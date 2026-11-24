import { describe, expect, test } from 'vitest';
import { USE_FLAGS, buildStatNamePayload, validateStatName } from './taxStatNameRules';

const valid = { name: 'Facturas', kind: 5, isFiscal: false, fiscalCode: '' };

describe('validateStatName (mismos casos del DTO del back)', () => {
  test('un nombre válido no tiene errores y el nombre es obligatorio', () => {
    expect(validateStatName(valid)).toEqual({});
    expect(validateStatName({ ...valid, name: ' ' }).name).toBe('msg.required.input.name');
  });
  test('máximos: nombre 50 y código fiscal 5', () => {
    expect(validateStatName({ ...valid, name: 'a'.repeat(50) })).toEqual({});
    expect(validateStatName({ ...valid, name: 'a'.repeat(51) }).name).toBe('page.typesTaxes.error.nameMax');
    expect(validateStatName({ ...valid, fiscalCode: 'a'.repeat(6) }).fiscalCode).toBe('page.typesTaxes.error.fiscalCodeMax');
  });
  test.each([-1, 100, 'x', 1.5])('código %p inválido; vacío o 0 es válido', (kind) => {
    expect(validateStatName({ ...valid, kind }).kind).toBe('page.typesTaxes.error.kind');
  });
  test('código vacío o 0 se acepta', () => {
    expect(validateStatName({ ...valid, kind: '' })).toEqual({});
    expect(validateStatName({ ...valid, kind: 0 })).toEqual({});
  });
  test('un documento fiscal exige su código fiscal', () => {
    expect(validateStatName({ ...valid, isFiscal: true, fiscalCode: '  ' }).fiscalCode).toBe('page.typesTaxes.error.fiscalCode');
    expect(validateStatName({ ...valid, isFiscal: true, fiscalCode: '01' })).toEqual({});
  });
});

describe('buildStatNamePayload', () => {
  test('recorta, convierte banderas a 0/1, usa 0 sin código y no envía id ni fechas', () => {
    const body = buildStatNamePayload({ ...valid, id: 3, name: ' Facturas ', kind: '', shopping: true, useCai: 1, isFiscal: true, fiscalCode: ' 09 ', status: true, create_at: 'x', typeGas: 2 });
    expect(body).toMatchObject({ name: 'Facturas', kind: 0, fiscalCode: '09', isFiscal: 1, status: 1, shopping: 1, useCai: 1, invoice: 0 });
    expect(Object.keys(body)).not.toEqual(expect.arrayContaining(['id', 'create_at', 'typeGas']));
    USE_FLAGS.forEach((key) => expect(key in body).toBe(true));
  });
});
