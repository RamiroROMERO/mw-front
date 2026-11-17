import { describe, expect, test } from 'vitest';
import { ACCOUNT_FIELDS, INITIAL_AREA_FORM, buildAreaPayload, mapAreaToForm, validateArea } from './billingAreaRules';

const valid = { ...INITIAL_AREA_FORM, name: 'ADMINISTRACION', storeId: 1, codeDocument: 'FAC', localPriceType: 2, outsiderPriceType: 2 };
const off = { accountingActive: false };

describe('validateArea (mismos casos que AdminAreasDTO del back)', () => {
  test('un área válida (sin Contabilidad) no tiene errores', () => { expect(validateArea(valid, off)).toEqual({}); });
  test('nombre: 5 mínimo (con espacios recortados) y 50 máximo', () => {
    expect(validateArea({ ...valid, name: 'ABCD' }, off).name).toBe('page.billingAreas.error.name');
    expect(validateArea({ ...valid, name: '  ABCD  ' }, off).name).toBeDefined();
    expect(validateArea({ ...valid, name: '' }, off).name).toBeDefined();
    expect(validateArea({ ...valid, name: 'ABCDE' }, off)).toEqual({});
    expect(validateArea({ ...valid, name: 'A'.repeat(50) }, off)).toEqual({});
    expect(validateArea({ ...valid, name: 'A'.repeat(51) }, off).name).toBe('page.billingAreas.error.nameMax');
  });
  test('almacén: entero mayor que 0', () => {
    [0, -1, 1.5, 'abc', '', null].forEach((storeId) => expect(validateArea({ ...valid, storeId }, off).storeId).toBe('msg.required.input.idStore'));
    expect(validateArea({ ...valid, storeId: '3' }, off)).toEqual({});
  });
  test('documento: obligatorio y de 3 caracteres como máximo', () => {
    expect(validateArea({ ...valid, codeDocument: '' }, off).codeDocument).toBe('msg.required.input.codeDocument');
    expect(validateArea({ ...valid, codeDocument: 'FTG' }, off)).toEqual({});
    expect(validateArea({ ...valid, codeDocument: 'FACT' }, off).codeDocument).toBe('page.billingAreas.error.documentMax');
  });
  test('tipos de precio: solo 1, 2 o 3 (0 es "sin elegir")', () => {
    ['localPriceType', 'outsiderPriceType'].forEach((field) => {
      [1, 2, 3, '3'].forEach((v) => expect(validateArea({ ...valid, [field]: v }, off)).toEqual({}));
      [0, 4, -1, 'x', 1.5, ''].forEach((v) => expect(validateArea({ ...valid, [field]: v }, off)[field]).toBe('msg.required.input.localPriceType'));
    });
  });
  test('la cuenta de ingreso es obligatoria solo con Contabilidad activa', () => {
    expect(validateArea(valid, { accountingActive: true }).incomeCtaCode).toBe('page.billingAreas.error.incomeAccount');
    expect(validateArea({ ...valid, incomeCtaCode: '   ' }, { accountingActive: true }).incomeCtaCode).toBeDefined();
    expect(validateArea({ ...valid, incomeCtaCode: '4010101001' }, { accountingActive: true })).toEqual({});
    expect(validateArea(valid, off)).toEqual({});
  });
  test('por defecto se asume Contabilidad activa (el back decide)', () => { expect(validateArea(valid).incomeCtaCode).toBeDefined(); });
  test('cada cuenta admite 20 caracteres y rechaza 21', () => {
    ACCOUNT_FIELDS.forEach((field) => {
      expect(validateArea({ ...valid, incomeCtaCode: 'A', [field]: 'A'.repeat(20) }, { accountingActive: true })[field]).toBeUndefined();
      expect(validateArea({ ...valid, incomeCtaCode: 'A', [field]: 'A'.repeat(21) }, { accountingActive: true })[field]).toBe('page.billingAreas.error.accountMax');
    });
  });
  test('las 12 cuentas son las del back', () => {
    expect(ACCOUNT_FIELDS).toEqual(['incomeCtaCode', 'discountCtaCode', 'taxCtaCode', 'receivableCtaCode', 'shortageCtaCode', 'severanceCtaCode', 'noticeCtaCode',
      'vacationCtaCode', 'thirteenthCtaCode', 'fourteenthCtaCode', 'depreciationCtaCode', 'depreciationCostCtaCode']);
  });
});

describe('buildAreaPayload', () => {
  test('solo los campos del formulario, con tipos correctos y textos recortados', () => {
    const payload = buildAreaPayload({ ...valid, id: 7, name: '  CAJA UNO  ', storeId: '2', localPriceType: '3', incomeCtaCode: ' 4010 ', accountIng: { code: '4010' }, invStore: {}, isRemoved: false });
    expect(payload).toMatchObject({ name: 'CAJA UNO', storeId: 2, localPriceType: 3, incomeCtaCode: '4010', codeDocument: 'FAC' });
    ['id', 'accountIng', 'invStore', 'isRemoved'].forEach((k) => expect(payload).not.toHaveProperty(k));
  });
  test('la casilla de Activos Fijos viaja como useFixedAsset (singular: con el plural nunca se guardaba)', () => {
    expect(buildAreaPayload({ ...valid, useFixedAsset: true }).useFixedAsset).toBe(true);
    expect(buildAreaPayload({ ...valid, useFixedAssets: true })).not.toHaveProperty('useFixedAssets');
  });
  test('envía las 12 cuentas (vacías como texto vacío) y las 6 banderas', () => {
    const payload = buildAreaPayload(valid);
    ACCOUNT_FIELDS.forEach((field) => expect(payload[field]).toBe(''));
    ['useBilling', 'useRrhh', 'useFixedAsset', 'isHospital', 'isDefault', 'status'].forEach((k) => expect(typeof payload[k]).toBe('boolean'));
  });
});

describe('mapAreaToForm', () => {
  test('los nulos y ausentes toman el valor inicial y los enteros 0/1 pasan a booleanos', () => {
    const form = mapAreaToForm({ id: 3, name: 'LIMPIEZA', storeId: 0, codeDocument: '', localPriceType: 0, taxCtaCode: null, depreciationCtaCode: null, useBilling: 1, useRrhh: 0, isDefault: 1, status: 1, accountIng: {} });
    expect(form).toMatchObject({ id: 3, name: 'LIMPIEZA', taxCtaCode: '', depreciationCtaCode: '', useBilling: true, useRrhh: false, isDefault: true, status: true });
    expect(form).not.toHaveProperty('accountIng');
  });
  test('una fila vacía da el formulario inicial', () => { expect(mapAreaToForm({})).toEqual(INITIAL_AREA_FORM); });
  test('un área real sale con sus cuentas y el almacén como número', () => {
    const form = mapAreaToForm({ id: 1, name: 'FACTURACION', incomeCtaCode: '4010101001', storeId: '1', codeDocument: 'FAC', localPriceType: 2, outsiderPriceType: 2 });
    expect(form).toMatchObject({ incomeCtaCode: '4010101001', storeId: 1, localPriceType: 2 });
  });
});
