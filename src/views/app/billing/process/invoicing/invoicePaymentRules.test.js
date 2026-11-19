import { describe, expect, test } from 'vitest';
import { needsPayments, toCents, buildRows, validatePayments, buildPayments } from './invoicePaymentRules';

describe('invoicePaymentRules', () => {
  test('solo el Contado pide formas de pago', () => {
    expect(needsPayments(1)).toBe(true);
    expect(needsPayments('1')).toBe(true);
    expect(needsPayments(2)).toBe(false);
    expect(needsPayments(0)).toBe(false);
  });

  test('toCents es exacto y rechaza lo que no es un monto de hasta 2 decimales', () => {
    expect(toCents('115')).toBe(11500);
    expect(toCents('0.1')).toBe(10);
    expect(toCents(0.3)).toBe(30);
    expect(toCents('1,234.50')).toBe(123450);
    expect(toCents('')).toBe(0);
    expect(toCents(null)).toBe(0);
    ['abc', '-5', '1.234', '1e3', '1..2'].forEach((bad) => expect(toCents(bad)).toBeNull());
  });

  test('las filas iniciales ponen el total en la primera forma', () => {
    const rows = buildRows([{ id: 1, description: 'Contado' }, { id: 6, description: 'POS' }], 184);
    expect(rows).toEqual([{ id: 1, name: 'Contado', value: '184', reference: '' }, { id: 6, name: 'POS', value: '', reference: '' }]);
    expect(buildRows([], 10)).toEqual([]);
  });

  test('valida monto, al menos uno con monto y suma igual al total en centavos', () => {
    const rows = (a, b) => [{ id: 1, value: a }, { id: 6, value: b }];
    expect(validatePayments(rows('84', '100'), 184)).toBeNull();
    expect(validatePayments(rows('0.1', '0.2'), 0.3)).toBeNull();
    expect(validatePayments(rows('84', '99.99'), 184)).toBe('msg.required.input.totalPayMethod');
    expect(validatePayments(rows('84', '100.01'), 184)).toBe('msg.required.input.totalPayMethod');
    expect(validatePayments(rows('', ''), 184)).toBe('page.invoicing.msg.payments.required');
    expect(validatePayments(rows('abc', '184'), 184)).toBe('page.invoicing.msg.payments.invalidAmount');
    expect(validatePayments(rows('-1', '185'), 184)).toBe('page.invoicing.msg.payments.invalidAmount');
    expect(validatePayments([], 184)).toBe('page.invoicing.msg.payments.required');
  });

  test('el cuerpo solo lleva las formas con monto, con su referencia', () => {
    const body = buildPayments([{ id: 1, value: '84.5', reference: ' EF ' }, { id: 6, value: '', reference: 'x' }, { id: 7, value: '0', reference: '' }]);
    expect(body).toEqual([{ paymentTypeDetailId: 1, amount: 84.5, reference: 'EF' }]);
  });
});
