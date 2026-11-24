import { describe, expect, test } from 'vitest';
import {
  INITIAL_LINE, INITIAL_RECEIPT, accountAction, buildPayload, caiAction, invoiceToLine, lineTotal, mapDetailToLines, mapReceiptToForm, printOptions, receiptState,
  receiptTotal, validateLine, validateReceipt
} from './retentionReceiptRules';

const line = { invoiceId: 6587, withholdingTypeId: 3, baseValue: '4000', percentValue: '1', invoiceTotal: 4000, balance: 4000 };

describe('lineTotal y receiptTotal (los mismos valores del back)', () => {
  test.each([
    ['4000', '1', 40], ['79800', '1', 798], ['3031.07', '1', 30.31], ['27792.25', '1', 277.92], ['13994.64', '1', 139.95], ['1000', '12.5', 125], ['0.5', '1', 0.01], ['100.05', '10', 10.01]
  ])('base %s al %s%% = %s', (base, percent, expected) => {
    expect(lineTotal(base, percent)).toBe(expected);
  });
  test('vacío o inválido da 0', () => {
    expect(lineTotal('', '1')).toBe(0);
    expect(lineTotal('100', 'x')).toBe(0);
    expect(lineTotal('-5', '1')).toBe(0);
  });
  test('el total suma en centavos (sin ruido de coma flotante)', () => {
    expect(receiptTotal([{ baseValue: '10.1', percentValue: '1' }, { baseValue: '20.2', percentValue: '1' }])).toBe(0.3);
    expect(receiptTotal([])).toBe(0);
  });
});

describe('receiptState y acciones', () => {
  test('un comprobante nuevo no se puede numerar, contabilizar ni anular', () => {
    expect(receiptState(INITIAL_RECEIPT)).toMatchObject({ saved: false, canGenerateCai: false, canAccount: false, canCancel: false, locked: false });
    expect(caiAction(INITIAL_RECEIPT)).toBe('page.retentionReceipt.msg.saveFirst');
    expect(accountAction(INITIAL_RECEIPT)).toBe('page.retentionReceipt.msg.saveFirst');
  });
  test('guardado sin número fiscal: se puede numerar y anular, no contabilizar', () => {
    const receipt = { id: 5, status: true, pdaNumber: 0, numberCAI: '' };
    expect(receiptState(receipt)).toMatchObject({ saved: true, canGenerateCai: true, canAccount: false, canCancel: true, locked: false });
    expect(caiAction(receipt)).toBe('ok');
    expect(accountAction(receipt)).toBe('page.retentionReceipt.msg.caiRequired');
  });
  test('con número fiscal se contabiliza (y sigue editable hasta contabilizar)', () => {
    const receipt = { id: 5, status: true, pdaNumber: 0, numberCAI: '000-001-05-00001570' };
    expect(receiptState(receipt)).toMatchObject({ hasCai: true, canGenerateCai: false, canAccount: true, locked: false });
    expect(caiAction(receipt)).toBe('page.retentionReceipt.msg.caiAlready');
    expect(accountAction(receipt)).toBe('ok');
  });
  test('contabilizado queda de solo lectura y solo se anula', () => {
    const receipt = { id: 5, status: true, pdaNumber: 100059990, numberCAI: 'N' };
    expect(receiptState(receipt)).toMatchObject({ isPosted: true, locked: true, canAccount: false, canCancel: true });
    expect(accountAction(receipt)).toBe('page.retentionReceipt.msg.alreadyPosted');
  });
  test('anulado: bloqueado y sin acciones', () => {
    for (const status of [false, 0]) {
      const receipt = { id: 5, status, pdaNumber: 0, numberCAI: 'N' };
      expect(receiptState(receipt)).toMatchObject({ isVoided: true, locked: true, canCancel: false, canGenerateCai: false, canAccount: false });
      expect(caiAction(receipt)).toBe('page.retentionReceipt.msg.voided');
      expect(accountAction(receipt)).toBe('page.retentionReceipt.msg.voided');
    }
    expect(receiptState({ id: 5, status: true }).isVoided).toBe(false);
    expect(receiptState({ id: 5, status: 1 }).isVoided).toBe(false);
  });
});

