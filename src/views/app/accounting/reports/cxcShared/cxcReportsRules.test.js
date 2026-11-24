import { describe, expect, test } from 'vitest';
import {
  localToday, isRealDate, validateAsOfDate, validateHistoryFilter, validateSearch, validateInsurer, normalizeSettings, effectiveCurrency, buildAsOfQuery, buildHistoryQuery,
  normalizeWeekly, normalizeProjection, normalizeHistory, normalizeInsurer, customerOptions
} from './cxcReportsRules';

describe('reportes de CxC: filtros', () => {
  test('fecha real', () => {
    expect(localToday(new Date(2026, 10, 24))).toBe('2026-11-24');
    expect(isRealDate('2028-02-29')).toBe(true);
    ['2026-02-30', '2026-13-01', '', 'x', null].forEach((d) => expect(isRealDate(d)).toBe(false));
    expect(validateAsOfDate('2026-11-24')).toBe('');
    expect(validateAsOfDate('2026-02-30')).toBe('page.cxcReports.msg.dateInvalid');
  });
  test('histórico: cliente o rango completo, válido y ordenado', () => {
    expect(validateHistoryFilter({ customerId: 5 })).toBe('');
    expect(validateHistoryFilter({ dateStart: '2026-01-01', dateEnd: '2026-01-31' })).toBe('');
    expect(validateHistoryFilter({})).toBe('page.cxcReports.msg.historyFilterRequired');
    expect(validateHistoryFilter({ customerId: 0, dateStart: '', dateEnd: '' })).toBe('page.cxcReports.msg.historyFilterRequired');
    expect(validateHistoryFilter({ dateStart: '2026-01-01' })).toBe('page.cxcReports.msg.historyRangeIncomplete');
    expect(validateHistoryFilter({ customerId: 1, dateEnd: '2026-01-01' })).toBe('page.cxcReports.msg.historyRangeIncomplete');
    expect(validateHistoryFilter({ dateStart: '2026-02-30', dateEnd: '2026-03-01' })).toBe('page.cxcReports.msg.dateInvalid');
    expect(validateHistoryFilter({ dateStart: '2026-03-02', dateEnd: '2026-03-01' })).toBe('page.cxcReports.msg.historyRangeInverted');
  });
  test('buscador: cliente o 3 caracteres', () => {
    expect(validateSearch({ customerId: 3 })).toBe('');
    expect(validateSearch({ documentCode: '001-A' })).toBe('');
    expect(validateSearch({})).toBe('page.cxcReports.msg.searchFilterRequired');
    expect(validateSearch({ documentCode: '  ' })).toBe('page.cxcReports.msg.searchFilterRequired');
    expect(validateSearch({ documentCode: 'ab' })).toBe('page.cxcReports.msg.searchTooShort');
    expect(validateSearch({ documentCode: 'ab', customerId: 2 })).toBe('');
    expect(validateInsurer({ insurerId: 0 })).toBe('page.cxcReports.msg.insurerRequired');
    expect(validateInsurer({ insurerId: '4' })).toBe('');
  });
  test('moneda y consultas', () => {
    expect(normalizeSettings(undefined)).toEqual({ hasDualCurrency: false });
    expect(effectiveCurrency(2, { hasDualCurrency: false })).toBe(1);
    expect(effectiveCurrency(2, { hasDualCurrency: true })).toBe(2);
    expect(buildAsOfQuery({ date: '2026-11-24', currency: 2, customerId: 0, customerTypeId: 3 }, { hasDualCurrency: false })).toEqual({ date: '2026-11-24', currency: 1, customerTypeId: 3 });
    expect(buildAsOfQuery({ date: 'x', currency: 2, customerId: '7' }, { hasDualCurrency: true })).toEqual({ date: 'x', currency: 2, customerId: 7 });
    expect(buildHistoryQuery({ customerId: 0, dateStart: '', dateEnd: '' })).toEqual({});
    expect(buildHistoryQuery({ customerId: 4, dateStart: '2026-01-01', dateEnd: '2026-02-01' })).toEqual({ customerId: 4, dateStart: '2026-01-01', dateEnd: '2026-02-01' });
  });
  test('respuestas seguras', () => {
    expect(normalizeWeekly(undefined)).toMatchObject({ rows: [], totals: { week1: 0, weekLater: 0, weekTotal: 0 } });
    expect(normalizeWeekly({ rows: [1], totals: { week1: 5 } }).totals.week1).toBe(5);
    expect(normalizeProjection(null)).toMatchObject({ rows: [], totals: { valCurr: 0, total: 0 }, percents: { valMore: 0 } });
    expect(normalizeHistory(undefined).totals).toEqual({ totalDocuments: 0, totalPaid: 0 });
    expect(normalizeInsurer(undefined)).toEqual({ rows: [], totals: { balance: 0 } });
    expect(customerOptions([{ id: 1, name: 'A' }])).toEqual([{ label: '1 | A', value: 1 }]);
    expect(customerOptions(undefined)).toEqual([]);
  });
});
