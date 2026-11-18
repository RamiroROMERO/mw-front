import { describe, expect, test } from 'vitest';
import { buildInitialForm, buildOrderPayload, formFromOrder, orderTotals, validateOrder } from './purchaseOrderRules';

// Mismos casos que modules/billing/purchaseOrders/__tests__ del back (PurchaseOrderDTO y PurchaseOrderService).
const NOW = new Date(2026, 10, 18, 12, 0, 0); // 2026-11-18
const LINE = { productCode: 'HPL-00001', unitId: 6, qty: 2, price: 100 };
const valid = () => ({ ...buildInitialForm(), date: '2026-11-10', customerId: 7, customerName: 'Ana', customerCode: '0801', sellerId: 13, paymentTypeId: 2 });
const check = (form = valid(), details = [LINE], options = { now: NOW }) => validateOrder(form, details, options);

describe('obligatorios de la orden', () => {
  test('una orden mínima es válida (sin teléfono, correo, dirección ni almacén)', () => {
    expect(check()).toEqual({});
  });
  test.each([['customerId', 0], ['customerName', ' '], ['customerCode', ''], ['sellerId', 0], ['paymentTypeId', 0], ['date', '']])('falta %s', (field, value) => {
    expect(Object.keys(check({ ...valid(), [field]: value }))).toEqual([field]);
  });
  test('el cliente debe ser uno creado: el id 0 se rechaza con su propio mensaje', () => {
    expect(check({ ...valid(), customerId: 0 }).customerId).toBe('page.billingPurchaseOrders.error.customer.required');
  });
  test('el teléfono es opcional pero con máximo de 40', () => {
    expect(check({ ...valid(), customerPhone: '' })).toEqual({});
    expect(check({ ...valid(), customerPhone: '9'.repeat(41) }).customerPhone).toBe('page.quotes.error.customerPhone.max');
  });
  test('el correo debe tener formato válido si viene', () => {
    expect(check({ ...valid(), customerEmail: 'x' }).customerEmail).toBe('page.quotes.error.customerEmail.invalid');
    expect(check({ ...valid(), customerEmail: 'a@b.com' })).toEqual({});
  });
  test('sin líneas, o con una línea inválida, se rechaza', () => {
    expect(check(valid(), []).details).toBe('page.quotes.error.details.required');
    expect(check(valid(), [{ ...LINE, qty: 0 }]).details).toBe('page.quotes.error.line.qty');
  });
  test('la fecha: real, no futura y dentro del límite de edición (con su mensaje de orden)', () => {
    expect(check({ ...valid(), date: '2026-11-19' }).date).toBe('page.quotes.error.date.future');
    expect(check({ ...valid(), date: '2026-10-01' }, [LINE], { timeQuote: 30, now: NOW }).date).toBe('page.billingPurchaseOrders.error.date.expired');
    expect(check({ ...valid(), date: '2026-10-19' }, [LINE], { timeQuote: 30, now: NOW })).toEqual({});
  });
});

describe('orden exonerada', () => {
  test('con la casilla la constancia es obligatoria y de máximo 50', () => {
    expect(check({ ...valid(), isExonerated: true, exonerationNumber: '' }).exonerationNumber).toBe('page.billingPurchaseOrders.error.exonerationNumber.required');
    expect(check({ ...valid(), isExonerated: true, exonerationNumber: 'x'.repeat(51) }).exonerationNumber).toBe('page.billingPurchaseOrders.error.exonerationNumber.max');
    expect(check({ ...valid(), isExonerated: true, exonerationNumber: 'EXO-1' })).toEqual({});
  });
  test('sin la casilla la constancia no se valida', () => {
    expect(check({ ...valid(), isExonerated: false, exonerationNumber: '' })).toEqual({});
  });
});

describe('cuerpo del POST/PUT', () => {
  test('lleva los campos del cliente, la forma de pago, la exoneración y la cotización; nunca importes, estado, nombre de la forma de pago ni usuarios', () => {
    const payload = buildOrderPayload({ ...valid(), total: 9, status: false, id: 4, paymentTerms: 'Falsa', quoteId: 12, isExonerated: true, exonerationNumber: ' E ' }, [LINE]);
    expect(Object.keys(payload).sort()).toEqual(['customerAddress', 'customerCode', 'customerEmail', 'customerId', 'customerName', 'customerPhone', 'date', 'deliveryTime', 'details', 'exonerationNumber', 'isExonerated', 'notes', 'paymentTypeId', 'quoteId', 'sellerId', 'storeId']);
    expect(payload).toMatchObject({ quoteId: 12, isExonerated: true, exonerationNumber: 'E', paymentTypeId: 2 });
  });
  test('sin la casilla la constancia viaja vacía', () => {
    expect(buildOrderPayload({ ...valid(), isExonerated: false, exonerationNumber: 'E' }, [LINE]).exonerationNumber).toBe('');
  });
});

describe('totales de la pantalla (los del back)', () => {
  const lines = [
    { subtotal: 100, discountValue: 0, taxValue: 15, total: 115, taxPercent: 15 },
    { subtotal: 100, discountValue: 0, taxValue: 0, total: 100, taxPercent: 0 }
  ];
  test('sin exoneración: gravado, exento e impuesto', () => {
    expect(orderTotals(lines, false)).toMatchObject({ subtotal: 200, taxValue: 15, total: 215, taxedValue: 100, exemptValue: 100, exoneratedValue: 0 });
  });
  test('con exoneración: el gravado pasa a exonerado, el impuesto 0 y el total sin impuesto', () => {
    expect(orderTotals(lines, true)).toMatchObject({ subtotal: 200, taxValue: 0, total: 200, taxedValue: 0, exemptValue: 100, exoneratedValue: 100 });
  });
});

describe('cargar una orden', () => {
  test('formFromOrder quita los null y convierte la casilla a booleano', () => {
    const form = formFromOrder({ id: 3, date: '2026-11-10T00:00:00Z', customerPhone: null, isExonerated: 1, exonerationNumber: 'E', paymentTypeId: 2 });
    expect(form).toMatchObject({ id: 3, date: '2026-11-10', customerPhone: '', isExonerated: true, exonerationNumber: 'E', paymentTypeId: 2 });
    Object.values(form).forEach((value) => expect(value).not.toBeNull());
    expect(formFromOrder({ isExonerated: 0 }).isExonerated).toBe(false);
  });
});
