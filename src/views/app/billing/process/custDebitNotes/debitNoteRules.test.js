import { describe, test, expect } from 'vitest';
import { findHeaderProblem, findDetailProblem, buildNotePayload, isNoteLocked, TYPE } from './debitNoteRules';

const TODAY = '2026-08-12';
const base = (o = {}) => ({ date: TODAY, documentCode: 'NDB', customerId: 5, typeId: 1, incomeCtaCode: '4201', valueLps: 50, currencyId: 1, exchangeRate: 1, typeOther: '', ...o });
const problem = (o) => (findHeaderProblem(base(o), { today: TODAY }) || {}).field;

describe('findHeaderProblem', () => {
  test('una nota válida de cada tipo', () => {
    expect(findHeaderProblem(base(), { today: TODAY })).toBeNull();
    expect(findHeaderProblem(base({ typeId: 4, typeOther: 'x' }), { today: TODAY })).toBeNull();
    expect(findHeaderProblem(base({ typeId: 3, incomeCtaCode: '' }), { today: TODAY })).toBeNull();
  });
  test.each([
    ['date', { date: '' }], ['date', { date: '2026-02-30' }], ['date', { date: '2026-08-13' }],
    ['documentCode', { documentCode: '' }], ['customerId', { customerId: 0 }], ['typeId', { typeId: 9 }],
    ['typeOther', { typeId: 4, typeOther: ' ' }], ['incomeCtaCode', { incomeCtaCode: '' }], ['incomeCtaCode', { typeId: 2, incomeCtaCode: '' }],
    ['valueLps', { valueLps: 0 }], ['exchangeRate', { currencyId: 2, exchangeRate: 0 }]
  ])('marca %s con %j', (field, o) => expect(problem(o)).toBe(field));
  test('hoy vale y Lempiras no exige tasa', () => {
    expect(problem({ date: TODAY })).toBeUndefined();
    expect(problem({ exchangeRate: 0 })).toBeUndefined();
  });
});

describe('findDetailProblem', () => {
  test('tipo 3 exige factura de origen y líneas', () => {
    expect(findDetailProblem({ typeId: TYPE.ADJUSTMENT, detail2: [{}], originInvoice: null })).not.toBeNull();
    expect(findDetailProblem({ typeId: TYPE.ADJUSTMENT, detail2: [], originInvoice: { id: 1 } })).not.toBeNull();
    expect(findDetailProblem({ typeId: TYPE.ADJUSTMENT, detail2: [{}], originInvoice: { id: 1 } })).toBeNull();
  });
  test('los demás exigen facturas con valor mayor que cero y no se topan por el saldo', () => {
    expect(findDetailProblem({ typeId: 1, detail1: [] })).not.toBeNull();
    expect(findDetailProblem({ typeId: 1, detail1: [{ appliedValue: 0 }] })).not.toBeNull();
    expect(findDetailProblem({ typeId: 1, detail1: [{ appliedValue: 999999, invoiceBalance: 1 }] })).toBeNull();
  });
});

describe('buildNotePayload', () => {
  const line = { invoiceNumber: 'FAC-1', percent: 50, appliedValue: 100, invoiceBalance: 200, invoiceDate: '2026-07-01', invoiceCai: 'x', valueUsd: 1 };

  test('tipos 1, 2 y 4: cabecera y facturas con solo número, porcentaje y valor (sin saldo, fechas ni dólares)', () => {
    const payload = buildNotePayload(base(), { detail1: [line] });
    expect(payload.invoices).toEqual([{ invoiceNumber: 'FAC-1', percent: 50, appliedValue: 100 }]);
    expect(payload).not.toHaveProperty('products');
    expect(payload).toMatchObject({ incomeCtaCode: '4201', typeOther: '' });
  });

  test('tipo 3: factura de origen y productos con solo código, cantidad y precio; sin cuenta de ingreso', () => {
    const payload = buildNotePayload(base({ typeId: 3 }), { originInvoice: { id: 55, numcai: 'C' }, detail2: [{ productCode: 'P1', quantity: 2, price: 5, subtotal: 10, total: 11, taxValue: 1 }] });
    expect(payload.products).toEqual([{ productCode: 'P1', quantity: 2, price: 5 }]);
    expect(payload).toMatchObject({ originInvoiceId: 55, incomeCtaCode: '' });
    expect(payload).not.toHaveProperty('invoices');
  });

  test('typeOther solo viaja en el tipo 4 y no hay importes ni nombres viejos', () => {
    expect(buildNotePayload(base({ typeOther: 'x' }), { detail1: [line] }).typeOther).toBe('');
    const payload = buildNotePayload(base({ typeId: 4, typeOther: 'x', valueLps: 99, valueUsd: 1, numberCAI: 'z' }), { detail1: [line] });
    expect(payload.typeOther).toBe('x');
    ['valueLps', 'valueUsd', 'numberCAI', 'total', 'subtotal', 'clientId', 'accCode', 'currenId', 'docValueUSD', 'name', 'invoCode'].forEach((key) => expect(payload).not.toHaveProperty(key));
  });
});

describe('isNoteLocked', () => {
  test('con partida o con número fiscal está bloqueada; una nota nueva o en borrador no', () => {
    expect(isNoteLocked({ pdaNumber: 5, numberCAI: '' })).toBe(true);
    expect(isNoteLocked({ pdaNumber: 0, numberCAI: '000-002-01-00000030' })).toBe(true);
    expect(isNoteLocked({ pdaNumber: 0, numberCAI: '' })).toBe(false);
    expect(isNoteLocked({ pdaNumber: 0, numberCAI: '   ' })).toBe(false);
  });
});
