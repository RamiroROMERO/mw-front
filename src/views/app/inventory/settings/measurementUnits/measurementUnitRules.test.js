import { describe, it, expect } from 'vitest';
import { validateUnit, buildUnitPayload, MAX_CODE, MAX_NAME, MAX_DESCRIPTION } from './measurementUnitRules';

// Los casos y los números son los mismos de modules/inventory/measurementUnits/__tests__/MeasurementUnitDTO.test.js del back.
const VALID = { code: 'LIB', name: 'Libra', description: '', baseConversion: 0 };

describe('code (obligatorio, máximo 5)', () => {
  it.each([['ausente', undefined], ['vacío', ''], ['solo espacios', '   ']])('%s se rechaza', (_, code) => {
    expect(validateUnit({ ...VALID, code }).code).toBe('msg.required.input.code');
  });

  it('de 6 caracteres se rechaza y de 5 es válido', () => {
    expect(validateUnit({ ...VALID, code: 'A'.repeat(MAX_CODE + 1) }).code).toBe('page.measurementUnits.error.codeMax');
    expect(validateUnit({ ...VALID, code: 'A'.repeat(MAX_CODE) }).code).toBeUndefined();
  });

  it('los espacios alrededor no cuentan para el máximo', () => {
    expect(validateUnit({ ...VALID, code: ` ${'A'.repeat(MAX_CODE)} ` }).code).toBeUndefined();
  });
});

describe('name (obligatorio, máximo 25)', () => {
  it.each([['ausente', undefined], ['vacío', ''], ['solo espacios', '  ']])('%s se rechaza', (_, name) => {
    expect(validateUnit({ ...VALID, name }).name).toBe('msg.required.input.name');
  });

  it('de 26 se rechaza y de 25 es válido (también con espacios alrededor)', () => {
    expect(validateUnit({ ...VALID, name: 'x'.repeat(MAX_NAME + 1) }).name).toBe('page.measurementUnits.error.nameMax');
    expect(validateUnit({ ...VALID, name: 'x'.repeat(MAX_NAME) }).name).toBeUndefined();
    expect(validateUnit({ ...VALID, name: ` ${'x'.repeat(MAX_NAME)} ` }).name).toBeUndefined();
  });
});

describe('description (máximo 500)', () => {
  it('500 es válida y 501 se rechaza', () => {
    expect(validateUnit({ ...VALID, description: 'd'.repeat(MAX_DESCRIPTION) }).description).toBeUndefined();
    expect(validateUnit({ ...VALID, description: 'd'.repeat(MAX_DESCRIPTION + 1) }).description).toBe('page.measurementUnits.error.descriptionMax');
  });

  it('ausente o vacía es válida', () => {
    expect(validateUnit({ ...VALID, description: undefined }).description).toBeUndefined();
  });
});

describe('baseConversion (entero mayor o igual a 0, por defecto 0)', () => {
  it.each([0, 1, '1', 25, '0', '', null, undefined])('%p es válido', (baseConversion) => {
    expect(validateUnit({ ...VALID, baseConversion }).baseConversion).toBeUndefined();
  });

  it.each([-1, 1.5, 'abc', '-3'])('%p se rechaza', (baseConversion) => {
    expect(validateUnit({ ...VALID, baseConversion }).baseConversion).toBe('page.measurementUnits.error.baseConversion');
  });
});

describe('una unidad válida no tiene errores', () => {
  it('con todos los campos', () => {
    expect(validateUnit({ ...VALID, description: 'x', baseConversion: 1 })).toEqual({});
  });
});

describe('buildUnitPayload', () => {
  const FORM = { id: 7, code: ' lib ', name: ' Libra ', description: '', baseConversion: '1', isPackaging: true, containerUse: true, status: true, type: 2, isRemoved: false };

  it('normaliza el código y el nombre y convierte baseConversion a número', () => {
    expect(buildUnitPayload(FORM)).toMatchObject({ code: 'LIB', name: 'Libra', baseConversion: 1, isPackaging: true, status: true });
  });

  it('descarta id, type (el nombre viejo) e isRemoved', () => {
    const payload = buildUnitPayload(FORM);
    expect(payload).not.toHaveProperty('id');
    expect(payload).not.toHaveProperty('type');
    expect(payload).not.toHaveProperty('isRemoved');
  });

  it('baseConversion vacío se envía como 0 e isPackaging siempre es booleano', () => {
    expect(buildUnitPayload({ ...FORM, baseConversion: '', isPackaging: undefined })).toMatchObject({ baseConversion: 0, isPackaging: false });
  });

  it('containerUse solo se envía con control de contenedores', () => {
    expect(buildUnitPayload(FORM, { containerControl: false })).not.toHaveProperty('containerUse');
    expect(buildUnitPayload(FORM, { containerControl: true })).toHaveProperty('containerUse', true);
  });

  it('no muta el formulario', () => {
    const copy = { ...FORM };
    buildUnitPayload(copy);
    expect(copy).toEqual(FORM);
  });
});
