import { describe, expect, test } from 'vitest';
import {
  isHospitalEnabled, buildPreviewParams, validateExtras, buildHospitalRows, validateHospitalCheckout, buildHospitalCheckoutPayload, previewPath, EVENTS_PATH, CHECKOUT_PATH, SETTINGS_PATH
} from './posHospitalRules';

const rows = [{ id: 1, name: 'Efectivo', isDefault: true, value: '', reference: '' }, { id: 2, name: 'Tarjeta', isDefault: false, value: '', reference: '' }];
const event = { id: 50 };
const preview = { copayment: 40, insurerPart: 190, total: 230 };
const form = (over = {}) => ({ saleType: 1, insuranceId: 0, gne: '', deductible: '', discountPercent: '', receivedValue: '', notes: '', ...over });

describe('posHospitalRules', () => {
  test('rutas y activación', () => {
    expect(EVENTS_PATH).toBe('billing/process/pointSales/hospital/events');
    expect(CHECKOUT_PATH).toBe('billing/process/pointSales/hospital/checkout');
    expect(previewPath(7)).toBe('billing/process/pointSales/hospital/events/7/preview');
    expect(SETTINGS_PATH).toBe('billing/process/pointSales/hospital/settings');
    expect(isHospitalEnabled({ enabled: true })).toBe(true);
    expect(isHospitalEnabled({ enabled: false })).toBe(false);
    expect(isHospitalEnabled(undefined)).toBe(false);
  });

  test('buildPreviewParams manda solo lo que el cajero digitó', () => {
    expect(buildPreviewParams({})).toEqual({});
    expect(buildPreviewParams({ insuranceId: '982', gne: '5', deductible: ' 10 ', discountPercent: '15', sessionId: 9 })).toEqual({ insuranceId: 982, gne: '5', deductible: '10', discountPercent: '15', sessionId: 9 });
    expect(buildPreviewParams({ insuranceId: 0, gne: '', sessionId: 0 })).toEqual({});
  });

  test('validateExtras: montos de hasta 2 decimales y descuento de 0 a 100', () => {
    expect(validateExtras(form())).toBeNull();
    expect(validateExtras(form({ gne: '10.5', deductible: '100', discountPercent: '100' }))).toBeNull();
    expect(validateExtras(form({ gne: 'x' }))).toBe('page.pointSales.hospital.msg.gneInvalid');
    expect(validateExtras(form({ gne: '-1' }))).toBe('page.pointSales.hospital.msg.gneInvalid');
    expect(validateExtras(form({ deductible: '1.234' }))).toBe('page.pointSales.hospital.msg.deductibleInvalid');
    expect(validateExtras(form({ discountPercent: '101' }))).toBe('page.pointSales.hospital.msg.discountInvalid');
    expect(validateExtras(form({ discountPercent: '-1' }))).toBe('page.pointSales.hospital.msg.discountInvalid');
  });

  test('buildHospitalRows prellena el efectivo con el copago, no con el total', () => {
    expect(buildHospitalRows(rows, 40).map((row) => row.value)).toEqual(['40', '']);
    expect(buildHospitalRows(rows, 0).map((row) => row.value)).toEqual(['0', '']);
  });

  test('validateHospitalCheckout: evento, vista previa y formas de pago contra el copago', () => {
    const paid = buildHospitalRows(rows, 40);
    expect(validateHospitalCheckout({ event: null, form: form(), preview, rows: paid })).toBe('page.pointSales.hospital.msg.eventRequired');
    expect(validateHospitalCheckout({ event, form: form({ gne: 'x' }), preview, rows: paid })).toBe('page.pointSales.hospital.msg.gneInvalid');
    expect(validateHospitalCheckout({ event, form: form(), preview: null, rows: paid })).toBe('page.pointSales.hospital.msg.previewPending');
    expect(validateHospitalCheckout({ event, form: form(), preview, rows: paid })).toBeNull();
    expect(validateHospitalCheckout({ event, form: form(), preview, rows: buildHospitalRows(rows, 230) })).toBe('msg.required.input.totalPayMethod');
    expect(validateHospitalCheckout({ event, form: form({ receivedValue: '30' }), preview, rows: paid })).toBe('msg.error.pos.receivedLess');
    // recibir de más con efectivo es vuelto válido; con tarjeta (sin efectivo) el vuelto no puede salir de ninguna parte
    expect(validateHospitalCheckout({ event, form: form({ receivedValue: '50' }), preview, rows: paid })).toBeNull();
    const card = [{ ...rows[0], value: '' }, { ...rows[1], value: '40' }];
    expect(validateHospitalCheckout({ event, form: form({ receivedValue: '50' }), preview, rows: card })).toBe('msg.error.pos.changeNotCash');
  });

  test('con copago 0 no hay formas de pago y Crédito no las pide', () => {
    expect(validateHospitalCheckout({ event, form: form(), preview: { ...preview, copayment: 0 }, rows: buildHospitalRows(rows, 0) })).toBeNull();
    expect(validateHospitalCheckout({ event, form: form(), preview: { ...preview, copayment: 0 }, rows: [{ ...rows[0], value: '10' }] })).toBe('msg.required.input.totalPayMethod');
    expect(validateHospitalCheckout({ event, form: form({ saleType: 2 }), preview, rows: [] })).toBeNull();
  });

  test('buildHospitalCheckoutPayload: solo lo digitado; Crédito no manda formas de pago', () => {
    const paid = [{ ...rows[0], value: '40' }, { ...rows[1], value: '0' }];
    const payload = buildHospitalCheckoutPayload({ sessionId: 9, event, form: form({ insuranceId: '982', gne: '5', deductible: '10', discountPercent: '15', receivedValue: '50', notes: ' hola ' }), rows: paid });
    expect(payload).toEqual({
      sessionId: 9, eventId: 50, insuranceId: 982, gne: '5', deductible: '10', discountPercent: '15', saleType: 1, notes: 'hola', receivedValue: '50',
      payments: [{ paymentTypeDetailId: 1, amount: 40, reference: '' }]
    });
    expect(Object.keys(payload)).not.toEqual(expect.arrayContaining(['total', 'copayment', 'details']));
    expect(buildHospitalCheckoutPayload({ sessionId: 9, event, form: form({ saleType: 2 }), rows: paid }).payments).toEqual([]);
  });
});
