import { describe, expect, test } from 'vitest';
import {
  buildInitialForm, validateCustomer, buildCustomerPayload, mapCustomerToForm, isRtnValid, shouldLookupRtn, accountsFromType, dropUnknownAccounts, localToday, hasAccountsPrivilege, ACCOUNTS_PRIVILEGE_CODE, isPhoneValid, cleanPhone
} from './customerRules';

// Mismos casos que dtos/__tests__/FacProcessCustomerDTO.test.js y services/__tests__/FacProcessCustomerService.test.js del back.
const valid = () => ({ ...buildInitialForm(), customerTypeId: 1, rtn: '05011990123456', nomcli: 'Cliente Prueba', receivableCtaCode: '1', discountCtaCode: '2', taxCtaCode: '3' });

describe('obligatorios (mínimo)', () => {
  test('un cliente mínimo es válido', () => { expect(validateCustomer(valid())).toEqual({}); });
  test('falta tipo, RTN o nombre', () => {
    const errors = validateCustomer({ ...valid(), customerTypeId: 0, rtn: '', nomcli: '  ' });
    expect(Object.keys(errors).sort()).toEqual(['customerTypeId', 'nomcli', 'rtn']);
  });
  test('teléfono y correo son opcionales', () => {
    expect(validateCustomer({ ...valid(), tel: '', purchaseContactEmail: '' })).toEqual({});
  });
  test('la fecha de ingreso es obligatoria, válida y no futura', () => {
    expect(validateCustomer({ ...valid(), entryDate: '' }).entryDate).toBeDefined();
    expect(validateCustomer({ ...valid(), entryDate: '2026-02-30' }).entryDate).toBeDefined();
    expect(validateCustomer({ ...valid(), entryDate: '2999-01-01' }).entryDate).toBeDefined();
    expect(validateCustomer({ ...valid(), entryDate: '2020-02-29' })).toEqual({});
  });
});

describe('RTN', () => {
  test.each(['0501-1990123456', '05011990.123456', '05011990:123456', '05011990,123456'])('carácter especial %s', (rtn) => {
    expect(validateCustomer({ ...valid(), rtn }).rtn).toBe('page.customers.error.rtn');
  });
  test('menos de 13 se rechaza salvo internacional; más de 20 siempre', () => {
    expect(validateCustomer({ ...valid(), rtn: '123456789012' }).rtn).toBeDefined();
    expect(validateCustomer({ ...valid(), rtn: '12345', isInternational: true })).toEqual({});
    expect(validateCustomer({ ...valid(), rtn: '1'.repeat(21), isInternational: true }).rtn).toBeDefined();
    expect(isRtnValid('1'.repeat(20))).toBe(true);
  });
  test('solo un cliente nuevo con RTN bien formado busca al existente', () => {
    expect(shouldLookupRtn({ id: 0, rtn: '05011990123456' })).toBe(true);
    expect(shouldLookupRtn({ id: 5, rtn: '05011990123456' })).toBe(false);
    expect(shouldLookupRtn({ id: 0, rtn: '123' })).toBe(false);
    expect(shouldLookupRtn({ id: 0, rtn: '', isInternational: true })).toBe(false);
    expect(shouldLookupRtn({ id: 0, rtn: 'AB12', isInternational: true })).toBe(true);
  });
});

describe('crédito', () => {
  test('si solicita crédito exige días y límite mayores que 0; si no, no', () => {
    expect(validateCustomer({ ...valid(), creditRequest: 1, creditDays: 0, creditLimit: 0 })).toEqual({ creditDays: 'msg.required.input.creditDays', creditLimit: 'msg.required.input.creditLimit' });
    expect(validateCustomer({ ...valid(), creditRequest: 1, creditDays: 30, creditLimit: '1500.5' })).toEqual({});
    expect(validateCustomer({ ...valid(), creditRequest: 2, creditDays: 0, creditLimit: 0 })).toEqual({});
  });
});

describe('cuentas según Contabilidad', () => {
  test('con Contabilidad activa exige cuenta por cobrar, descuento e impuesto', () => {
    const errors = validateCustomer({ ...valid(), receivableCtaCode: '', discountCtaCode: '', taxCtaCode: '' });
    expect(Object.keys(errors).sort()).toEqual(['discountCtaCode', 'receivableCtaCode', 'taxCtaCode']);
  });
  test('sin Contabilidad no las exige; flete y bonificación nunca', () => {
    expect(validateCustomer({ ...valid(), receivableCtaCode: '', discountCtaCode: '', taxCtaCode: '' }, { accountingActive: false })).toEqual({});
    expect(validateCustomer({ ...valid(), freightCtaCode: '', bonusCtaCode: '' })).toEqual({});
  });
});

describe('correos y descuento global', () => {
  test('correo con formato válido si viene', () => {
    expect(validateCustomer({ ...valid(), purchaseContactEmail: 'sin-arroba' }).purchaseContactEmail).toBeDefined();
    expect(validateCustomer({ ...valid(), paymentContactEmail: 'a@b' }).paymentContactEmail).toBeDefined();
    expect(validateCustomer({ ...valid(), purchaseContactEmail: 'a@b.com', paymentContactEmail: 'c@d.hn' })).toEqual({});
  });
  test('descuento global de 0 a 100 con 2 decimales', () => {
    expect(validateCustomer({ ...valid(), globalDiscount: 100.01 }).globalDiscount).toBeDefined();
    expect(validateCustomer({ ...valid(), globalDiscount: '5.555' }).globalDiscount).toBeDefined();
    expect(validateCustomer({ ...valid(), globalDiscount: 15.5 })).toEqual({});
  });
});

