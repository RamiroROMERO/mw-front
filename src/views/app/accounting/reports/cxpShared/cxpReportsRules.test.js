import { describe, expect, test } from 'vitest';
import {
  BASE_PATH, validateAsOfDate, validateRange, validateProviderHistory, validateHistoryFilter, validateSearch, buildAsOfQuery, buildHistoryQuery, buildRangeQuery,
  normalizeProjection, normalizeCash, normalizePeriod, normalizeHistory, normalizeProviderHistory, providerOptions, dueStatus
} from './cxpReportsRules';

describe('reportes de CxP: filtros (los mismos del back)', () => {
  test('ruta del módulo propio', () => expect(BASE_PATH).toBe('accounting/reports/cxpReports'));
  test('fecha de corte real', () => {
    expect(validateAsOfDate('2026-11-24')).toBe('');
    expect(validateAsOfDate('2026-02-30')).toBe('page.cxpReports.msg.dateInvalid');
    expect(validateAsOfDate('')).toBe('page.cxpReports.msg.dateInvalid');
  });
  test('rango obligatorio, real y ordenado', () => {
    expect(validateRange({ dateStart: '2026-03-01', dateEnd: '2026-03-31' })).toBe('');
    expect(validateRange({ dateStart: '', dateEnd: '2026-03-31' })).toBe('page.cxpReports.msg.rangeRequired');
    expect(validateRange({ dateStart: '2026-02-30', dateEnd: '2026-03-31' })).toBe('page.cxpReports.msg.dateInvalid');
    expect(validateRange({ dateStart: '2026-04-01', dateEnd: '2026-03-31' })).toBe('page.cxpReports.msg.rangeInverted');
  });
  test('historial por proveedor: proveedor y rango', () => {
    expect(validateProviderHistory({ providerId: 3, dateStart: '2026-01-01', dateEnd: '2026-01-31' })).toBe('');
    expect(validateProviderHistory({ providerId: 0, dateStart: '2026-01-01', dateEnd: '2026-01-31' })).toBe('page.cxpReports.msg.providerRequired');
    expect(validateProviderHistory({ providerId: 3, dateStart: '', dateEnd: '' })).toBe('page.cxpReports.msg.rangeRequired');
  });
  test('historial de pagos: proveedor o rango completo', () => {
    expect(validateHistoryFilter({ providerId: 5 })).toBe('');
    expect(validateHistoryFilter({ dateStart: '2026-01-01', dateEnd: '2026-01-31' })).toBe('');
    expect(validateHistoryFilter({})).toBe('page.cxpReports.msg.historyFilterRequired');
    expect(validateHistoryFilter({ dateStart: '2026-01-01' })).toBe('page.cxpReports.msg.historyRangeIncomplete');
    expect(validateHistoryFilter({ providerId: 1, dateEnd: '2026-01-01' })).toBe('page.cxpReports.msg.historyRangeIncomplete');
    expect(validateHistoryFilter({ dateStart: '2026-03-02', dateEnd: '2026-03-01' })).toBe('page.cxpReports.msg.rangeInverted');
    expect(validateHistoryFilter({ dateStart: '2026-02-30', dateEnd: '2026-03-01' })).toBe('page.cxpReports.msg.dateInvalid');
  });
  test('buscador: proveedor o 3 caracteres', () => {
    expect(validateSearch({ providerId: 3 })).toBe('');
    expect(validateSearch({ documentCode: '001-A' })).toBe('');
    expect(validateSearch({})).toBe('page.cxpReports.msg.searchFilterRequired');
    expect(validateSearch({ documentCode: 'ab' })).toBe('page.cxpReports.msg.searchTooShort');
    expect(validateSearch({ providerId: 1, documentCode: 'ab' })).toBe('');
  });
});

describe('reportes de CxP: consultas y respuestas', () => {
  test('solo lo que se llenó; proveedor 0 = todos', () => {
    expect(buildAsOfQuery({ date: '2026-11-24', providerId: 0 })).toEqual({ date: '2026-11-24' });
    expect(buildAsOfQuery({ date: '2026-11-24', providerId: '7' })).toEqual({ date: '2026-11-24', providerId: 7 });
    expect(buildHistoryQuery({ providerId: 0, dateStart: '', dateEnd: '' })).toEqual({});
    expect(buildHistoryQuery({ providerId: 2, dateStart: '2026-01-01', dateEnd: '2026-01-31' })).toEqual({ providerId: 2, dateStart: '2026-01-01', dateEnd: '2026-01-31' });
    expect(buildRangeQuery({ dateStart: 'a', dateEnd: 'b', providerId: 4 })).toEqual({ providerId: 4, dateStart: 'a', dateEnd: 'b' });
  });
  test('una respuesta vacía o rara no rompe la pantalla', () => {
    expect(normalizeProjection(undefined).rows).toEqual([]);
    expect(normalizeProjection(undefined).totals.valMore).toBe(0);
    expect(normalizeProjection({ rows: [{ id: 1 }], totals: { total: 5 } }).totals.total).toBe(5);
    expect(normalizeCash(null).totals.balance).toBe(0);
    expect(normalizePeriod(undefined).orphans).toEqual({ count: 0, total: 0, rows: [] });
    expect(normalizePeriod({ orphans: { count: 2, total: 10 } }).orphans.count).toBe(2);
    expect(normalizeHistory({ rows: 'x' }).rows).toEqual([]);
    expect(normalizeProviderHistory(undefined).totals.balance).toBe(0);
  });
  test('combo de proveedores del selector corto', () => {
    expect(providerOptions([{ id: 3, name: 'Beta' }])).toEqual([{ label: '3 | Beta', value: 3 }]);
    expect(providerOptions(undefined)).toEqual([]);
  });
  test('estado respecto del vencimiento', () => {
    expect(dueStatus(null)).toEqual({ code: 'noDue', days: 0 });
    expect(dueStatus(5)).toEqual({ code: 'overdue', days: 5 });
    expect(dueStatus(-3)).toEqual({ code: 'toDue', days: 3 });
    expect(dueStatus(0)).toEqual({ code: 'toDue', days: 0 });
  });
});
