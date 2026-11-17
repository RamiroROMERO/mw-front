import { describe, expect, test } from 'vitest';
import { RADIO_TO_TYPE, MAX_RANGE_DAYS, COLUMNS_BY_TYPE, validateReportRange, buildReportRequest, reportFileName, normalizeReport, isValidCalendarDate, REPORT_TITLES } from './purchaseReportRules';

describe('validateReportRange', () => {
  test('rango válido', () => { expect(validateReportRange({ dateStart: '2026-08-01', dateEnd: '2026-08-31' })).toEqual({}); });
  test('fechas obligatorias', () => {
    expect(validateReportRange({ dateStart: '', dateEnd: '' })).toEqual({ dateStart: 'msg.required.input.date', dateEnd: 'msg.required.input.date' });
    expect(validateReportRange({})).toMatchObject({ dateStart: 'msg.required.input.date' });
  });
  test.each([['2026-02-30'], ['2026-13-01'], ['01/08/2026'], ['2027-02-29']])('fecha inválida %s', (d) => {
    expect(validateReportRange({ dateStart: d, dateEnd: '2027-03-01' }).dateStart).toBe('page.fuelPurchases.report.error.dateInvalid');
  });
  test('bisiesto válido', () => { expect(isValidCalendarDate('2028-02-29')).toBe(true); });
  test('desde posterior a hasta; el mismo día vale', () => {
    expect(validateReportRange({ dateStart: '2026-08-31', dateEnd: '2026-08-01' }).dateEnd).toBe('page.fuelPurchases.report.error.range');
    expect(validateReportRange({ dateStart: '2026-08-10', dateEnd: '2026-08-10' })).toEqual({});
  });
  test('366 días pasa y 367 no (igual que el back)', () => {
    expect(MAX_RANGE_DAYS).toBe(366);
    expect(validateReportRange({ dateStart: '2026-01-01', dateEnd: '2027-01-02' })).toEqual({});
    expect(validateReportRange({ dateStart: '2026-01-01', dateEnd: '2027-01-03' }).dateEnd).toBe('page.purchaseReport.report.error.tooLarge');
    expect(validateReportRange({ dateStart: '2028-01-01', dateEnd: '2029-01-01' })).toEqual({});
    expect(validateReportRange({ dateStart: '2028-01-01', dateEnd: '2029-01-02' }).dateEnd).toBe('page.purchaseReport.report.error.tooLarge');
  });
});

describe('buildReportRequest', () => {
  const f = { dateStart: ' 2026-08-01 ', dateEnd: '2026-08-31' };
  test('json: URL por tipo, fechas recortadas y sin filtros vacíos ni formato', () => {
    expect(buildReportRequest('byStore', f)).toEqual({ url: 'inventory/reports/purchases/byStore', params: { dateStart: '2026-08-01', dateEnd: '2026-08-31' } });
  });
  test('los filtros con valor viajan como texto; 0, vacío y no numéricos no', () => {
    expect(buildReportRequest('detailByProduct', { ...f, storeId: 3, providerId: '12', productCode: ' P1 ' }).params).toEqual({ dateStart: '2026-08-01', dateEnd: '2026-08-31', storeId: '3', providerId: '12', productCode: 'P1' });
    expect(buildReportRequest('byStore', { ...f, storeId: 0, providerId: '', productCode: 0 }).params).toEqual({ dateStart: '2026-08-01', dateEnd: '2026-08-31' });
    expect(buildReportRequest('byStore', { ...f, storeId: 'abc', providerId: -2 }).params).not.toHaveProperty('storeId');
  });
  test('pdf y xlsx agregan el formato en params (no en la URL, que GETPdf agrega "?")', () => {
    const r = buildReportRequest('byStore', f, 'xlsx');
    expect(r.params.format).toBe('xlsx');
    expect(r.url).not.toContain('?');
    expect(buildReportRequest('byStore', f, 'pdf').params.format).toBe('pdf');
    expect(buildReportRequest('byStore', f, 'csv').params).not.toHaveProperty('format');
  });
  test('nombre del archivo', () => {
    expect(reportFileName('Reporte', 'xlsx')).toBe('Reporte.xlsx');
    expect(reportFileName('Reporte', 'pdf')).toBe('Reporte.pdf');
    expect(reportFileName('Reporte', 'otro')).toBe('Reporte.pdf');
  });
});

describe('opciones del modal y columnas', () => {
  test('las 13 opciones del legacy apuntan a un tipo con columnas', () => {
    expect(Object.keys(RADIO_TO_TYPE).map(Number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
    Object.values(RADIO_TO_TYPE).forEach((t) => expect(COLUMNS_BY_TYPE[t].length).toBeGreaterThan(0));
    expect(RADIO_TO_TYPE[6]).toBe('monthlyDetail');
    expect(RADIO_TO_TYPE[10]).toBe('taxDeclaration');
    expect(RADIO_TO_TYPE[11]).toBe('adminExpenses');
  });
  test('el detallado mensual tiene las 12 columnas de meses', () => {
    expect(COLUMNS_BY_TYPE.monthlyDetail.filter((c) => /^m\d+$/.test(c.field))).toHaveLength(12);
  });
  test('cada columna declara campo y etiqueta', () => {
    Object.values(COLUMNS_BY_TYPE).flat().forEach((c) => { expect(c.field && c.label).toBeTruthy(); });
  });
});

describe('títulos', () => {
  test('hay un título (nombre de archivo) por cada tipo con columnas', () => {
    expect(Object.keys(REPORT_TITLES).sort()).toEqual(Object.keys(COLUMNS_BY_TYPE).sort());
  });
});

describe('normalizeReport', () => {
  test('toma filas y totales; cualquier forma rara es vacío', () => {
    expect(normalizeReport({ title: 'T', rows: [{ a: 1 }], totals: { total: 5 } })).toEqual({ title: 'T', rows: [{ a: 1 }], totals: { total: 5 } });
    [undefined, null, {}, { rows: 'x', totals: 5 }].forEach((d) => expect(normalizeReport(d)).toEqual({ title: '', rows: [], totals: {} }));
  });
});
