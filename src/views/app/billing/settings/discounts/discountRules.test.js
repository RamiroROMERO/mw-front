import { describe, expect, test } from 'vitest';
import { INITIAL_DISCOUNT_FORM, buildDiscountPayload, isValidPercent, mapDiscountToForm, validateDiscount } from './discountRules';

const valid = { ...INITIAL_DISCOUNT_FORM, name: 'Tercera Edad', percentValue: '15', discountCtaCode: '4300' };

describe('validateDiscount (mismos casos que AdminDiscountDTO del back)', () => {
  test('un descuento válido no tiene errores', () => { expect(validateDiscount(valid)).toEqual({}); });
  test('el nombre es obligatorio (vacío y solo espacios), de 5 a 50 caracteres', () => {
    ['', '   ', null, undefined].forEach((name) => expect(validateDiscount({ ...valid, name }).name).toBe('msg.required.input.description'));
    expect(validateDiscount({ ...valid, name: 'ABCD' }).name).toBe('page.discounts.error.name');
    expect(validateDiscount({ ...valid, name: '  ABCD  ' }).name).toBe('page.discounts.error.name');
    expect(validateDiscount({ ...valid, name: 'ABCDE' })).toEqual({});
    expect(validateDiscount({ ...valid, name: 'A'.repeat(50) })).toEqual({});
    expect(validateDiscount({ ...valid, name: 'A'.repeat(51) }).name).toBe('page.discounts.error.nameMax');
  });
  test('el porcentaje es obligatorio y va de 0.01 a 100 con hasta 2 decimales', () => {
    ['', '  ', null].forEach((v) => expect(validateDiscount({ ...valid, percentValue: v }).percentValue).toBe('msg.required.input.amount'));
    [0.01, 1, 2.5, '2.5', 99.99, 100, '100', '100.00'].forEach((v) => expect(validateDiscount({ ...valid, percentValue: v })).toEqual({}));
    [0, '0', '0.00', -1, 100.01, 101, '2.555', '1e2', 'abc', '5%', '--5'].forEach((v) => expect(validateDiscount({ ...valid, percentValue: v }).percentValue).toBe('page.discounts.error.percent'));
  });
  test('la cuenta contable es obligatoria solo con Contabilidad activa (y se asume activa si no se conoce)', () => {
    ['', '   ', null, undefined].forEach((v) => {
      expect(validateDiscount({ ...valid, discountCtaCode: v }).discountCtaCode).toBe('msg.required.select.contAccount');
      expect(validateDiscount({ ...valid, discountCtaCode: v }, { accountingActive: true }).discountCtaCode).toBe('msg.required.select.contAccount');
      expect(validateDiscount({ ...valid, discountCtaCode: v }, { accountingActive: false })).toEqual({});
    });
  });
  test('la cuenta admite 20 caracteres y rechaza 21', () => {
    expect(validateDiscount({ ...valid, discountCtaCode: 'A'.repeat(20) })).toEqual({});
    expect(validateDiscount({ ...valid, discountCtaCode: 'A'.repeat(21) }).discountCtaCode).toBe('page.discounts.error.accountMax');
  });
  test('un formulario vacío marca los tres campos', () => {
    expect(Object.keys(validateDiscount(INITIAL_DISCOUNT_FORM)).sort()).toEqual(['discountCtaCode', 'name', 'percentValue']);
  });
});

describe('isValidPercent', () => {
  test('acepta solo 0.01 a 100 con 2 decimales como máximo', () => {
    expect(isValidPercent('0.01')).toBe(true);
    expect(isValidPercent(100)).toBe(true);
    expect(isValidPercent('0.001')).toBe(false);
    expect(isValidPercent(' 5 ')).toBe(true);
    expect(isValidPercent(null)).toBe(false);
  });
});

describe('payload y carga', () => {
  test('el cuerpo trae solo lo que el back acepta, con el porcentaje como número y el nombre recortado', () => {
    expect(buildDiscountPayload({ ...valid, id: 4, name: '  Tercera Edad ', percentValue: '2.5', isRemoved: true, idCtaAccount: 'viejo' })).toEqual({ name: 'Tercera Edad', percentValue: 2.5, discountCtaCode: '4300', status: true });
    expect(buildDiscountPayload({ ...valid, status: false }).status).toBe(false);
  });
  test('cargar una fila convierte el porcentaje de MySQL (15.00) y no copia campos ajenos', () => {
    expect(mapDiscountToForm({ id: 1, name: 'Tercera Edad', percentValue: '15.00', discountCtaCode: '4300', status: 1, idCtaAccount: 'viejo' })).toEqual({ id: 1, name: 'Tercera Edad', percentValue: '15', discountCtaCode: '4300', status: true });
    expect(mapDiscountToForm({ id: 2, name: 'X', percentValue: '2.50', status: false }).percentValue).toBe('2.5');
  });
});
