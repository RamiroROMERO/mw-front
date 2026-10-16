import { describe, it, expect } from 'vitest';
import {
  MAX_CODE_LENGTH, emptyComponentForm, mapComponentToForm, isValidQty, canOpenComponents, componentOptions, unitOptions,
  validateComponent, buildComponentPayload
} from './compoundRules';

// Mismos casos que ComponentDTO.test.js, componentRules.test.js y ComponentService.create.test.js del back.
const FATHER = 'ISL-00043';
const VALID = { productCode: 'ISL-00044', unitedOut: 'UND', qty: 2.5 };
const COMP = 'page.productsCatalog.error.comp';
const fieldsOf = (form, opts = { fatherCode: FATHER }) => Object.keys(validateComponent(form, opts)).sort();

describe('isValidQty', () => {
  it.each([[0.01], [1], [2.5], [100], [0.1], [1.1], [4.35], [1.15], ['2.5'], ['0.01'], [99999999.99]])('acepta %p', (qty) => {
    expect(isValidQty(qty)).toBe(true);
  });

  it.each([[0], [-1], [-0.01], [1.234], [0.001], [0.005], [2.505], ['1.234'], ['abc'], [''], ['  '], [null], [undefined], [NaN], [Infinity], [true], [[]], [{}]])('rechaza %p', (qty) => {
    expect(isValidQty(qty)).toBe(false);
  });

  it('no se deja engañar por el ruido de coma flotante', () => {
    expect(isValidQty(0.1 + 0.2)).toBe(false);
    expect(isValidQty(1.005)).toBe(false);
  });
});

describe('validateComponent: alta', () => {
  it('un cuerpo válido no tiene errores', () => {
    expect(validateComponent(VALID, { fatherCode: FATHER })).toEqual({});
  });

  it('textos numéricos y espacios alrededor son válidos', () => {
    expect(validateComponent({ productCode: ' ISL-00044 ', unitedOut: ' UND ', qty: '2.5' }, { fatherCode: FATHER })).toEqual({});
  });

  it.each([['productCode'], ['unitedOut'], ['qty']])('%s es obligatorio (vacío, nulo, solo espacios o ausente)', (field) => {
    [undefined, null, '', '   '].forEach((v) => {
      expect(fieldsOf({ ...VALID, [field]: v })).toEqual([field]);
    });
    const missing = { ...VALID };
    delete missing[field];
    expect(fieldsOf(missing)).toEqual([field]);
  });

  it('un formulario vacío marca los tres campos, con su id de traducción', () => {
    expect(validateComponent(emptyComponentForm(), { fatherCode: FATHER })).toEqual({
      productCode: `${COMP}.productCode`, unitedOut: `${COMP}.unit`, qty: `${COMP}.qtyRequired`
    });
  });

  it('el propio padre no puede ser componente (con espacios también)', () => {
    expect(validateComponent({ ...VALID, productCode: FATHER }, { fatherCode: FATHER })).toEqual({ productCode: `${COMP}.self` });
    expect(fieldsOf({ ...VALID, productCode: ` ${FATHER} ` })).toEqual(['productCode']);
  });

  it('productCode y unitedOut aceptan 20 caracteres y rechazan 21', () => {
    const max = 'A'.repeat(MAX_CODE_LENGTH);
    expect(fieldsOf({ ...VALID, productCode: max, unitedOut: max })).toEqual([]);
    expect(validateComponent({ ...VALID, productCode: `${max}A`, unitedOut: `${max}A` }, { fatherCode: FATHER })).toEqual({
      productCode: `${COMP}.productCodeMax`, unitedOut: `${COMP}.unitMax`
    });
  });

  it.each([[0], [-1], [1.234], ['1.234'], ['abc'], [true], [NaN]])('cantidad %p se rechaza como inválida', (qty) => {
    expect(validateComponent({ ...VALID, qty }, { fatherCode: FATHER })).toEqual({ qty: `${COMP}.qty` });
  });

  it.each([[0.01], [2.5], ['0.01']])('cantidad %p se acepta', (qty) => {
    expect(fieldsOf({ ...VALID, qty })).toEqual([]);
  });

  it('sin fatherCode (producto aún no cargado) no marca "uno mismo"', () => {
    expect(validateComponent(VALID, {})).toEqual({});
    expect(validateComponent(VALID)).toEqual({});
  });
});

describe('validateComponent: edición', () => {
  it('el producto componente no se valida (no cambia)', () => {
    expect(validateComponent({ productCode: '', unitedOut: 'CAJ', qty: 1 }, { fatherCode: FATHER, isEdit: true })).toEqual({});
    expect(validateComponent({ productCode: FATHER, unitedOut: 'CAJ', qty: 1 }, { fatherCode: FATHER, isEdit: true })).toEqual({});
  });

  it('la unidad y la cantidad se siguen validando', () => {
    expect(validateComponent({ unitedOut: '', qty: '' }, { isEdit: true })).toEqual({ unitedOut: `${COMP}.unit`, qty: `${COMP}.qtyRequired` });
    expect(validateComponent({ unitedOut: 'CAJ', qty: 1.234 }, { isEdit: true })).toEqual({ qty: `${COMP}.qty` });
  });
});

