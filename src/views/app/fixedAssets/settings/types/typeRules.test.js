import { describe, expect, test } from 'vitest';
import { buildTypePayload, validateType } from './typeRules';

const valid = { id: 0, code: 'mob', name: 'Mobiliario', userLife: 10, residualValue: 10, depreciationTypeId: 1, depreciationCtaCode: '1130101', costCtaCode: '6010101', status: 1 };

describe('validateType (mismos casos que TypeDTO del back)', () => {
  test('un tipo válido no tiene errores', () => {
    expect(validateType(valid)).toEqual({});
  });
  test.each(['code', 'name', 'userLife', 'residualValue', 'depreciationTypeId', 'depreciationCtaCode', 'costCtaCode'])('%s obligatorio', (field) => {
    expect(Object.keys(validateType({ ...valid, [field]: '' }))).toContain(field);
  });
  test('código de 1 a 4 y nombre de 5 a 50', () => {
    expect(validateType({ ...valid, code: 'ABCDE' }).code).toBeDefined();
    expect(validateType({ ...valid, code: 'ABCD' }).code).toBeUndefined();
    expect(validateType({ ...valid, name: 'abcd' }).name).toBeDefined();
    expect(validateType({ ...valid, name: 'a'.repeat(51) }).name).toBeDefined();
  });
  test.each([0, -1, 100, 1.5, 'x'])('vida útil %p inválida', (userLife) => {
    expect(validateType({ ...valid, userLife }).userLife).toBeDefined();
  });
  test.each([0, -5, 101, 2.5, 'x'])('valor residual %p inválido', (residualValue) => {
    expect(validateType({ ...valid, residualValue }).residualValue).toBeDefined();
  });
  test('solo línea recta', () => {
    expect(validateType({ ...valid, depreciationTypeId: 2 }).depreciationTypeId).toBeDefined();
    expect(validateType({ ...valid, depreciationTypeId: '1' })).toEqual({});
  });
});

describe('buildTypePayload', () => {
  test('el alta manda el código en mayúsculas y no manda el correlativo', () => {
    const payload = buildTypePayload({ ...valid, currentCode: '000003', id: 0 });
    expect(payload.code).toBe('MOB');
    expect(payload).not.toHaveProperty('currentCode');
    expect(payload).not.toHaveProperty('id');
  });
  test('la edición no manda el código', () => {
    expect(buildTypePayload({ ...valid, id: 4 })).not.toHaveProperty('code');
  });
  test('números y estado normalizados', () => {
    expect(buildTypePayload({ ...valid, userLife: '10', status: false })).toMatchObject({ userLife: 10, status: 0 });
  });
});
