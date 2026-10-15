import { describe, it, expect } from 'vitest';
import { validateType, buildTypePayload, MAX_NAME, MAX_CODE_INIT, MAX_DESCRIPTION } from './typeProductRules';

// Los casos y los números son los mismos de modules/inventory/typeProducts/__tests__/TypeProductDTO.test.js del back.
const VALID = { name: 'Equipo de limpieza', codeInit: 'eql', codeSeq: '00000', description: '' };

describe('name (obligatorio, máximo 50)', () => {
  it.each([['ausente', undefined], ['vacío', ''], ['solo espacios', '   ']])('%s se rechaza', (_, name) => {
    expect(validateType({ ...VALID, name }).name).toBe('msg.required.input.name');
  });

  it('de 51 caracteres se rechaza y de 50 es válido (los espacios alrededor no cuentan)', () => {
    expect(validateType({ ...VALID, name: 'x'.repeat(MAX_NAME + 1) }).name).toBe('page.typeProducts.error.nameMax');
    expect(validateType({ ...VALID, name: ` ${'x'.repeat(MAX_NAME)} ` }).name).toBeUndefined();
  });
});

describe('codeInit (obligatorio, máximo 4)', () => {
  it.each([['ausente', undefined], ['vacío', ''], ['solo espacios', '  ']])('%s se rechaza', (_, codeInit) => {
    expect(validateType({ ...VALID, codeInit }).codeInit).toBe('msg.required.input.codeInit');
  });

  it('de 5 caracteres se rechaza y de 4 es válido', () => {
    expect(validateType({ ...VALID, codeInit: 'A'.repeat(MAX_CODE_INIT + 1) }).codeInit).toBe('page.typeProducts.error.codeInitMax');
    expect(validateType({ ...VALID, codeInit: 'A'.repeat(MAX_CODE_INIT) }).codeInit).toBeUndefined();
  });
});

describe('codeSeq (opcional, 5 dígitos)', () => {
  it.each([['4 dígitos', '0001'], ['6 dígitos', '000001'], ['con letras', '0000A'], ['con signo', '-0001']])('%s se rechaza', (_, codeSeq) => {
    expect(validateType({ ...VALID, codeSeq }).codeSeq).toBe('page.typeProducts.error.codeSeqFormat');
  });

  it.each([['de 5 dígitos', '00051'], ['vacío', ''], ['ausente', undefined]])('%s es válido', (_, codeSeq) => {
    expect(validateType({ ...VALID, codeSeq }).codeSeq).toBeUndefined();
  });
});

describe('description (opcional, máximo 500)', () => {
  it('de 501 se rechaza y de 500 es válido', () => {
    expect(validateType({ ...VALID, description: 'x'.repeat(MAX_DESCRIPTION + 1) }).description).toBe('page.typeProducts.error.descriptionMax');
    expect(validateType({ ...VALID, description: 'x'.repeat(MAX_DESCRIPTION) }).description).toBeUndefined();
  });
});

describe('formulario válido', () => {
  it('no tiene errores; las cuentas son opcionales', () => {
    expect(validateType(VALID)).toEqual({});
    expect(validateType({ ...VALID, invCtaCode: '', costCtaCode: undefined })).toEqual({});
  });
});

describe('buildTypePayload', () => {
  const FORM = { id: 9, ...VALID, invCtaCode: ' 1101 ', costCtaCode: '', expenseCtaCode: '5101', incomeCtaCode: '4101', status: true, isRemoved: false, inventoryAccount: 'x' };

  it('al crear envía los campos del DTO: nombre e inicial en mayúsculas, sin id ni nombres viejos', () => {
    expect(buildTypePayload(FORM)).toEqual({
      name: 'EQUIPO DE LIMPIEZA', description: '', status: true, codeInit: 'EQL', codeSeq: '00000',
      invCtaCode: '1101', costCtaCode: '', expenseCtaCode: '5101', incomeCtaCode: '4101'
    });
  });

  it('el correlativo vacío se envía como 00000', () => {
    expect(buildTypePayload({ ...FORM, codeSeq: '' }).codeSeq).toBe('00000');
  });

  it('al editar no envía codeInit ni codeSeq (son inmutables)', () => {
    const payload = buildTypePayload(FORM, { isEdit: true });
    expect(payload).not.toHaveProperty('codeInit');
    expect(payload).not.toHaveProperty('codeSeq');
    expect(payload.name).toBe('EQUIPO DE LIMPIEZA');
  });
});
