import { describe, it, expect } from 'vitest';
import {
  calculateReturnLine, buildReturnLinesFromPurchase, setReturnQty, sumReturn, sumApplied, appliedFromPercent, percentFromApplied,
  buildInvoiceLine, validateNote, buildPayload, noteState, normalizeNote, noteLabel, isReturnType, TYPE_RETURN
} from './creditNoteRules';

// Los números son los de modules/inventory/creditNotes/__tests__/creditNoteRules.test.js del back: A x 4 a 100 con 10 % de descuento
// y 15 % de impuesto = 400 - 40 + 54 = 414; B x 5 a 20 exonerada = 100.
const A = { price: 100, discountPercent: 10, taxPercent: 15, isExonerated: false };
const B = { price: 20, discountPercent: 0, taxPercent: 15, isExonerated: true };

describe('importes de una línea de devolución', () => {
  it('A x 4: subtotal 400, descuento 40, impuesto 54 y total 414', () => {
    expect(calculateReturnLine(A, 4)).toEqual({ subtotal: 400, discountValue: 40, taxValue: 54, total: 414 });
  });
  it('B exonerada x 5: sin impuesto aunque la compra traiga un porcentaje', () => {
    expect(calculateReturnLine(B, 5)).toEqual({ subtotal: 100, discountValue: 0, taxValue: 0, total: 100 });
  });
  it('el impuesto va sobre el subtotal descontado y todo a centavos (3 x 3.333 al 5 % y 15 %: 10 - 0.50 + 1.43 = 10.93)', () => {
    expect(calculateReturnLine({ price: 3.333, discountPercent: 5, taxPercent: 15 }, 3)).toEqual({ subtotal: 10, discountValue: 0.5, taxValue: 1.43, total: 10.93 });
  });
  it('cantidad 0, vacía o inválida da cero', () => {
    [0, '', 'x', undefined].forEach((q) => expect(calculateReturnLine(A, q)).toEqual({ subtotal: 0, discountValue: 0, taxValue: 0, total: 0 }));
  });
});

describe('líneas devolubles de una compra', () => {
  const purchaseLines = [
    { id: 1, productCode: 'A', qty: '10.00000', price: '100', discountPercent: '10', taxPercent: '15', isBonus: false, isExonerated: false, productData: { name: 'CLORO' } },
    { id: 2, productCode: 'A', qty: 2, price: 0, discountPercent: 0, taxPercent: 0, isBonus: true },
    { id: 3, productCode: 'B', qty: 5, price: 20, discountPercent: 0, taxPercent: 15, isBonus: false, isExonerated: true }
  ];
  it('excluye las bonificadas, convierte los textos a número y arranca con la cantidad comprada', () => {
    const lines = buildReturnLinesFromPurchase(purchaseLines);
    expect(lines.map((l) => l.productCode)).toEqual(['A', 'B']);
    expect(lines[0]).toMatchObject({ qty: 10, qtyReturn: 10, description: 'CLORO', subtotal: 1000, discountValue: 100, taxValue: 135, total: 1035 });
    expect(lines[1]).toMatchObject({ description: 'B', qtyReturn: 5, total: 100 });
  });
  it('cambiar la cantidad recalcula y la limita a lo comprado y a 0', () => {
    const [line] = buildReturnLinesFromPurchase(purchaseLines);
    expect(setReturnQty(line, 4)).toMatchObject({ qtyReturn: 4, subtotal: 400, discountValue: 40, taxValue: 54, total: 414 });
    expect(setReturnQty(line, 99).qtyReturn).toBe(10);
    expect(setReturnQty(line, -3)).toMatchObject({ qtyReturn: 0, total: 0 });
    expect(setReturnQty(line, 'abc').qtyReturn).toBe(0);
  });
  it('sin compra devuelve una lista vacía', () => {
    expect(buildReturnLinesFromPurchase(undefined)).toEqual([]);
  });
});

