import { describe, expect, test } from 'vitest';
import { buildPosRows, receivedAndChange, formatCents, validatePosPayment, PAYMENT_METHODS_PATH } from './posPaymentRules';

const methods = [{ id: 1, description: 'Contado', isDefault: true }, { id: 6, description: 'POS Ficohsa', isDefault: false }];

describe('posPaymentRules', () => {
  test('la forma predeterminada sale prellenada con el total y la ruta es la del POS', () => {
    expect(buildPosRows(methods, 115)).toEqual([
      { id: 1, name: 'Contado', isDefault: true, value: '115', reference: '' },
      { id: 6, name: 'POS Ficohsa', isDefault: false, value: '', reference: '' }
    ]);
    expect(PAYMENT_METHODS_PATH).toBe('billing/process/pointSales/paymentMethods');
  });

  test('recibido y cambio en centavos exactos; vacío vale el total; inválido da null', () => {
    expect(receivedAndChange('200', 87.45)).toEqual({ receivedCents: 20000, changeCents: 11255 });
    expect(receivedAndChange('', 10)).toEqual({ receivedCents: 1000, changeCents: 0 });
    expect(receivedAndChange('5', 10)).toEqual({ receivedCents: 500, changeCents: 0 });
    expect(receivedAndChange('abc', 10)).toBeNull();
    expect(formatCents(11255)).toBe('112.55');
    expect(formatCents(-5)).toBe('0.00');
  });

  test('0.1 + 0.2 = 0.3: la suma de las formas no tiene ruido de coma flotante', () => {
    const rows = [{ id: 1, isDefault: true, value: '0.1' }, { id: 6, isDefault: false, value: '0.2' }];
    expect(validatePosPayment({ rows, total: 0.3, receivedValue: '' })).toBeNull();
  });

  test('suma distinta, sin monto o monto inválido', () => {
    const rows = buildPosRows(methods, 100);
    expect(validatePosPayment({ rows: [{ ...rows[0], value: '90' }, rows[1]], total: 100, receivedValue: '' })).toBe('msg.required.input.totalPayMethod');
    expect(validatePosPayment({ rows: [{ ...rows[0], value: '' }, rows[1]], total: 100, receivedValue: '' })).toBe('page.invoicing.msg.payments.required');
    expect(validatePosPayment({ rows: [{ ...rows[0], value: '1.234' }, rows[1]], total: 100, receivedValue: '' })).toBe('page.invoicing.msg.payments.invalidAmount');
  });

  test('recibido menor que el total, y cambio que solo cabe en el efectivo', () => {
    const cashOnly = buildPosRows(methods, 100);
    expect(validatePosPayment({ rows: cashOnly, total: 100, receivedValue: '90' })).toBe('msg.error.pos.receivedLess');
    expect(validatePosPayment({ rows: cashOnly, total: 100, receivedValue: '150' })).toBeNull();
    const mixed = [{ ...cashOnly[0], value: '10' }, { ...cashOnly[1], value: '90' }];
    expect(validatePosPayment({ rows: mixed, total: 100, receivedValue: '110' })).toBeNull();
    expect(validatePosPayment({ rows: mixed, total: 100, receivedValue: '120' })).toBe('msg.error.pos.changeNotCash');
    const cardOnly = [{ ...cashOnly[0], value: '' }, { ...cashOnly[1], value: '100' }];
    expect(validatePosPayment({ rows: cardOnly, total: 100, receivedValue: '101' })).toBe('msg.error.pos.changeNotCash');
    expect(validatePosPayment({ rows: cardOnly, total: 100, receivedValue: '' })).toBeNull();
  });
});
