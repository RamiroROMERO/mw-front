import { describe, expect, test } from 'vitest';
import { buildHeaderPayload, isAmount, isRealDate, validateChange, validateRegister } from './registerRules';

const TODAY = '2026-11-25';
const valid = { id: 0, typeId: 3, condition: 'Nuevo', name: 'Escritorio', dateIn: '2026-08-10', dateBuy: '', valueBuy: 1500, valueIn: 1400, isActive: 1 };

describe('validateRegister (mismos casos que RegisterDTO del back)', () => {
  test('un activo válido no tiene errores', () => {
    expect(validateRegister(valid, TODAY)).toEqual({});
  });
  test.each(['typeId', 'condition', 'name', 'dateIn', 'valueBuy', 'valueIn'])('%s es obligatorio', (field) => {
    expect(validateRegister({ ...valid, [field]: '' }, TODAY)[field]).toBeDefined();
  });
  test('el estado físico es de la lista', () => {
    expect(validateRegister({ ...valid, condition: 'Roto' }, TODAY).condition).toBeDefined();
  });
  test.each(['2026-02-30', 'abc', '2999-01-01'])('fecha de ingreso %p inválida o futura', (dateIn) => {
    expect(validateRegister({ ...valid, dateIn }, TODAY).dateIn).toBeDefined();
  });
  test('la fecha de compra es opcional (vacía o la fecha nula) pero real y no futura', () => {
    expect(validateRegister({ ...valid, dateBuy: '1900-01-01' }, TODAY).dateBuy).toBeUndefined();
    expect(validateRegister({ ...valid, dateBuy: '2026-13-01' }, TODAY).dateBuy).toBeDefined();
    expect(validateRegister({ ...valid, dateBuy: '2999-01-01' }, TODAY).dateBuy).toBeDefined();
  });
  test.each([0, -1, 'x', 10.555, 1e10 + 1])('valor %p inválido', (value) => {
    expect(validateRegister({ ...valid, valueIn: value }, TODAY).valueIn).toBeDefined();
    expect(validateRegister({ ...valid, valueBuy: value }, TODAY).valueBuy).toBeDefined();
  });
  test('máximos: nombre 100, factura 20, series 50, proveedor 100', () => {
    expect(validateRegister({ ...valid, name: 'a'.repeat(101) }, TODAY).name).toBeDefined();
    expect(validateRegister({ ...valid, invoiceNumber: 'a'.repeat(21) }, TODAY).invoiceNumber).toBeDefined();
    expect(validateRegister({ ...valid, serial2: 'a'.repeat(51) }, TODAY).serial2).toBeDefined();
    expect(validateRegister({ ...valid, providerName: 'a'.repeat(101) }, TODAY).providerName).toBeDefined();
  });
});

describe('validateChange', () => {
  const line = { date: '2026-08-10', description: 'Mejora', value: 100 };
  test('una línea válida no tiene errores y el valor 0 es válido', () => {
    expect(validateChange(line, TODAY)).toEqual({});
    expect(validateChange({ ...line, value: 0 }, TODAY)).toEqual({});
  });
  test.each([[{ date: '2026-02-30' }], [{ date: '2999-01-01' }], [{ description: ' ' }], [{ description: 'a'.repeat(201) }], [{ value: -1 }], [{ value: '' }], [{ value: 1.234 }]])('%j inválido', (bad) => {
    expect(Object.keys(validateChange({ ...line, ...bad }, TODAY))).toHaveLength(1);
  });
});

describe('buildHeaderPayload', () => {
  test('el alta manda el tipo y nunca el código; los números y el estado van normalizados', () => {
    const payload = buildHeaderPayload({ ...valid, code: 'AF-X-000001', valueIn: '1400', isActive: '2' });
    expect(payload.typeId).toBe(3);
    expect(payload).not.toHaveProperty('code');
    expect(payload).toMatchObject({ valueIn: 1400, isActive: 2, dateBuy: '' });
  });
  test('la edición no manda el tipo', () => {
    expect(buildHeaderPayload({ ...valid, id: 5 })).not.toHaveProperty('typeId');
  });
  test('la fecha de compra nula del sistema viaja vacía', () => {
    expect(buildHeaderPayload({ ...valid, dateBuy: '1900-01-01' }).dateBuy).toBe('');
    expect(buildHeaderPayload({ ...valid, dateBuy: '2026-08-01T00:00:00.000Z' }).dateBuy).toBe('2026-08-01');
  });
});

describe('ayudas', () => {
  test('isAmount y isRealDate', () => {
    expect(isAmount('12.5')).toBe(true);
    expect(isAmount(0, { allowZero: true })).toBe(true);
    expect(isRealDate('2028-02-29')).toBe(true);
    expect(isRealDate('2027-02-29')).toBe(false);
  });
});
