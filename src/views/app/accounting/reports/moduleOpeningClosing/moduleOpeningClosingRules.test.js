import { describe, expect, test } from 'vitest';
import {
  maxYear, validateYear, yearPath, generateBody, statusBody, bulkBody, cellState, nextStatus, monthState, normalizeYear, normalizeSettings, closedCount, STATUS_OPEN, STATUS_CLOSED
} from './moduleOpeningClosingRules';

const NOW = new Date(2026, 10, 24);

describe('Apertura y Cierre de Módulos: reglas', () => {
  test('año entre 2010 y el próximo año', () => {
    expect(maxYear(NOW)).toBe(2027);
    expect(validateYear(2026, NOW)).toBe('');
    expect(validateYear('2027', NOW)).toBe('');
    expect(validateYear(2010, NOW)).toBe('');
    ['', 'x', 2009, 2028, '26', null].forEach((y) => expect(validateYear(y, NOW)).toBe('page.moduleOpeningClosing.msg.yearInvalid'));
  });
  test('cuerpos y rutas', () => {
    expect(yearPath('2026')).toBe('accounting/reports/moduleOpeningClosing/year/2026');
    expect(generateBody('3', '2026')).toEqual({ monthIndex: 3, year: 2026 });
    expect(statusBody(1)).toEqual({ status: 1 });
    expect(statusBody(5)).toEqual({ status: 0 });
    expect(bulkBody('7', 0)).toEqual({ headerId: 7, status: 0 });
  });
  test('estado de una celda y el contrario que se pide al pulsar', () => {
    expect(cellState({ status: 1 })).toBe('open');
    expect(cellState({ status: 0 })).toBe('closed');
    expect(cellState({ status: null })).toBe('none');
    expect(cellState(undefined)).toBe('none');
    expect(nextStatus({ status: 1 })).toBe(STATUS_CLOSED);
    expect(nextStatus({ status: 0 })).toBe(STATUS_OPEN);
  });
  test('estado del mes: sin generar, todo abierto, todo cerrado o mixto', () => {
    expect(monthState({ generated: false })).toBe('notGenerated');
    expect(monthState({ generated: true, cells: [{ status: null }], open: 0, closed: 0 })).toBe('empty');
    expect(monthState({ generated: true, cells: [{ status: 1 }, { status: 1 }], open: 2, closed: 0 })).toBe('allOpen');
    expect(monthState({ generated: true, cells: [{ status: 0 }, { status: 0 }], open: 0, closed: 2 })).toBe('allClosed');
    expect(monthState({ generated: true, cells: [{ status: 0 }, { status: 1 }], open: 1, closed: 1 })).toBe('mixed');
  });
  test('respuestas seguras', () => {
    const y = normalizeYear(undefined);
    expect(y.months).toHaveLength(12);
    expect(y.modules).toEqual([]);
    expect(normalizeSettings(undefined)).toEqual({ closingEnforced: false, globalCloseDate: '' });
    expect(normalizeSettings({ closingEnforced: 1, globalCloseDate: '2025-12-31' })).toEqual({ closingEnforced: true, globalCloseDate: '2025-12-31' });
    expect(closedCount({ months: [{ closed: 2 }, { closed: 3 }] })).toBe(5);
  });
});
