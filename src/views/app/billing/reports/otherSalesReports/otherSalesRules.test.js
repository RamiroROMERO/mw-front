import { describe, expect, test } from 'vitest';
import {
  REPORT_TYPES, buildOtherRequest, validateOtherForm, reportFileName, selectedTypeIds, normalizeReport, normalizeFilters, pivotTableColumns, grandTotal, findType, REPORT_URL
} from './otherSalesRules';

const form = { startDate: '2025-01-01', endDate: '2025-01-31', currency: 1, customerId: 0, cashierId: 0, isPartner: 0, minDays: '', avgOp: '', avgValue: '', avgValue2: '' };

describe('REPORT_TYPES', () => {
  test('son los 17 reportes, sin claves repetidas, cada uno con columnas fijas o tabla dinámica', () => {
    expect(REPORT_TYPES).toHaveLength(17);
    expect(new Set(REPORT_TYPES.map((t) => t.key)).size).toBe(17);
    REPORT_TYPES.forEach((t) => expect(Boolean(t.isPivot) !== Boolean(t.columns)).toBe(true));
    ['creditSales', 'lastPurchase', 'averageMonthlyByCustomer'].forEach((key) => expect(findType(key).key).toBe(key));
  });
});

describe('buildOtherRequest', () => {
  test('los parámetros van en params (no en la URL) con dateStart/dateEnd; sin filtros no viajan', () => {
    expect(buildOtherRequest('byCustomer', form)).toEqual({ url: `${REPORT_URL}/byCustomer`, params: { dateStart: '2025-01-01', dateEnd: '2025-01-31' } });
  });

  test('moneda: solo Dólares viaja y solo en los reportes con montos', () => {
    expect(buildOtherRequest('byCustomer', { ...form, currency: 2 }).params.currency).toBe('2');
    expect(buildOtherRequest('cashExpenses', { ...form, currency: 2 }).params.currency).toBeUndefined();
    expect(buildOtherRequest('lastPurchase', { ...form, currency: 2 }).params.currency).toBeUndefined();
  });

  test('cada filtro solo viaja en el reporte que lo admite', () => {
    const all = { ...form, customerId: 5, cashierId: 9, isPartner: 1, minDays: '30' };
    expect(buildOtherRequest('byCustomer', all).params).toMatchObject({ customerId: '5', isPartner: '1' });
    expect(buildOtherRequest('byCustomer', all).params.cashierId).toBeUndefined();
    expect(buildOtherRequest('byCashier', all).params).toMatchObject({ cashierId: '9' });
    expect(buildOtherRequest('byCashier', all).params.isPartner).toBeUndefined();
    expect(buildOtherRequest('cashSales', all).params).toEqual({ dateStart: '2025-01-01', dateEnd: '2025-01-31' });
    expect(buildOtherRequest('byCustomer', { ...form, customerId: 'x' }).params.customerId).toBeUndefined();
  });

  test('última compra: sin fechas y con los días mínimos', () => {
    expect(buildOtherRequest('lastPurchase', { ...form, minDays: '30', isPartner: 1 }).params).toEqual({ isPartner: '1', minDays: '30' });
    expect(buildOtherRequest('lastPurchase', form).params).toEqual({});
  });

  test('promedio mensual: clasificaciones y comparación', () => {
    expect(buildOtherRequest('averageMonthlyByCustomer', { ...form, avgOp: 'between', avgValue: '100', avgValue2: '200' }, 'json', [2, 6]).params)
      .toMatchObject({ productTypeIds: '2,6', avgOp: 'between', avgValue: '100', avgValue2: '200' });
    expect(buildOtherRequest('averageMonthlyByCustomer', { ...form, avgOp: 'lt', avgValue: '50', avgValue2: '9' }).params.avgValue2).toBeUndefined();
    expect(buildOtherRequest('averageMonthlyByCustomer', form).params.avgOp).toBeUndefined();
    expect(buildOtherRequest('byCustomer', form, 'json', [2]).params.productTypeIds).toBeUndefined();
  });

  test('formato: pdf y xlsx viajan; json no', () => {
    expect(buildOtherRequest('byCustomer', form, 'xlsx').params.format).toBe('xlsx');
    expect(buildOtherRequest('byCustomer', form, 'pdf').params.format).toBe('pdf');
    expect(buildOtherRequest('byCustomer', form, 'json').params.format).toBeUndefined();
  });
});

