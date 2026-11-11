import { describe, expect, test } from 'vitest';
import { buildPayload, buildSavePayload, calculateTotal, formFromPurchase, isProcessed, toFormValidation, validateFuelPurchase } from './fuelPurchaseRules';

const TODAY = '2026-11-11';
const VALID = {
  documentTypeId: 3, date: '2026-11-10', machineId: 3, driverId: 4, concept: 'Combustible camión',
  qtyDiesel: 10, qtyGasoline: 0, qtyOil: 0, qtyOthers: 0, providerId: 7, storeId: 0, productCode: '',
  invoiceNumber: '000-001-01-00000123', invoiceDate: '2026-11-10', dueDate: '2026-12-10',
  paymentTypeId: 2, expenseCtaCode: '6010', subtotal: 1000, discount: 0, tax: 150
};
const run = (changes = {}) => validateFuelPurchase({ ...VALID, ...changes }, { today: TODAY });

describe('validateFuelPurchase', () => {
  test('un documento válido no tiene errores', () => expect(run()).toEqual({}));

  test.each([
    ['documentTypeId', 0], ['date', ''], ['machineId', 0], ['driverId', 0], ['concept', ''], ['providerId', 0],
    ['invoiceNumber', ''], ['paymentTypeId', 0], ['expenseCtaCode', ''], ['invoiceDate', ''], ['dueDate', '']
  ])('%s vacío es error', (field, value) => {
    expect(run({ [field]: value })[field]).toBeTruthy();
  });

  test('las fechas 1900-01-01 cuentan como vacías', () => {
    expect(run({ invoiceDate: '1900-01-01' }).invoiceDate).toBeTruthy();
    expect(run({ dueDate: '1900-01-01' }).dueDate).toBeTruthy();
  });

  test('máximo del concepto en el borde', () => {
    expect(run({ concept: 'a'.repeat(80) })).toEqual({});
    expect(run({ concept: 'a'.repeat(81) }).concept).toBeTruthy();
  });

  test('N° de factura: 19 a 20 caracteres y sin punto', () => {
    expect(run({ invoiceNumber: '1'.repeat(18) }).invoiceNumber).toBeTruthy();
    expect(run({ invoiceNumber: '1'.repeat(19) })).toEqual({});
    expect(run({ invoiceNumber: '1'.repeat(20) })).toEqual({});
    expect(run({ invoiceNumber: '1'.repeat(21) }).invoiceNumber).toBeTruthy();
    expect(run({ invoiceNumber: '000-001-01-0000.123' }).invoiceNumber).toBeTruthy();
  });

  test('fechas: orden y factura no futuras, vencimiento no anterior', () => {
    expect(run({ date: '2026-11-12' }).date).toBeTruthy();
    expect(run({ date: TODAY })).toEqual({});
    expect(run({ invoiceDate: '2026-11-12', dueDate: '2026-12-01' }).invoiceDate).toBeTruthy();
    expect(run({ dueDate: '2026-11-09' }).dueDate).toBeTruthy();
    expect(run({ dueDate: '2026-11-10' })).toEqual({});
  });

  test('al menos una cantidad de combustible mayor a 0', () => {
    expect(run({ qtyDiesel: 0 }).qtyDiesel).toBeTruthy();
    expect(run({ qtyDiesel: 0, qtyOil: 1.5 })).toEqual({});
    expect(run({ qtyDiesel: -1, qtyOil: 2 }).qtyDiesel).toBeTruthy();
  });

  test('con almacén el producto es obligatorio', () => {
    expect(run({ storeId: 5, productCode: '' }).productCode).toBeTruthy();
    expect(run({ storeId: 5, productCode: 'DSL-1' })).toEqual({});
    expect(run({ storeId: 0, productCode: '' })).toEqual({});
  });

  test('importes negativos o no numéricos son error', () => {
    expect(run({ subtotal: -1 }).subtotal).toBeTruthy();
    expect(run({ discount: 'abc' }).discount).toBeTruthy();
    expect(run({ tax: -0.01 }).tax).toBeTruthy();
  });

  test('total cero es error', () => {
    expect(run({ subtotal: 100, tax: 0, discount: 100 }).total).toBeTruthy();
    expect(run({ subtotal: 0, tax: 0 }).total).toBeTruthy();
  });

  test('kilómetros y número de orden: enteros mayores o iguales a 0', () => {
    expect(run({ kilometers: 12.5 }).kilometers).toBeTruthy();
    expect(run({ orderNumber: -1 }).orderNumber).toBeTruthy();
    expect(run({ kilometers: 0, orderNumber: 0 })).toEqual({});
  });
});

