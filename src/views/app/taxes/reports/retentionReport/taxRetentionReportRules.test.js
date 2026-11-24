import { describe, expect, test } from 'vitest';
import { buildReportRequest, matchesSearch, normalizeReport, reportFileName, validateReportRange } from './taxRetentionReportRules';

describe('petición', () => {
  test('json solo lleva las fechas; pdf o xlsx suman el formato en params, no en la URL', () => {
    expect(buildReportRequest('retentions', { dateStart: '2026-01-01', dateEnd: '2026-01-31' })).toEqual({
      url: 'tax/reports/retentionReport/retentions', params: { dateStart: '2026-01-01', dateEnd: '2026-01-31' }
    });
    const r = buildReportRequest('declarationBook', { dateStart: '2026-01-01', dateEnd: '2026-01-31' }, 'xlsx');
    expect(r.params.format).toBe('xlsx');
    expect(r.url).not.toContain('?');
  });
  test('nombres de archivo por tipo y formato', () => {
    expect(reportFileName('declarationBook', 'xlsx')).toBe('Registro de Retenciones.xlsx');
    expect(reportFileName('retentions', 'pdf')).toBe('Reporte de Retenciones para Declaración Fiscal.pdf');
  });
});

describe('validación (mismos casos del back)', () => {
  test('fechas obligatorias, válidas, en orden y máximo 366 días', () => {
    expect(validateReportRange({ dateStart: '', dateEnd: '2026-01-01' }).dateStart).toBeTruthy();
    expect(validateReportRange({ dateStart: '2026-02-01', dateEnd: '2026-01-01' }).dateEnd).toBeTruthy();
    expect(validateReportRange({ dateStart: '2026-01-01', dateEnd: '2027-01-03' }).dateEnd).toBeTruthy();
    expect(validateReportRange({ dateStart: '2026-01-01', dateEnd: '2026-12-31' })).toEqual({});
  });
});

describe('respuesta y búsqueda', () => {
  test('normalizeReport devuelve listas y total en cero sin datos', () => {
    expect(normalizeReport()).toEqual({ rows: [], totals: { total: 0 } });
    expect(normalizeReport({ rows: [{ a: 1 }], totals: { total: 5 } }).totals.total).toBe(5);
  });
  test('el filtro busca en fecha, proveedor, RTN y número del comprobante', () => {
    const row = { date: '2026-01-05', providerName: 'Acme', providerRtn: '0801', numberRetention: 'R-1' };
    expect(matchesSearch(row, 'acme')).toBe(true);
    expect(matchesSearch(row, '0801')).toBe(true);
    expect(matchesSearch(row, 'r-1')).toBe(true);
    expect(matchesSearch(row, 'zzz')).toBe(false);
    expect(matchesSearch(row, '')).toBe(true);
  });
});
