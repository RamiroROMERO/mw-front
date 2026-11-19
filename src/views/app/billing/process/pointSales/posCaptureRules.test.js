import { describe, expect, test } from 'vitest';
import { fromSearchRow, stockWarning, invoiceState, buildInvoiceParams, PRODUCTS_PATH, INVOICES_PATH } from './posCaptureRules';

describe('posCaptureRules', () => {
  test('rutas del POS', () => {
    expect(PRODUCTS_PATH).toBe('billing/process/pointSales/products');
    expect(INVOICES_PATH).toBe('billing/process/pointSales/invoices');
  });

  test('fromSearchRow adapta la fila del servidor al formulario sin traer el costo', () => {
    const row = { code: 'P1', name: 'Producto', unitName: 'UND', unitId: 3, taxPercent: 15, minPrice: 1, midPrice: 2, maxPrice: 3, unitFactor: 12, hasCommission: true, kind: 1, stock: 7, suggestedPrice: 3 };
    expect(fromSearchRow(row)).toEqual({
      productCode: 'P1', productName: 'Producto', undoutName: 'UND', undoutId: 3, taxPercent: 15, min: 1, med: 2, max: 3, costValue: 0, valChange: 12, paymentComiss: 1, typeId: 1, stock: 7, suggestedPrice: 3
    });
    expect(fromSearchRow({ ...row, hasCommission: false }).paymentComiss).toBe(0);
  });

  test('stockWarning: solo con control de existencias, no para servicios, y compara cantidad por factor contra la existencia', () => {
    expect(stockWarning({ controlStock: false, kind: 1, stock: 1, qty: 5 })).toBeNull();
    expect(stockWarning({ controlStock: true, kind: 2, stock: 0, qty: 5 })).toBeNull();
    expect(stockWarning({ controlStock: true, kind: 1, stock: 10, qty: 10 })).toBeNull();
    expect(stockWarning({ controlStock: true, kind: 1, stock: 10, qty: 11 })).toEqual({ available: 10 });
    expect(stockWarning({ controlStock: true, kind: 1, stock: 10, qty: 1, unitFactor: 12 })).toEqual({ available: 10 });
    expect(stockWarning({ controlStock: true, kind: 1, stock: -3, qty: 1 })).toEqual({ available: 0 });
  });

  test('invoiceState: anulada gana sobre cerrada', () => {
    expect(invoiceState({ isVoided: true, isClosed: true })).toBe('voided');
    expect(invoiceState({ isVoided: false, isClosed: true })).toBe('closed');
    expect(invoiceState({ isVoided: false, isClosed: false })).toBe('issued');
  });

  test('buildInvoiceParams solo manda lo que hay', () => {
    expect(buildInvoiceParams({ sessionId: 9 })).toEqual({ sessionId: 9 });
    expect(buildInvoiceParams({ sessionId: 9, dateStart: '2026-11-01', dateEnd: '2026-11-30', cashierId: '7' })).toEqual({ sessionId: 9, dateStart: '2026-11-01', dateEnd: '2026-11-30', cashierId: 7 });
    expect(buildInvoiceParams({ sessionId: 9, cashierId: 0 })).toEqual({ sessionId: 9 });
  });
});
