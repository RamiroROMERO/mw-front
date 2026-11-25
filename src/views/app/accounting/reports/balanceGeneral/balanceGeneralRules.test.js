import { describe, expect, test } from 'vitest';
import { BASE_PATH, validateFilter, buildQuery, normalizeBalance, activeNotices, isBalanced, defaultLevel } from './balanceGeneralRules';

const ok = { date: '2025-12-31', level: 10 };

describe('balance general: filtros (los mismos del back)', () => {
  test('ruta', () => expect(BASE_PATH).toBe('accounting/reports/balanceGeneral'));
  test('fecha obligatoria y real; nivel elegido', () => {
    expect(validateFilter(ok)).toBe('');
    expect(validateFilter({ ...ok, date: '' })).toBe('page.balanceGeneral.msg.dateRequired');
    expect(validateFilter({ ...ok, date: undefined })).toBe('page.balanceGeneral.msg.dateRequired');
    expect(validateFilter({ ...ok, date: '2025-02-30' })).toBe('page.balanceGeneral.msg.dateInvalid');
    expect(validateFilter({ ...ok, level: 0 })).toBe('page.balanceGeneral.msg.levelRequired');
    expect(validateFilter({ ...ok, level: '' })).toBe('page.balanceGeneral.msg.levelRequired');
  });
  test('consulta con el nivel como número', () => expect(buildQuery({ date: '2025-12-31', level: '7' })).toEqual({ date: '2025-12-31', level: 7 }));
});

describe('balance general: respuesta y avisos', () => {
  test('una respuesta vacía no rompe la pantalla', () => {
    const b = normalizeBalance(undefined);
    expect(b.rows).toEqual([]);
    expect(b.totals).toBeNull();
    expect(b.notices.otherTypes.types).toEqual([]);
    expect(normalizeBalance({ rows: 'x' }).rows).toEqual([]);
  });
  test('solo se muestran los avisos con algo, en orden fijo', () => {
    const b = normalizeBalance({ notices: { noAccount: { count: 2, lines: 5, debit: 1, credit: 0 }, otherTypes: { count: 1, lines: 3, debit: 5, credit: 0, types: ['Cuentas de Orden'] }, unbalancedEntries: { debit: 10, credit: 4, difference: 6 } } });
    expect(activeNotices(b.notices).map((n) => n.key)).toEqual(['noAccount', 'otherTypes', 'unbalancedEntries']);
    expect(activeNotices(normalizeBalance(undefined).notices)).toEqual([]);
    expect(activeNotices(undefined)).toEqual([]);
  });
  test('descuadre menor a medio centavo no avisa', () => {
    expect(activeNotices(normalizeBalance({ notices: { unbalancedEntries: { debit: 1, credit: 1, difference: 0.001 } } }).notices)).toEqual([]);
  });
  test('cuadra solo con diferencia 0 al centavo', () => {
    expect(isBalanced({ difference: 0 })).toBe(true);
    expect(isBalanced({ difference: 0.004 })).toBe(true);
    expect(isBalanced({ difference: 0.01 })).toBe(false);
    expect(isBalanced({ difference: -500.1 })).toBe(false);
    expect(isBalanced(null)).toBe(false);
  });
  test('el último nivel (cuenta de detalle) queda elegido si no hay uno', () => {
    const levels = [{ value: 3 }, { value: 7 }, { value: 10 }];
    expect(defaultLevel(levels, 0)).toBe(10);
    expect(defaultLevel(levels, 7)).toBe(7);
    expect(defaultLevel([], 0)).toBe(0);
    expect(defaultLevel(undefined, 0)).toBe(0);
  });
});
