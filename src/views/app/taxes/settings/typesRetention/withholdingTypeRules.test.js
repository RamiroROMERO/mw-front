import { describe, expect, test } from 'vitest';
import { buildWithholdingPayload, INITIAL_WITHHOLDING_FORM, isValidPercent, isValidSarCode, mapWithholdingToForm, validateWithholdingType } from './withholdingTypeRules';

const valid = { name: 'Retención 12.5%', percentValue: '12.5', sarCode: '112', withholdingCtaCode: '200010504', reportTypeId: '' };

describe('validateWithholdingType', () => {
  test('un formulario válido no tiene errores y el reporte es opcional', () => {
    expect(validateWithholdingType(valid)).toEqual({});
    expect(validateWithholdingType({ ...valid, reportTypeId: '2' })).toEqual({});
  });
  test('los cuatro campos obligatorios vacíos marcan cada uno', () => {
    expect(Object.keys(validateWithholdingType(INITIAL_WITHHOLDING_FORM)).sort()).toEqual(['name', 'percentValue', 'sarCode', 'withholdingCtaCode']);
  });
  test('el nombre admite 80 caracteres y no 81; solo espacios cuenta como vacío', () => {
    expect(validateWithholdingType({ ...valid, name: 'a'.repeat(80) })).toEqual({});
    expect(validateWithholdingType({ ...valid, name: 'a'.repeat(81) }).name).toBeDefined();
    expect(validateWithholdingType({ ...valid, name: '   ' }).name).toBe('msg.required.input.description');
  });
  test.each([0, '0', -1, 100.01, 101, '1.234', 'abc', '1e1'])('porcentaje %p inválido', (percentValue) => {
    expect(validateWithholdingType({ ...valid, percentValue }).percentValue).toBeDefined();
  });
  test.each([0.01, '0.01', 100, '12.50', 5])('porcentaje %p válido', (percentValue) => {
    expect(validateWithholdingType({ ...valid, percentValue }).percentValue).toBeUndefined();
  });
  test.each([0, '0', -5, 1.5, 'abc', 2147483648])('código SAR %p inválido', (sarCode) => {
    expect(validateWithholdingType({ ...valid, sarCode }).sarCode).toBeDefined();
  });
  test('la cuenta: "0" cuenta como vacía y 21 caracteres es demasiado', () => {
    expect(validateWithholdingType({ ...valid, withholdingCtaCode: '0' }).withholdingCtaCode).toBe('msg.required.input.IdCtaAccount');
    expect(validateWithholdingType({ ...valid, withholdingCtaCode: '1'.repeat(21) }).withholdingCtaCode).toBeDefined();
  });
  test('helpers puros', () => {
    expect(isValidPercent('12.5')).toBe(true);
    expect(isValidSarCode('2154')).toBe(true);
    expect(isValidSarCode('0')).toBe(false);
  });
});

describe('buildWithholdingPayload', () => {
  test('números, recorte y reporte vacío = 0; nunca manda id ni isRemoved', () => {
    expect(buildWithholdingPayload({ ...valid, id: 9, name: '  Ret  ', isRemoved: true })).toEqual({
      name: 'Ret', percentValue: 12.5, sarCode: 112, withholdingCtaCode: '200010504', reportTypeId: 0, status: true
    });
    expect(buildWithholdingPayload({ ...valid, reportTypeId: '2', status: false }).reportTypeId).toBe(2);
    expect(buildWithholdingPayload({ ...valid, status: 0 }).status).toBe(false);
  });
});

describe('mapWithholdingToForm', () => {
  test('los decimales de MySQL pasan a número y el reporte 0 queda vacío', () => {
    expect(mapWithholdingToForm({ id: 3, name: 'RAP', percentValue: '5.00', sarCode: 2154, withholdingCtaCode: ' 200010502 ', reportTypeId: 0, status: 1 })).toEqual({
      id: 3, name: 'RAP', percentValue: '5', sarCode: '2154', withholdingCtaCode: '200010502', reportTypeId: '', status: true
    });
    expect(mapWithholdingToForm({ reportTypeId: 1, status: 0 })).toMatchObject({ reportTypeId: '1', status: false });
  });
});
