import { describe, expect, test } from 'vitest';
import {
  defaultRange, isValidDate, validateQuery, buildQuery, buildSummaryQuery, totalPages, rangeSummary, normalizeResponse, normalizeSummary, normalizePdaDetail, STATUS_LABELS, STATUS_CLASS
} from './moduleAuditRules';

const OK = { moduleId: 5, dateStart: '2026-11-01', dateEnd: '2026-11-24' };

describe('Auditoría de Módulos: reglas', () => {
  test('rango por defecto: del primer día del mes a hoy', () => {
    expect(defaultRange(new Date(2026, 10, 24))).toEqual({ dateStart: '2026-11-01', dateEnd: '2026-11-24' });
    expect(isValidDate('2026-02-30')).toBe(false);
    expect(isValidDate('2028-02-29')).toBe(true);
  });
  test('módulo y fechas obligatorios y válidos', () => {
    expect(validateQuery(OK)).toEqual({});
    expect(validateQuery({ ...OK, moduleId: 0 }).moduleId).toBe('page.moduleAudit.msg.moduleRequired');
    expect(validateQuery({ ...OK, dateStart: '' }).dateStart).toBe('page.diaryBook.error.date.required');
    expect(validateQuery({ ...OK, dateEnd: '2026-13-01' }).dateEnd).toBe('page.diaryBook.error.date.invalid');
    expect(validateQuery({ ...OK, dateStart: '2026-12-01' }).dateEnd).toBe('page.diaryBook.msg.invalidDateRange');
  });
  test('cuerpo de la consulta: estado y búsqueda solo si hay', () => {
    expect(buildQuery(OK, { page: 2 })).toEqual({ moduleId: 5, startDate: '2026-11-01', endDate: '2026-11-24', page: 2, pageSize: 50 });
    expect(buildQuery(OK, { status: 'issues', search: ' x ' })).toEqual({ moduleId: 5, startDate: '2026-11-01', endDate: '2026-11-24', status: 'issues', search: 'x' });
    expect(buildQuery(OK, { status: 'all' }).status).toBeUndefined();
    expect(buildSummaryQuery(OK)).toEqual({ startDate: '2026-11-01', endDate: '2026-11-24' });
  });
  test('páginas y resumen del rango', () => {
    expect(totalPages(0)).toBe(1);
    expect(totalPages(101)).toBe(3);
    expect(rangeSummary(1, 0)).toBe('0');
    expect(rangeSummary(3, 101)).toBe('101-101 / 101');
  });
  test('respuestas con valores seguros', () => {
    expect(normalizeResponse(undefined)).toEqual({ rows: [], totals: { count: 0, value: 0, accountingValue: 0, difference: 0 }, counts: { all: 0, noPda: 0, missingPda: 0, mismatch: 0, ok: 0, issues: 0 }, totalRecords: 0 });
    expect(normalizeResponse({ totals: { count: '3', value: '1.5' }, counts: { issues: 2 }, pagination: { totalRecords: 3 } }).counts.issues).toBe(2);
    expect(normalizeSummary(null)).toEqual([]);
    expect(normalizeSummary([{ moduleId: 1 }])[0].counts.issues).toBe(0);
  });
  test('partida: totales en centavos sin ruido de coma flotante', () => {
    const d = normalizePdaDetail({ lines: [{ debit: 0.1, credit: 0 }, { debit: 0.2, credit: 0 }, { debit: 0, credit: '0.30' }] }, 7);
    expect(d.totalDebit).toBe(0.3);
    expect(d.totalCredit).toBe(0.3);
    expect(d.pdaNumber).toBe(7);
    expect(normalizePdaDetail(undefined, 1).lines).toEqual([]);
  });
  test('cada estado tiene texto y color', () => {
    ['noPda', 'missingPda', 'mismatch', 'ok'].forEach((s) => { expect(STATUS_LABELS[s]).toBeTruthy(); expect(STATUS_CLASS[s]).toBeTruthy(); });
  });
});
