import { describe, expect, test } from 'vitest';
import {
  COLUMNS, REPORT_URL, SETTINGS_URL, TYPE_DETAIL, TYPE_NEW_CUSTOMERS, TYPE_SUMMARY, buildSellerRequest, defaultRange, effectiveForm, normalizeSellerReport, normalizeSettings,
  reportFileName, validateReportRange
} from './salesBySellerRules';

const form = { sellerCode: '', currency: 1, partnersOnly: 0, startDate: '2026-08-01', endDate: '2026-08-31' };

describe('buildSellerRequest', () => {
  test('mínima: solo las fechas (startDate/endDate pasan a dateStart/dateEnd) y la URL del tipo; "todos", Lempiras y sin mayoristas no viajan', () => {
    for (const type of [TYPE_DETAIL, TYPE_SUMMARY, TYPE_NEW_CUSTOMERS]) {
      expect(buildSellerRequest(type, form)).toEqual({ url: `${REPORT_URL}/${type}`, params: { dateStart: '2026-08-01', dateEnd: '2026-08-31' } });
    }
  });

  test('el vendedor viaja como texto; vacío o "0" no viaja', () => {
    expect(buildSellerRequest(TYPE_DETAIL, { ...form, sellerCode: ' MM ' }).params.sellerCode).toBe('MM');
    ['', '0', null, undefined].forEach((sellerCode) => expect(buildSellerRequest(TYPE_DETAIL, { ...form, sellerCode }).params).not.toHaveProperty('sellerCode'));
  });

  test('la moneda Dólares solo viaja en detalle y resumen; los mayoristas solo en clientes nuevos', () => {
    const both = { ...form, currency: 2, partnersOnly: 1 };
    expect(buildSellerRequest(TYPE_DETAIL, both).params).toEqual({ dateStart: '2026-08-01', dateEnd: '2026-08-31', currency: '2' });
    expect(buildSellerRequest(TYPE_SUMMARY, both).params.currency).toBe('2');
    expect(buildSellerRequest(TYPE_NEW_CUSTOMERS, both).params).toEqual({ dateStart: '2026-08-01', dateEnd: '2026-08-31', partnersOnly: '1' });
  });

  test('el formato pdf o xlsx va en params (no en la URL); json no manda formato', () => {
    expect(buildSellerRequest(TYPE_DETAIL, form, 'pdf').params.format).toBe('pdf');
    const xlsx = buildSellerRequest(TYPE_SUMMARY, form, 'xlsx');
    expect(xlsx.params.format).toBe('xlsx');
    expect(xlsx.url).not.toContain('?');
    expect(buildSellerRequest(TYPE_DETAIL, form, 'json').params).not.toHaveProperty('format');
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
  expect(reportFileName(TYPE_DETAIL, 'pdf')).toBe('Reporte de Ventas por Vendedor.pdf');
  expect(reportFileName(TYPE_SUMMARY, 'xlsx')).toBe('Resumen de Ventas por Vendedor y Producto.xlsx');
  expect(reportFileName(TYPE_NEW_CUSTOMERS, 'xlsx')).toBe('Reporte de Clientes Registrados por Vendedor.xlsx');
  expect(SETTINGS_URL).toBe(`${REPORT_URL}/settings`);
});

test('las columnas de cada tipo son las del back (el vendedor primero)', () => {
  expect(COLUMNS[TYPE_DETAIL].map((c) => c.field)).toEqual(['sellerName', 'date', 'number', 'customerName', 'productName', 'qty', 'price', 'subtotal', 'tax', 'total', 'commissionPercent', 'commissionValue']);
  expect(COLUMNS[TYPE_SUMMARY].map((c) => c.field)).toEqual(['sellerName', 'productCode', 'productName', 'qty', 'subtotal', 'tax', 'total', 'commissionValue']);
  expect(COLUMNS[TYPE_NEW_CUSTOMERS].map((c) => c.field)).toEqual(['sellerName', 'dateIn', 'customerCode', 'customerName', 'phone1', 'deptoName']);
});

describe('normalizeSellerReport', () => {
  test('forma válida', () => expect(normalizeSellerReport({ rows: [{ a: 1 }], totals: { total: 5 } })).toEqual({ rows: [{ a: 1 }], totals: { total: 5 } }));
  test('formas raras quedan vacías', () => {
    [undefined, null, 'x', { rows: 'x', totals: 3 }].forEach((data) => expect(normalizeSellerReport(data)).toEqual({ rows: [], totals: {} }));
  });
});

describe('moneda según la facturación de la empresa', () => {
  test('normalizeSettings: solo true exacto cuenta como dual', () => {
    expect(normalizeSettings({ hasDualCurrency: true })).toEqual({ hasDualCurrency: true });
    [undefined, null, {}, { hasDualCurrency: 1 }, 'x'].forEach((data) => expect(normalizeSettings(data)).toEqual({ hasDualCurrency: false }));
  });

  test('effectiveForm: sin facturación dual la moneda se fuerza a Lempiras y no viaja', () => {
    const dollars = { ...form, currency: 2 };
    expect(effectiveForm(dollars, { hasDualCurrency: false }).currency).toBe(1);
    expect(buildSellerRequest(TYPE_DETAIL, effectiveForm(dollars, { hasDualCurrency: false })).params).not.toHaveProperty('currency');
    expect(buildSellerRequest(TYPE_DETAIL, effectiveForm(dollars, { hasDualCurrency: true })).params.currency).toBe('2');
  });
});
