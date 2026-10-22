import { describe, expect, test } from 'vitest';
import {
  validateProvider, buildProviderPayload, validateBillingData, buildBillingPayload, validateBankAccount, buildBankAccountPayload,
  isAccountRequired, localToday, ACCOUNT_TYPES, CLASSIFICATIONS, ACCOUNT_TYPE_OPTIONS, CLASSIFICATION_OPTIONS
} from './providerRules';

// Mismos números y casos que los tests del back (ProviderDTO, ProviderService, ProviderBillingDataDTO y ProviderBank).
const VALID = {
  dni: '0801199912345', providerTypeId: 3, name: 'ACME', phone: '2222', email: 'a@b.c',
  payableCtaCode: '2101', discountCtaCode: '4101', taxCtaCode: '2102'
};
const CAI = 'A1B2C3-D4E5F6-A7B8C9-D0E1F2-A3B4C5-D6';

describe('validateProvider', () => {
  test('un proveedor válido no tiene errores', () => {
    expect(validateProvider(VALID)).toEqual({});
  });

  test.each(['dni', 'name', 'phone', 'email'])('%s vacío o con espacios es obligatorio', (field) => {
    expect(validateProvider({ ...VALID, [field]: '' })[field]).toBeDefined();
    expect(validateProvider({ ...VALID, [field]: '   ' })[field]).toBeDefined();
  });

  test.each([0, '0', '', null, undefined])('el tipo de proveedor %p es obligatorio', (value) => {
    expect(validateProvider({ ...VALID, providerTypeId: value }).providerTypeId).toBe('msg.required.select.typeProvider');
  });

  test('RTN: 12 es error, 13 es válido y 20 es el máximo (borde)', () => {
    expect(validateProvider({ ...VALID, dni: '1'.repeat(12) }).dni).toBe('page.providers.error.dniMin');
    expect(validateProvider({ ...VALID, dni: '1'.repeat(13) })).toEqual({});
    expect(validateProvider({ ...VALID, dni: '1'.repeat(20) })).toEqual({});
    expect(validateProvider({ ...VALID, dni: '1'.repeat(21) }).dni).toBe('page.providers.error.dniMax');
  });

  test('el RTN se mide recortado', () => {
    expect(validateProvider({ ...VALID, dni: `  ${'1'.repeat(12)}  ` }).dni).toBe('page.providers.error.dniMin');
  });

  test('un proveedor internacional puede tener un RTN corto', () => {
    expect(validateProvider({ ...VALID, dni: 'AB1', isInternational: true })).toEqual({});
  });

  test.each([['name', 120], ['phone', 50], ['email', 50]])('%s admite %i y rechaza uno más', (field, max) => {
    expect(validateProvider({ ...VALID, [field]: 'x'.repeat(max) })[field]).toBeUndefined();
    expect(validateProvider({ ...VALID, [field]: 'x'.repeat(max + 1) })[field]).toBeDefined();
  });

  test('un email "-" es válido (el legacy solo exige que no esté vacío)', () => {
    expect(validateProvider({ ...VALID, email: '-' })).toEqual({});
  });

  test.each(['payableCtaCode', 'discountCtaCode', 'taxCtaCode'])('con Contabilidad activa %s es obligatoria (vacía, espacios o "0")', (field) => {
    ['', '  ', '0', undefined].forEach((value) => {
      expect(validateProvider({ ...VALID, [field]: value }, { accountingActive: true })[field]).toBe('msg.required.select.accounts');
    });
  });

  test('con Contabilidad apagada las cuentas no se exigen', () => {
    expect(validateProvider({ ...VALID, payableCtaCode: '', discountCtaCode: '', taxCtaCode: '' }, { accountingActive: false })).toEqual({});
  });

  test('flete, bonificación y otros recargos nunca son obligatorios', () => {
    expect(validateProvider({ ...VALID, freightCtaCode: '', bonusCtaCode: '', otherCtaCode: '' })).toEqual({});
  });

  test('isAccountRequired solo marca las tres cuentas y solo con Contabilidad', () => {
    expect(isAccountRequired({ field: 'payableCtaCode', accountingActive: true })).toBe(true);
    expect(isAccountRequired({ field: 'taxCtaCode', accountingActive: false })).toBe(false);
    expect(isAccountRequired({ field: 'freightCtaCode', accountingActive: true })).toBe(false);
  });

  test.each(['creditDays', 'shipDays'])('%s acepta 0 y positivos; rechaza negativos, decimales y texto', (field) => {
    expect(validateProvider({ ...VALID, [field]: 0 })[field]).toBeUndefined();
    expect(validateProvider({ ...VALID, [field]: '30' })[field]).toBeUndefined();
    expect(validateProvider({ ...VALID, [field]: -1 })[field]).toBeDefined();
    expect(validateProvider({ ...VALID, [field]: 1.5 })[field]).toBeDefined();
    expect(validateProvider({ ...VALID, [field]: 'abc' })[field]).toBeDefined();
  });

  test.each(['percHosp', 'percProv'])('%s acepta de 0 a 100', (field) => {
    expect(validateProvider({ ...VALID, [field]: 0 })[field]).toBeUndefined();
    expect(validateProvider({ ...VALID, [field]: 100 })[field]).toBeUndefined();
    expect(validateProvider({ ...VALID, [field]: -0.01 })[field]).toBeDefined();
    expect(validateProvider({ ...VALID, [field]: 100.01 })[field]).toBeDefined();
  });

  test.each([['contactManager', 50], ['contactSales', 50], ['contactManagerPhone', 20], ['contactLogisticPhone', 20]])(
    '%s admite %i y rechaza uno más', (field, max) => {
      expect(validateProvider({ ...VALID, [field]: 'x'.repeat(max) })[field]).toBeUndefined();
      expect(validateProvider({ ...VALID, [field]: 'x'.repeat(max + 1) })[field]).toBeDefined();
    }
  );
});