describe('calculateTotal', () => {
  test('suma en centavos', () => {
    expect(calculateTotal({ subtotal: 0.1, tax: 0.2, discount: 0 })).toBe(0.3);
    expect(calculateTotal({ subtotal: 1000, tax: 150, discount: 50 })).toBe(1100);
    expect(calculateTotal({ subtotal: '10.005', tax: '', discount: '' })).toBe(10.01);
  });
});

describe('toFormValidation', () => {
  test('agrega el sufijo Valid', () => expect(toFormValidation({ date: 'x' })).toEqual({ dateValid: 'x' }));
});

describe('buildPayload', () => {
  test('no manda total, partida, estado ni correlativo', () => {
    const payload = buildPayload({ ...VALID, total: 999, pdaNumber: 5 }, 'CMB');
    expect(payload).not.toHaveProperty('total');
    expect(payload).not.toHaveProperty('pdaNumber');
    expect(payload).not.toHaveProperty('state');
    expect(payload).not.toHaveProperty('documentId');
    expect(payload).toMatchObject({ documentCode: 'CMB', invoiceNumber: '000-001-01-00000123', dueDate: '2026-12-10', subtotal: 1000 });
  });

  test('fechas vacías van como 1900-01-01 y los vacíos numéricos como 0', () => {
    const payload = buildPayload({ ...VALID, invoiceDate: '', dueDate: '', kilometers: '', discount: '' }, 'CMB');
    expect(payload).toMatchObject({ invoiceDate: '1900-01-01', dueDate: '1900-01-01', kilometers: 0, discount: 0 });
  });
});

describe('formFromPurchase', () => {
  test('mapea la fila del back al formulario', () => {
    const documents = [{ value: 3, code: 'CMB' }];
    const form = formFromPurchase({
      id: 9, documentCode: 'CMB', date: '2026-11-10', machineId: 3, machineData: { code: 'HBC1234' }, driverId: 4,
      invoiceNumber: 'X', invoiceDate: '2026-11-10', dueDate: '1900-01-01', subtotal: '100.00', tax: '15.00', discount: '0.00',
      total: '115.00', pdaNumber: 0, productCode: null
    }, documents);
    expect(form).toMatchObject({ id: 9, documentTypeId: 3, plate: 'HBC1234', dueDate: '', subtotal: 100, total: 115, productCode: '' });
  });

  test('un documento que no está en la lista queda sin tipo', () => {
    expect(formFromPurchase({ documentCode: 'ZZZ' }, [{ value: 3, code: 'CMB' }]).documentTypeId).toBe(0);
  });
});

describe('orden procesada (SPEC v2-33-sr)', () => {
  test.each([
    [{ pdaNumber: 100028237 }, true], [{ pdaNumber: '12' }, true], [{ pdaNumber: 0 }, false], [{ pdaNumber: '0' }, false],
    [{ pdaNumber: null }, false], [{}, false], [undefined, false]
  ])('isProcessed(%j) = %s', (form, expected) => expect(isProcessed(form)).toBe(expected));

  test('una orden procesada manda solo las observaciones', () => {
    expect(buildSavePayload({ ...VALID, pdaNumber: 700, notes: 'corregida' }, 'CMB')).toEqual({ notes: 'corregida' });
  });

  test('una orden procesada sin observaciones manda notes vacío (nunca el documento)', () => {
    expect(buildSavePayload({ ...VALID, pdaNumber: 700 }, 'CMB')).toEqual({ notes: '' });
  });

  test('una orden sin procesar manda el documento completo, igual que buildPayload', () => {
    const form = { ...VALID, pdaNumber: 0, notes: 'x' };
    expect(buildSavePayload(form, 'CMB')).toEqual(buildPayload(form, 'CMB'));
    expect(buildSavePayload(form, 'CMB').providerId).toBe(7);
  });

  test('el cuerpo nunca incluye total, pdaNumber, state ni documentId', () => {
    const payload = buildSavePayload({ ...VALID, pdaNumber: 0, total: 1, state: 1, documentId: 9 }, 'CMB');
    ['total', 'pdaNumber', 'state', 'documentId'].forEach((field) => expect(payload).not.toHaveProperty(field));
  });
});
