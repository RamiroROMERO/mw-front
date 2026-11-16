import { describe, it, expect } from 'vitest';
import { REPORT_TYPES, VALUE_FILTERS, validateStockReport, buildStockReportRequest, needsStore, reportTypeOf, defaultReportForm } from './stockReportRules';

const VALID = { typeId: 1, storeId: 1, dateEnd: '2026-10-31', valueFilterId: 3 };

describe('tipos y filtros', () => {
  it('los cuatro tipos del back, con ids únicos', () => {
    expect(REPORT_TYPES.map((t) => t.type)).toEqual(['stock', 'general', 'nonMoving', 'expiry']);
    expect(new Set(REPORT_TYPES.map((t) => t.id)).size).toBe(4);
  });
  it('los tres filtros del back', () => {
    expect(VALUE_FILTERS.map((f) => f.value)).toEqual(['nonPositive', 'positive', 'all']);
  });
  it('solo el general no pide almacén', () => {
    expect(REPORT_TYPES.map((t) => needsStore(t.id))).toEqual([true, false, true, true]);
    expect(needsStore(99)).toBe(false);
  });
  it('reportTypeOf acepta el id como texto y devuelve null si no existe', () => {
    expect(reportTypeOf('3').type).toBe('nonMoving');
    expect(reportTypeOf(0)).toBeNull();
  });
});

describe('validateStockReport', () => {
  it('un filtro completo es válido', () => expect(validateStockReport(VALID)).toEqual({}));
  it('con todo vacío marca el tipo y la fecha (el almacén depende del tipo)', () => {
    expect(validateStockReport({})).toEqual({ typeId: 'msg.required.select', dateEnd: 'msg.required.input.date' });
  });
  it('sin almacén lo pide salvo en el general', () => {
    expect(validateStockReport({ ...VALID, storeId: 0 })).toEqual({ storeId: 'msg.required.select' });
    expect(validateStockReport({ ...VALID, typeId: 2, storeId: 0 })).toEqual({});
  });
  it.each([[''], ['  '], [undefined]])('fecha %p obligatoria', (dateEnd) => {
    expect(validateStockReport({ ...VALID, dateEnd })).toEqual({ dateEnd: 'msg.required.input.date' });
  });
  it.each([['2026-02-30'], ['abc'], ['2026-13-01'], ['2026-1-1']])('fecha %s inválida', (dateEnd) => {
    expect(validateStockReport({ ...VALID, dateEnd })).toEqual({ dateEnd: 'page.stock.report.error.dateInvalid' });
  });
  it('el 29 de febrero bisiesto es válido y una fecha futura también (son reportes "al" una fecha)', () => {
    expect(validateStockReport({ ...VALID, dateEnd: '2028-02-29' })).toEqual({});
    expect(validateStockReport({ ...VALID, dateEnd: '2099-01-01' })).toEqual({});
  });
  it('un tipo desconocido se marca', () => {
    expect(validateStockReport({ ...VALID, typeId: 9 }).typeId).toBe('msg.required.select');
  });
});

describe('buildStockReportRequest', () => {
  it('arma el GET con los parámetros en `params` y no en la URL', () => {
    const r = buildStockReportRequest({ ...VALID, valueFilterId: 2 }, 'xlsx');
    expect(r).toEqual({ url: 'inventory/process/stocks/reports', params: { type: 'stock', dateEnd: '2026-10-31', valueFilter: 'positive', format: 'xlsx', storeId: 1 }, fileName: 'Reporte de Existencias.xlsx' });
    expect(r.url).not.toContain('?');
  });
  it('el general no envía almacén', () => {
    const r = buildStockReportRequest({ ...VALID, typeId: 2, storeId: 5 });
    expect(r.params).not.toHaveProperty('storeId');
    expect(r.fileName).toBe('Reporte General de Existencias.pdf');
  });
  it.each([[1, 'nonPositive'], [2, 'positive'], [3, 'all']])('el filtro %i va como %s', (valueFilterId, value) => {
    expect(buildStockReportRequest({ ...VALID, valueFilterId }).params.valueFilter).toBe(value);
  });
  it('los nombres de archivo de los cuatro tipos', () => {
    expect(REPORT_TYPES.map((t) => buildStockReportRequest({ ...VALID, typeId: t.id }).fileName)).toEqual(['Reporte de Existencias.pdf', 'Reporte General de Existencias.pdf', 'Productos sin Movimiento.pdf', 'Existencias por Fecha de Vencimiento.pdf']);
  });
  it('un formato distinto de xlsx es pdf y el filtro por defecto es all', () => {
    expect(buildStockReportRequest(VALID, 'otro').params.format).toBe('pdf');
    expect(buildStockReportRequest({ ...VALID, valueFilterId: undefined }).params.valueFilter).toBe('all');
  });
  it('el valor inicial del modal es el reporte de existencias, todos los valores y la fecha de hoy', () => {
    expect(defaultReportForm('2026-11-16')).toEqual({ typeId: 1, storeId: 0, dateEnd: '2026-11-16', valueFilterId: 3 });
  });
});
