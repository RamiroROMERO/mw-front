import { describe, expect, test } from 'vitest';
import {
  MAX_CODE, MAX_NAME, MAX_DESCRIPTION, buildChangePayload, buildPreviewParams, formFromProduct, isCodeChange, isUnchanged, normalizeCode,
  productOption, remainingText, summarizeResult, validateChange
} from './changeCodeRules';

const CURRENT = { id: 5, code: 'ISL-00001', name: 'ATOMIZADOR', description: 'DE 500' };
const form = (over = {}) => ({ newCode: 'ISL-00099', name: 'ATOMIZADOR 500ML', description: '', ...over });
const errors = (f, current = CURRENT) => validateChange(f, current);

test('límites iguales a los del back', () => {
  expect([MAX_CODE, MAX_NAME, MAX_DESCRIPTION]).toEqual([20, 120, 120]);
});

describe('normalizeCode', () => {
  test('recorta y pasa a mayúsculas; lo que no es texto cuenta como vacío', () => {
    expect(normalizeCode('  isl-00099 ')).toBe('ISL-00099');
    expect(normalizeCode(12)).toBe('');
    expect(normalizeCode(null)).toBe('');
  });
});

describe('validateChange (mismos casos que el DTO y las reglas del back)', () => {
  test('un formulario válido no tiene errores', () => {
    expect(errors(form())).toEqual({});
  });

  test('sin producto elegido se marca el producto', () => {
    expect(errors(form(), null).product).toBe('page.changeCode.error.product');
    expect(errors(form(), {}).product).toBe('page.changeCode.error.product');
  });

  test.each([[''], ['   '], [undefined], [null]])('código nuevo %p = mantener el código actual (no es error)', (newCode) => {
    expect(errors(form({ newCode })).newCode).toBeUndefined();
  });

  test('20 caracteres pasa y 21 no (el código se mide ya recortado)', () => {
    expect(errors(form({ newCode: 'a'.repeat(20) })).newCode).toBeUndefined();
    expect(errors(form({ newCode: `  ${'a'.repeat(20)}  ` })).newCode).toBeUndefined();
    expect(errors(form({ newCode: 'a'.repeat(21) })).newCode).toBe('page.changeCode.error.codeTooLong');
  });

  test.each([['AB CD'], ['AB\tCD'], ['AB\nCD']])('espacios internos (%p) se rechazan', (newCode) => {
    expect(errors(form({ newCode })).newCode).toBe('page.changeCode.error.codeSpaces');
  });

  test.each([[''], ['   '], [undefined]])('el nombre %p es obligatorio', (name) => {
    expect(errors(form({ name })).name).toBe('msg.required.input.name');
  });

  test('nombre: 120 pasa y 121 no; descripción: 120 pasa y 121 no, y es opcional', () => {
    expect(errors(form({ name: 'N'.repeat(120) })).name).toBeUndefined();
    expect(errors(form({ name: 'N'.repeat(121) })).name).toBe('page.changeCode.error.nameTooLong');
    expect(errors(form({ description: 'D'.repeat(120) })).description).toBeUndefined();
    expect(errors(form({ description: 'D'.repeat(121) })).description).toBe('page.changeCode.error.descriptionTooLong');
    expect(errors(form({ description: undefined })).description).toBeUndefined();
  });

  test('marca todos los campos inválidos a la vez', () => {
    expect(Object.keys(errors({ newCode: 'AB CD', name: '', description: 'D'.repeat(121) }, null)).sort()).toEqual(['description', 'name', 'newCode', 'product']);
  });
});

describe('qué cambia', () => {
  test('isCodeChange: distinto del actual (sin distinguir mayúsculas); vacío o igual no es cambio de código', () => {
    expect(isCodeChange(form(), CURRENT)).toBe(true);
    expect(isCodeChange(form({ newCode: 'isl-00001' }), CURRENT)).toBe(false);
    expect(isCodeChange(form({ newCode: '' }), CURRENT)).toBe(false);
  });

  test('isUnchanged: sin código nuevo, nombre ni descripción distintos no hay nada que guardar', () => {
    expect(isUnchanged({ newCode: '', name: 'ATOMIZADOR', description: 'DE 500' }, CURRENT)).toBe(true);
    expect(isUnchanged({ newCode: 'ISL-00001', name: ' ATOMIZADOR ', description: 'DE 500' }, CURRENT)).toBe(true);
    expect(isUnchanged({ newCode: '', name: 'OTRO', description: 'DE 500' }, CURRENT)).toBe(false);
    expect(isUnchanged({ newCode: '', name: 'ATOMIZADOR', description: '' }, CURRENT)).toBe(false);
    expect(isUnchanged(form(), CURRENT)).toBe(false);
  });
});

describe('payload y parámetros', () => {
  test('el cuerpo trae solo newCode normalizado, nombre y descripción recortados', () => {
    expect(buildChangePayload({ ...form({ newCode: ' isl-00099 ', name: ' N ', description: ' d ' }), id: 9, status: 0, costValue: 5 }, CURRENT))
      .toEqual({ newCode: 'ISL-00099', name: 'N', description: 'd' });
  });

  test('sin código nuevo se envía el código actual (el back lo trata como cambio solo de nombre y descripción)', () => {
    expect(buildChangePayload(form({ newCode: '' }), CURRENT)).toEqual({ newCode: 'ISL-00001', name: 'ATOMIZADOR 500ML', description: '' });
  });

  test('la vista previa pide el código actual y el nuevo normalizado', () => {
    expect(buildPreviewParams(form({ newCode: ' isl-00099 ' }), CURRENT)).toEqual({ code: 'ISL-00001', newCode: 'ISL-00099' });
  });

  test('formFromProduct arranca con el código nuevo vacío y el nombre y la descripción actuales', () => {
    expect(formFromProduct(CURRENT)).toEqual({ newCode: '', name: 'ATOMIZADOR', description: 'DE 500' });
    expect(formFromProduct({})).toEqual({ newCode: '', name: '', description: '' });
  });

  test('productOption: "código - nombre"', () => {
    expect(productOption(CURRENT)).toEqual({ value: 'ISL-00001', label: 'ISL-00001 - ATOMIZADOR' });
    expect(productOption(null)).toBeNull();
  });
});

describe('resultado del cambio', () => {
  test('suma filas y tablas; remaining vacío no marca nada', () => {
    const result = summarizeResult({ updated: [{ table: 'inv_prod', column: 'codprod', rows: 1 }, { table: 'inv_kardex', column: 'codprod', rows: 1670 }], remaining: [] });
    expect(result).toMatchObject({ rows: 1671, tables: 2, hasRemaining: false });
  });

  test('remaining con filas se marca y se describe', () => {
    const result = summarizeResult({ updated: [], remaining: [{ table: 'inv_kardex', column: 'codprod', rows: 2 }, { table: 'fac_facturasdeta', column: 'codprod', rows: 1 }] });
    expect(result.hasRemaining).toBe(true);
    expect(remainingText(result.remaining)).toBe('inv_kardex.codprod (2), fac_facturasdeta.codprod (1)');
  });

  test('una respuesta vacía o rara no rompe', () => {
    expect(summarizeResult(undefined)).toMatchObject({ rows: 0, tables: 0, hasRemaining: false });
    expect(summarizeResult({ updated: 'x', remaining: null })).toMatchObject({ rows: 0, hasRemaining: false });
  });
});
