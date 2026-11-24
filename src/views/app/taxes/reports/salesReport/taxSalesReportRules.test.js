import { describe, expect, test } from 'vitest';
import { buildReportRequest, matchesSearch, normalizeReport, reportFileName, validateReportRange } from './taxSalesReportRules';

describe('petición', () => {
  test('json lleva fechas; el CAI solo si se eligió; pdf o xlsx suman el formato en params, no en la URL', () => {
    expect(buildReportRequest('sales', { dateStart: '2026-01-01', dateEnd: '2026-01-31', cai: '' })).toEqual({
      url: 'tax/reports/salesReport/sales', params: { dateStart: '2026-01-01', dateEnd: '2026-01-31' }
    });
    const r = buildReportRequest('salesBook', { dateStart: '2026-01-01', dateEnd: '2026-01-31', cai: ' AB-CD ' }, 'xlsx');
    expect(r.params).toEqual({ dateStart: '2026-01-01', dateEnd: '2026-01-31', cai: 'AB-CD', format: 'xlsx' });
    expect(r.url).not.toContain('?');
  });
  test('nombres de archivo por tipo y formato', () => {
    expect(reportFileName('salesBook', 'xlsx')).toBe('Libro de Ventas.xlsx');
    expect(reportFileName('sales', 'pdf')).toBe('Reporte de Ventas para Declaración Fiscal.pdf');
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
  test('normalizeReport devuelve listas y totales en cero sin datos', () => {
    expect(normalizeReport()).toEqual({ rows: [], totals: { total: 0, exempt: 0, exonerated: 0, taxed: 0, tax: 0 } });
    expect(normalizeReport({ rows: [{ a: 1 }], totals: { total: 5 } }).totals.total).toBe(5);
  });
  test('el filtro busca en fecha, cliente, RTN y número', () => {
    const row = { date: '2026-01-05', clientName: 'Acme', clientRtn: '0801', number: 'F-1' };
    expect(matchesSearch(row, 'acme')).toBe(true);
    expect(matchesSearch(row, '0801')).toBe(true);
    expect(matchesSearch(row, 'zzz')).toBe(false);
    expect(matchesSearch(row, '')).toBe(true);
  });
});