describe('validateLine', () => {
  test('una línea válida no tiene errores', () => {
    expect(validateLine(line)).toEqual({});
  });
  test('factura, tipo, base y porcentaje obligatorios', () => {
    expect(Object.keys(validateLine(INITIAL_LINE)).sort()).toEqual(['baseValue', 'invoiceId', 'percentValue', 'withholdingTypeId']);
  });
  test.each(['0', '-1', '1.234', 'abc', '1e3'])('base %p inválida', (baseValue) => {
    expect(validateLine({ ...line, baseValue }).baseValue).toBeDefined();
  });
  test.each(['0', '100.01', '101', '1.234', 'x'])('porcentaje %p inválido', (percentValue) => {
    expect(validateLine({ ...line, percentValue }).percentValue).toBeDefined();
  });
  test('la base no puede superar el máximo de la factura (mayor entre subtotal y total)', () => {
    expect(validateLine({ ...line, baseValue: '4000.01' }).baseValue).toBe('page.retentionReceipt.error.baseExceeded');
    expect(validateLine({ ...line, baseValue: '4000' }).baseValue).toBeUndefined();
  });
  test('misma factura y mismo tipo no se repiten; otro tipo de la misma factura sí', () => {
    const lines = [{ ...line }];
    expect(validateLine(line, lines).withholdingTypeId).toBe('page.retentionReceipt.error.duplicated');
    expect(validateLine({ ...line, withholdingTypeId: 4, baseValue: '1000' }, lines)).toEqual({});
  });
  test('una retención en cero se rechaza', () => {
    expect(validateLine({ ...line, baseValue: '0.4' }).baseValue).toBe('page.retentionReceipt.error.totalZero');
  });
  test('lo retenido de la misma factura no supera su saldo', () => {
    const lines = [{ ...line, baseValue: '4000', percentValue: '1' }]; // 40
    expect(validateLine({ ...line, withholdingTypeId: 4, balance: 100, baseValue: '4000', percentValue: '1.5' }, lines)).toEqual({}); // 40 + 60 = 100
    expect(validateLine({ ...line, withholdingTypeId: 4, balance: 99.99, baseValue: '4000', percentValue: '1.5' }, lines).baseValue).toBe('page.retentionReceipt.error.balance');
  });
});

describe('validateReceipt y payload', () => {
  const form = { date: '2026-02-11', documentCode: 'RET', providerId: '31' };
  test('cabecera y al menos una línea', () => {
    expect(validateReceipt(form, [line])).toEqual({});
    expect(Object.keys(validateReceipt(INITIAL_RECEIPT, [])).sort()).toEqual(['date', 'details', 'documentCode', 'providerId']);
    expect(validateReceipt({ ...form, providerId: '0' }, [line]).providerId).toBeDefined();
  });
  test('máximo 200 líneas', () => {
    expect(validateReceipt(form, Array.from({ length: 201 }, () => line)).details).toBe('page.retentionReceipt.error.maxLines');
    expect(validateReceipt(form, Array.from({ length: 200 }, () => line))).toEqual({});
  });
  test('el payload solo lleva lo que el cliente decide', () => {
    expect(buildPayload({ ...form, id: 9, total: 99, numberCAI: 'X', pdaNumber: 5, date: '2026-02-11T06:00:00.000Z' }, [{ ...line, description: 'D', totalValue: 1 }])).toEqual({
      date: '2026-02-11', documentCode: 'RET', providerId: 31, details: [{ invoiceId: 6587, withholdingTypeId: 3, baseValue: 4000, percentValue: 1 }]
    });
  });
});

describe('mapeos', () => {
  test('mapReceiptToForm: decimales a número, 1900-01-01 vacío, anulado', () => {
    expect(mapReceiptToForm({
      id: 37, date: '2026-02-11', documentCode: 'RET', documentId: 38, cai: 'C', numberCAI: 'N', rangeCAI: 'R', limitDate: '1900-01-01', providerId: 31, providerName: 'P',
      pdaNumber: 100059990, total: '40.00', status: 1
    })).toEqual({
      id: 37, date: '2026-02-11', documentCode: 'RET', documentId: '38', cai: 'C', numberCAI: 'N', rangeCAI: 'R', limitDate: '', providerId: '31', providerName: 'P', pdaNumber: 100059990, total: 40, status: true
    });
    expect(mapReceiptToForm({ id: 1, status: false }).status).toBe(false);
    expect(mapReceiptToForm({ id: 1, documentId: 0 }).documentId).toBe('');
  });
  test('mapDetailToLines: una anulada llega en cero y conserva factura y tipo', () => {
    expect(mapDetailToLines([{ invoiceId: 6587, invoiceNumber: 'F', withholdingTypeId: 3, description: 'D', baseValue: 0, percentValue: 0 }])).toEqual([
      { ...INITIAL_LINE, invoiceId: 6587, invoiceNumber: 'F', withholdingTypeId: '3', description: 'D', baseValue: '0', percentValue: '0' }
    ]);
  });
  test('invoiceToLine: base sugerida = subtotal, máximo = mayor entre subtotal y total, saldo', () => {
    expect(invoiceToLine({ id: 8795, invoiceNumber: 'F', subtotal: 5120, total: 4864, balance: 4864 })).toMatchObject({
      invoiceId: 8795, invoiceNumber: 'F', baseValue: '5120', invoiceTotal: 5120, balance: 4864
    });
  });
  test('printOptions: original por defecto y copia con copy=1', () => {
    expect(printOptions(7)).toMatchObject({ path: 'tax/process/withholdingReceipts', id: 7, query: {} });
    expect(printOptions(7, true).query).toEqual({ copy: 1 });
  });
});
