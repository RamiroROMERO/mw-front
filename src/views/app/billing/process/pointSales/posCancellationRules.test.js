import { describe, expect, test } from 'vitest';
import { toCents, formatCents, totals, activePayments, validateReceipt, buildPayload, canVoid } from './posCancellationRules';

const ok = { customerId: 2, documentCode: 'REC', documents: [{ id: 1, valuePaid: '100' }], payments: [{ paymentTypeDetailId: 1, amount: '100' }], differenceCtaCode: '' };
const pending = [{ id: 1, balance: 100 }, { id: 2, balance: 50.5 }];

describe('posCancellationRules', () => {
  test('centavos: hasta 2 decimales y mayor que 0', () => {
    expect(toCents('10.5')).toBe(1050);
    ['0', '-1', '1.234', 'abc', '', null].forEach((v) => expect(toCents(v)).toBeNull());
    expect(formatCents(1050)).toBe('10.50');
  });

  test('totales y diferencia sin coma flotante', () => {
    expect(totals({ documents: [{ valuePaid: '0.10' }, { valuePaid: '0.20' }], payments: [{ amount: '0.30' }] })).toEqual({ appliedCents: 30, collectedCents: 30, differenceCents: 0 });
    expect(totals({ documents: [{ valuePaid: '150' }], payments: [{ amount: '140' }] }).differenceCents).toBe(-1000);
  });

  test('solo se mandan las formas con monto', () => {
    expect(activePayments([{ id: 1, value: '100' }, { id: 2, value: '' }, { id: 3, value: 0 }])).toEqual([{ paymentTypeDetailId: 1, amount: '100' }]);
  });

  test('validación con los mismos casos del back', () => {
    expect(validateReceipt(ok, { pending })).toEqual({});
    expect(validateReceipt({ ...ok, customerId: 0 }, { pending }).customerId).toBeTruthy();
    expect(validateReceipt({ ...ok, documentCode: '' }, { pending }).documentCode).toBeTruthy();
    expect(validateReceipt({ ...ok, documents: [] }, { pending }).documents).toBeTruthy();
    expect(validateReceipt({ ...ok, documents: [{ id: 1, valuePaid: '10' }, { id: 1, valuePaid: '5' }] }, { pending }).documents).toBeTruthy();
    expect(validateReceipt({ ...ok, documents: [{ id: 1, valuePaid: '100.01' }], payments: [{ amount: '100.01' }] }, { pending }).documents).toBeTruthy();
    expect(validateReceipt({ ...ok, payments: [] }, { pending }).payments).toBeTruthy();
    expect(validateReceipt({ ...ok, payments: [{ amount: '90' }] }, { pending }).differenceCtaCode).toBeTruthy();
    expect(validateReceipt({ ...ok, payments: [{ amount: '90' }], differenceCtaCode: '5999' }, { pending })).toEqual({});
  });

  test('el cuerpo no lleva caja, cajero ni empresa y la cuenta de diferencia solo con diferencia', () => {
    const exact = buildPayload({ ...ok, date: '2026-11-18', cashId: 9, cashierId: 9 }, { documents: ok.documents, payments: ok.payments });
    expect(Object.keys(exact).sort()).toEqual(['customerId', 'date', 'description', 'documentCode', 'documents', 'payments', 'reference']);
    const short = buildPayload({ ...ok, differenceCtaCode: '5999' }, { documents: ok.documents, payments: [{ paymentTypeDetailId: 1, amount: '90' }] });
    expect(short.differenceCtaCode).toBe('5999');
  });

  test('anular según el estado', () => {
    expect(canVoid({ isVoided: false, isClosed: false }, true)).toBe(true);
    expect(canVoid({ isVoided: true }, true)).toBe(false);
    expect(canVoid({ isClosed: true }, true)).toBe(false);
    expect(canVoid({}, false)).toBe(false);
  });
});
