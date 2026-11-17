import { describe, expect, test } from 'vitest';
import { INITIAL_CASH_BOX_FORM, buildCashBoxPayload, mapCashBoxToForm, validateCashBox } from './cashBoxRules';

const valid = { ...INITIAL_CASH_BOX_FORM, name: 'Caja Principal', cashCtaCode: '1010101001', depositCtaCode: '1010203004' };

describe('validateCashBox (mismos casos que FacSetCashDTO del back)', () => {
  test('una caja válida (sin área) no tiene errores', () => { expect(validateCashBox(valid)).toEqual({}); });
  test('nombre: 5 mínimo (con espacios recortados) y 40 máximo', () => {
    expect(validateCashBox({ ...valid, name: 'ABCD' }).name).toBe('page.cashBoxes.error.name');
    expect(validateCashBox({ ...valid, name: '  ABCD  ' }).name).toBeDefined();
    expect(validateCashBox({ ...valid, name: '' }).name).toBeDefined();
    expect(validateCashBox({ ...valid, name: 'ABCDE' })).toEqual({});
    expect(validateCashBox({ ...valid, name: 'A'.repeat(40) })).toEqual({});
    expect(validateCashBox({ ...valid, name: 'A'.repeat(41) }).name).toBe('page.cashBoxes.error.nameMax');
  });
  test('las dos cuentas son obligatorias (vacías y solo espacios)', () => {
    ['', '   ', null, undefined].forEach((v) => {
      expect(validateCashBox({ ...valid, cashCtaCode: v }).cashCtaCode).toBe('msg.required.input.cashAccount');
      expect(validateCashBox({ ...valid, depositCtaCode: v }).depositCtaCode).toBe('msg.required.input.depositAccount');
    });
  });
  test('cada cuenta admite 20 caracteres y rechaza 21', () => {
    ['cashCtaCode', 'depositCtaCode'].forEach((field) => {
      expect(validateCashBox({ ...valid, [field]: 'A'.repeat(20) })).toEqual({});
      expect(validateCashBox({ ...valid, [field]: 'A'.repeat(21) })[field]).toBe('page.cashBoxes.error.accountMax');
    });
  });
  test('el área es opcional: con o sin valor no da error', () => {
    [0, '', null, 3, '3'].forEach((billingAreaId) => expect(validateCashBox({ ...valid, billingAreaId })).toEqual({}));
  });
});

describe('buildCashBoxPayload', () => {
  test('solo los campos del formulario, textos recortados y área vacía como 0', () => {
    const payload = buildCashBoxPayload({ ...valid, id: 7, name: '  Caja Uno  ', cashCtaCode: ' 1010 ', billingAreaId: '', isRemoved: false, nomarea: 'x' });
    expect(payload).toEqual({ name: 'Caja Uno', cashCtaCode: '1010', depositCtaCode: '1010203004', billingAreaId: 0, status: true });
  });
  test('un área elegida viaja como número y status como booleano', () => {
    expect(buildCashBoxPayload({ ...valid, billingAreaId: '3', status: 0 })).toMatchObject({ billingAreaId: 3, status: false });
  });
});

describe('mapCashBoxToForm', () => {
  test('nulos y ausentes toman el valor inicial y el status 0/1 pasa a booleano', () => {
    expect(mapCashBoxToForm({ id: 3, name: 'Caja Dos', cashCtaCode: null, billingAreaId: null, status: 1 })).toEqual({ ...INITIAL_CASH_BOX_FORM, id: 3, name: 'Caja Dos', status: true });
    expect(mapCashBoxToForm({ status: 0 }).status).toBe(false);
  });
  test('una fila vacía da el formulario inicial y una real conserva cuentas y área', () => {
    expect(mapCashBoxToForm({})).toEqual(INITIAL_CASH_BOX_FORM);
    expect(mapCashBoxToForm({ id: 1, name: 'Caja Principal', billingAreaId: '1', cashCtaCode: '1010101001', depositCtaCode: '1010203004', status: true, isRemoved: false }))
      .toEqual({ id: 1, name: 'Caja Principal', billingAreaId: 1, cashCtaCode: '1010101001', depositCtaCode: '1010203004', status: true });
  });
});
