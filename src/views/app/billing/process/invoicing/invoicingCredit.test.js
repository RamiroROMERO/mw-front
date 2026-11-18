import { describe, expect, test } from 'vitest';
import { CREDIT_STATUS_PATH, creditAlertLevel, creditWarningIds, paymentStatusColor, paymentStatusId } from './invoicingRules';

// SPEC v2-73-sr: el nivel de crédito lo calcula el servidor; el front solo lo traduce.
describe('creditAlertLevel', () => {
  test.each([
    [{ level: 'exceeded' }, 'over'],
    [{ level: 'warning' }, 'warning'],
    [{ level: 'ok' }, 'ok'],
    [{ level: 'none' }, null],
    [{}, null],
    [null, null],
    [undefined, null]
  ])('%j -> %p', (status, expected) => expect(creditAlertLevel(status)).toBe(expected));

  test('límite 0 (nivel none) ya no marca "excedido" como el cálculo anterior del front', () => {
    expect(creditAlertLevel({ level: 'none', limit: 0, balance: 500, available: -500 })).toBeNull();
  });
});

describe('creditWarningIds', () => {
  test('un id de traducción por aviso de crédito y nada con otros avisos', () => {
    const warnings = [{ code: 'credit.warning' }, { code: 'stock.insufficient', productCode: 'A' }, { code: 'credit.exceeded' }, null, { code: 'otro' }];
    expect(creditWarningIds(warnings)).toEqual(['page.invoicing.modal.creditStatus.warning', 'page.invoicing.modal.creditStatus.exceeded']);
  });

  test('sin avisos o con algo que no es una lista devuelve vacío', () => {
    expect(creditWarningIds([])).toEqual([]);
    expect(creditWarningIds(undefined)).toEqual([]);
    expect(creditWarningIds({})).toEqual([]);
  });
});

describe('estado de pago', () => {
  test('pagada y pendiente tienen etiqueta; borrador, anulada y sin estado no', () => {
    expect(paymentStatusId('paid')).toBe('page.invoicing.paymentStatus.paid');
    expect(paymentStatusId('pending')).toBe('page.invoicing.paymentStatus.pending');
    ['draft', 'voided', null, undefined, ''].forEach((status) => expect(paymentStatusId(status)).toBeNull());
  });

  test('colores', () => {
    expect(paymentStatusColor('paid')).toBe('success');
    expect(paymentStatusColor('pending')).toBe('warning');
    expect(paymentStatusColor(null)).toBe('secondary');
  });

  test('la ruta del endpoint', () => expect(CREDIT_STATUS_PATH).toBe('billing/process/invoicing/creditStatus'));
});
