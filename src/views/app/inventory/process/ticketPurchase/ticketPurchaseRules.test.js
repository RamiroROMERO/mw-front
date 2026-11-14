import { describe, it, expect } from 'vitest';
import {
  MAX_AMOUNT, toCents, round2, localToday, isValidCalendarDate, checkAmount, calculateLineTotal, lineTotalFits, lineTotalOrZero, sumTotals,
  validateHeader, validateLine, validateLines, toFormValidation, emptyForm, emptyLine, buildPayload, lineFromServer, lineFromOrder,
  formFromTicket, isProcessed, applyAccountToAll
} from './ticketPurchaseRules';

// Los casos son los de TicketPurchaseDTO.test.js y ticketPurchaseRules.test.js del back.
const TODAY = '2026-11-13';
const HEADER = { documentCode: 'BCP', date: '2026-11-01', providerId: 60, paymentTypeId: 2 };
const LINE = { productCode: '', nameProduct: 'FLY BANNER', qty: 3, price: 10.5, total: 31.5, expenseCtaCode: '6010123002', toInventory: false, storeId: 0 };
const header = (patch) => validateHeader({ ...HEADER, ...patch }, { today: TODAY });
const line = (patch, options) => validateLine({ ...LINE, ...patch }, options);

describe('dinero en centavos', () => {
  it('toCents y round2 redondean las mitades hacia arriba sin Math.round(x * 100)', () => {
    expect(toCents(1.005)).toBe(101);
    expect(toCents(10.475)).toBe(1048);
    expect(round2(2.675)).toBe(2.68);
    expect(round2(0.1 + 0.2)).toBe(0.3);
    expect(toCents('abc')).toBe(0);
  });

  it('calculateLineTotal es round2(cantidad × precio) (los mismos casos del back)', () => {
    [[2, 10, 20], [3, 0.1, 0.3], [1.5, 0.1, 0.15], [2.5, 0.15, 0.38], [0.5, 0.01, 0.01], [33.33, 3, 99.99], [0.01, 0.01, 0], [999999.99, 1, 999999.99], [12, 25.5, 306]]
      .forEach(([qty, price, expected]) => expect(calculateLineTotal(qty, price)).toBe(expected));
    expect(calculateLineTotal(999999.99, 999999.99)).toBe(999999980000);
  });

  it('lineTotalFits: 999,999.99 cabe; 1,000,000.00 no; el redondeo manda', () => {
    expect(lineTotalFits(999999.99, 1)).toBe(true);
    expect(lineTotalFits(1000, 1000)).toBe(false);
    expect(lineTotalFits(999.99, 1000.01)).toBe(false);
    expect(lineTotalFits(999.99, 1000)).toBe(true);
  });

  it('lineTotalOrZero: el total en vivo es 0 mientras falte cantidad o precio', () => {
    expect(lineTotalOrZero(3, 10.5)).toBe(31.5);
    expect(lineTotalOrZero('0.5', '3')).toBe(1.5);
    expect(lineTotalOrZero('', 10)).toBe(0);
    expect(lineTotalOrZero(2, 'abc')).toBe(0);
    expect(lineTotalOrZero(undefined, undefined)).toBe(0);
  });

  it('sumTotals suma sin ruido de coma flotante', () => {
    expect(sumTotals([{ total: 0.1 }, { total: 0.2 }])).toBe(0.3);
    expect(sumTotals([])).toBe(0);
    expect(sumTotals([{ total: 1.1 }, { total: 2.2 }, { total: 3.3 }])).toBe(6.6);
  });
});

describe('checkAmount', () => {
  it.each([[0.01], [0.5], [1], ['12.50'], [999999.99]])('%p es válido (0.5 y 0.01 también: antes validInt los rechazaba)', (value) => {
    expect(checkAmount(value)).toBeNull();
  });
  it.each([[''], [null], [undefined], ['abc']])('%p no es un número', (value) => expect(checkAmount(value)).toBe('invalid'));
  it.each([[0], [-1], ['0.00']])('%p no es mayor a 0', (value) => expect(checkAmount(value)).toBe('notPositive'));
  it.each([[1.005], [0.001], ['10.123']])('%p tiene más de 2 decimales', (value) => expect(checkAmount(value)).toBe('decimals'));
  it('el borde del máximo', () => {
    expect(MAX_AMOUNT).toBe(999999.99);
    expect(checkAmount(1000000)).toBe('tooLarge');
  });
});

