import { describe, expect, test } from 'vitest';
import { BASE_PATH, validateFilter, buildQuery, normalizeStatement, activeNotices, defaultLevel } from './incomeStatementRules';

const ok = { dateStart: '2025-01-01', dateEnd: '2025-12-31', level: 7 };

describe('estado de resultado: filtros (los mismos del back)', () => {
  test('ruta', () => expect(BASE_PATH).toBe('accounting/reports/incomeStatementReport'));
  test('fechas obligatorias, reales y ordenadas; nivel elegido', () => {
    expect(validateFilter(ok)).toBe('');
    expect(validateFilter({ ...ok, dateStart: '' })).toBe('page.incomeStatementReport.msg.rangeRequired');
    expect(validateFilter({ ...ok, dateEnd: undefined })).toBe('page.incomeStatementReport.msg.rangeRequired');
    expect(validateFilter({ ...ok, dateStart: '2025-02-30' })).toBe('page.incomeStatementReport.msg.dateInvalid');
    expect(validateFilter({ ...ok, dateStart: '2026-01-01' })).toBe('page.incomeStatementReport.msg.rangeInverted');
    expect(validateFilter({ ...ok, level: 0 })).toBe('page.incomeStatementReport.msg.levelRequired');
    expect(validateFilter({ ...ok, level: '' })).toBe('page.incomeStatementReport.msg.levelRequired');
  });
  test('consulta con el nivel como número', () => expect(buildQuery({ ...ok, level: '10' })).toEqual({ dateStart: '2025-01-01', dateEnd: '2025-12-31', level: 10 }));
});

describe('estado de resultado: respuesta y avisos', () => {
  test('una respuesta vacía no rompe la pantalla', () => {
    expect(normalizeStatement(undefined).rows).toEqual([]);
    expect(normalizeStatement(undefined).totals).toBeNull();
    expect(normalizeStatement({ rows: 'x' }).rows).toEqual([]);
    expect(normalizeStatement({ notices: { nonResultAccounts: { count: 2, lines: 5, debit: 1, credit: 0 } } }).notices.nonResultAccounts.count).toBe(2);
  });
  test('solo se muestran los avisos con algo, en orden fijo', () => {
    const s = normalizeStatement({ notices: { nonResultAccounts: { count: 1, lines: 3, debit: 5, credit: 0 }, excludedClosing: { count: 4, debit: 1, credit: 1 } } });
    expect(activeNotices(s.notices).map((n) => n.key)).toEqual(['nonResultAccounts', 'excludedClosing']);
    expect(activeNotices(normalizeStatement(undefined).notices)).toEqual([]);
    expect(activeNotices(undefined)).toEqual([]);
  });
  test('el primer nivel que ofrece el back queda elegido si no hay uno', () => {
    const levels = [{ value: 7 }, { value: 10 }];
    expect(defaultLevel(levels, 0)).toBe(7);
    expect(defaultLevel(levels, 10)).toBe(10);
    expect(defaultLevel([], 0)).toBe(0);
    expect(defaultLevel(undefined, 0)).toBe(0);
  });
});