describe('sumas sin ruido de coma flotante', () => {
  it('el total de la devolución solo cuenta las líneas con cantidad: 414 + 100 = 514', () => {
    const lines = [{ qtyReturn: 4, total: 414 }, { qtyReturn: 5, total: 100 }, { qtyReturn: 0, total: 77 }];
    expect(sumReturn(lines)).toBe(514);
  });
  it('0.1 + 0.2 aplicados suman 0.3', () => {
    expect(sumApplied([{ appliedValue: 0.1 }, { appliedValue: 0.2 }])).toBe(0.3);
    expect(sumApplied([])).toBe(0);
  });
  it('% y valor aplicado se convierten entre sí sobre el saldo', () => {
    expect(appliedFromPercent(10, 1234.56)).toBe(123.46);
    expect(appliedFromPercent(100, 80)).toBe(80);
    expect(percentFromApplied(50, 200)).toBe(25);
    expect(percentFromApplied(50, 0)).toBe(0);
  });
  it('una compra pendiente arranca aplicando todo su saldo', () => {
    expect(buildInvoiceLine({ documentCode: 'F-1', date: '2026-08-01', balance: '150.5' })).toEqual({
      id: 'F-1', invoiceNumber: 'F-1', invoiceDate: '2026-08-01', invoiceCai: '', invoiceOrderCode: '', balance: 150.5, percent: 100, appliedValue: 150.5
    });
  });
});

const FORM = { documentCode: 'NCP', providerId: 5, cai: 'CAI', numberCAI: '000-001', typeId: 1, accCode: '4990101001', originInvoiceNumber: '' };
const INVOICES = [{ invoiceNumber: 'F-1', appliedValue: 50, percent: 10 }];
const PRODUCTS = [{ productCode: 'A', qtyReturn: 2 }];

describe('validación de campos (los mismos casos del back)', () => {
  it('una nota de descuento y una devolución válidas no tienen errores', () => {
    expect(validateNote(FORM, { invoices: INVOICES })).toEqual({});
    expect(validateNote({ ...FORM, typeId: 3, originInvoiceNumber: 'F-100', accCode: '' }, { products: PRODUCTS })).toEqual({});
  });
  it('cabecera: documento, proveedor, CAI y número', () => {
    expect(validateNote({ ...FORM, documentCode: '', providerId: 0, cai: ' ', numberCAI: '' }, { invoices: INVOICES })).toEqual({
      documentCode: 'msg.required.select.typeDocument', providerId: 'msg.required.select.provider', cai: 'msg.required.input.code', numberCAI: 'msg.required.input.code'
    });
  });
  it.each([[1], [2], [4]])('tipo %i: exige una compra con valor y la cuenta contable', (typeId) => {
    expect(validateNote({ ...FORM, typeId }, { invoices: [] }).detail).toBe('msg.required.select.invoiceToApply');
    expect(validateNote({ ...FORM, typeId }, { invoices: [{ invoiceNumber: 'F', appliedValue: 0 }] }).detail).toBe('msg.required.select.invoiceToApply');
    expect(validateNote({ ...FORM, typeId, accCode: '' }, { invoices: INVOICES }).accCode).toBe('msg.required.select.account');
  });
  it('devolución: exige la compra origen y al menos una cantidad; no pide cuenta ni compras aplicadas', () => {
    const base = { ...FORM, typeId: 3, accCode: '' };
    expect(validateNote({ ...base, originInvoiceNumber: '' }, { products: PRODUCTS }).detail).toBe('msg.required.select.originInvoice');
    expect(validateNote({ ...base, originInvoiceNumber: 'F-100' }, { products: [{ productCode: 'A', qtyReturn: 0 }] }).detail).toBe('msg.required.select.originInvoice');
    expect(validateNote({ ...base, originInvoiceNumber: 'F-100' }, { products: PRODUCTS, invoices: [] })).toEqual({});
  });
  it('sin argumentos no lanza', () => {
    expect(Object.keys(validateNote(undefined))).toContain('documentCode');
  });
});