describe('fechas', () => {
  it('localToday usa el calendario local', () => {
    expect(localToday(new Date(2026, 10, 13, 23, 59))).toBe('2026-11-13');
    expect(localToday(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
  it('isValidCalendarDate: el día debe existir en el mes', () => {
    ['2024-06-01', '2028-02-29', '2000-02-29'].forEach((d) => expect(isValidCalendarDate(d)).toBe(true));
    ['2024-02-30', '2026-02-29', '2100-02-29', '2024-13-01', '2024-1-1', 'abc', '', null].forEach((d) => expect(isValidCalendarDate(d)).toBe(false));
  });
});

describe('validateHeader', () => {
  it('una cabecera completa no tiene errores', () => {
    expect(header({})).toEqual({});
  });
  it.each(['documentCode', 'date', 'providerId', 'paymentTypeId'])('%s vacío es obligatorio', (field) => {
    expect(Object.keys(header({ [field]: '' }))).toEqual([field]);
    expect(Object.keys(header({ [field]: null }))).toEqual([field]);
  });
  it.each([[0], ['0'], [-1], ['abc'], [1.5]])('proveedor y forma de pago %p no son válidos', (value) => {
    expect(header({ providerId: value }).providerId).toBe('msg.required.select.provider');
    expect(header({ paymentTypeId: value }).paymentTypeId).toBe('msg.required.select.paymentMethod');
  });
  it('proveedor y forma de pago como texto numérico son válidos', () => {
    expect(header({ providerId: '60', paymentTypeId: '2' })).toEqual({});
  });
  it('la fecha: 1900-01-01 es "sin fecha", una inexistente o futura se rechaza y hoy se acepta', () => {
    expect(header({ date: '1900-01-01' }).date).toBe('msg.required.input.date');
    expect(header({ date: '2026-02-30' }).date).toBe('page.ticketPurchase.error.dateInvalid');
    expect(header({ date: '2026-11-14' }).date).toBe('page.ticketPurchase.error.dateFuture');
    expect(header({ date: TODAY })).toEqual({});
  });
  it('sin argumentos marca los cuatro obligatorios', () => {
    expect(Object.keys(validateHeader())).toEqual(['documentCode', 'date', 'providerId', 'paymentTypeId']);
  });
});

describe('validateLine', () => {
  it('una línea completa no tiene errores', () => {
    expect(line({})).toEqual({});
  });
  it('el producto es opcional (texto libre) mientras no sea "Al Inventario"', () => {
    expect(line({ productCode: '' })).toEqual({});
    expect(line({ productCode: '0' })).toEqual({});
  });
  it('nombre obligatorio y máximo de 250', () => {
    expect(line({ nameProduct: '' }).nameProduct).toBe('page.ticketPurchase.error.nameRequired');
    expect(line({ nameProduct: '   ' }).nameProduct).toBe('page.ticketPurchase.error.nameRequired');
    expect(line({ nameProduct: 'A'.repeat(250) })).toEqual({});
    expect(line({ nameProduct: 'A'.repeat(251) }).nameProduct).toBe('page.ticketPurchase.error.nameMax');
  });
  it('código de producto: 20 pasa y 21 no', () => {
    expect(line({ productCode: 'P'.repeat(20) })).toEqual({});
    expect(line({ productCode: 'P'.repeat(21) }).productCode).toBe('page.ticketPurchase.error.productMax');
  });
  it.each([['qty', 'msg.required.input.qty'], ['price', 'msg.required.input.price']])('%s: vacío, 0, negativo, decimales y tope', (field, requiredId) => {
    expect(line({ [field]: '' })[field]).toBe(requiredId);
    expect(line({ [field]: 'abc' })[field]).toBe(requiredId);
    expect(line({ [field]: 0 })[field]).toBe('page.ticketPurchase.error.notPositive');
    expect(line({ [field]: -1 })[field]).toBe('page.ticketPurchase.error.notPositive');
    expect(line({ [field]: 1.005 })[field]).toBe('page.ticketPurchase.error.decimals');
    expect(line({ [field]: 1000000 })[field]).toBe('page.ticketPurchase.error.tooLarge');
    expect(line({ [field]: 0.01 })[field]).toBeUndefined();
  });
  it('el total (cantidad × precio) no puede pasar de 999,999.99', () => {
    expect(line({ qty: 1000, price: 1000 }).total).toBe('page.ticketPurchase.error.totalTooLarge');
    expect(line({ qty: 1000, price: 999.99 })).toEqual({});
  });
  it('con Contabilidad activa la cuenta es obligatoria y de hasta 15 caracteres; sin ella no se pide', () => {
    expect(line({ expenseCtaCode: '' }).expenseCtaCode).toBe('msg.required.input.account');
    expect(line({ expenseCtaCode: '0' }).expenseCtaCode).toBe('msg.required.input.account');
    expect(line({ expenseCtaCode: 'C'.repeat(15) })).toEqual({});
    expect(line({ expenseCtaCode: 'C'.repeat(16) }).expenseCtaCode).toBe('page.ticketPurchase.error.accountMax');
    expect(line({ expenseCtaCode: '' }, { accountingActive: false })).toEqual({});
  });
  it('"Al Inventario" exige producto y almacén (solo con Contabilidad activa)', () => {
    const errors = line({ toInventory: true });
    expect(errors.productCode).toBe('page.ticketPurchase.error.productToInventory');
    expect(errors.storeId).toBe('page.ticketPurchase.error.storeToInventory');
    expect(line({ toInventory: true, productCode: 'HPL-00001', storeId: 3 })).toEqual({});
    expect(line({ toInventory: true, productCode: 'HPL-00001', storeId: '3' })).toEqual({});
    expect(line({ toInventory: true }, { accountingActive: false })).toEqual({});
  });
  it('validateLines devuelve solo las líneas con error y su número (la primera es la 1)', () => {
    const result = validateLines([LINE, { ...LINE, nameProduct: '' }, LINE, { ...LINE, qty: 0 }]);
    expect(result.map((item) => item.index)).toEqual([2, 4]);
    expect(result[0].errors.nameProduct).toBeDefined();
    expect(validateLines([LINE])).toEqual([]);
  });
  it('toFormValidation agrega el sufijo Valid', () => {
    expect(toFormValidation({ date: 'x', providerId: 'y' })).toEqual({ dateValid: 'x', providerIdValid: 'y' });
  });
});

describe('buildPayload', () => {
  const form = { ...HEADER, purchaseOrderId: 40, notes: 'obs', valueTotal: 999, pdaNumber: 5, documentId: 7, numberCAI: 'X' };

  it('manda la cabecera y el detalle con los nombres del back y sin total, CAI, partida ni correlativo', () => {
    const payload = buildPayload(form, [{ ...LINE, productCode: ' HPL-1 ', nameProduct: ' CAJA ', qty: '3', price: '10.50', toInventory: true, storeId: '4' }]);
    expect(payload).toEqual({
      documentCode: 'BCP', date: '2026-11-01', providerId: 60, paymentTypeId: 2, purchaseOrderId: 40, notes: 'obs',
      detail: [{ productCode: 'HPL-1', name: 'CAJA', quantity: 3, price: 10.5, storeId: 4, expenseCtaCode: '6010123002', sendInv: 1 }]
    });
    ['pdaNumber', 'documentId', 'numberCAI', 'valueTotal', 'idOc', 'total'].forEach((key) => expect(payload).not.toHaveProperty(key));
    expect(payload.detail[0]).not.toHaveProperty('total');
    expect(payload.detail[0]).not.toHaveProperty('valueTotal1');
    expect(payload.detail[0]).not.toHaveProperty('contCta');
  });

  it('sin orden de compra manda 0', () => {
    expect(buildPayload({ ...form, purchaseOrderId: '' }, [LINE]).purchaseOrderId).toBe(0);
    expect(buildPayload({ ...form, purchaseOrderId: 0 }, [LINE]).purchaseOrderId).toBe(0);
  });

  it('el almacén solo viaja con "Al Inventario"', () => {
    expect(buildPayload(form, [{ ...LINE, storeId: 4, toInventory: false }]).detail[0]).toMatchObject({ storeId: 0, sendInv: 0 });
  });

  it('sin Contabilidad activa no hay cuenta, almacén ni "Al Inventario"', () => {
    const payload = buildPayload(form, [{ ...LINE, storeId: 4, toInventory: true }], { accountingActive: false });
    expect(payload.detail[0]).toMatchObject({ storeId: 0, sendInv: 0, expenseCtaCode: '' });
  });

  it('la fecha 1900-01-01 sale vacía', () => {
    expect(buildPayload({ ...form, date: '1900-01-01' }, [LINE]).date).toBe('');
  });
});

describe('mapeos del back', () => {
  it('lineFromServer usa los nombres nuevos y convierte los decimales de MySQL', () => {
    expect(lineFromServer({ id: 3, productCode: 'HPL-1', name: 'ACEITE', quantity: '2.00', price: '10.50', total: '21.00', expenseCtaCode: '5010', sendInv: 1, storeId: 4 }))
      .toEqual({ id: 3, productCode: 'HPL-1', nameProduct: 'ACEITE', qty: 2, price: 10.5, total: 21, expenseCtaCode: '5010', toInventory: true, storeId: 4 });
    expect(lineFromServer({ sendInv: 0 }).toInventory).toBe(false);
    expect(lineFromServer({}).nameProduct).toBe('');
  });

  it('lineFromOrder redondea a 2 decimales (la orden trae hasta 5), recalcula el total y aplica almacén, cuenta e inventario', () => {
    const result = lineFromOrder({ id: 9, productCode: 'HPL-1', productData: { name: 'ACEITE' }, qty: 2.5, price: 10.12345, total: 25.30863 }, { storeId: '4', expenseCtaCode: '5010', toInventory: true });
    expect(result).toMatchObject({ id: 9, productCode: 'HPL-1', nameProduct: 'ACEITE', qty: 2.5, price: 10.12, total: 25.3, storeId: 4, expenseCtaCode: '5010', toInventory: true });
  });

  it('lineFromOrder sin opciones deja almacén 0, cuenta vacía y sin inventario', () => {
    expect(lineFromOrder({ qty: 1, price: 2, productCode: 'X' })).toMatchObject({ storeId: 0, expenseCtaCode: '', toInventory: false });
  });

  it('formFromTicket usa los nombres nuevos y la suma de las líneas como total', () => {
    const lines = [{ total: 0.1 }, { total: 0.2 }];
    expect(formFromTicket({ id: 5, documentCode: 'BCP', documentId: 12, date: '2024-06-01', purchaseOrderId: 40, providerId: 60, paymentTypeId: 2, notes: null, pdaNumber: 100, numberCAI: '000-001-11-00000012' }, lines))
      .toEqual({ id: 5, documentCode: 'BCP', documentId: 12, date: '2024-06-01', purchaseOrderId: 40, providerId: 60, paymentTypeId: 2, notes: '', pdaNumber: 100, numberCAI: '000-001-11-00000012', valueTotal: 0.3 });
  });

  it('el formulario inicial arranca con la fecha de hoy y sin selecciones', () => {
    expect(emptyForm('2026-11-13')).toMatchObject({ id: 0, documentCode: '', date: '2026-11-13', providerId: 0, paymentTypeId: 0, purchaseOrderId: 0, pdaNumber: 0 });
    expect(emptyLine()).toMatchObject({ idProd: 0, productCode: '', nameProduct: '', qty: 1, price: 0, expenseCtaCode: '', toInventory: false, storeId: 0 });
  });

  it('isProcessed: con número de partida ya no se modifica', () => {
    expect(isProcessed({ pdaNumber: 100028205 })).toBe(true);
    expect(isProcessed({ pdaNumber: 0 })).toBe(false);
    expect(isProcessed({})).toBe(false);
  });

  it('applyAccountToAll cambia la cuenta de todas las líneas sin mutar y no hace nada sin cuenta', () => {
    const lines = [{ id: 1, expenseCtaCode: 'A' }, { id: 2, expenseCtaCode: '' }];
    const result = applyAccountToAll(lines, ' B ');
    expect(result.map((l) => l.expenseCtaCode)).toEqual(['B', 'B']);
    expect(lines[0].expenseCtaCode).toBe('A');
    expect(applyAccountToAll(lines, '')).toBe(lines);
  });
});
