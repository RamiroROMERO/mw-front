import { describe, expect, test } from 'vitest';
import {
  COLUMNS, REPORT_URL, SETTINGS_URL, buildGeneralInvoiceRequest, defaultRange, effectiveForm, normalizeGeneralInvoice, normalizeSettings, reportFileName, validateReportRange
} from './generalInvoiceRules';

const form = { customerId: 0, typeDocto: 3, currency: 1, startDate: '2026-08-01', endDate: '2026-08-31' };

describe('buildGeneralInvoiceRequest', () => {
  test('mínima: solo las fechas (startDate/endDate pasan a dateStart/dateEnd); "todos", tipo 3 y Lempiras no viajan', () => {
    expect(buildGeneralInvoiceRequest(form)).toEqual({ url: REPORT_URL, params: { dateStart: '2026-08-01', dateEnd: '2026-08-31' } });
  });

  test('cliente, tipo de venta 1 o 2 y dólares viajan como texto', () => {
    const { params } = buildGeneralInvoiceRequest({ ...form, customerId: 23, typeDocto: 2, currency: 2 });
    expect(params).toEqual({ dateStart: '2026-08-01', dateEnd: '2026-08-31', customerId: '23', saleType: '2', currency: '2' });
    expect(buildGeneralInvoiceRequest({ ...form, typeDocto: 1 }).params.saleType).toBe('1');
  });

  test('cliente en 0, vacío o inválido no viaja', () => {
    ['', 0, '0', 'abc', -3, 1.5].forEach((customerId) => expect(buildGeneralInvoiceRequest({ ...form, customerId }).params).not.toHaveProperty('customerId'));
  });

  test('el formato pdf o xlsx va en params (no en la URL); json no manda formato', () => {
    expect(buildGeneralInvoiceRequest(form, 'pdf').params.format).toBe('pdf');
    const xlsx = buildGeneralInvoiceRequest(form, 'xlsx');
    expect(xlsx.params.format).toBe('xlsx');
    expect(xlsx.url).not.toContain('?');
    expect(buildGeneralInvoiceRequest(form, 'json').params).not.toHaveProperty('format');
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

test('nombres de archivo', () => {
  expect(reportFileName('pdf')).toBe('Reporte de Ventas.pdf');
  expect(reportFileName('xlsx')).toBe('Reporte de Ventas.xlsx');
});

test('las 11 columnas son las del back, con RTN y los 7 montos numéricos', () => {
  expect(COLUMNS.map((c) => c.field)).toEqual(['date', 'number', 'customerCode', 'customerName', 'subtotal', 'discount', 'taxedValue', 'exemptValue', 'exoneratedValue', 'tax', 'total']);
  expect(COLUMNS.filter((c) => c.isNumber)).toHaveLength(7);
});

describe('normalizeGeneralInvoice', () => {
  test('forma válida', () => expect(normalizeGeneralInvoice({ rows: [{ a: 1 }], totals: { total: 5 } })).toEqual({ rows: [{ a: 1 }], totals: { total: 5 } }));
  test('formas raras quedan vacías', () => {
    [undefined, null, 'x', { rows: 'x', totals: 3 }].forEach((data) => expect(normalizeGeneralInvoice(data)).toEqual({ rows: [], totals: {} }));
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
    expect(buildGeneralInvoiceRequest(effectiveForm(dollars, { hasDualCurrency: false })).params).not.toHaveProperty('currency');
    expect(buildGeneralInvoiceRequest(effectiveForm(dollars, { hasDualCurrency: true })).params.currency).toBe('2');
    expect(effectiveForm(dollars, undefined).currency).toBe(1);
  });
});

test('la URL de los ajustes cuelga de la del reporte', () => {
  expect(SETTINGS_URL).toBe(`${REPORT_URL}/settings`);
});