describe('payload', () => {
  test('envía solo los campos del cliente con los tipos del back y recorta textos', () => {
    const payload = buildCustomerPayload({ ...valid(), id: 9, rtn: ' 05011990123456 ', creditDays: '30', creditLimit: '1500.5', isDefaultPos: 1, sellerId: '7' });
    expect(payload).toMatchObject({ rtn: '05011990123456', creditDays: 30, creditLimit: 1500.5, isDefaultPos: true, sellerId: 7, customerTypeId: 1 });
    for (const key of ['id', 'isRemoved', 'companyId', 'idTypeCont', 'numccxc', 'defaPos']) expect(payload).not.toHaveProperty(key);
  });
  test('los campos de hospital y de productor solo viajan si la empresa los usa', () => {
    const sin = buildCustomerPayload(valid());
    for (const key of ['kind', 'isDefaultInsurer', 'memberLimit', 'isProducer', 'isCertifiedProducer']) {
      if (key === 'memberLimit') continue;
      expect(sin).not.toHaveProperty(key);
    }
    const con = buildCustomerPayload({ ...valid(), kind: 2, memberLimit: 4, isProducer: true }, { isHospital: true, isFarmControl: true });
    expect(con).toMatchObject({ kind: 2, memberLimit: 4, isProducer: true });
  });
});

describe('mapCustomerToForm', () => {
  test('los nulos y ausentes toman el valor inicial y los enteros pasan a booleano', () => {
    const form = mapCustomerToForm({ id: 4, rtn: '05011990123456', nomcli: 'X', tel: null, isDefaultPos: 1, paysTax: 0, creditLimit: '1500.50', creditRequest: 1, creditDays: 30, entryDate: '2025-03-04T00:00:00.000Z' });
    expect(form).toMatchObject({ id: 4, tel: '', phone2: '', isDefaultPos: true, paysTax: false, creditLimit: 1500.5, creditDays: 30, entryDate: '2025-03-04' });
    expect(Object.values(form).some((v) => v === null || v === undefined)).toBe(false);
  });
  test('la fecha 1900-01-01 de los clientes antiguos queda vacía para que se elija una', () => {
    expect(mapCustomerToForm({ id: 1, entryDate: '1900-01-01' }).entryDate).toBe('');
  });
  test('el formulario nuevo trae la fecha de hoy', () => {
    expect(buildInitialForm().entryDate).toBe(localToday());
  });
});

describe('cuentas por tipo y catálogo', () => {
  test('accountsFromType usa los nombres del tipo de cliente', () => {
    expect(accountsFromType({ idCtaCxp: '1', idCtaDesc: '2', idCtaIva: '3', idCtaFlete: '', idCtaBon: null })).toEqual({ receivableCtaCode: '1', discountCtaCode: '2', taxCtaCode: '3', freightCtaCode: '', bonusCtaCode: '' });
    expect(accountsFromType(null)).toBeNull();
  });
  test('dropUnknownAccounts quita las cuentas que no están en el catálogo', () => {
    const next = dropUnknownAccounts({ receivableCtaCode: '1', discountCtaCode: '9', taxCtaCode: '' }, [{ value: '1' }]);
    expect(next).toMatchObject({ receivableCtaCode: '1', discountCtaCode: '', taxCtaCode: '' });
  });
});

describe('privilegio de Actualizar Cuentas', () => {
  test('es 99.01.003 y solo cuenta si está activo', () => {
    expect(ACCOUNTS_PRIVILEGE_CODE).toBe('99.01.003');
    expect(hasAccountsPrivilege({ code: '99.01.003', active: true })).toBe(true);
    expect(hasAccountsPrivilege({ code: '99.01.003', active: false })).toBe(false);
    expect(hasAccountsPrivilege({ fnCreate: false, id: 0 })).toBe(false);
    expect(hasAccountsPrivilege(undefined)).toBe(false);
  });
});

describe('teléfono (fnValidatePhone del legacy)', () => {
  test.each(['9999-8888', '99998888', '2220 1234', '(9999)8888', '+504 9999-8888', '504 9999-8888', '38887777'])('válido %s', (tel) => {
    expect(isPhoneValid(tel)).toBe(true);
    expect(validateCustomer({ ...valid(), tel })).toEqual({});
  });
  test.each(['1999-8888', '9999-888', '9999-88888', '9971-9045 / 3180-7699', 'abc', '504 9999'])('inválido %s', (tel) => {
    expect(isPhoneValid(tel)).toBe(false);
    expect(validateCustomer({ ...valid(), tel }).tel).toBe('page.customers.error.phone');
  });
  test('vacío y cliente internacional no se validan', () => {
    expect(validateCustomer({ ...valid(), tel: '' })).toEqual({});
    expect(validateCustomer({ ...valid(), tel: '+1 305 555 0100', isInternational: true })).toEqual({});
  });
  test('solo se valida si cambió respecto del cliente cargado', () => {
    const historic = '9971-9045 / 3180-7699';
    expect(validateCustomer({ ...valid(), tel: historic }, { originalTel: historic })).toEqual({});
    expect(validateCustomer({ ...valid(), tel: historic }, { originalTel: '' }).tel).toBeDefined();
  });
  test('cleanPhone quita espacios, guiones, paréntesis y el prefijo del país', () => {
    expect(cleanPhone(' +504 (9999)-8888 ')).toBe('99998888');
  });
});