describe('validateOtherForm', () => {
  test('fechas obligatorias y en orden, salvo en la última compra', () => {
    expect(validateOtherForm('byCustomer', form)).toEqual({});
    expect(validateOtherForm('byCustomer', { ...form, startDate: '' })).toHaveProperty('startDate');
    expect(validateOtherForm('byCustomer', { ...form, startDate: '2025-02-01' })).toHaveProperty('endDate');
    expect(validateOtherForm('lastPurchase', { ...form, startDate: '', endDate: '' })).toEqual({});
  });

  test('días mínimos enteros', () => {
    expect(validateOtherForm('lastPurchase', { ...form, minDays: '30' })).toEqual({});
    expect(validateOtherForm('lastPurchase', { ...form, minDays: '-1' })).toHaveProperty('minDays');
    expect(validateOtherForm('byCustomer', { ...form, minDays: '-1' })).toEqual({});
  });

  test('promedio: la comparación exige valores mayores a 0 y, entre, en orden', () => {
    const avg = (extra) => validateOtherForm('averageMonthlyByCustomer', { ...form, ...extra });
    expect(avg({})).toEqual({});
    expect(avg({ avgOp: 'lt' })).toHaveProperty('avgValue');
    expect(avg({ avgOp: 'gt', avgValue: '10' })).toEqual({});
    expect(avg({ avgOp: 'between', avgValue: '10' })).toHaveProperty('avgValue2');
    expect(avg({ avgOp: 'between', avgValue: '30', avgValue2: '20' })).toHaveProperty('avgValue2');
    expect(avg({ avgOp: 'between', avgValue: '10', avgValue2: '20' })).toEqual({});
  });
});

describe('ayudas', () => {
  test('nombre del archivo: el título que arma el back', () => {
    expect(reportFileName('resumeByArea', 'pdf')).toBe('Resumen de Ventas por Área.pdf');
    expect(reportFileName('salesByProductTypeMonthly', 'xlsx')).toBe('Ventas por Tipo de Producto Mensual.xlsx');
  });

  test('clasificaciones marcadas', () => {
    const types = [{ id: 2, name: 'A' }, { id: 6, name: 'B' }];
    expect(selectedTypeIds({ type_2: 1, type_6: 0 }, types)).toEqual([2]);
    expect(selectedTypeIds({ type_2: true, type_6: true }, types)).toEqual([2, 6]);
    expect(selectedTypeIds({}, types)).toEqual([]);
  });

  test('respuestas raras se normalizan a vacío', () => {
    expect(normalizeReport(null)).toEqual({ rows: [], totals: {}, columns: [] });
    expect(normalizeFilters(undefined)).toEqual({ cashiers: [], productTypes: [] });
    expect(normalizeFilters({ cashiers: [{ id: 5, name: 'Carolina' }] }).cashiers).toEqual([{ label: 'Carolina', value: 5 }]);
  });

  test('columnas dinámicas del back y total de la pantalla', () => {
    expect(pivotTableColumns([{ key: 'm_2025_01', header: 'Ene-2025', type: 'number' }, { key: 'qtyTotal', header: 'Facturas', type: 'integer' }]))
      .toEqual([{ field: 'm_2025_01', header: 'Ene-2025', isNumber: true, isInteger: false }, { field: 'qtyTotal', header: 'Facturas', isNumber: false, isInteger: true }]);
    expect(grandTotal({ total: 5 })).toBe(5);
    expect(grandTotal({ value: 7 })).toBe(7);
    expect(grandTotal({})).toBeUndefined();
  });
});
