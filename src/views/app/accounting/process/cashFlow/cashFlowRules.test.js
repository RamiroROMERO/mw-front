import { describe, expect, test } from 'vitest';
import {
  todayLocal, isValidDate, validateQuery, buildQuery, buildExport, exportFileName, buildDocumentsQuery, normalizeSummary, weekSummaryRows, agingSummaryRows, bucketLabels,
  banksWithoutAccount, WEEK_FIELDS, AGING_FIELDS, FIELD_LABELS
} from './cashFlowRules';

describe('Flujo de Efectivo: reglas', () => {
  test('fecha de hoy y fechas reales', () => {
    expect(todayLocal(new Date(2026, 10, 24))).toBe('2026-11-24');
    expect(isValidDate('2026-02-30')).toBe(false);
    expect(isValidDate('2028-02-29')).toBe(true);
    expect(isValidDate('')).toBe(false);
  });
  test('la fecha es obligatoria y válida', () => {
    expect(validateQuery({ date: '' }).date).toBe('page.diaryBook.error.date.required');
    expect(validateQuery({ date: '2026-13-01' }).date).toBe('page.diaryBook.error.date.invalid');
    expect(validateQuery({ date: '2026-11-24' })).toEqual({});
  });
  test('cuerpos de la consulta, del detalle y de la exportación por pestaña', () => {
    expect(buildQuery({ date: ' 2026-11-24 ' })).toEqual({ date: '2026-11-24' });
    expect(buildExport({ date: '2026-11-24' }, 1)).toEqual({ date: '2026-11-24', section: 'summary' });
    expect(buildExport({ date: '2026-11-24' }, 2).section).toBe('payable');
    expect(buildExport({ date: '2026-11-24' }, 3).section).toBe('receivable');
    expect(buildDocumentsQuery({ date: '2026-11-24' }, 'payable', 5)).toEqual({ date: '2026-11-24', kind: 'payable', entityId: 5 });
    expect(exportFileName(2, 'xlsx')).toBe('FlujoEfectivoCuentasPorPagar.xlsx');
    expect(exportFileName(1, 'pdf')).toBe('FlujoEfectivo.pdf');
  });
  test('todas las columnas tienen su texto', () => {
    [...WEEK_FIELDS, ...AGING_FIELDS].forEach((f) => expect(FIELD_LABELS[f]).toBeTruthy());
    expect(WEEK_FIELDS).toContain('weekLater');
  });
  test('respuesta vacía o incompleta no rompe la pantalla', () => {
    expect(normalizeSummary(null)).toBeNull();
    const s = normalizeSummary({ bankTotal: '10.5', payable: { rows: [{}] } });
    expect(s.bankTotal).toBe(10.5);
    expect(s.payable.rows).toHaveLength(1);
    expect(s.receivable.rows).toEqual([]);
    expect(s.payable.totals.weekLater).toBe(0);
    expect(s.projection.weekTotal).toBe(0);
  });
  test('filas del resumen: el de antigüedad no lleva saldo proyectado', () => {
    const s = normalizeSummary({ diff: { week1: 5 }, projection: { week1: 9 } });
    expect(weekSummaryRows(s).map((r) => r.key)).toEqual(['cxc', 'cxp', 'diff', 'projection']);
    expect(agingSummaryRows(s).map((r) => r.key)).toEqual(['cxc', 'cxp', 'diff']);
    expect(weekSummaryRows(s)[3].totals.week1).toBe(9);
  });
  test('texto de la semana y del rango de un documento; bancos sin cuenta', () => {
    expect(bucketLabels({ weekField: 'week3', agingField: 'val60' })).toEqual({ week: 'page.cashFlow.table.week3', aging: 'page.cashFlow.table.days60' });
    expect(bucketLabels({})).toEqual({ week: '', aging: '' });
    expect(banksWithoutAccount([{ missingAccount: true }, {}, { missingAccount: true }])).toBe(2);
  });
});
