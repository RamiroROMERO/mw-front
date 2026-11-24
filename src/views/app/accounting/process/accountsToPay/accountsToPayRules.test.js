import { describe, expect, test } from 'vitest';
import {
  isValidDate, validateQuery, validateReport, buildReportBody, statusMessage, normalizeDetail, canEditComment, canDeleteDocument,
  validateComment, commentChanged, MAX_DOCUMENT_COMMENT, AGING_BUCKETS
} from './accountsToPayRules';

describe('fecha de corte', () => {
  test('acepta fechas reales y bisiestos', () => {
    expect(isValidDate('2028-02-29')).toBe(true);
    expect(isValidDate('2026-12-31')).toBe(true);
  });
  test('rechaza fechas imposibles o mal escritas', () => {
    ['2026-02-30', '2026-13-01', 'abc', '2026-1-1', '', null].forEach((d) => expect(isValidDate(d)).toBe(false));
  });
  test('validateQuery marca vacía e inválida', () => {
    expect(validateQuery({ date: '' }).date).toBe('page.accountsToPay.error.date.required');
    expect(validateQuery({ date: '2026-02-30' }).date).toBe('page.accountsToPay.error.date.invalid');
    expect(validateQuery({ date: '2026-05-01' })).toEqual({});
  });
});

describe('reporte', () => {
  test('el modo 1 no necesita fecha', () => {
    expect(validateReport({ mode: '1', date: '' })).toEqual({});
    expect(buildReportBody({ mode: '1', date: '2026-01-01' })).toEqual({ mode: 1 });
  });
  test('los modos 2 y 3 exigen fecha real', () => {
    expect(validateReport({ mode: '2', date: '' }).date).toBeTruthy();
    expect(validateReport({ mode: '3', date: '2026-02-30' }).date).toBeTruthy();
    expect(validateReport({ mode: '3', date: '2026-02-28' })).toEqual({});
    expect(buildReportBody({ mode: '3', date: '2026-02-28' })).toEqual({ mode: 3, date: '2026-02-28' });
  });
  test('un modo desconocido se rechaza', () => {
    expect(validateReport({ mode: '9', date: '2026-01-01' }).mode).toBeTruthy();
  });
});

describe('estado', () => {
  test('mensajes del legacy', () => {
    expect(statusMessage({ code: 'toDue', days: 5 })).toEqual({ id: 'page.accountsToPay.status.toDue', values: { days: 5 } });
    expect(statusMessage({ code: 'overdue', days: 9 }).id).toBe('page.accountsToPay.status.overdue');
    expect(statusMessage(null).id).toBe('page.accountsToPay.status.noDue');
  });
});

test('normalizeDetail tolera formas raras', () => {
  const d = normalizeDetail(null);
  expect(d).toEqual({ provider: {}, providerComment: '', rows: [], totals: {}, aging: {} });
  expect(normalizeDetail({ rows: 'x', providerComment: 4 }).rows).toEqual([]);
});

test('los 6 tramos coinciden con los del back', () => {
  expect(AGING_BUCKETS.map((b) => b.field)).toEqual(['current', 'd1to30', 'd31to60', 'd61to90', 'd91to120', 'over120']);
});

describe('privilegios y comentarios', () => {
  test('editar exige fn_update; eliminar exige fn_delete y administrador', () => {
    expect(canEditComment({ update: true })).toBe(true);
    expect(canEditComment({ update: false })).toBe(false);
    expect(canDeleteDocument({ id: 1 }, { delete: true, admin: true })).toBe(true);
    expect(canDeleteDocument({ id: 1 }, { delete: true, admin: false })).toBe(false);
    expect(canDeleteDocument({ id: 1 }, { delete: false, admin: true })).toBe(false);
    expect(canDeleteDocument(null, { delete: true, admin: true })).toBe(false);
  });
  test('largo del comentario', () => {
    expect(validateComment('x'.repeat(MAX_DOCUMENT_COMMENT), MAX_DOCUMENT_COMMENT)).toBe('');
    expect(validateComment('x'.repeat(MAX_DOCUMENT_COMMENT + 1), MAX_DOCUMENT_COMMENT)).toBeTruthy();
  });
  test('detecta cambios ignorando espacios', () => {
    expect(commentChanged(' a ', 'a')).toBe(false);
    expect(commentChanged('b', 'a')).toBe(true);
    expect(commentChanged('', null)).toBe(false);
  });
});
