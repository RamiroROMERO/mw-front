import { describe, expect, test } from 'vitest';
import {
  HONORARIUMS_PATH, HONORARIUM_EVENTS_PATH, validateReceipt, buildReceiptPayload, validateVoidReason, voidParams, providerOptions, defaultTypeTax, emptyForm, canVoid, MAX_INVOICE, MAX_REASON
} from './posHonorariumRules';

const form = (over = {}) => ({ eventId: 50, providerId: 7, invoiceNumber: '0000010400000181', description: 'HONORARIOS', expenseCtaCode: '600010101', paymentTypeId: 7, typeTax: 6, total: '8000.00', ...over });

describe('posHonorariumRules', () => {
  test('rutas', () => {
    expect(HONORARIUMS_PATH).toBe('billing/process/pointSales/honorariums');
    expect(HONORARIUM_EVENTS_PATH).toBe('billing/process/pointSales/honorariums/events');
  });

  test('un recibo completo no tiene error', () => {
    expect(validateReceipt(form())).toBeNull();
  });

  test.each([
    [{ eventId: 0 }, 'eventRequired'], [{ providerId: 0 }, 'providerRequired'], [{ invoiceNumber: ' ' }, 'invoiceRequired'], [{ invoiceNumber: 'x'.repeat(MAX_INVOICE + 1) }, 'invoiceTooLong'],
    [{ description: '' }, 'descriptionRequired'], [{ description: 'x'.repeat(251) }, 'descriptionTooLong'], [{ typeTax: 0 }, 'typeTaxRequired'], [{ expenseCtaCode: '0' }, 'accountRequired'],
    [{ paymentTypeId: 0 }, 'paymentRequired'], [{ total: '0' }, 'totalInvalid'], [{ total: '1.234' }, 'totalInvalid'], [{ total: '-5' }, 'totalInvalid'], [{ total: 'abc' }, 'totalInvalid']
  ])('rechaza %j', (over, key) => {
    expect(validateReceipt(form(over))).toBe(`page.pointSales.honorarium.msg.${key}`);
  });

  test('el cuerpo solo lleva lo digitado y la sesión (nada de retención, documento ni cuentas del médico)', () => {
    const payload = buildReceiptPayload({ sessionId: '9', form: { ...form(), retenValue: 5, documentCode: 'X' } });
    expect(Object.keys(payload).sort()).toEqual(['description', 'eventId', 'expenseCtaCode', 'invoiceNumber', 'paymentTypeId', 'providerId', 'sessionId', 'total', 'typeTax']);
    expect(payload).toMatchObject({ sessionId: 9, eventId: 50, total: '8000.00' });
  });

  test('motivo de anulación obligatorio y de hasta 200 caracteres', () => {
    expect(validateVoidReason(' ')).toBe('msg.required.input.voidReason');
    expect(validateVoidReason('x'.repeat(MAX_REASON + 1))).toBe('page.pointSales.honorarium.msg.reasonTooLong');
    expect(validateVoidReason('error')).toBeNull();
    expect(voidParams(` ${'x'.repeat(300)} `).reason.length).toBe(MAX_REASON);
  });

  test('opciones de médico, tipo fiscal por defecto, formulario vacío y anulación', () => {
    expect(providerOptions([{ id: 7, name: 'Ana', dni: '0801' }, { id: 8, name: 'Luis' }])).toEqual([{ value: 7, label: '0801 - Ana' }, { value: 8, label: 'Luis' }]);
    expect(providerOptions(undefined)).toEqual([]);
    expect(defaultTypeTax([{ value: 5, label: 'Facturas' }, { value: 6, label: 'Recibos por Honoraarios' }])).toBe(6);
    expect(defaultTypeTax([{ value: 5, label: 'Facturas' }])).toBe(0);
    expect(emptyForm(50, 6)).toMatchObject({ eventId: 50, typeTax: 6, providerId: 0, total: '' });
    expect(canVoid({ status: 1 })).toBe(true);
    expect(canVoid({ status: 0 })).toBe(false);
  });
});
