import { describe, expect, test } from 'vitest';
import { BASE_PATH, validateFilter, buildQuery, validateAnnual, buildAnnualQuery, normalizeBalance, activeNotices, isBalanced, defaultLevel } from './trialBalanceRules';

const ok = { dateStart: '2025-12-01', dateEnd: '2025-12-31', level: 10 };

describe('balanza: filtros (los mismos del back)', () => {
  test('ruta', () => expect(BASE_PATH).toBe('accounting/reports/trialBalance'));
  test('fechas obligatorias, reales y ordenadas; nivel elegido', () => {
    expect(validateFilter(ok)).toBe('');
    expect(validateFilter({ ...ok, dateStart: '' })).toBe('page.trialBalance.msg.rangeRequired');
    expect(validateFilter({ ...ok, dateEnd: undefined })).toBe('page.trialBalance.msg.rangeRequired');
    expect(validateFilter({ ...ok, dateStart: '2025-02-30' })).toBe('page.trialBalance.msg.dateInvalid');
    expect(validateFilter({ ...ok, dateStart: '2026-01-01' })).toBe('page.trialBalance.msg.rangeInverted');
    expect(validateFilter({ ...ok, level: 0 })).toBe('page.trialBalance.msg.levelRequired');
  });
  test('consulta con el nivel como número', () => expect(buildQuery({ ...ok, level: '7' })).toEqual({ dateStart: '2025-12-01', dateEnd: '2025-12-31', level: 7 }));
  test('anual integrada: año de "Desde" y nivel', () => {
    expect(validateAnnual({ dateStart: '2025-12-01', level: 10 })).toBe('');
    expect(validateAnnual({ dateStart: '', level: 10 })).toBe('page.trialBalance.msg.rangeRequired');
    expect(validateAnnual({ dateStart: '2025-13-01', level: 10 })).toBe('page.trialBalance.msg.dateInvalid');
    expect(validateAnnual({ dateStart: '2025-12-01', level: 0 })).toBe('page.trialBalance.msg.levelRequired');
    expect(buildAnnualQuery({ dateStart: '2024-03-15', level: '7' })).toEqual({ year: 2024, level: 7 });
  });
});

describe('balanza: respuesta, control y avisos', () => {
  test('una respuesta vacía no rompe la pantalla', () => {
    const b = normalizeBalance(undefined);
    expect(b.rows).toEqual([]);
    expect(b.totals).toBeNull();
    expect(b.notices.otherTypes.types).toEqual([]);
    expect(normalizeBalance({ rows: 'x' }).rows).toEqual([]);
  });
  test('solo se muestran los avisos con algo, en orden fijo', () => {
    const b = normalizeBalance({ notices: { noAccount: { count: 2, lines: 5, debit: 1, credit: 0 }, otherTypes: { count: 1, lines: 3, debit: 5, credit: 0, types: ['Cuentas de Orden'] } } });
    expect(activeNotices(b.notices).map((n) => n.key)).toEqual(['noAccount', 'otherTypes']);
    expect(activeNotices(normalizeBalance(undefined).notices)).toEqual([]);
    expect(activeNotices(undefined)).toEqual([]);
  });
  test('un control cuadra solo con diferencia 0 al centavo', () => {
    expect(isBalanced(0)).toBe(true);
    expect(isBalanced(0.004)).toBe(true);
    expect(isBalanced(0.01)).toBe(false);
    expect(isBalanced(-264.82)).toBe(false);
    expect(isBalanced(undefined)).toBe(false);
  });
  test('el último nivel (cuenta de detalle) queda elegido si no hay uno', () => {
    const levels = [{ value: 3 }, { value: 7 }, { value: 10 }];
    expect(defaultLevel(levels, 0)).toBe(10);
    expect(defaultLevel(levels, 7)).toBe(7);
    expect(defaultLevel([], 0)).toBe(0);
  });
});
