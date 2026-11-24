import { describe, expect, test } from 'vitest';
import { INITIAL_ACCOUNT_FORM, buildAccountPayload, levelOf, mapAccountToForm, normalizeCode, validateAccount } from './ledgerAccountRules';

const LEVELS = [1, 3, 5, 7, 10];
const valid = { ...INITIAL_ACCOUNT_FORM, code: '1010101009', name: 'CAJA NUEVA', accountTypeId: 1, expenseTypeId: 4 };

describe('niveles y separadores (mismos casos que accountRules del back)', () => {
  test.each([['1', 1], ['101', 2], ['10101', 3], ['1010101', 4], ['1010101001', 5], ['12', 0], ['123456789', 0]])('el código %s es de nivel %i', (code, level) => {
    expect(levelOf(code, LEVELS)).toBe(level);
  });
  test('los separadores de la máscara se quitan', () => {
    expect(normalizeCode(' 10101-01-001 ')).toBe('1010101001');
  });
});

describe('validateAccount (mismos casos que AccountDTO del back)', () => {
  test('una cuenta válida no tiene errores', () => { expect(validateAccount(valid, { levels: LEVELS })).toEqual({}); });
  test('el código es obligatorio, solo dígitos y de un largo que sea un nivel', () => {
    expect(validateAccount({ ...valid, code: '' }, { levels: LEVELS }).code).toBe('msg.required.input.code');
    expect(validateAccount({ ...valid, code: '10A' }, { levels: LEVELS }).code).toBe('page.ledgerAccounts.error.code.digits');
    expect(validateAccount({ ...valid, code: '101010100' }, { levels: LEVELS }).code).toBe('page.ledgerAccounts.error.code.level');
    expect(validateAccount({ ...valid, code: '101010100' }).code).toBeUndefined();
    expect(validateAccount({ ...valid, code: '10101-01-001' }, { levels: LEVELS })).toEqual({});
  });
  test('al editar no se valida el código', () => {
    expect(validateAccount({ ...valid, code: '' }, { levels: LEVELS, isEdit: true })).toEqual({});
  });
  test('nombre obligatorio y de máximo 120', () => {
    expect(validateAccount({ ...valid, name: '   ' }).name).toBe('msg.required.input.name');
    expect(validateAccount({ ...valid, name: 'x'.repeat(121) }).name).toBe('page.ledgerAccounts.error.name.max');
    expect(validateAccount({ ...valid, name: 'x'.repeat(120) })).toEqual({});
  });
  test('tipo de cuenta y de gasto obligatorios', () => {
    expect(validateAccount({ ...valid, accountTypeId: 0 }).accountTypeId).toBe('msg.required.select.typeAccount');
    expect(validateAccount({ ...valid, expenseTypeId: '0' }).expenseTypeId).toBe('msg.required.select.typeSpent');
  });
  test('moneda extranjera exige moneda', () => {
    expect(validateAccount({ ...valid, useForeignCurrency: true, currencyId: 0 }).currencyId).toBe('page.ledgerAccounts.error.currency.required');
    expect(validateAccount({ ...valid, useForeignCurrency: true, currencyId: 2 })).toEqual({});
  });
});

describe('buildAccountPayload / mapAccountToForm', () => {
  test('el alta manda el código sin máscara y nada del nivel ni de los textos', () => {
    const payload = buildAccountPayload({ ...valid, code: '10101-01-009' });
    expect(payload.code).toBe('1010101009');
    ['level', 'nivel', 'isRemoved', 'accountType', 'expenseType', 'cmonext'].forEach((key) => expect(payload).not.toHaveProperty(key));
    expect(payload.lastDate).toBe('1900-01-01');
  });
  test('la edición no manda el código', () => {
    expect(buildAccountPayload(valid, { isEdit: true })).not.toHaveProperty('code');
  });
  test('una fecha de cierre 1900-01-01 es "sin fecha" y se recorta a día', () => {
    expect(mapAccountToForm({ id: 3, code: '1', lastDate: '1900-01-01' }).lastDate).toBe('');
    expect(mapAccountToForm({ id: 3, code: '1', lastDate: '2025-12-31T00:00:00.000Z' }).lastDate).toBe('2025-12-31');
  });
  test('las banderas y los ids llegan como el formulario los usa', () => {
    expect(mapAccountToForm({ id: 3, code: ' 101 ', name: 'X', accountTypeId: '1', opera: 1, status: 0, useForeignCurrency: 1 })).toMatchObject({ code: '101', accountTypeId: 1, opera: true, status: false, useForeignCurrency: true });
  });
});
