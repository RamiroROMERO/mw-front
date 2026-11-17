import { describe, expect, test } from 'vitest';
import {
  DETAIL_PATH, INITIAL_DETAIL_FORM, INITIAL_PAYMENT_METHOD_FORM, buildDetailPayload, buildPaymentMethodPayload, mapDetailToForm, mapPaymentMethodToForm, validateDetail, validatePaymentMethod
} from './paymentMethodRules';

const header = { ...INITIAL_PAYMENT_METHOD_FORM, name: 'Efectivo', usageCriteria: 1, usageType: 3 };
const detail = { ...INITIAL_DETAIL_FORM, description: 'Contado', paymentCtaCode: '1010101001' };

describe('validatePaymentMethod (mismos casos que AdminPaymentTypeDTO del back)', () => {
  test('una forma válida no tiene errores', () => { expect(validatePaymentMethod(header)).toEqual({}); });
  test('el nombre es obligatorio (vacío y solo espacios) y 40 es el máximo', () => {
    ['', '   ', null].forEach((name) => expect(validatePaymentMethod({ ...header, name }).name).toBe('msg.required.input.name'));
    expect(validatePaymentMethod({ ...header, name: 'A'.repeat(40) })).toEqual({});
    expect(validatePaymentMethod({ ...header, name: 'A'.repeat(41) }).name).toBe('page.paymentMethods.error.nameMax');
  });
  test('criterio de uso de 1 a 6 y tipo de uso de 1 a 3', () => {
    [1, 6, '6'].forEach((v) => expect(validatePaymentMethod({ ...header, usageCriteria: v })).toEqual({}));
    [0, 7, '', 'x'].forEach((v) => expect(validatePaymentMethod({ ...header, usageCriteria: v }).usageCriteria).toBeDefined());
    [1, 3].forEach((v) => expect(validatePaymentMethod({ ...header, usageType: v })).toEqual({}));
    [0, 4, ''].forEach((v) => expect(validatePaymentMethod({ ...header, usageType: v }).usageType).toBeDefined());
  });
});

describe('payload y carga de la cabecera', () => {
  test('el cuerpo trae solo lo que el back acepta, con la predeterminada como 0 o 1', () => {
    expect(buildPaymentMethodPayload({ ...header, id: 4, isDefault: true, isRemoved: true, name: '  Efectivo ' })).toEqual({ name: 'Efectivo', usageCriteria: 1, usageType: 3, isDefault: 1, status: true });
    expect(buildPaymentMethodPayload({ ...header, isDefault: false }).isDefault).toBe(0);
  });
  test('cargar una fila convierte la predeterminada de 0/1 a booleano y no copia campos ajenos', () => {
    expect(mapPaymentMethodToForm({ id: 2, name: 'X', usageCriteria: 2, usageType: 1, isDefault: 1, status: 1, idCtaCont: 'viejo' })).toEqual({ id: 2, name: 'X', usageCriteria: 2, usageType: 1, isDefault: true, status: true });
  });
});

describe('validateDetail (mismos casos que PaymentTypeDetailsDTO y el servicio del back)', () => {
  test('una línea válida no tiene errores (comisión y cliente son opcionales)', () => { expect(validateDetail(detail)).toEqual({}); });
  test('descripción y cuenta contable obligatorias (vacías y solo espacios)', () => {
    ['', '  ', null].forEach((v) => {
      expect(validateDetail({ ...detail, description: v }).description).toBe('msg.required.input.description');
      expect(validateDetail({ ...detail, paymentCtaCode: v }).paymentCtaCode).toBe('msg.required.select.contAccount');
    });
  });
  test('descripción de 50 como máximo', () => {
    expect(validateDetail({ ...detail, description: 'A'.repeat(50) })).toEqual({});
    expect(validateDetail({ ...detail, description: 'A'.repeat(51) }).description).toBe('page.paymentMethods.error.descriptionMax');
  });
  test('porcentaje de 0 a 100', () => {
    [0, '0', 3.5, 100, ''].forEach((v) => expect(validateDetail({ ...detail, percentComiss: v })).toEqual({}));
    [-1, 100.01, 'abc'].forEach((v) => expect(validateDetail({ ...detail, percentComiss: v }).percentComiss).toBe('page.paymentMethods.error.percent'));
  });
  test('con cuenta de comisión el porcentaje debe ser mayor que 0', () => {
    expect(validateDetail({ ...detail, commissionCtaCode: '6010', percentComiss: 0 }).percentComiss).toBe('page.paymentMethods.error.percentRequired');
    expect(validateDetail({ ...detail, commissionCtaCode: '6010', percentComiss: 3.5 })).toEqual({});
  });
  test('con "genera CxC" el cliente es obligatorio; sin ella no', () => {
    expect(validateDetail({ ...detail, isReceivable: true, customerId: 0 }).customerId).toBe('page.paymentMethods.error.customerRequired');
    expect(validateDetail({ ...detail, isReceivable: true, customerId: 5 })).toEqual({});
    expect(validateDetail({ ...detail, isReceivable: false, customerId: 0 })).toEqual({});
  });
});

describe('payload y carga de las cuentas', () => {
  test('el cuerpo usa los nombres nuevos, la forma de pago del contexto y la casilla como 0 o 1', () => {
    const body = buildDetailPayload({ ...detail, percentComiss: '3.5', commissionCtaCode: ' 6010 ', isReceivable: true, customerId: '7', idCtaCont: 'viejo', idFather: 9 }, '4');
    expect(body).toEqual({ paymentTypeId: 4, description: 'Contado', paymentCtaCode: '1010101001', percentComiss: 3.5, commissionCtaCode: '6010', isReceivable: 1, customerId: 7, status: true });
  });
  test('sin "genera CxC" el cliente viaja como 0', () => {
    expect(buildDetailPayload({ ...detail, isReceivable: false, customerId: 7 }, 4).customerId).toBe(0);
  });
  test('cargar una fila del back convierte los números del texto de MySQL y la casilla a booleano', () => {
    expect(mapDetailToForm({ id: 6, paymentTypeId: 6, description: 'POS', paymentCtaCode: '10', percentComiss: '3.50', commissionCtaCode: '60', isReceivable: 1, customerId: 3, status: 1 }))
      .toEqual({ id: 6, paymentTypeId: 6, description: 'POS', paymentCtaCode: '10', percentComiss: 3.5, commissionCtaCode: '60', isReceivable: true, customerId: 3, status: true });
  });
});

describe('ruta del detalle', () => {
  test('es la que monta el back (paymentTypeDetails), no paymentMethodsDetail', () => { expect(DETAIL_PATH).toBe('billing/settings/paymentTypeDetails'); });
});
