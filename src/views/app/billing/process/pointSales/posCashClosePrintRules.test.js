import { describe, expect, test } from 'vitest';
import { CASH_CLOSE_PRINT_TYPES, availableTypes, sheetAllowed, normalizeSheet, buildPrintRequest } from './posCashClosePrintRules';

describe('posCashClosePrintRules', () => {
  test('siete tipos y el global solo para el supervisor', () => {
    expect(CASH_CLOSE_PRINT_TYPES).toHaveLength(7);
    expect(availableTypes(false).map((t) => t.id)).not.toContain('daily');
    expect(availableTypes(true).map((t) => t.id)).toContain('daily');
  });

  test('la térmica solo en resumen, detallado y entradas y salidas', () => {
    ['summary', 'detail', 'cashMovements'].forEach((t) => expect(sheetAllowed(t, 'thermal')).toBe(true));
    ['area', 'paymentMethod', 'daily', 'cancellations'].forEach((t) => { expect(sheetAllowed(t, 'thermal')).toBe(false); expect(normalizeSheet(t, 'thermal')).toBe('letter'); });
    expect(sheetAllowed('area', 'letter')).toBe(true);
  });

  test('cierre guardado: por id y sin cifras ni usuario', () => {
    const r = buildPrintRequest({ path: 'p', id: 30, sessionId: 5, type: 'detail', sheet: 'thermal', cashValue: '999', userName: 'x', total: 1 });
    expect(r).toEqual({ url: 'p/30/print', params: { sessionId: 5, type: 'detail', sheet: 'thermal' }, fileName: 'Cierre de Caja Detallado.pdf' });
  });

  test('vista previa: con lo digitado y el efectivo solo si hay', () => {
    const r = buildPrintRequest({ path: 'p', id: 0, sessionId: 5, type: 'summary', sheet: 'letter', date: '2026-11-18', cashierId: 7, allCashiers: true, cashValue: '' });
    expect(r.url).toBe('p/preview/print');
    expect(r.params).toEqual({ sessionId: 5, type: 'summary', sheet: 'letter', date: '2026-11-18', cashierId: 7, allCashiers: 'true' });
    expect(buildPrintRequest({ path: 'p', id: 0, sessionId: 5, type: 'area', sheet: 'thermal' }).params.sheet).toBe('letter');
  });
});
