import { describe, expect, test } from 'vitest';
import {
  REPORT_BASE_URL, TYPE_DETAIL, TYPE_SUMMARY, buildSalesRequest, columnsFor, defaultRange, hasCosts, normalizeSalesReport, reportFileName, toUsd, validateReportRange
} from './salesReportRules';

const form = { customerId: 0, storeId: 0, productCode: '', sellerCode: '', documentType: 3, startDate: '2026-08-01', endDate: '2026-08-31' };

describe('buildSalesRequest', () => {
  test('mínima: solo las fechas (startDate/endDate pasan a dateStart/dateEnd); "todos" no viaja', () => {
    expect(buildSalesRequest(TYPE_DETAIL, form)).toEqual({ url: `${REPORT_BASE_URL}/detail`, params: { dateStart: '2026-08-01', dateEnd: '2026-08-31' } });
  });

  test('filtros con valor viajan como texto; documentType 3 no viaja y 1 o 2 sí', () => {
    const { params } = buildSalesRequest(TYPE_SUMMARY, { ...form, customerId: 23, storeId: '4', productCode: ' P1 ', sellerCode: 'V1', documentType: 2 });
    expect(params).toEqual({ dateStart: '2026-08-01', dateEnd: '2026-08-31', customerId: '23', storeId: '4', productCode: 'P1', sellerCode: 'V1', documentType: '2' });
    expect(buildSalesRequest(TYPE_DETAIL, { ...form, documentType: 1 }).params.documentType).toBe('1');
  });

  test('ids en 0, vacíos o inválidos y producto o vendedor en "0" no viajan', () => {
    const { params } = buildSalesRequest(TYPE_DETAIL, { ...form, customerId: 0, storeId: '', productCode: '0', sellerCode: '0' });
    expect(Object.keys(params).sort()).toEqual(['dateEnd', 'dateStart']);
  });

  test('el formato xlsx va en params (no en la URL); json no manda formato', () => {
    const xlsx = buildSalesRequest(TYPE_DETAIL, form, 'xlsx');
    expect(xlsx.params.format).toBe('xlsx');
    expect(xlsx.url).not.toContain('?');
    expect(buildSalesRequest(TYPE_DETAIL, form, 'json').params).not.toHaveProperty('format');
  });
});

describe('validateReportRange (mismos casos del back)', () => {
  test('válido', () => expect(validateReportRange({ dateStart: '2026-08-01', dateEnd: '2026-08-31' })).toEqual({}));
  test('vacías, inválidas, invertidas y de más de 366 días', () => {
    expect(validateReportRange({ dateStart: '', dateEnd: '2026-08-31' }).dateStart).toBeDefined();
    expect(validateReportRange({ dateStart: '2026-02-30', dateEnd: '2026-03-01' }).dateStart).toBeDefined();
    expect(validateReportRange({ dateStart: '2026-09-02', dateEnd: '2026-08-31' }).dateEnd).toBeDefined();
    expect(validateReportRange({ dateStart: '2026-01-01', dateEnd: '2027-01-03' }).dateEnd).toBeDefined();
    expect(validateReportRange({ dateStart: '2026-01-01', dateEnd: '2027-01-02' })).toEqual({});
  });
});

describe('defaultRange', () => {
  test('del primer día del mes a hoy, en fecha local', () => {
    expect(defaultRange(new Date(2026, 10, 20, 23, 59))).toEqual({ startDate: '2026-11-01', endDate: '2026-11-20' });
    expect(defaultRange(new Date(2027, 0, 1, 0, 5))).toEqual({ startDate: '2027-01-01', endDate: '2027-01-01' });
  });
});

describe('columnas y costos', () => {
  test('sin costos: ni costo ni utilidad; con costos se agregan al final', () => {
    expect(columnsFor(TYPE_DETAIL, false).map((c) => c.field)).not.toContain('costValue');
    expect(columnsFor(TYPE_DETAIL, true).slice(-2).map((c) => c.field)).toEqual(['costValue', 'profit']);
    expect(columnsFor(TYPE_SUMMARY, true).slice(-2).map((c) => c.field)).toEqual(['costValue', 'profit']);
    expect(columnsFor(TYPE_SUMMARY, false).map((c) => c.field)).not.toContain('storeName');
  });

  test('hasCosts: solo si el back mandó costValue en los totales', () => {
    expect(hasCosts({ total: 1 })).toBe(false);
    expect(hasCosts({ total: 1, costValue: 0 })).toBe(true);
    expect(hasCosts(undefined)).toBe(false);
    expect(hasCosts(null)).toBe(false);
  });
});

describe('normalizeSalesReport', () => {
  test('formas raras quedan vacías', () => {
    expect(normalizeSalesReport(undefined)).toEqual({ rows: [], totals: {} });
    expect(normalizeSalesReport({ rows: 'x', totals: 5 })).toEqual({ rows: [], totals: {} });
    expect(normalizeSalesReport({ rows: [{ a: 1 }], totals: { total: 2 } })).toEqual({ rows: [{ a: 1 }], totals: { total: 2 } });
  });
});

describe('toUsd y archivo', () => {
  test('divide con el tipo de cambio y sin tipo de cambio válido da 0', () => {
    expect(toUsd(2500, 25)).toBe(100);
    expect(toUsd(100, 0)).toBe(0);
    expect(toUsd(100, -1)).toBe(0);
    expect(toUsd('abc', 25)).toBe(0);
    expect(toUsd(100, undefined)).toBe(0);
  });
  test('nombre del archivo Excel por tipo', () => {
    expect(reportFileName(TYPE_DETAIL)).toBe('Reporte General de Ventas.xlsx');
    expect(reportFileName(TYPE_SUMMARY)).toBe('Reporte de Ventas Resumido.xlsx');
  });
});