describe('cuerpo del POST y PUT', () => {
  const FULL = { ...FORM, date: '2026-10-20', typeOther: 'Intereses', description: 'obs', docValueUSD: '0', exchangeRate: '', discountPercent: '5', currenId: 1, isMixed: false, pdaNumber: 99, documentId: 7, valueLps: 1234 };

  it('una nota de descuento manda las compras con su valor y porcentaje, y no manda importes ni partida ni correlativo', () => {
    const body = buildPayload(FULL, { invoices: [...INVOICES, { invoiceNumber: 'F-2', appliedValue: 0 }], products: PRODUCTS });
    expect(body).toEqual({
      date: '2026-10-20', documentCode: 'NCP', providerId: 5, typeId: 1, typeOther: '', description: 'obs', docValueUSD: 0, exchangeRate: 1, discountPercent: 5,
      accCode: '4990101001', currenId: 1, cai: 'CAI', numberCAI: '000-001', originInvoiceNumber: '', isMixed: false,
      invoices: [{ invoiceNumber: 'F-1', appliedValue: 50, percent: 10 }]
    });
    ['pdaNumber', 'documentId', 'valueLps', 'products'].forEach((key) => expect(body[key]).toBeUndefined());
  });
  it('una devolución manda solo producto y cantidad (el back calcula cada importe) y la compra origen; sin cuenta ni descuento', () => {
    const body = buildPayload({ ...FULL, typeId: 3, originInvoiceNumber: 'F-100' }, { invoices: INVOICES, products: [...PRODUCTS, { productCode: 'B', qtyReturn: 0 }] });
    expect(body.products).toEqual([{ productCode: 'A', quantity: 2 }]);
    expect(body).toMatchObject({ typeId: 3, originInvoiceNumber: 'F-100', accCode: '', discountPercent: 0 });
    expect(body.invoices).toBeUndefined();
  });
  it('el texto "otros" solo viaja en el tipo 4 y la nota mixta como booleano', () => {
    expect(buildPayload({ ...FULL, typeId: 4 }, { invoices: INVOICES }).typeOther).toBe('Intereses');
    expect(buildPayload({ ...FULL, isMixed: true }, { invoices: INVOICES }).isMixed).toBe(true);
  });
});

describe('estado de la nota', () => {
  it('nueva: se guarda pero no se contabiliza ni se anula', () => {
    expect(noteState({ id: 0, pdaNumber: 0, status: 1 })).toEqual({ saved: false, processed: false, voided: false, locked: false, canProcess: false, canRepost: false, canVoid: false });
  });
  it('guardada: se puede contabilizar', () => {
    expect(noteState({ id: 5, pdaNumber: 0, status: 1 })).toMatchObject({ saved: true, locked: false, canProcess: true, canRepost: false });
  });
  it('contabilizada: bloqueada, se puede re-contabilizar y anular', () => {
    expect(noteState({ id: 5, pdaNumber: 100, status: 1 })).toMatchObject({ processed: true, locked: true, canProcess: false, canRepost: true, canVoid: true });
  });
  it('anulada: bloqueada y sin ninguna acción', () => {
    expect(noteState({ id: 5, pdaNumber: 100, status: 0 })).toMatchObject({ voided: true, locked: true, canProcess: false, canRepost: false, canVoid: false });
  });
});

describe('respuesta de GET /:id', () => {
  it('convierte el detalle a los campos del formulario', () => {
    const { invoices, products } = normalizeNote({
      invoices: [{ id: 1, invoiceNumber: 'F-1', invoiceDate: '2026-08-01', invoiceBalance: '100.00', percent: '10.00', appliedValue: '10.00' }],
      products: [{ id: 2, purchaseId: 77, productCode: 'A', quantity: '4.00', subtotal: '400.00', discountValue: '40.00', taxValue: '54.00', total: '414.00', productData: { name: 'CLORO' } }]
    });
    expect(invoices[0]).toEqual({ id: 1, invoiceNumber: 'F-1', invoiceDate: '2026-08-01', invoiceCai: '', invoiceOrderCode: '', balance: 100, percent: 10, appliedValue: 10 });
    expect(products[0]).toMatchObject({ purchaseId: 77, productCode: 'A', description: 'CLORO', qty: 4, qtyReturn: 4, subtotal: 400, total: 414 });
  });
  it('respuesta ausente: detalle vacío', () => {
    expect(normalizeNote(undefined)).toEqual({ invoices: [], products: [] });
  });
  it('noteLabel e isReturnType', () => {
    expect(noteLabel({ documentCode: 'NCP', documentId: 12 })).toBe('NCP-12');
    expect(isReturnType('3')).toBe(true);
    expect(isReturnType(TYPE_RETURN)).toBe(true);
    expect(isReturnType(1)).toBe(false);
  });
});
