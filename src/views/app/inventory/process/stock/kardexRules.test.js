import { describe, it, expect } from 'vitest';
import { validateKardexFilter, buildKardexParams, currentCost, normalizeKardex, formatQty, documentLabel, buildSummary, isValidCalendarDate, todayText, EMPTY_KARDEX } from './kardexRules';

// Los casos del filtro son los mismos de modules/inventory/stocks/__tests__/kardexRules.test.js del back.
const VALID = { storeId: 1, productCode: 'HPL-00001', dateStart: '2026-08-01', dateEnd: '2026-08-31' };

describe('filtro del detalle', () => {
  it('un filtro válido no tiene errores', () => {
    expect(validateKardexFilter(VALID)).toEqual({});
  });
  it.each([[0], [''], [undefined], [-1], [1.5], ['abc']])('almacén %p se rechaza', (storeId) => {
    expect(validateKardexFilter({ ...VALID, storeId }).storeId).toBe('msg.required.select.storeId');
  });
  it('el almacén llega como texto numérico y es válido', () => {
    expect(validateKardexFilter({ ...VALID, storeId: '3' })).toEqual({});
  });
  it.each([[''], ['  '], ['0'], [undefined]])('producto %p se rechaza', (productCode) => {
    expect(validateKardexFilter({ ...VALID, productCode }).productCode).toBe('msg.required.select.product');
  });
  it('fechas vacías, mal escritas o con día inexistente', () => {
    expect(validateKardexFilter({ ...VALID, dateStart: '' }).dateStart).toBe('msg.required.select.dateStart');
    expect(validateKardexFilter({ ...VALID, dateEnd: '' }).dateEnd).toBe('msg.required.select.dateEnd');
    expect(validateKardexFilter({ ...VALID, dateStart: '01/08/2026' }).dateStart).toBeDefined();
    expect(validateKardexFilter({ ...VALID, dateEnd: '2026-02-30' }).dateEnd).toBeDefined();
  });
  it('rango invertido marca la fecha final; un solo día es válido', () => {
    expect(validateKardexFilter({ ...VALID, dateStart: '2026-09-01', dateEnd: '2026-08-31' }).dateEnd).toBe('msg.required.input.range');
    expect(validateKardexFilter({ ...VALID, dateStart: '2026-08-15', dateEnd: '2026-08-15' })).toEqual({});
  });
  it('sin objeto devuelve todos los errores sin lanzar', () => {
    expect(Object.keys(validateKardexFilter(undefined)).sort()).toEqual(['dateEnd', 'dateStart', 'productCode', 'storeId']);
  });
  it('isValidCalendarDate: bisiesto y mes 13', () => {
    expect(isValidCalendarDate('2028-02-29')).toBe(true);
    expect(isValidCalendarDate('2026-02-29')).toBe(false);
    expect(isValidCalendarDate('2026-13-01')).toBe(false);
  });
  it('todayText usa la fecha local', () => {
    expect(todayText(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(todayText(new Date(2026, 11, 31, 0, 1))).toBe('2026-12-31');
  });
});

describe('parámetros de la consulta', () => {
  it('almacén a número y código sin espacios; solo los 4 campos', () => {
    expect(buildKardexParams({ ...VALID, storeId: '2', productCode: ' HPL-00001 ', extra: 1 })).toEqual({ storeId: 2, productCode: 'HPL-00001', dateStart: '2026-08-01', dateEnd: '2026-08-31' });
  });
});

describe('costo vigente (tipoc)', () => {
  const product = { cost: 1, maxCost: 2, lastCost: 3 };
  it.each([[1, 1], [2, 2], [3, 3], [0, 3], [undefined, 3]])('tipoc %p usa %p', (costType, expected) => {
    expect(currentCost({ ...product, costType })).toBe(expected);
  });
  it('sin producto da 0', () => {
    expect(currentCost(null)).toBe(0);
  });
});

describe('normalizar la respuesta', () => {
  it('respuesta ausente o rota da el detalle vacío, sin compartir el arreglo', () => {
    [undefined, null, 'x', 5].forEach((v) => {
      const n = normalizeKardex(v);
      expect(n).toEqual(EMPTY_KARDEX);
      expect(n.rows).not.toBe(EMPTY_KARDEX.rows);
    });
  });
  it('convierte los totales a número y conserva filas y producto', () => {
    const n = normalizeKardex({ product: { code: 'A' }, rows: [{ id: 1 }], totals: { qtyIn: '80', qtyOut: 30, stock: '50', value: '500.5', maxCost: null } });
    expect(n.product).toEqual({ code: 'A' });
    expect(n.rows).toEqual([{ id: 1 }]);
    expect(n.totals).toEqual({ qtyIn: 80, qtyOut: 30, stock: 50, value: 500.5, maxCost: 0, minCost: 0 });
  });
  it('filas que no son un arreglo quedan vacías', () => {
    expect(normalizeKardex({ rows: 'x' }).rows).toEqual([]);
  });
});

describe('formato', () => {
  it.each([[0, '0.00'], [5, '5.00'], [60, '60.00'], [0.3, '0.30'], [1.23456, '1.23456'], [-88, '-88.00'], ['abc', '0.00'], [undefined, '0.00']])('formatQty(%p) = %p', (v, text) => {
    expect(formatQty(v)).toBe(text);
  });
  it('documentLabel: código y número, solo uno o ninguno', () => {
    expect(documentLabel({ documentCode: 'FAC', documentId: 1234 })).toBe('FAC 1234');
    expect(documentLabel({ documentCode: 'FAC', documentId: 0 })).toBe('FAC');
    expect(documentLabel({ documentCode: '', documentId: 9 })).toBe('9');
    expect(documentLabel({ documentCode: ' ', documentId: 0 })).toBe('');
    expect(documentLabel(undefined)).toBe('');
  });
});

describe('panel de totales', () => {
  it('con los números del back: saldo 60 + 20 - 30 = 50 al costo 10', () => {
    const s = buildSummary({ product: { maxCost: 99, lastCost: 10, cost: 5, costType: 3 }, rows: [], totals: { qtyIn: 80, qtyOut: 30, stock: 50, value: 500, maxCost: 10, minCost: 10 } });
    expect(s).toEqual({ maximumCost: '10.00', minimumCost: '10.00', averageCost: '5.00', lastPurchaseCost: '10.00', currentExistence: '50.00', totalInputs: '80.00', totalOutputs: '30.00', totalValue: '500.00' });
  });
  it('sin detalle todo es cero', () => {
    const s = buildSummary(undefined);
    expect(Object.values(s).every((v) => v === '0.00')).toBe(true);
  });
  it('existencia negativa se muestra con su signo', () => {
    expect(buildSummary({ product: { costType: 3, lastCost: 62 }, totals: { stock: -88, value: -4772.24 } })).toMatchObject({ currentExistence: '-88.00', totalValue: '-4772.24' });
  });
});
