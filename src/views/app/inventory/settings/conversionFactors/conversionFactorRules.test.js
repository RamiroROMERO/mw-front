import { describe, it, expect } from 'vitest';
import { validateFactor, buildFactorPayload, isValidFactor, MAX_UNIT_CODE } from './conversionFactorRules';

// Los casos y los números son los mismos de modules/inventory/conversionFactors/__tests__/ConversionFactorDTO.test.js del back.
const VALID = { inputUnitCode: 'LIB', outputUnitCode: 'GRM', valueFactor: 453.592 };

describe.each([['inputUnitCode', 'msg.required.select.inputUnit'], ['outputUnitCode', 'msg.required.select.outputUnit']])('%s (obligatorio, máximo 5)', (field, requiredId) => {
  it.each([['ausente', undefined], ['vacío', ''], ['solo espacios', '   ']])('%s se rechaza', (_, value) => {
    expect(validateFactor({ ...VALID, [field]: value })[field]).toBe(requiredId);
  });

  it('de 6 caracteres se rechaza y de 5 es válido', () => {
    expect(validateFactor({ ...VALID, [field]: 'A'.repeat(MAX_UNIT_CODE + 1) })[field]).toBe('page.conversionFactors.error.unitCodeMax');
    expect(validateFactor({ ...VALID, [field]: 'A'.repeat(MAX_UNIT_CODE) })[field]).toBeUndefined();
  });

  it('los espacios alrededor no cuentan para el máximo', () => {
    expect(validateFactor({ ...VALID, [field]: ` ${'A'.repeat(MAX_UNIT_CODE)} ` })[field]).toBeUndefined();
  });
});

describe('valueFactor (obligatorio, mayor que 0, hasta 15 enteros y 5 decimales)', () => {
  it.each([['ausente', undefined], ['vacío', '']])('%s pide el factor', (_, valueFactor) => {
    expect(validateFactor({ ...VALID, valueFactor }).valueFactor).toBe('msg.required.input.valueFactor');
  });

  it.each([['cero', 0], ['cero como texto', '0'], ['negativo', -1], ['no numérico', 'abc'], ['con 6 decimales', '1.123456'], ['con 16 enteros', '1234567890123456']])('%s se rechaza', (_, valueFactor) => {
    expect(validateFactor({ ...VALID, valueFactor }).valueFactor).toBe('page.conversionFactors.error.valueFactor');
  });

  it.each([[1], ['1'], [0.00001], ['453.59200'], ['999999999999999.99999'], ['1.100000']])('%s es válido', (valueFactor) => {
    expect(validateFactor({ ...VALID, valueFactor })).toEqual({});
    expect(isValidFactor(valueFactor)).toBe(true);
  });
});

describe('misma unidad de entrada y salida', () => {
  it('no tiene regla', () => {
    expect(validateFactor({ inputUnitCode: 'UND', outputUnitCode: 'UND', valueFactor: 12 })).toEqual({});
  });
});

describe('buildFactorPayload', () => {
  it('envía solo los campos del DTO: sin id ni nombres de unidad, códigos recortados y el factor como número', () => {
    const payload = buildFactorPayload({ ...VALID, id: 9, inputUnitName: 'Libra', outputUnitName: 'Gramo', inputUnitCode: ' LIB ', valueFactor: '453.592', status: true });
    expect(payload).toEqual({ inputUnitCode: 'LIB', outputUnitCode: 'GRM', valueFactor: 453.592, status: true });
  });
});
