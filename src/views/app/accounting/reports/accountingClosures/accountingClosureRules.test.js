import { describe, expect, test } from 'vitest';
import { validateCloseDate, canDeleteRow, closingWarnings, localToday } from './accountingClosureRules';

const NOW = new Date(2026, 10, 24);

describe('Cierres Contables: reglas', () => {
  test('fecha real y no futura', () => {
    expect(localToday(NOW)).toBe('2026-11-24');
    expect(validateCloseDate('2026-11-24', NOW)).toBe('');
    expect(validateCloseDate('2024-02-29', NOW)).toBe('');
    ['', 'x', null, '2026-02-30', '2026-13-01'].forEach((d) => expect(validateCloseDate(d, NOW)).toBe('page.accountingClosures.msg.dateInvalid'));
    expect(validateCloseDate('2026-11-25', NOW)).toBe('page.accountingClosures.msg.dateFuture');
  });
  test('solo el último cierre se puede eliminar', () => {
    const rows = [{ id: 1, date: '2025-12-31' }, { id: 3, date: '2026-12-31' }, { id: 2, date: '2026-06-30' }];
    expect(canDeleteRow(rows[1], rows)).toBe(true);
    expect(canDeleteRow(rows[0], rows)).toBe(false);
    expect(canDeleteRow(rows[2], rows)).toBe(false);
    expect(canDeleteRow(null, rows)).toBe(false);
    expect(canDeleteRow({ id: 1 }, [])).toBe(false);
    const same = [{ id: 1, date: '2026-12-31' }, { id: 2, date: '2026-12-31' }];
    expect(canDeleteRow(same[1], same)).toBe(true);
    expect(canDeleteRow(same[0], same)).toBe(false);
  });
  test('avisos de la vista previa', () => {
    expect(closingWarnings(null)).toEqual([]);
    expect(closingWarnings({ difference: 0, unknownTypeAccounts: [] })).toEqual([]);
    expect(closingWarnings({ difference: 0.001, unknownTypeAccounts: [] })).toEqual([]);
    expect(closingWarnings({ difference: 10.5, unknownTypeAccounts: [{ accountNumber: 'X' }] })).toEqual(['difference', 'unknownTypes']);
  });
});
