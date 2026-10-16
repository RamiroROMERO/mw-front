import { describe, it, expect } from 'vitest';
import { COST_FIELDS, COSTS_PRIVILEGE_CODE, MAX_COST, hasCostsPrivilege, isService, mapCostsToForm, validateCosts, buildCostsPayload, costsAfterSave } from './costRules';

// Mismos casos que ProductCostsDTO.test.js y ProductService.costs.test.js del back.
const VALID = { costValue: 10, lastCostValue: 12.5, maxCostValue: 20 };
const PRODUCT = 1;
const SERVICE = 2;
const fieldsOf = (form, type = PRODUCT) => Object.keys(validateCosts(form, type)).sort();

describe('validateCosts', () => {
  it('tres montos mayores a 0 en un producto son válidos', () => {
    expect(validateCosts(VALID, PRODUCT)).toEqual({});
  });

  it('un cuerpo completo con textos numéricos es válido', () => {
    expect(validateCosts({ costValue: '10', lastCostValue: '12.50', maxCostValue: ' 20 ' }, PRODUCT)).toEqual({});
  });

  it.each(COST_FIELDS)('%s vacío, nulo o ausente se rechaza como requerido', (field) => {
    [undefined, null, '', '   '].forEach((v) => {
      expect(validateCosts({ ...VALID, [field]: v }, PRODUCT)).toEqual({ [field]: 'page.productsCatalog.error.costs.required' });
    });
    const missing = { ...VALID };
    delete missing[field];
    expect(fieldsOf(missing)).toEqual([field]);
  });

  it('un formulario vacío marca los tres campos', () => {
    expect(fieldsOf({})).toEqual([...COST_FIELDS].sort());
  });

  it.each(COST_FIELDS)('%s negativo o no numérico se rechaza como inválido', (field) => {
    [-1, '-0.5', 'abc', '12x', true, false, NaN, Infinity].forEach((v) => {
      expect(validateCosts({ ...VALID, [field]: v }, PRODUCT)).toEqual({ [field]: 'page.productsCatalog.error.costs.invalid' });
    });
  });

  it.each(COST_FIELDS)('%s: el tope del DECIMAL(17,5) pasa y lo mayor se rechaza', (field) => {
    expect(fieldsOf({ ...VALID, [field]: MAX_COST })).toEqual([]);
    expect(fieldsOf({ ...VALID, [field]: '99999999999.99999' })).toEqual([]);
    expect(validateCosts({ ...VALID, [field]: 100000000000 }, PRODUCT)).toEqual({ [field]: 'page.productsCatalog.error.costs.invalid' });
  });
});

describe('validateCosts: el cero', () => {
  it.each(COST_FIELDS)('un producto con %s en 0 se rechaza (también como texto)', (field) => {
    [0, '0', '0.00'].forEach((v) => {
      expect(validateCosts({ ...VALID, [field]: v }, PRODUCT)).toEqual({ [field]: 'page.productsCatalog.error.costs.zero' });
    });
  });

  it('un producto con los tres en 0 marca los tres', () => {
    expect(fieldsOf({ costValue: 0, lastCostValue: 0, maxCostValue: 0 }, PRODUCT)).toEqual([...COST_FIELDS].sort());
  });

  it('un servicio acepta los tres en 0', () => {
    expect(validateCosts({ costValue: 0, lastCostValue: '0', maxCostValue: 0 }, SERVICE)).toEqual({});
  });

  it('el tipo como texto "2" también es servicio', () => {
    expect(validateCosts({ costValue: 0, lastCostValue: 0, maxCostValue: 0 }, '2')).toEqual({});
  });

  it('un servicio sigue rechazando un negativo y un vacío', () => {
    expect(fieldsOf({ costValue: -1, lastCostValue: '', maxCostValue: 0 }, SERVICE)).toEqual(['costValue', 'lastCostValue']);
  });

  it('un tipo desconocido se trata como producto (el back usa el tipo guardado)', () => {
    [undefined, null, 0, 3].forEach((type) => {
      expect(fieldsOf({ costValue: 0, lastCostValue: 1, maxCostValue: 1 }, type)).toEqual(['costValue']);
    });
  });

  it('isService', () => {
    expect([2, '2'].every(isService)).toBe(true);
    expect([1, '1', 0, null, undefined].some(isService)).toBe(false);
  });
});

describe('mapCostsToForm', () => {
  it('precarga los tres costos actuales como texto', () => {
    expect(mapCostsToForm({ costValue: 10, lastCostValue: '12.50000', maxCostValue: 20 })).toEqual({ costValue: '10', lastCostValue: '12.50000', maxCostValue: '20' });
  });

  it('un costo ausente o nulo queda vacío y no copia el de otro campo', () => {
    expect(mapCostsToForm({ costValue: 10, lastCostValue: null })).toEqual({ costValue: '10', lastCostValue: '', maxCostValue: '' });
    expect(mapCostsToForm(undefined)).toEqual({ costValue: '', lastCostValue: '', maxCostValue: '' });
  });

  it('un costo en 0 se conserva como "0"', () => {
    expect(mapCostsToForm({ costValue: 0, lastCostValue: 0, maxCostValue: 0 })).toEqual({ costValue: '0', lastCostValue: '0', maxCostValue: '0' });
  });

  it('cambiar un monto no copia su valor a los otros (D5)', () => {
    const form = { ...mapCostsToForm(VALID), costValue: '99' };
    expect(buildCostsPayload(form)).toEqual({ costValue: 99, lastCostValue: 12.5, maxCostValue: 20 });
  });
});

describe('buildCostsPayload', () => {
  it('manda solo los tres montos, como número', () => {
    expect(buildCostsPayload({ costValue: '10', lastCostValue: '12.50', maxCostValue: ' 20 ', type: 2, extra: 1 })).toEqual({ costValue: 10, lastCostValue: 12.5, maxCostValue: 20 });
  });
});

describe('costsAfterSave', () => {
  it('agrega purchaseCostValue igual al último costo (lo que hace el back)', () => {
    expect(costsAfterSave({ costValue: 1, lastCostValue: 2, maxCostValue: 3 })).toEqual({ costValue: 1, lastCostValue: 2, maxCostValue: 3, purchaseCostValue: 2 });
  });
});

describe('hasCostsPrivilege', () => {
  it('el código es 11.01.003 (Editar Costos Promedio)', () => {
    expect(COSTS_PRIVILEGE_CODE).toBe('11.01.003');
  });

  it('solo un privilegio activo habilita el botón', () => {
    expect(hasCostsPrivilege({ code: '11.01.003', active: 1 })).toBe(true);
    expect(hasCostsPrivilege({ code: '11.01.003', active: true })).toBe(true);
  });

  it.each([[{ active: 0 }], [{ active: false }], [{ id: 0, name: '', status: false }], [null], [undefined]])('%j no lo habilita', (privilege) => {
    expect(hasCostsPrivilege(privilege)).toBe(false);
  });
});
