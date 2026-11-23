import { describe, expect, test } from 'vitest';
import {
  COLUMNS, REPORT_URL, SETTINGS_URL, buildMonthlyRequest, defaultYear, effectiveForm, normalizeMonthly, normalizeSettings, reportFileName, validateYear, yearOptions
} from './monthlySalesCustomerRules';

const form = { year: 2025, customerId: 0, withoutTax: 0, currency: 1 };

describe('buildMonthlyRequest', () => {
  test('mínima: solo el año; todos los clientes, con impuesto y Lempiras no viajan', () => {
    expect(buildMonthlyRequest(form)).toEqual({ url: REPORT_URL, params: { year: '2025' } });
  });

  test('cliente, sin impuesto y dólares viajan como texto', () => {
    expect(buildMonthlyRequest({ ...form, customerId: 23, withoutTax: 1, currency: 2 }).params).toEqual({ year: '2025', customerId: '23', withTax: '0', currency: '2' });
  });

  test('cliente en 0, vacío o inválido no viaja', () => {
    ['', 0, '0', 'abc', -3, 1.5].forEach((customerId) => expect(buildMonthlyRequest({ ...form, customerId }).params).not.toHaveProperty('customerId'));
  });

  test('el formato pdf o xlsx va en params (no en la URL); json no manda formato', () => {
    expect(buildMonthlyRequest(form, 'pdf').params.format).toBe('pdf');
    const xlsx = buildMonthlyRequest(form, 'xlsx');
    expect(xlsx.params.format).toBe('xlsx');
    expect(xlsx.url).not.toContain('?');
    expect(buildMonthlyRequest(form, 'json').params).not.toHaveProperty('format');
  });
});

describe('año', () => {
  test('validateYear acepta 4 dígitos entre 2000 y 2100 (bordes incluidos)', () => {
    ['2000', 2025, '2100'].forEach((year) => expect(validateYear(year)).toEqual({}));
  });

  test('vacío, texto, fuera de rango o con decimales se marca', () => {
    ['', undefined, null, 'abc', '25', '1999', '2101', '2025.5'].forEach((year) => expect(validateYear(year).year).toBeDefined());
  });

  test('el selector ofrece del año actual hacia atrás y el valor por defecto es el actual', () => {
    const now = new Date(2026, 10, 23);
    const options = yearOptions(now, 3);
    expect(options).toEqual([{ value: 2026, label: '2026' }, { value: 2025, label: '2025' }, { value: 2024, label: '2024' }, { value: 2023, label: '2023' }]);
    expect(defaultYear(now)).toBe(2026);
    expect(yearOptions(now)).toHaveLength(15);
  });
});

test('nombres de archivo y URL de ajustes', () => {
  expect(reportFileName('pdf')).toBe('Reporte de Ventas por Cliente Mensual.pdf');
  expect(reportFileName('xlsx')).toBe('Reporte de Ventas por Cliente Mensual.xlsx');
  expect(SETTINGS_URL).toBe(`${REPORT_URL}/settings`);
});

test('las 15 columnas son las del back: cliente, 12 meses, total y porcentaje', () => {
  expect(COLUMNS.map((c) => c.field)).toEqual(['customerName', ...Array.from({ length: 12 }, (_, i) => `month_${i + 1}`), 'total', 'percent']);
  expect(COLUMNS.filter((c) => c.isNumber)).toHaveLength(14);
});

describe('normalizeMonthly', () => {
  test('forma válida', () => expect(normalizeMonthly({ rows: [{ a: 1 }], totals: { total: 5 } })).toEqual({ rows: [{ a: 1 }], totals: { total: 5 } }));
  test('formas raras quedan vacías', () => {
    [undefined, null, 'x', { rows: 'x', totals: 3 }].forEach((data) => expect(normalizeMonthly(data)).toEqual({ rows: [], totals: {} }));
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
    expect(buildMonthlyRequest(effectiveForm(dollars, { hasDualCurrency: false })).params).not.toHaveProperty('currency');
    expect(buildMonthlyRequest(effectiveForm(dollars, { hasDualCurrency: true })).params.currency).toBe('2');
  });
});