describe('buildComponentPayload', () => {
  it('alta: producto, unidad y cantidad numérica, con los textos recortados', () => {
    expect(buildComponentPayload({ id: 0, productCode: ' ISL-00044 ', unitedOut: ' UND ', qty: '2.5', extra: 1 })).toEqual({
      productCode: 'ISL-00044', unitedOut: 'UND', qty: 2.5
    });
  });

  it('edición: solo unidad y cantidad (el producto componente no viaja)', () => {
    expect(buildComponentPayload({ id: 12, productCode: 'ISL-00044', unitedOut: 'CAJ', qty: '3' }, { isEdit: true })).toEqual({ unitedOut: 'CAJ', qty: 3 });
  });
});

describe('mapComponentToForm / emptyComponentForm', () => {
  it('la fila de la API pasa al formulario con la cantidad como texto', () => {
    expect(mapComponentToForm({ id: 12, productCode: 'ISL-00044', productName: 'X', unitedOut: 'UND', qty: 2.5 })).toEqual({
      id: 12, productCode: 'ISL-00044', unitedOut: 'UND', qty: '2.5'
    });
  });

  it('valores ausentes o nulos quedan vacíos', () => {
    expect(mapComponentToForm({ id: 1, productCode: null, unitedOut: undefined, qty: null })).toEqual({ id: 1, productCode: '', unitedOut: '', qty: '' });
  });

  it('el formulario vacío no pasa la validación del alta', () => {
    expect(Object.keys(validateComponent(emptyComponentForm(), { fatherCode: FATHER }))).toHaveLength(3);
  });
});

describe('canOpenComponents', () => {
  it.each([[{ id: 5, isCompound: true }], [{ id: 5, isCompound: 1 }], [{ id: '5', isCompound: '1' }]])('%j: activo', (product) => {
    expect(canOpenComponents(product)).toBe(true);
  });

  it.each([
    [{ id: 5, isCompound: false }], [{ id: 5, isCompound: 0 }], [{ id: 5 }], [{ id: 0, isCompound: true }],
    [{ isCompound: true }], [{ id: null, isCompound: true }], [null], [undefined]
  ])('%j: deshabilitado (sin compuesto marcado o sin producto guardado)', (product) => {
    expect(canOpenComponents(product)).toBe(false);
  });
});

describe('componentOptions', () => {
  const products = [
    { code: FATHER, name: 'Padre', type: 1 },
    { code: 'ISL-00044', name: 'A', type: 1 },
    { code: 'ISL-00045', name: 'B' },
    { code: 'SRV-1', name: 'Servicio', type: 2 },
    { code: 'ISL-00046', name: 'Ya es componente', type: 1 }
  ];

  it('excluye al padre, a los servicios y a los que ya son componentes', () => {
    expect(componentOptions(products, { fatherCode: FATHER, existingCodes: ['ISL-00046'] }).map((p) => p.code)).toEqual(['ISL-00044', 'ISL-00045']);
  });

  it('sin existingCodes solo excluye al padre y a los servicios; un producto sin type se conserva', () => {
    expect(componentOptions(products, { fatherCode: FATHER }).map((p) => p.code)).toEqual(['ISL-00044', 'ISL-00045', 'ISL-00046']);
  });

  it('una lista ausente devuelve []', () => {
    expect(componentOptions(undefined, { fatherCode: FATHER })).toEqual([]);
  });

  it('también acepta opciones de combo con value (como las del catálogo)', () => {
    const options = [{ value: FATHER, label: 'Padre' }, { value: 'ISL-00044', label: 'A' }, { value: 'ISL-00046', label: 'B' }];
    expect(componentOptions(options, { fatherCode: FATHER, existingCodes: ['ISL-00046'] }).map((p) => p.value)).toEqual(['ISL-00044']);
  });

  it('no muta la lista original', () => {
    const copy = JSON.stringify(products);
    componentOptions(products, { fatherCode: FATHER });
    expect(JSON.stringify(products)).toBe(copy);
  });
});

describe('unitOptions', () => {
  const dist = (code, name, status = 1, undOutName = name) => ({ status, undOutName, undOutData: { code, name } });

  it('solo las distribuciones activas, con el código de la unidad como valor', () => {
    expect(unitOptions([dist('UND', 'UNIDAD'), dist('CAJ', 'CAJA', 0), dist('RIS', 'RISTRA', true)])).toEqual([
      { id: 'UND', name: 'UNIDAD' }, { id: 'RIS', name: 'RISTRA' }
    ]);
  });

  it('no repite una unidad', () => {
    expect(unitOptions([dist('UND', 'UNIDAD'), dist('UND', 'UNIDAD')])).toHaveLength(1);
  });

  it('usa el nombre de la unidad si undOutName viene vacío', () => {
    expect(unitOptions([dist('UND', 'UNIDAD', 1, '')])).toEqual([{ id: 'UND', name: 'UNIDAD' }]);
  });

  it('una fila sin código de unidad no genera opción', () => {
    expect(unitOptions([{ status: 1, undOutName: 'X' }, { status: 1, undOutData: {} }, null])).toEqual([]);
  });

  it('una lista ausente devuelve []', () => {
    expect(unitOptions(undefined)).toEqual([]);
  });
});
