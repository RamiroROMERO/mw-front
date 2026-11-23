import { describe, expect, test } from 'vitest';
import {
  COLUMNS, REPORT_URL, SETTINGS_URL, buildSummaryRequest, defaultRange, effectiveForm, normalizeSettings, normalizeSummary, reportFileName, validateReportRange
} from './summaryByProductRules';

const form = { itemType: 0, currency: 1, startDate: '2026-08-01', endDate: '2026-08-31' };

describe('buildSummaryRequest', () => {
  test('mínima: solo las fechas (startDate/endDate pasan a dateStart/dateEnd); tipo "todos" y Lempiras no viajan', () => {
    expect(buildSummaryRequest(form)).toEqual({ url: REPORT_URL, params: { dateStart: '2026-08-01', dateEnd: '2026-08-31' } });
  });

  test('tipo de producto 1 o 2 y dólares viajan como texto', () => {
    expect(buildSummaryRequest({ ...form, itemType: 2, currency: 2 }).params).toEqual({ dateStart: '2026-08-01', dateEnd: '2026-08-31', itemType: '2', currency: '2' });
    expect(buildSummaryRequest({ ...form, itemType: 1 }).params.itemType).toBe('1');
  });

  test('tipo inválido, vacío o 0 no viaja', () => {
    ['', 0, '0', 'x', 3, -1].forEach((itemType) => expect(buildSummaryRequest({ ...form, itemType }).params).not.toHaveProperty('itemType'));
  });

  test('el formato pdf o xlsx va en params (no en la URL); json no manda formato', () => {
    expect(buildSummaryRequest(form, 'pdf').params.format).toBe('pdf');
    const xlsx = buildSummaryRequest(form, 'xlsx');
    expect(xlsx.params.format).toBe('xlsx');
    expect(xlsx.url).not.toContain('?');
    expect(buildSummaryRequest(form, 'json').params).not.toHaveProperty('format');
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

test('defaultRange: del primer día del mes a hoy', () => {
  expect(defaultRange(new Date(2026, 10, 20, 23, 59))).toEqual({ startDate: '2026-11-01', endDate: '2026-11-20' });
});

test('nombres de archivo y URL de ajustes', () => {
  expect(reportFileName('pdf')).toBe('Reporte de Ventas por Producto.pdf');
  expect(reportFileName('xlsx')).toBe('Reporte de Ventas por Producto.xlsx');
  expect(SETTINGS_URL).toBe(`${REPORT_URL}/settings`);
});

test('las 7 columnas son las del back, con 5 montos numéricos', () => {
  expect(COLUMNS.map((c) => c.field)).toEqual(['productCode', 'productName', 'qty', 'subtotal', 'discount', 'tax', 'total']);
  expect(COLUMNS.filter((c) => c.isNumber)).toHaveLength(5);
});

describe('normalizeSummary', () => {
  test('forma válida', () => expect(normalizeSummary({ rows: [{ a: 1 }], totals: { total: 5 } })).toEqual({ rows: [{ a: 1 }], totals: { total: 5 } }));
  test('formas raras quedan vacías', () => {
    [undefined, null, 'x', { rows: 'x', totals: 3 }].forEach((data) => expect(normalizeSummary(data)).toEqual({ rows: [], totals: {} }));
  });
});

describe('moneda según la facturación de la empresa', () => {
  test('normalizeSettings: solo true exacto cuenta como dual', () => {
    expect(normalizeSettings({ hasDualCurrency: true })).toEqual({ hasDualCurrency: true });
    [undefined, null, {}, { hasDualCurrency: 1 }, { hasDualCurrency: 'true' }, 'x'].forEach((data) => expect(normalizeSettings(data)).toEqual({ hasDualCurrency: false }));
  });

  test('effectiveForm: sin facturación dual la moneda se fuerza a Lempiras y no viaja', () => {
    const dollars = { ...form, currency: 2 };
    expect(effectiveForm(dollars, { hasDualCurrency: false }).currency).toBe(1);
    expect(buildSummaryRequest(effectiveForm(dollars, { hasDualCurrency: false })).params).not.toHaveProperty('currency');
    expect(buildSummaryRequest(effectiveForm(dollars, { hasDualCurrency: true })).params.currency).toBe('2');
    expect(effectiveForm(dollars, undefined).currency).toBe(1);
  });
});
