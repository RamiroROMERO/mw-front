import { describe, it, expect } from 'vitest';
import { validateStore, buildStorePayload, isValidType, isStoreAccountRequired, MAX_NAME, MAX_DESCRIPTION, MAX_ACCOUNT } from './storeRules';

// Los casos y los números son los mismos de modules/inventory/store/__tests__/StoreDTO.required.test.js y
// StoreService.rules.test.js del back.
const VALID = { name: 'Bodega', type: 1, description: '', invCtaCode: '1010', costCtaCode: '', expenseCtaCode: '' };

describe('name', () => {
  it.each([['ausente', undefined], ['vacío', ''], ['solo espacios', '   ']])('%s se rechaza', (_, name) => {
    expect(validateStore({ ...VALID, name }).name).toBe('msg.required.input.name');
  });

  it('de 51 caracteres se rechaza y de 50 es válido', () => {
    expect(validateStore({ ...VALID, name: 'x'.repeat(MAX_NAME + 1) }).name).toBe('page.store.error.nameMax');
    expect(validateStore({ ...VALID, name: 'x'.repeat(MAX_NAME) }).name).toBeUndefined();
  });
});

describe('type (sin valor por defecto: 1, 2 o 3)', () => {
  it.each([[undefined], [null], [''], [0], ['0'], [4], ['abc']])('type %p se rechaza', (type) => {
    expect(validateStore({ ...VALID, type }).type).toBe('page.store.error.type');
    expect(isValidType(type)).toBe(false);
  });

  it.each([1, 2, 3, '1', '2', '3'])('type %p es válido', (type) => {
    expect(validateStore({ ...VALID, type }).type).toBeUndefined();
    expect(isValidType(type)).toBe(true);
  });
});

describe('description (máximo 500)', () => {
  it('500 es válida y 501 se rechaza', () => {
    expect(validateStore({ ...VALID, description: 'd'.repeat(MAX_DESCRIPTION) }).description).toBeUndefined();
    expect(validateStore({ ...VALID, description: 'd'.repeat(MAX_DESCRIPTION + 1) }).description).toBe('page.store.error.descriptionMax');
  });

  it('ausente o vacía es válida', () => {
    expect(validateStore({ ...VALID, description: undefined }).description).toBeUndefined();
  });
});

describe('cuenta de almacén obligatoria con Contabilidad activa', () => {
  it.each([[1], [3]])('tipo %i sin cuenta se rechaza', (type) => {
    expect(validateStore({ ...VALID, type, invCtaCode: '' }, { accountingActive: true }).invCtaCode).toBe('page.store.error.storeAccount');
  });

  it('una cuenta de solo espacios cuenta como vacía', () => {
    expect(validateStore({ ...VALID, invCtaCode: '   ' }).invCtaCode).toBe('page.store.error.storeAccount');
  });

  it('tipo 2 (Centro de Destino) se guarda sin cuenta', () => {
    expect(validateStore({ ...VALID, type: 2, invCtaCode: '' }).invCtaCode).toBeUndefined();
  });

  it('con Contabilidad apagada no se exige (tipo 1)', () => {
    expect(validateStore({ ...VALID, invCtaCode: '' }, { accountingActive: false }).invCtaCode).toBeUndefined();
  });

  it('isStoreAccountRequired replica la regla', () => {
    expect(isStoreAccountRequired({ type: 1, accountingActive: true })).toBe(true);
    expect(isStoreAccountRequired({ type: '3', accountingActive: true })).toBe(true);
    expect(isStoreAccountRequired({ type: 2, accountingActive: true })).toBe(false);
    expect(isStoreAccountRequired({ type: 1, accountingActive: false })).toBe(false);
  });

  it('por defecto se asume Contabilidad activa (el back decide)', () => {
    expect(validateStore({ ...VALID, invCtaCode: '' }).invCtaCode).toBe('page.store.error.storeAccount');
  });
});

describe('máximos de las cuentas (20)', () => {
  it.each(['invCtaCode', 'costCtaCode', 'expenseCtaCode'])('%s: 20 es válida y 21 se rechaza', (field) => {
    expect(validateStore({ ...VALID, [field]: '1'.repeat(MAX_ACCOUNT) })[field]).toBeUndefined();
    expect(validateStore({ ...VALID, [field]: '1'.repeat(MAX_ACCOUNT + 1) })[field]).toBeTruthy();
  });
});

describe('un almacén válido no tiene errores', () => {
  it('con las tres cuentas', () => {
    expect(validateStore({ ...VALID, costCtaCode: '5010', expenseCtaCode: '6010' })).toEqual({});
  });

  it('Centro de Destino sin cuentas con Contabilidad activa', () => {
    expect(validateStore({ name: 'Centro', type: 2 })).toEqual({});
  });
});

describe('buildStorePayload', () => {
  const FORM = { id: 7, name: ' Bodega ', type: 1, invCtaCode: '1010', costCtaCode: '5010', expenseCtaCode: '6010', fertilizerCredit: true, typeName: 'Almacen', isRemoved: false };

  it('con Contabilidad apagada no envía las tres cuentas', () => {
    const payload = buildStorePayload(FORM, { accountingActive: false, coffeeActive: true });
    expect(payload).not.toHaveProperty('invCtaCode');
    expect(payload).not.toHaveProperty('costCtaCode');
    expect(payload).not.toHaveProperty('expenseCtaCode');
  });

  it('con Contabilidad activa las envía', () => {
    expect(buildStorePayload(FORM, { accountingActive: true })).toMatchObject({ invCtaCode: '1010', costCtaCode: '5010', expenseCtaCode: '6010' });
  });

  it('sin café no envía fertilizerCredit; con café sí', () => {
    expect(buildStorePayload(FORM, { coffeeActive: false })).not.toHaveProperty('fertilizerCredit');
    expect(buildStorePayload(FORM, { coffeeActive: true })).toHaveProperty('fertilizerCredit', true);
  });

  it('descarta typeName e isRemoved y recorta el nombre', () => {
    const payload = buildStorePayload(FORM);
    expect(payload).not.toHaveProperty('typeName');
    expect(payload).not.toHaveProperty('isRemoved');
    expect(payload.name).toBe('Bodega');
  });

  it('no muta el formulario', () => {
    const copy = { ...FORM };
    buildStorePayload(copy, { accountingActive: false });
    expect(copy).toEqual(FORM);
  });
});
