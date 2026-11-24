import { describe, expect, test } from 'vitest';
import {
  currentMonthRange, isValidDate, normalizeAccount, validateQuery, buildQuery, exportPath, searchPath, totalPages, rangeSummary, normalizeResponse, MAX_ACCOUNTS
} from './ledgerRules';

const OK = { dateStart: '2026-11-01', dateEnd: '2026-11-30' };

describe('Libro Mayor: reglas', () => {
  test('rango por defecto: el mes en curso (también bisiesto)', () => {
    expect(currentMonthRange(new Date(2026, 10, 24))).toEqual(OK);
    expect(currentMonthRange(new Date(2028, 1, 10))).toEqual({ dateStart: '2028-02-01', dateEnd: '2028-02-29' });
  });
  test('fechas reales', () => {
    expect(isValidDate('2026-02-30')).toBe(false);
    expect(isValidDate('2028-02-29')).toBe(true);
    expect(isValidDate('')).toBe(false);
  });
  test('cuenta actual: la cuenta es obligatoria y "0" cuenta como vacía', () => {
    expect(validateQuery({ mode: 'single', ...OK, accountCode: '' }).account).toBe('page.ledger.msg.missingAccount');
    expect(validateQuery({ mode: 'single', ...OK, accountCode: '0' }).account).toBe('page.ledger.msg.missingAccount');
    expect(validateQuery({ mode: 'single', ...OK, accountCode: '1010' })).toEqual({});
  });
  test('varias cuentas: de 1 a 50', () => {
    expect(validateQuery({ mode: 'multi', ...OK, accountCodes: [] }).accounts).toBe('page.ledger.msg.missingAccounts');
    expect(validateQuery({ mode: 'multi', ...OK, accountCodes: Array.from({ length: MAX_ACCOUNTS + 1 }, (_, i) => `A${i}`) }).accounts).toBe('page.ledger.msg.tooManyAccounts');
    expect(validateQuery({ mode: 'multi', ...OK, accountCodes: ['A'] })).toEqual({});
  });
  test('fechas inválidas, vacías o invertidas', () => {
    expect(validateQuery({ mode: 'single', dateStart: '', dateEnd: '2026-11-30', accountCode: 'A' }).dateStart).toBe('page.diaryBook.error.date.required');
    expect(validateQuery({ mode: 'single', dateStart: '2026-02-30', dateEnd: '2026-11-30', accountCode: 'A' }).dateStart).toBe('page.diaryBook.error.date.invalid');
    expect(validateQuery({ mode: 'single', dateStart: '2026-12-01', dateEnd: '2026-11-30', accountCode: 'A' }).dateEnd).toBe('page.diaryBook.msg.invalidDateRange');
  });
  test('cuerpo de la consulta y del Excel', () => {
    expect(buildQuery({ mode: 'single', ...OK, accountCode: ' 1010 ' }, { page: 2 })).toEqual({ startDate: '2026-11-01', endDate: '2026-11-30', accountCode: '1010', page: 2, pageSize: 50 });
    expect(buildQuery({ mode: 'multi', ...OK, accountCodes: ['A', '', 'B'] })).toEqual({ startDate: '2026-11-01', endDate: '2026-11-30', accountCodes: ['A', 'B'] });
    expect(normalizeAccount('0')).toBe('');
  });
  test('rutas por modo: solo Excel', () => {
    expect(exportPath('single')).toBe('accounting/process/ledger/exportXLSX');
    expect(exportPath('multi')).toBe('accounting/process/ledger/multi/exportXLSX');
    expect(searchPath('multi')).toBe('accounting/process/ledger/multi');
  });
  test('páginas y resumen', () => {
    expect(totalPages(0)).toBe(1);
    expect(totalPages(101)).toBe(3);
    expect(rangeSummary(1, 0)).toBe('0');
    expect(rangeSummary(3, 101)).toBe('101-101 / 101');
  });
  test('respuesta con valores seguros', () => {
    expect(normalizeResponse(undefined)).toEqual({ rows: [], totals: { count: 0, debit: 0, credit: 0 }, totalRecords: 0, account: null, openingBalance: 0, closingBalance: 0 });
    const r = normalizeResponse({ rows: [{}], totals: { count: '3', debit: '1.5', credit: 2 }, pagination: { totalRecords: 3 }, account: { code: 'A' }, openingBalance: 10, closingBalance: 20 });
    expect(r.totals).toEqual({ count: 3, debit: 1.5, credit: 2 });
    expect(r.closingBalance).toBe(20);
  });
});