describe('buildProviderPayload', () => {
  test('quita los campos que se guardan por otra vía o solo existen en la tabla', () => {
    const payload = buildProviderPayload({ ...VALID, isRemoved: 0, cai: 'x', rangeIn: 1, rangeOut: 2, dateLimit: '2030-01-01', providerTypeData: {} });
    ['isRemoved', 'cai', 'rangeIn', 'rangeOut', 'dateLimit', 'providerTypeData'].forEach((f) => expect(payload).not.toHaveProperty(f));
  });

  test('sin Contabilidad no envía las cuentas', () => {
    const payload = buildProviderPayload(VALID, { accountingActive: false });
    ['payableCtaCode', 'discountCtaCode', 'taxCtaCode', 'freightCtaCode', 'bonusCtaCode', 'otherCtaCode'].forEach((f) => expect(payload).not.toHaveProperty(f));
  });

  test('con Contabilidad las conserva y recorta los textos', () => {
    const payload = buildProviderPayload({ ...VALID, name: ' ACME ' });
    expect(payload).toMatchObject({ name: 'ACME', payableCtaCode: '2101' });
  });
});

describe('validateBillingData ("Info Fact.")', () => {
  const TODAY = '2026-09-15';
  const VALID_BILLING = { cai: CAI, rangeIn: 1, rangeOut: 500, dateLimit: '2026-12-31' };

  test('datos válidos', () => {
    expect(validateBillingData(VALID_BILLING, { today: TODAY })).toEqual({});
  });

  test('CAI: 31 caracteres es error, 32 y 50 válidos, 51 error', () => {
    expect(validateBillingData({ ...VALID_BILLING, cai: 'x'.repeat(31) }, { today: TODAY }).cai).toBeDefined();
    expect(validateBillingData({ ...VALID_BILLING, cai: 'x'.repeat(32) }, { today: TODAY }).cai).toBeUndefined();
    expect(validateBillingData({ ...VALID_BILLING, cai: 'x'.repeat(50) }, { today: TODAY }).cai).toBeUndefined();
    expect(validateBillingData({ ...VALID_BILLING, cai: 'x'.repeat(51) }, { today: TODAY }).cai).toBeDefined();
  });

  test.each(['rangeIn', 'rangeOut'])('%s debe ser entero entre 1 y 99999999', (field) => {
    [0, -5, '', 1.5, undefined, 100000000].forEach((value) => {
      expect(validateBillingData({ ...VALID_BILLING, [field]: value }, { today: TODAY })[field]).toBe('msg.required.input.range');
    });
  });

  test('el final debe ser mayor que el inicial', () => {
    expect(validateBillingData({ ...VALID_BILLING, rangeIn: 100, rangeOut: 100 }, { today: TODAY }).rangeOut).toBe('page.providers.error.rangeOrder');
    expect(validateBillingData({ ...VALID_BILLING, rangeIn: 100, rangeOut: 101 }, { today: TODAY })).toEqual({});
  });

  test('fecha límite: vacía es error; hoy es válida; ayer no; el sentinel 1900-01-01 no', () => {
    expect(validateBillingData({ ...VALID_BILLING, dateLimit: '' }, { today: TODAY }).dateLimit).toBe('msg.required.input.deadline');
    expect(validateBillingData({ ...VALID_BILLING, dateLimit: TODAY }, { today: TODAY })).toEqual({});
    expect(validateBillingData({ ...VALID_BILLING, dateLimit: '2026-09-14' }, { today: TODAY }).dateLimit).toBe('page.providers.error.deadlinePast');
    expect(validateBillingData({ ...VALID_BILLING, dateLimit: '1900-01-01' }, { today: TODAY }).dateLimit).toBeDefined();
  });

  test('buildBillingPayload convierte el rango a número y recorta la fecha', () => {
    expect(buildBillingPayload({ cai: ` ${CAI} `, rangeIn: '10', rangeOut: '20', dateLimit: '2026-12-31T00:00:00.000Z' }))
      .toEqual({ cai: CAI, rangeIn: 10, rangeOut: 20, dateLimit: '2026-12-31' });
  });
});

