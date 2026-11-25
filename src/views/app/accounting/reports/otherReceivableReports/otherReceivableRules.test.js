import { describe, expect, test } from 'vitest';
import { BASE_PATH, EXPIRY_OPTIONS, validateFilter, buildQuery, normalizeStatement } from './otherReceivableRules';

const ok = { date: '2025-06-30', expiry: 'all' };

describe('otros reportes de CxC: filtros (los mismos del back)', () => {
  test('ruta y las opciones del legacy', () => {
    expect(BASE_PATH).toBe('accounting/reports/otherReceivableReports');
    expect(EXPIRY_OPTIONS.map((o) => o.id)).toEqual(['all', 'noDue', 'current', 'd1to30', 'd31to60', 'd61to90', 'over90']);
  });
  test('fecha real y vencimiento conocido', () => {
    expect(validateFilter(ok)).toBe('');
    expect(validateFilter({ ...ok, date: '' })).toBe('page.cxcReports.msg.dateInvalid');
    expect(validateFilter({ ...ok, date: '2025-02-30' })).toBe('page.cxcReports.msg.dateInvalid');
    expect(validateFilter({ ...ok, expiry: 'xx' })).toBe('page.otherReceivableReports.msg.expiryInvalid');
  });
  test('consulta: moneda, cliente y tipo solo si aplican; el vencimiento siempre', () => {
    expect(buildQuery({ ...ok, currency: 1, customerId: 0, customerTypeId: 0 }, { hasDualCurrency: false })).toEqual({ date: '2025-06-30', currency: 1, expiry: 'all' });
    expect(buildQuery({ ...ok, currency: 2, customerId: '7', customerTypeId: '3', expiry: 'd1to30' }, { hasDualCurrency: true })).toEqual({ date: '2025-06-30', currency: 2, customerId: 7, customerTypeId: 3, expiry: 'd1to30' });
    expect(buildQuery({ ...ok, currency: 2, customerId: 0, customerTypeId: 0 }, { hasDualCurrency: false }).currency).toBe(1); // sin dual no hay dólares
  });
  test('una respuesta vacía no rompe la pantalla', () => {
    expect(normalizeStatement(undefined)).toEqual({ rows: [], totals: { originalValue: 0, payments: 0, creditNotes: 0, debitNotes: 0, balance: 0 }, counts: { customers: 0, documents: 0 } });
    expect(normalizeStatement({ rows: 'x', totals: { balance: 5 } }).rows).toEqual([]);
    expect(normalizeStatement({ totals: { balance: 5 } }).totals.balance).toBe(5);
  });
});
