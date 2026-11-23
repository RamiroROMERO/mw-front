import { describe, expect, test } from 'vitest';
import { buildCheckoutPayload, hasSession } from './posCheckoutRules';

describe('posCheckoutRules', () => {
  const header = { customerId: '7', customerName: 'Ana', customerDNI: '08', documentType: 1, sellerId: 3, notes: 'n', total: 999, cashId: 8, cashierId: 9, date: '2000-01-01', taxValue: 5 };
  const details = [{ productCode: 'P1', unitedOut: 'UND', qty: '2', price: 100, discountPercent: 0, total: 1, unitedCoste: 0, areaId: 9, storeId: 9, taxValue: 0 }];

  test('solo manda lo que digita el cajero y la sesión; ningún monto calculado, caja, cajero, área, almacén ni fecha', () => {
    const payload = buildCheckoutPayload({ sessionId: '12', header, details, payments: [{ id: 1, value: 230 }, { id: 2, value: 0 }], receivedValue: 300 });
    expect(payload).toEqual({
      sessionId: 12, customerId: 7, customerName: 'Ana', customerDNI: '08', saleType: 1, sellerId: 3, notes: 'n', receivedValue: '300',
      details: [{ productCode: 'P1', unitName: 'UND', qty: 2, price: 100, discountPercent: 0, discountId: 0, isBonus: false, lotCode: '', expirationDate: null }],
      payments: [{ paymentTypeDetailId: 1, amount: 230, reference: '' }]
    });
    ['total', 'cashId', 'cashierId', 'date', 'taxValue', 'areaId', 'storeId', 'unitedCoste'].forEach((key) => {
      expect(payload).not.toHaveProperty(key);
      expect(payload.details[0]).not.toHaveProperty(key);
    });
  });

  test('sin monto recibido manda vacío y los pagos en 0 no se envían', () => {
    const payload = buildCheckoutPayload({ sessionId: 1, header, details, payments: [{ id: 1, value: 0 }], receivedValue: undefined });
    expect(payload.receivedValue).toBe('');
    expect(payload.payments).toEqual([]);
  });

  test('hasSession exige sessionId', () => {
    expect(hasSession({ sessionId: 5 })).toBe(true);
    expect(hasSession({ cashId: 1 })).toBe(false);
    expect(hasSession(null)).toBe(false);
  });
});
