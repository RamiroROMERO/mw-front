import { describe, it, expect } from 'vitest';
import {
  isDefaultRow, canDeleteDistribution, emptyDistributionForm, mapDistributionToForm, validateDistribution,
  buildDistributionPayload, pickCalculatedPrices
} from './distributionRules';

// Mismos casos que ProductDistributionDTO.test.js del back.
const VALID = { undoutId: 4, valChange: 1, localMinPrice: 10, localMedPrice: 12, localMaxPrice: 15 };
const form = (extra = {}) => ({ ...emptyDistributionForm(), ...VALID, ...extra });

describe('validateDistribution', () => {
  it('un formulario completo es válido', () => {
    expect(validateDistribution(form())).toEqual({});
  });

  it('el formulario vacío marca unidad, cantidad base y los tres precios locales', () => {
    expect(Object.keys(validateDistribution(emptyDistributionForm())).sort()).toEqual(['localMaxPrice', 'localMedPrice', 'localMinPrice', 'undoutId']);
  });

  it.each([[0], [''], [null], [undefined], ['abc'], [1.5], [-1]])('unidad %p se rechaza', (undoutId) => {
    expect(Object.keys(validateDistribution(form({ undoutId })))).toEqual(['undoutId']);
  });

  it('la unidad como string numérico es válida', () => {
    expect(validateDistribution(form({ undoutId: '4' }))).toEqual({});
  });

  it.each([[0], ['0'], [''], [null], [-1], ['x']])('cantidad base %p se rechaza', (valChange) => {
    expect(Object.keys(validateDistribution(form({ valChange })))).toEqual(['valChange']);
  });

  it.each(['localMinPrice', 'localMedPrice', 'localMaxPrice'])('%s: 0, vacío, negativo o texto se rechazan', (field) => {
    [0, '0', '', null, -1, 'x'].forEach((value) => {
      expect(Object.keys(validateDistribution(form({ [field]: value })))).toEqual([field]);
    });
  });

  it('precios con decimales o como string son válidos', () => {
    expect(validateDistribution(form({ localMinPrice: '10.5', localMedPrice: 0.01 }))).toEqual({});
  });

  it.each(['localOtherPrice', 'foranMinPrice', 'foranMedPrice', 'foranMaxPrice', 'foranOtherPrice'])('%s opcional: vacío o 0 válidos; negativo o texto se rechazan', (field) => {
    [undefined, null, '', 0, '0', 5, '5.25'].forEach((value) => expect(validateDistribution(form({ [field]: value }))).toEqual({}));
    [-1, '-0.01', 'abc'].forEach((value) => expect(Object.keys(validateDistribution(form({ [field]: value })))).toEqual([field]));
  });

  it('cada error es un id de traducción', () => {
    const errors = validateDistribution(emptyDistributionForm());
    Object.values(errors).forEach((id) => expect(id).toMatch(/^page\.productsCatalog\.error\.dist\./));
  });
});

describe('buildDistributionPayload', () => {
  it('manda producto, unidad, cantidad, los ocho precios y el estado como 0/1', () => {
    expect(buildDistributionPayload(form({ localOtherPrice: '7.5', foranMinPrice: 11 }), ' HPL-1 ')).toEqual({
      productCode: 'HPL-1', undoutId: 4, valChange: 1,
      localMinPrice: 10, localMedPrice: 12, localMaxPrice: 15, localOtherPrice: 7.5,
      foranMinPrice: 11, foranMedPrice: 0, foranMaxPrice: 0, foranOtherPrice: 0,
      status: 1
    });
  });

  it('no manda idFather, undCode, isDefault ni id (el payload roto que descartaba el back)', () => {
    const payload = buildDistributionPayload(form({ id: 9, isDefault: false }), 'A');
    ['idFather', 'undCode', 'isDefault', 'id', 'undOutName'].forEach((key) => expect(payload).not.toHaveProperty(key));
  });

  it('los precios opcionales vacíos o inválidos van en 0', () => {
    const payload = buildDistributionPayload(form({ foranMinPrice: '', foranMedPrice: null, foranMaxPrice: 'x' }), 'A');
    expect([payload.foranMinPrice, payload.foranMedPrice, payload.foranMaxPrice]).toEqual([0, 0, 0]);
  });

  it('status false -> 0, true -> 1; la default siempre va activa', () => {
    expect(buildDistributionPayload(form({ status: false }), 'A').status).toBe(0);
    expect(buildDistributionPayload(form({ status: true }), 'A').status).toBe(1);
    expect(buildDistributionPayload(form({ status: false, isDefault: true }), 'A').status).toBe(1);
  });
});

describe('mapDistributionToForm', () => {
  const row = { id: 7, undoutId: 4, undOutName: 'CAJA', valChange: '12.00000', localMinPrice: '10.00', localMedPrice: '12.00', localMaxPrice: '15.00', localOtherPrice: null, isDefault: 1, status: 1 };

  it('convierte status e isDefault de 0/1 a booleano y conserva id, unidad y precios', () => {
    expect(mapDistributionToForm(row)).toMatchObject({ id: 7, undoutId: 4, valChange: '12.00000', localMinPrice: '10.00', isDefault: true, status: true, localOtherPrice: 0, foranMinPrice: 0 });
    expect(mapDistributionToForm({ ...row, isDefault: 0, status: 0 })).toMatchObject({ isDefault: false, status: false });
  });

  it('una fila mapeada y enviada sin cambios es válida y produce un payload coherente', () => {
    const mapped = mapDistributionToForm(row);
    expect(validateDistribution(mapped)).toEqual({});
    expect(buildDistributionPayload(mapped, 'A')).toMatchObject({ undoutId: 4, valChange: 12, localMinPrice: 10, status: 1 });
  });
});

describe('default: no se elimina ni se desactiva', () => {
  it.each([[1, true], ['1', true], [true, true], [0, false], ['0', false], [false, false], [undefined, false]])('isDefault %p -> %s', (isDefault, expected) => {
    expect(isDefaultRow({ isDefault })).toBe(expected);
    expect(canDeleteDistribution({ isDefault })).toBe(!expected);
  });
});

describe('pickCalculatedPrices (solo los precios mayores a 0)', () => {
  it('conserva los calculados y descarta los que salieron en 0', () => {
    expect(pickCalculatedPrices({ localMinPrice: 150, localMedPrice: 0, localMaxPrice: 171.43, foranMinPrice: 0 })).toEqual({ localMinPrice: 150, localMaxPrice: 171.43 });
  });

  it('sin nada calculado -> objeto vacío', () => {
    expect(pickCalculatedPrices({ localMinPrice: 0 })).toEqual({});
    expect(pickCalculatedPrices(undefined)).toEqual({});
  });
});
