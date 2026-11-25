import { describe, expect, test } from 'vitest';
import { BASE_PATH, validateFilter, buildQuery, fileNameOf, normalizeReport, activeNotices, monthLabels } from './accountingReportsRules';

const base = { kind: 'income', mode: 'monthly', year: 2025, level: 3, dateStart: '', dateEnd: '' };

describe('reportes contables: filtros (los mismos del back)', () => {
  test('ruta del módulo', () => expect(BASE_PATH).toBe('accounting/reports/accountingReports'));
  test('mensual y anual: año de 4 dígitos y nivel elegido', () => {
    expect(validateFilter(base)).toBe('');
    expect(validateFilter({ ...base, mode: 'annual' })).toBe('');
    ['25', '', 'abc', '12345', '1800', '2200'].forEach((year) => expect(validateFilter({ ...base, year })).toBe('page.accountingReports.msg.yearInvalid'));
    expect(validateFilter({ ...base, level: 0 })).toBe('page.accountingReports.msg.levelRequired');
    expect(validateFilter({ ...base, level: '' })).toBe('page.accountingReports.msg.levelRequired');
  });
  test('por fechas: ambas, reales y ordenadas; el año no se pide', () => {
    const range = { ...base, mode: 'range', year: '' };
    expect(validateFilter({ ...range, dateStart: '2026-01-01', dateEnd: '2026-01-31' })).toBe('');
    expect(validateFilter({ ...range, dateStart: '2026-01-01' })).toBe('page.accountingReports.msg.rangeRequired');
    expect(validateFilter({ ...range, dateStart: '2026-02-30', dateEnd: '2026-03-01' })).toBe('page.accountingReports.msg.dateInvalid');
    expect(validateFilter({ ...range, dateStart: '2026-03-02', dateEnd: '2026-03-01' })).toBe('page.accountingReports.msg.rangeInverted');
  });
  test('tipo y formato obligatorios', () => {
    expect(validateFilter({ ...base, kind: '' })).toBe('page.accountingReports.msg.kindRequired');
    expect(validateFilter({ ...base, mode: 'daily' })).toBe('page.accountingReports.msg.kindRequired');
  });
});

describe('reportes contables: consulta, archivo y respuesta', () => {
  test('mensual y anual mandan el año; por fechas, las fechas', () => {
    expect(buildQuery(base)).toEqual({ kind: 'income', mode: 'monthly', level: 3, year: 2025 });
    expect(buildQuery({ ...base, mode: 'range', dateStart: 'a', dateEnd: 'b' })).toEqual({ kind: 'income', mode: 'range', level: 3, dateStart: 'a', dateEnd: 'b' });
  });
  test('nombre del archivo igual al del back', () => {
    expect(fileNameOf({ kind: 'income', mode: 'monthly' })).toBe('ReporteIngresosMensual.xlsx');
    expect(fileNameOf({ kind: 'expenses', mode: 'annual' })).toBe('ReporteCostosGastosResumenAnual.xlsx');
    expect(fileNameOf({ kind: 'expenses', mode: 'range' })).toBe('ReporteCostosGastosPorFechas.xlsx');
  });
  test('una respuesta vacía no rompe la pantalla', () => {
    expect(normalizeReport(undefined).rows).toEqual([]);
    expect(normalizeReport(undefined).totals.total).toBe(0);
    expect(normalizeReport({ rows: 'x' }).rows).toEqual([]);
    expect(normalizeReport({ notices: { noAccount: { count: 2, debit: 1, credit: 0 } } }).notices.noAccount.count).toBe(2);
  });
  test('solo se muestran los avisos con algo', () => {
    const r = normalizeReport({ notices: { noAccount: { count: 3, debit: 1, credit: 2 }, unknownType: { count: 1, debit: 0, credit: 5 } } });
    expect(activeNotices(r.notices).map((n) => n.key)).toEqual(['noAccount', 'unknownType']);
    expect(activeNotices(undefined)).toEqual([]);
  });
  test('12 meses', () => expect(monthLabels('es')).toHaveLength(12));
});
