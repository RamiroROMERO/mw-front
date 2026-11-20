import { describe, expect, test } from 'vitest';
import { buildPrintRequest } from '@Helpers/printDocument';
import { PRINT_PATH, PRINT_FILE_NAME, findHeaderProblem, findDetailProblem, buildNotePayload, isNoteLocked, returnedLines, calculateReturnLine, localToday, TYPE } from './creditNoteRules';

const header = (over = {}) => ({
  date: '2026-11-10', documentCode: 'NCC', customerId: 5, typeId: TYPE.DISCOUNT, typeOther: '', description: 'x', incomeCtaCode: '4201', currencyId: 1, exchangeRate: 1, ...over
});
const today = '2026-11-20';

describe('findHeaderProblem (mismos casos que CreditNoteDTO)', () => {
  test('una cabecera válida no tiene problemas', () => {
    expect(findHeaderProblem(header(), { today })).toBeNull();
  });

  test.each([
    ['fecha vacía', { date: '' }, 'date', 'msg.error.creditNote.date.invalid'],
    ['fecha inexistente', { date: '2026-02-30' }, 'date', 'msg.error.creditNote.date.invalid'],
    ['fecha futura', { date: '2026-11-21' }, 'date', 'msg.error.creditNote.date.future'],
    ['sin documento', { documentCode: '' }, 'documentCode', 'msg.required.select.typeDocument'],
    ['sin cliente', { customerId: 0 }, 'customerId', 'msg.required.select.customer'],
    ['tipo inválido', { typeId: 5 }, 'typeId', 'msg.error.creditNote.type.invalid'],
    ['tipo 4 sin descripción', { typeId: TYPE.OTHER, typeOther: '  ' }, 'typeOther', 'msg.error.creditNote.typeOther.required'],
    ['tipo 1 sin cuenta', { incomeCtaCode: '' }, 'incomeCtaCode', 'msg.required.select.account'],
    ['tipo 2 sin cuenta', { typeId: TYPE.CANCEL, incomeCtaCode: '' }, 'incomeCtaCode', 'msg.required.select.account'],
    ['dólares sin tasa', { currencyId: 2, exchangeRate: 0 }, 'exchangeRate', 'msg.error.creditNote.exchangeRate.invalid']
  ])('%s', (_label, over, field, messageId) => {
    expect(findHeaderProblem(header(over), { today })).toEqual({ field, messageId });
  });

  test('la fecha de hoy es válida y la devolución no pide cuenta contable', () => {
    expect(findHeaderProblem(header({ date: today }), { today })).toBeNull();
    expect(findHeaderProblem(header({ typeId: TYPE.RETURN, incomeCtaCode: '' }), { today })).toBeNull();
  });

  test('localToday usa la fecha local', () => {
    expect(localToday(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('returnedLines y findDetailProblem', () => {
  const line = (quantity) => ({ productCode: 'P', quantity });

  test('solo las líneas con cantidad mayor que 0 se devuelven', () => {
    expect(returnedLines([line(0), line(2), line(-1), line('x'), line(0.5)]).map((l) => l.quantity)).toEqual([2, 0.5]);
  });

  test('devolución: exige factura de origen y al menos una cantidad', () => {
    expect(findDetailProblem({ typeId: 3, detail2: [line(1)] })).toEqual({ messageId: 'msg.required.select.originInvoice' });
    expect(findDetailProblem({ typeId: 3, originInvoice: { id: 1 }, detail2: [line(0)] })).toEqual({ messageId: 'msg.error.invalidValue' });
    expect(findDetailProblem({ typeId: 3, originInvoice: { id: 1 }, detail2: [line(1)] })).toBeNull();
  });

  test('tipos 1, 2 y 4: exigen una factura con valor mayor que 0', () => {
    expect(findDetailProblem({ typeId: 1, detail1: [] })).toEqual({ messageId: 'msg.required.select.invoiceToApply' });
    expect(findDetailProblem({ typeId: 1, detail1: [{ appliedValue: 0 }] })).toEqual({ messageId: 'msg.error.invalidValue' });
    expect(findDetailProblem({ typeId: 4, detail1: [{ appliedValue: 10 }] })).toBeNull();
  });
});

describe('buildNotePayload: solo lo que digita el usuario', () => {
  test('tipos 1, 2 y 4: cabecera y facturas con número, porcentaje y valor (sin saldo, fechas, CAI ni dólares)', () => {
    const body = buildNotePayload(header({ typeId: TYPE.OTHER, typeOther: 'Otros' }), {
      detail1: [{ invoiceNumber: 'F-1', percent: 10, appliedValue: 20, invoiceBalance: 200, invoiceCai: 'x', appliedValueUsd: 1 }]
    });
    expect(body).toEqual({
      documentCode: 'NCC', date: '2026-11-10', customerId: 5, typeId: 4, typeOther: 'Otros', description: 'x', exchangeRate: 1, discountPercent: undefined, incomeCtaCode: '4201', currencyId: 1,
      invoices: [{ invoiceNumber: 'F-1', percent: 10, appliedValue: 20 }]
    });
    expect(body).not.toHaveProperty('products');
    expect(body).not.toHaveProperty('valueLps');
  });

  test('devolución: factura de origen y solo producto y cantidad de las líneas con cantidad; sin cuenta', () => {
    const body = buildNotePayload(header({ typeId: TYPE.RETURN }), {
      originInvoice: { id: 55 },
      detail2: [{ productCode: 'A', quantity: 2, price: 10, total: 20 }, { productCode: 'B', quantity: 0, price: 5 }]
    });
    expect(body.originInvoiceId).toBe(55);
    expect(body.products).toEqual([{ productCode: 'A', quantity: 2 }]);
    expect(body.incomeCtaCode).toBe('');
    expect(body).not.toHaveProperty('invoices');
  });

  test('el tipo de descripción solo viaja en el tipo 4', () => {
    expect(buildNotePayload(header({ typeOther: 'basura' }), { detail1: [] }).typeOther).toBe('');
  });
});

describe('calculateReturnLine (solo para mostrar; mismos números que el back)', () => {
  // 10 unidades a 10, descuento 10 %, impuesto 15 %.
  const origin = { quantityInvoiced: 10, price: 10, discountPercent: 10, taxPercent: 15 };

  test('2 x 10 = 20; descuento 2; impuesto 15 % de 18 = 2.70; total 20.70', () => {
    expect(calculateReturnLine(origin, 2)).toMatchObject({ quantity: 2, subtotal: 20, discountValue: 2, taxValue: 2.7, total: 20.7 });
  });

  test('la cantidad se topa en lo facturado y no baja de 0', () => {
    expect(calculateReturnLine(origin, 99).quantity).toBe(10);
    expect(calculateReturnLine(origin, -3)).toMatchObject({ quantity: 0, total: 0 });
    expect(calculateReturnLine(origin, 'x').quantity).toBe(0);
  });

  test('mitades hacia arriba sin ruido de coma flotante: 3 x 10.125 = 30.375 -> 30.38', () => {
    expect(calculateReturnLine({ ...origin, price: 10.125, discountPercent: 0, taxPercent: 0 }, 3).subtotal).toBe(30.38);
  });

  test('el total es subtotal - descuento + impuesto al centavo', () => {
    [1, 2.5, 7, 9.99].forEach((quantity) => {
      const result = calculateReturnLine({ ...origin, price: 13.37 }, quantity);
      expect(Math.round(result.total * 100)).toBe(Math.round(result.subtotal * 100) - Math.round(result.discountValue * 100) + Math.round(result.taxValue * 100));
    });
  });
});

describe('isNoteLocked', () => {
  test('con partida o número fiscal la nota no se edita ni se elimina (se anula)', () => {
    expect(isNoteLocked({ pdaNumber: 0, numberCAI: '' })).toBe(false);
    expect(isNoteLocked({ pdaNumber: 9, numberCAI: '' })).toBe(true);
    expect(isNoteLocked({ pdaNumber: 0, numberCAI: '000-001-06-00000001' })).toBe(true);
    expect(isNoteLocked({ pdaNumber: '0', numberCAI: '  ' })).toBe(false);
  });
});

describe('impresión', () => {
  test('GET /:id/print de lo guardado y archivo Nota de Credito.pdf', () => {
    expect(buildPrintRequest({ path: PRINT_PATH, id: 7 })).toEqual({ url: 'billing/process/creditNotes/7/print', params: undefined });
    expect(PRINT_FILE_NAME).toBe('Nota de Credito.pdf');
  });
});
