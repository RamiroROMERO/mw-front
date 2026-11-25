import { describe, expect, test } from 'vitest';
import { BASE_PATH, validateFilter, buildQuery, normalizeReport, activeNotices, noticeItemText, percentText } from './budgetExecutionRules';

const ok = { mode: 'month', year: 2025, month: 12 };

describe('presupuesto ejecutado: filtros (los mismos del back)', () => {
  test('ruta', () => expect(BASE_PATH).toBe('accounting/reports/budgetExecution'));
  test('año de 4 dígitos entre 2000 y 2100, y mes del 1 al 12', () => {
    expect(validateFilter(ok)).toBe('');
    ['', 'abc', 1999, 2101, '25'].forEach((year) => expect(validateFilter({ ...ok, year })).toBe('page.budgetExecution.msg.yearInvalid'));
    [0, 13, '', 'x'].forEach((month) => expect(validateFilter({ ...ok, month })).toBe('page.budgetExecution.msg.monthInvalid'));
  });
  test('rango: el mes final válido y no menor al inicial; un solo mes es válido', () => {
    expect(validateFilter({ mode: 'range', year: 2025, month: 3, monthEnd: 11 })).toBe('');
    expect(validateFilter({ mode: 'range', year: 2025, month: 5, monthEnd: 5 })).toBe('');
    expect(validateFilter({ mode: 'range', year: 2025, month: 5, monthEnd: 4 })).toBe('page.budgetExecution.msg.rangeInverted');
    expect(validateFilter({ mode: 'range', year: 2025, month: 5, monthEnd: 13 })).toBe('page.budgetExecution.msg.monthInvalid');
    expect(validateFilter({ mode: 'range', year: 2025, month: 5, monthEnd: '' })).toBe('page.budgetExecution.msg.monthInvalid');
    // el mes final no cuenta en modo mes
    expect(validateFilter({ mode: 'month', year: 2025, month: 5, monthEnd: 99 })).toBe('');
  });
  test('consulta con números; el mes final solo en modo rango', () => {
    expect(buildQuery({ mode: 'month', year: '2025', month: '2', monthEnd: '9' })).toEqual({ mode: 'month', year: 2025, month: 2 });
    expect(buildQuery({ mode: 'range', year: '2025', month: '3', monthEnd: '9' })).toEqual({ mode: 'range', year: 2025, month: 3, monthEnd: 9 });
  });
});

describe('presupuesto ejecutado: respuesta y avisos', () => {
  test('una respuesta vacía no rompe la pantalla', () => {
    expect(normalizeReport(undefined)).toEqual({ rows: [], notices: { missingAccounts: [], otherTypeAccounts: [] } });
    expect(normalizeReport({ rows: 'x', notices: { missingAccounts: 'y' } }).rows).toEqual([]);
  });
  test('solo se muestran los avisos con algo, en orden fijo', () => {
    const n = normalizeReport({ notices: { missingAccounts: [{ line: 'A', accountNumber: '1' }], otherTypeAccounts: [{ line: 'B', accountNumber: '7', type: 'Cuentas de Orden' }] } }).notices;
    expect(activeNotices(n).map((x) => x.key)).toEqual(['missingAccounts', 'otherTypeAccounts']);
    expect(activeNotices(normalizeReport(undefined).notices)).toEqual([]);
    expect(activeNotices(undefined)).toEqual([]);
  });
  test('texto de un elemento de aviso y del porcentaje', () => {
    expect(noticeItemText({ line: 'Ventas', accountNumber: '4010101001' })).toBe('Ventas: 4010101001');
    expect(noticeItemText({ line: 'Orden', accountNumber: '7', type: 'Cuentas de Orden' })).toBe('Orden: 7 (Cuentas de Orden)');
    const f = (v) => v.toFixed(2);
    expect(percentText(90.01, f)).toBe('90.01%');
    expect(percentText(0, f)).toBe('0.00%');
    expect(percentText(null, f)).toBe('');
    expect(percentText(undefined, f)).toBe('');
  });
});