describe('localToday', () => {
  test('usa el calendario local, no UTC', () => {
    expect(localToday(new Date(2026, 8, 15, 23, 30))).toBe('2026-09-15');
    expect(localToday(new Date(2026, 0, 1, 0, 5))).toBe('2026-01-01');
  });
});

describe('cuenta bancaria', () => {
  const BANK = { typeCtaName: 'Cuenta de Cheques', classificCta: 'CC', bankName: 'BAC', bankCtaCode: '123', beneficName: 'IRON' };

  test('válida', () => {
    expect(validateBankAccount(BANK)).toEqual({});
  });

  test('las listas son las del legacy', () => {
    expect(ACCOUNT_TYPES).toEqual(['Cuenta de Ahorro', 'Cuenta de Cheques', 'Cuenta de Ahorro en Dolares', 'Cuenta de Cheques en Dolares']);
    expect(CLASSIFICATIONS).toEqual(['CA', 'CC']);
    expect(ACCOUNT_TYPE_OPTIONS.every((o) => o.id === o.name)).toBe(true);
    expect(CLASSIFICATION_OPTIONS.map((o) => o.id)).toEqual(['CA', 'CC']);
  });

  test('el tipo y la clasificación rechazan el número de la opción, el valor "0" del "Seleccione" y textos fuera de la lista', () => {
    ['1', 2, '0', '', 'otra', 'cuenta de cheques'].forEach((value) => {
      expect(validateBankAccount({ ...BANK, typeCtaName: value }).typeCtaName).toBeDefined();
    });
    ['1', 2, '0', '', 'ca', 'XX'].forEach((value) => {
      expect(validateBankAccount({ ...BANK, classificCta: value }).classificCta).toBeDefined();
    });
  });

  test.each(['bankName', 'bankCtaCode', 'beneficName'])('%s es obligatorio', (field) => {
    expect(validateBankAccount({ ...BANK, [field]: '' })[field]).toBeDefined();
    expect(validateBankAccount({ ...BANK, [field]: '  ' })[field]).toBeDefined();
  });

  test.each([['bankName', 50], ['bankCtaCode', 50], ['beneficName', 80], ['beneficDni', 20], ['beneficEmail', 50]])(
    '%s admite %i y rechaza uno más', (field, max) => {
      expect(validateBankAccount({ ...BANK, [field]: 'x'.repeat(max) })[field]).toBeUndefined();
      expect(validateBankAccount({ ...BANK, [field]: 'x'.repeat(max + 1) })[field]).toBeDefined();
    }
  );

  test('el RTN y el correo del beneficiario son opcionales', () => {
    expect(validateBankAccount({ ...BANK, beneficDni: '', beneficEmail: '' })).toEqual({});
  });

  test('el cuerpo lleva el proveedor, el texto de las listas y isExterior como 0/1', () => {
    expect(buildBankAccountPayload({ ...BANK, isExterior: true, status: true }, 7))
      .toMatchObject({ providerId: 7, typeCtaName: 'Cuenta de Cheques', classificCta: 'CC', isExterior: 1, status: true });
    expect(buildBankAccountPayload({ ...BANK, isExterior: false }, 7).isExterior).toBe(0);
  });
});
