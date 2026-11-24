import { describe, expect, test } from 'vitest';
import {
  currentMonthRange, isValidDate, validateQuery, normalizeAccount, buildQuery, totalPages, rangeSummary, normalizeResponse, PAGE_SIZE
} from './diaryBookRules';

describe('rango por defecto', () => {
  test('primer y último día del mes en curso', () => {
    expect(currentMonthRange(new Date(2026, 10, 24))).toEqual({ dateStart: '2026-11-01', dateEnd: '2026-11-30' });
    expect(currentMonthRange(new Date(2026, 1, 3))).toEqual({ dateStart: '2026-02-01', dateEnd: '2026-02-28' });
    expect(currentMonthRange(new Date(2028, 1, 10))).toEqual({ dateStart: '2028-02-01', dateEnd: '2028-02-29' });
    expect(currentMonthRange(new Date(2026, 11, 31))).toEqual({ dateStart: '2026-12-01', dateEnd: '2026-12-31' });
  });
});

describe('validación', () => {
  test('fechas reales', () => {
    expect(isValidDate('2028-02-29')).toBe(true);
    ['2026-02-30', '2026-13-01', 'abc', '', null].forEach((d) => expect(isValidDate(d)).toBe(false));
  });
  test('vacías, inválidas y rango invertido', () => {
    expect(validateQuery({ dateStart: '', dateEnd: '2026-11-30' }).dateStart).toBe('page.diaryBook.error.date.required');
    expect(validateQuery({ dateStart: '2026-11-01', dateEnd: '2026-02-30' }).dateEnd).toBe('page.diaryBook.error.date.invalid');
    expect(validateQuery({ dateStart: '2026-12-01', dateEnd: '2026-11-30' }).dateEnd).toBe('page.diaryBook.msg.invalidDateRange');
    expect(validateQuery({ dateStart: '2026-11-01', dateEnd: '2026-11-30' })).toEqual({});
    expect(validateQuery({ dateStart: '2026-11-05', dateEnd: '2026-11-05' })).toEqual({});
  });
});

describe('consulta', () => {
  test('la cuenta "0" del selector limpio significa todas', () => {
    expect(normalizeAccount('0')).toBe('');
    expect(normalizeAccount(' 1010101001 ')).toBe('1010101001');
    expect(normalizeAccount(undefined)).toBe('');
  });
  test('cuerpo de la pantalla y del Excel', () => {
    const form = { dateStart: '2026-11-01', dateEnd: '2026-11-30', accountCode: '0' };
    expect(buildQuery(form)).toEqual({ startDate: '2026-11-01', endDate: '2026-11-30', accountCode: '' });
    expect(buildQuery(form, { page: 3, search: ' caja ' })).toEqual({ startDate: '2026-11-01', endDate: '2026-11-30', accountCode: '', search: 'caja', page: 3, pageSize: PAGE_SIZE });
  });
});

describe('paginación', () => {
  test('páginas y texto de rango', () => {
    expect(totalPages(0)).toBe(1);
    expect(totalPages(50)).toBe(1);
    expect(totalPages(51)).toBe(2);
    expect(rangeSummary(1, 321)).toBe('1-50 / 321');
    expect(rangeSummary(7, 321)).toBe('301-321 / 321');
    expect(rangeSummary(1, 0)).toBe('0');
  });
  test('normalizeResponse tolera formas raras', () => {
    expect(normalizeResponse(null)).toEqual({ rows: [], totals: { count: 0, debit: 0, credit: 0, diff: 0 }, totalRecords: 0 });
    expect(normalizeResponse({ rows: [{ id: 1 }], totals: { count: 1, debit: 5, credit: 5, diff: 0 }, pagination: { totalRecords: 1 } }).totalRecords).toBe(1);
  });
});
