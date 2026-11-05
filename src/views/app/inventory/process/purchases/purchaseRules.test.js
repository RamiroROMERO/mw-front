import { describe, it, expect } from 'vitest';
import {
  CASH, CREDIT, validateHeader, validateLine, calculatePurchaseLine, calculateTotals, lastSixAsNumber, isFutureDate,
  resolveDateOut, buildPurchasePayload, buildDetailLine, packFactor, toBaseUnits, formFromSaved, invoiceNumberChanged, lineFromServer, lineFromOrder, headerFromOrder, processOrderLines, buildProcessOrderPayload, lineFromProduct, existenceInStore
} from './purchaseRules';

// Los casos y los números son los de PurchaseDTO.test.js y PurchaseDetailDTO.test.js del back.
const NOW = new Date(2026, 7, 20, 12, 0, 0);
const HEADER = {
  documentCode: 'CPA', date: '2026-08-10', invoiceNumber: '000-001-01-00001234', providerId: 5,
  storeId: 3, paymentTypeId: 2, typeFp: 2, dateOut: '2026-09-10'
};
const LINE = { productCode: 'HPL-00001', qty: 12, price: 25.5, discountPercent: 0, taxPercent: 15, isBonus: 0, isExonerated: 0 };
const without = (data, field) => Object.fromEntries(Object.entries(data).filter(([key]) => key !== field));

describe('validateHeader', () => {
  it('una compra a crédito válida no tiene errores', () => {
    expect(validateHeader(HEADER, NOW)).toEqual({});
  });

  it.each(['documentCode', 'date', 'invoiceNumber', 'providerId', 'storeId', 'paymentTypeId', 'typeFp'])(
    '%s ausente se rechaza',
    (field) => {
      expect(Object.keys(validateHeader(without(HEADER, field), NOW))).toContain(field);
    }
  );

  it.each([['providerId', 0], ['storeId', 0], ['paymentTypeId', -1], ['providerId', 1.5]])('%s = %p no es un id válido', (field, value) => {
    expect(Object.keys(validateHeader({ ...HEADER, [field]: value }, NOW))).toContain(field);
  });

  it('documentCode: 5 caracteres pasa y 6 falla', () => {
    expect(validateHeader({ ...HEADER, documentCode: 'ABCDE' }, NOW).documentCode).toBeUndefined();
    expect(validateHeader({ ...HEADER, documentCode: 'ABCDEF' }, NOW).documentCode).toBeDefined();
  });

  it('una fecha futura se rechaza y la de hoy no', () => {
    expect(validateHeader({ ...HEADER, date: '2026-08-21' }, NOW).date).toBe('msg.purchase.date.future');
    expect(validateHeader({ ...HEADER, date: '2026-08-20', dateOut: '2026-08-20' }, NOW).date).toBeUndefined();
  });

  describe('invoiceNumber', () => {
    it('máximo 40 caracteres', () => {
      expect(validateHeader({ ...HEADER, invoiceNumber: '1'.repeat(40) }, NOW).invoiceNumber).toBeUndefined();
      expect(validateHeader({ ...HEADER, invoiceNumber: '1'.repeat(41) }, NOW).invoiceNumber).toBe('msg.purchase.invoiceNumber.invalid');
    });
    it('los últimos 6 caracteres deben dar un número mayor a 0', () => {
      expect(validateHeader({ ...HEADER, invoiceNumber: '000-001-01-00000000' }, NOW).invoiceNumber).toBeDefined();
      expect(validateHeader({ ...HEADER, invoiceNumber: 'FAC-ABCDEF' }, NOW).invoiceNumber).toBeDefined();
      expect(validateHeader({ ...HEADER, invoiceNumber: '000-001-01-00000001' }, NOW).invoiceNumber).toBeUndefined();
      expect(validateHeader({ ...HEADER, invoiceNumber: '12345' }, NOW).invoiceNumber).toBeUndefined();
    });
    it('solo espacios cuenta como vacío', () => {
      expect(validateHeader({ ...HEADER, invoiceNumber: '   ' }, NOW).invoiceNumber).toBe('msg.purchase.invoiceNumber.required');
    });
  });

  it('el CAI es opcional y máximo 50', () => {
    expect(validateHeader({ ...HEADER, cai: '' }, NOW).cai).toBeUndefined();
    expect(validateHeader({ ...HEADER, cai: 'C'.repeat(50) }, NOW).cai).toBeUndefined();
    expect(validateHeader({ ...HEADER, cai: 'C'.repeat(51) }, NOW).cai).toBeDefined();
  });

  describe('typeFp y dateOut', () => {
    it('solo 1 o 2', () => {
      expect(validateHeader({ ...HEADER, typeFp: 0 }, NOW).typeFp).toBeDefined();
      expect(validateHeader({ ...HEADER, typeFp: 3 }, NOW).typeFp).toBeDefined();
      expect(validateHeader({ ...HEADER, typeFp: '1' }, NOW).typeFp).toBeUndefined();
    });
    it('crédito sin dateOut se rechaza', () => {
      expect(validateHeader(without(HEADER, 'dateOut'), NOW).dateOut).toBe('msg.purchase.dateOut.required');
      expect(validateHeader({ ...HEADER, dateOut: '1900-01-01' }, NOW).dateOut).toBe('msg.purchase.dateOut.required');
    });
    it('crédito con dateOut anterior a la fecha se rechaza y el mismo día pasa', () => {
      expect(validateHeader({ ...HEADER, dateOut: '2026-08-09' }, NOW).dateOut).toBe('msg.purchase.dateOut.range');
      expect(validateHeader({ ...HEADER, dateOut: '2026-08-10' }, NOW).dateOut).toBeUndefined();
    });
    it('contado no exige dateOut', () => {
      expect(validateHeader({ ...without(HEADER, 'dateOut'), typeFp: 1 }, NOW).dateOut).toBeUndefined();
    });
  });

  it('almacén: solo opcional en complementarias y combustible', () => {
    const noStore = without(HEADER, 'storeId');
    expect(validateHeader({ ...noStore, isExpense: 1 }, NOW).storeId).toBeUndefined();
    expect(validateHeader({ ...noStore, doctoComb: true }, NOW).storeId).toBeUndefined();
    expect(validateHeader({ ...noStore, isExpense: 0 }, NOW).storeId).toBeDefined();
  });
});

describe('lastSixAsNumber, isFutureDate y resolveDateOut', () => {
  it('lastSixAsNumber lee los últimos 6 caracteres desde el inicio', () => {
    expect(lastSixAsNumber('000-001-01-00001234')).toBe(1234);
    expect(lastSixAsNumber('FAC-ABCDEF')).toBe(0);
    expect(lastSixAsNumber('')).toBe(0);
  });
  it('isFutureDate compara por texto con la fecha local', () => {
    expect(isFutureDate('2026-08-21', NOW)).toBe(true);
    expect(isFutureDate('2026-08-20', NOW)).toBe(false);
    expect(isFutureDate('', NOW)).toBe(false);
  });
  it('en contado el vencimiento es la fecha; en crédito se respeta', () => {
    expect(resolveDateOut({ typeFp: CASH, date: '2026-08-10', dateOut: '2026-12-31' })).toBe('2026-08-10');
    expect(resolveDateOut({ typeFp: CREDIT, date: '2026-08-10', dateOut: '2026-12-31' })).toBe('2026-12-31');
  });
});

describe('validateLine', () => {
  it('una línea válida no tiene errores', () => {
    expect(validateLine(LINE)).toEqual({});
  });
  it.each(['productCode', 'qty', 'price'])('%s ausente se rechaza', (field) => {
    expect(Object.keys(validateLine(without(LINE, field)))).toContain(field);
  });
  it('productCode: 30 caracteres pasa y 31 falla', () => {
    expect(validateLine({ ...LINE, productCode: 'A'.repeat(30) }).productCode).toBeUndefined();
    expect(validateLine({ ...LINE, productCode: 'A'.repeat(31) }).productCode).toBeDefined();
  });
  it.each([['qty', 0], ['qty', -1], ['price', 0], ['price', -5], ['qty', 'abc']])('%s = %p debe ser mayor a cero', (field, value) => {
    expect(Object.keys(validateLine({ ...LINE, [field]: value }))).toContain(field);
  });
  it('acepta cantidades y precios menores a uno (el hook usaba validInt)', () => {
    expect(validateLine({ ...LINE, qty: 0.5, price: 0.25 })).toEqual({});
    expect(validateLine({ ...LINE, qty: 0.00001, price: 0.00001 })).toEqual({});
  });
  it.each(['discountPercent', 'taxPercent'])('%s: 0 y 100 pasan, -0.01 y 100.01 fallan', (field) => {
    expect(validateLine({ ...LINE, [field]: 0 })[field]).toBeUndefined();
    expect(validateLine({ ...LINE, [field]: 100 })[field]).toBeUndefined();
    expect(validateLine({ ...LINE, [field]: -0.01 })[field]).toBe('msg.purchase.percent.range');
    expect(validateLine({ ...LINE, [field]: 100.01 })[field]).toBe('msg.purchase.percent.range');
  });
  it('lotCode: 20 caracteres pasa y 21 falla', () => {
    expect(validateLine({ ...LINE, lotCode: 'L'.repeat(20) }).lotCode).toBeUndefined();
    expect(validateLine({ ...LINE, lotCode: 'L'.repeat(21) }).lotCode).toBeDefined();
  });
  it('bonificación y exonerada a la vez se rechaza; una sola no', () => {
    expect(validateLine({ ...LINE, isBonus: 1, isExonerated: 1 }).isExonerated).toBe('msg.purchase.line.exclusive');
    expect(validateLine({ ...LINE, isBonus: true, isExonerated: true }).isExonerated).toBeDefined();
    expect(validateLine({ ...LINE, isBonus: 1, isExonerated: 0 })).toEqual({});
    expect(validateLine({ ...LINE, isBonus: 0, isExonerated: 1 })).toEqual({});
  });
});

describe('calculatePurchaseLine', () => {
  it('12 x 25.50 con 15 % de impuesto', () => {
    // subtotal 306; descuento 0; impuesto 306 x 15 / 100 = 45.90; total 351.90
    expect(calculatePurchaseLine(LINE)).toEqual({ subTotal: 306, discount: 0, taxValue: 45.9, total: 351.9, taxPercent: 15 });
  });
  it('con 10 % de descuento el impuesto va sobre lo descontado', () => {
    // 306 - 30.60 = 275.40; impuesto 41.31; total 316.71
    expect(calculatePurchaseLine({ ...LINE, discountPercent: 10 })).toEqual({
      subTotal: 306, discount: 30.6, taxValue: 41.31, total: 316.71, taxPercent: 15
    });
  });
  it('una línea exonerada va con impuesto cero', () => {
    expect(calculatePurchaseLine({ ...LINE, isExonerated: 1 })).toEqual({ subTotal: 306, discount: 0, taxValue: 0, total: 306, taxPercent: 0 });
  });
  it('redondea a 5 decimales sin ruido de coma flotante', () => {
    // 0.1 x 3 = 0.30000000000000004 en coma flotante
    expect(calculatePurchaseLine({ qty: 3, price: 0.1, discountPercent: 0, taxPercent: 0 }).subTotal).toBe(0.3);
  });
});

describe('calculateTotals', () => {
  const lines = [
    { subTotal: 306, discount: 0, taxValue: 45.9, total: 351.9, isBonus: 0, isExonerated: 0 },
    { subTotal: 100, discount: 10, taxValue: 0, total: 90, isBonus: 0, isExonerated: 0 },
    { subTotal: 50, discount: 0, taxValue: 0, total: 50, isBonus: 0, isExonerated: 1 },
    { subTotal: 20, discount: 0, taxValue: 3, total: 23, isBonus: 1, isExonerated: 0 }
  ];
  it('separa gravado, exento y exonerado netos de descuento, y deja la bonificación aparte', () => {
    // gravado 306; exento 100 - 10 = 90; exonerado 50; subtotal 456; descuento 10; impuesto 45.90
    // total 351.90 + 90 + 50 = 491.90; bonificación 23
    expect(calculateTotals(lines)).toEqual({
      valueSubtotal: 456, valueDiscount: 10, valueTax: 45.9, valueExonerated: 50, valueExempt: 90, valueTaxable: 306,
      bonification: 23, valueTotal: 491.9
    });
  });
  it('el flete y otros recargos suman al total', () => {
    expect(calculateTotals(lines, { freight: 8.5, otherCharges: 1.5 }).valueTotal).toBe(501.9);
  });
  it('sin líneas todo es cero', () => {
    expect(calculateTotals([]).valueTotal).toBe(0);
  });
  it('una línea del servidor trae subtotal en minúscula', () => {
    expect(calculateTotals([{ subtotal: 10, discount: 0, taxValue: 0, total: 10 }]).valueSubtotal).toBe(10);
  });
});

describe('payloads: compra completa con details (SPEC v2-22-sr)', () => {
  const FORM = {
    ...HEADER, id: 5, documentId: 7, cai: '', valueSubtotal: 1, valueDiscount: 0, valueExonerated: 0, valueExempt: 1, valueTaxable: 0,
    valueTax: 0, freight: 0, otherCharges: 0, valueTotal: 1, expenseCtaCode: 'X', purchaseOrderId: 0, requestedBy: '', description: '',
    providerType: 1, exemptedCertificate: '', exemptedNumber: '', exemptedRecord: '', importNumberDua: '', importTicket: '',
    importCif: 0, importDai: 0, importSelectiveTax: 0, state: 'Cerrada', forma: 2, pdaNumber: 9
  };
  const SERVER_FIELDS = ['documentId', 'subtotal', 'discount', 'tax', 'total', 'valueExonerated', 'valueExempt', 'valueTaxable', 'state', 'forma', 'pdaNumber', 'expenseCtaCode', 'typeDocto', 'id'];

  it('la cabecera usa los nombres del back y trae las líneas en details', () => {
    const body = buildPurchasePayload(FORM, [LINE]);
    expect(body).toMatchObject({ documentCode: 'CPA', invoiceNumber: '000-001-01-00001234', typeFp: 2, dateOut: '2026-09-10', providerId: 5, storeId: 3 });
    expect(body.details).toHaveLength(1);
  });
  it('no manda lo que decide el back: importes, correlativo, estado, forma ni partida', () => {
    const body = buildPurchasePayload(FORM, [LINE]);
    SERVER_FIELDS.forEach((key) => expect(body[key]).toBeUndefined());
  });
  it('documentCode solo va en el alta', () => {
    expect(buildPurchasePayload(FORM, [LINE], { isNew: false }).documentCode).toBeUndefined();
    expect(buildPurchasePayload(FORM, [LINE], { isNew: true }).documentCode).toBe('CPA');
  });
  it('en contado el vencimiento va igual a la fecha', () => {
    expect(buildPurchasePayload({ ...FORM, typeFp: '1', dateOut: '2026-12-31' }, [LINE])).toMatchObject({ typeFp: 1, dateOut: '2026-08-10' });
  });
  it('sin líneas, details es una lista vacía', () => {
    expect(buildPurchasePayload(FORM, []).details).toEqual([]);
    expect(buildPurchasePayload(FORM).details).toEqual([]);
  });
});

describe('línea de details', () => {
  const FULL = { ...LINE, subTotal: 306, discount: 0, taxValue: 45.9, total: 351.9, dateOut: '', lotCode: 'L1', idTemp: 1, nameProduct: 'X' };

  it('manda solo lo que decide el cliente: cantidad y costo base, porcentajes, banderas, lote y vencimiento', () => {
    expect(buildDetailLine(FULL)).toEqual({
      productCode: 'HPL-00001', qty: 12, price: 25.5, discountPercent: 0, taxPercent: 15, isBonus: 0, isExonerated: 0, lotCode: 'L1', dateOut: '1900-01-01'
    });
  });
  it('no manda los importes que calcula el back ni nombres viejos', () => {
    const body = buildDetailLine(FULL);
    ['subTotal', 'subtotal', 'discount', 'taxValue', 'tax', 'total', 'purchaseId', 'expirationDate', 'packQty', 'nameProduct', 'idTemp'].forEach((key) => expect(body[key]).toBeUndefined());
  });
  it('un vencimiento digitado se conserva', () => {
    expect(buildDetailLine({ ...FULL, dateOut: '2027-01-31' }).dateOut).toBe('2027-01-31');
  });
  it('orderDetailId solo viaja cuando es una línea de orden', () => {
    expect(buildDetailLine({ ...FULL, orderDetailId: 301 }).orderDetailId).toBe(301);
    expect(buildDetailLine({ ...FULL, orderDetailId: 0 }).orderDetailId).toBeUndefined();
    expect(buildDetailLine(FULL).orderDetailId).toBeUndefined();
  });
  it('banderas como true, 1 o "1" se mandan como 1', () => {
    expect(buildDetailLine({ ...FULL, isBonus: true, isExonerated: '1' })).toMatchObject({ isBonus: 1, isExonerated: 1 });
  });
});

describe('factor de empaque: Cant (ENT) y Precio (ENT) a unidad base', () => {
  it('36 x 9 = 324 en HPL-00227 y el costo se divide entre el factor', () => {
    // 36 empaques a 90.00 el empaque, factor 9: 324 unidades a 10.00 la unidad (el subtotal no cambia: 3240)
    expect(toBaseUnits({ qty: 36, price: 90, packQty: 9 })).toEqual({ qty: 324, price: 10 });
    expect(buildDetailLine({ ...LINE, qty: 36, price: 90, packQty: 9 })).toMatchObject({ qty: 324, price: 10 });
  });
  it('sin factor, o con un factor no positivo o inválido, no hay conversión', () => {
    [undefined, null, 0, -3, 'x', ''].forEach((packQty) => {
      expect(packFactor({ packQty })).toBe(1);
      expect(toBaseUnits({ qty: 5, price: 2, packQty })).toEqual({ qty: 5, price: 2 });
    });
  });
  it('el factor puede venir como texto de la API', () => {
    expect(packFactor({ packQty: '12.00000' })).toBe(12);
  });
  it('el costo base se redondea a 5 decimales sin ruido de coma flotante', () => {
    expect(toBaseUnits({ qty: 3, price: 10, packQty: 3 })).toEqual({ qty: 9, price: 3.33333 });
    expect(toBaseUnits({ qty: 0.1, price: 1, packQty: 3 }).qty).toBe(0.3);
  });
  it('el subtotal de pantalla (ENT) y el de lo enviado (base) coinciden cuando la división es exacta', () => {
    const shown = calculatePurchaseLine({ qty: 36, price: 90, discountPercent: 0, taxPercent: 15 });
    const base = toBaseUnits({ qty: 36, price: 90, packQty: 9 });
    expect(calculatePurchaseLine({ ...base, discountPercent: 0, taxPercent: 15 })).toEqual(shown);
  });
});

describe('lo que decide el back al guardar', () => {
  const SAVED = {
    id: 99, documentId: 1412, invoiceNumber: '000-001-01-00001234-1', subtotal: 306, discount: 0, valueExempt: 0, valueExonerated: 0,
    valueTaxable: 306, tax: 45.9, freight: 0, otherCharges: 0, total: 351.9, bonification: 0
  };
  it('formFromSaved lleva id, correlativo, N° de factura final y totales al formulario', () => {
    expect(formFromSaved(SAVED)).toEqual({
      id: 99, documentId: 1412, invoiceNumber: '000-001-01-00001234-1', valueSubtotal: 306, valueDiscount: 0, valueExempt: 0,
      valueExonerated: 0, valueTaxable: 306, valueTax: 45.9, freight: 0, otherCharges: 0, valueTotal: 351.9, bonification: 0
    });
  });
  it('invoiceNumberChanged avisa cuando el back agregó un sufijo y no cuando es el mismo número', () => {
    expect(invoiceNumberChanged('000-001-01-00001234', '000-001-01-00001234-1')).toBe(true);
    expect(invoiceNumberChanged('000-001-01-00001234 ', '000-001-01-00001234')).toBe(false);
    expect(invoiceNumberChanged('', 'X')).toBe(false);
    expect(invoiceNumberChanged('X', '')).toBe(false);
  });
});

describe('detalle que devuelve el back', () => {
  it('lineFromServer arma subTotal, el nombre del producto, limpia el vencimiento vacío y no convierte (ya es unidad base)', () => {
    const line = lineFromServer({ subtotal: 10, productData: { name: 'Jabón' }, dateOut: '1900-01-01' });
    expect(line).toMatchObject({ subTotal: 10, nameProduct: 'Jabón', dateOut: '', packQty: 1 });
  });
  it('un vencimiento real se conserva', () => {
    expect(lineFromServer({ subtotal: 1, dateOut: '2027-01-31' }).dateOut).toBe('2027-01-31');
  });
});

describe('orden de compra importada', () => {
  const ROW = {
    id: 301, productCode: 'HPL-00001', productData: { name: 'Jabón', packId: 4 }, undId: 4, conversionFactor: '9.00000', qty: '10', price: '5',
    subTotal: '50', percentDiscount: '10', discount: '5', percentTax: '15', tax: '6.75', total: '51.75', isExonerated: 0
  };
  it('lineFromOrder traduce los nombres de la orden a los de la compra y guarda la línea de la orden', () => {
    const line = lineFromOrder(ROW, 2);
    expect(line).toMatchObject({
      orderDetailId: 301, productCode: 'HPL-00001', nameProduct: 'Jabón', qty: 10, price: 5, subTotal: 50, discountPercent: 10, discount: 5,
      taxPercent: 15, taxValue: 6.75, total: 51.75, isBonus: 0, isExonerated: 0, lotCode: '', dateOut: ''
    });
    expect(typeof line.idTemp).toBe('number');
  });
  it('si la unidad de la línea es la de empaque del producto, la línea lleva el factor de la orden y se convierte al guardar', () => {
    const line = lineFromOrder(ROW);
    expect(line.packQty).toBe(9);
    expect(buildDetailLine(line)).toMatchObject({ qty: 90, price: 0.55556, orderDetailId: 301 });
  });
  it.each([
    ['otra unidad que la de empaque', { undId: 5 }],
    ['producto sin empaque', { productData: { name: 'X' } }],
    ['factor 0', { conversionFactor: 0 }],
    ['sin unidad', { undId: 0 }]
  ])('%s: sin conversión', (_label, extra) => {
    const line = lineFromOrder({ ...ROW, ...extra });
    expect(line.packQty).toBe(1);
    expect(buildDetailLine(line)).toMatchObject({ qty: 10, price: 5 });
  });
  it('una línea exonerada de la orden queda exonerada', () => {
    expect(lineFromOrder({ productCode: 'X', isExonerated: 1 }).isExonerated).toBe(1);
  });
  it('headerFromOrder solo toma la orden y el solicitante (no el id ni la fecha de la compra)', () => {
    expect(headerFromOrder({ id: 12, applicantName: 'Ana', date: '2026-01-01', valueTotal: 99 })).toEqual({ purchaseOrderId: 12, requestedBy: 'Ana' });
  });
});

describe('"Procesar" una orden: una sola llamada', () => {
  const PRODUCTS = [
    { id: 2165, productCode: 'EQL-00052', qtyRec: 4, qty: 10, qtyReceived: 0, price: 12.5, discountPercent: 0, taxPercent: 15, isExonerated: false },
    { id: 2166, productCode: 'EQL-00053', qtyRec: 0, qty: 15, qtyReceived: 0, price: 3, discountPercent: 0, taxPercent: 0, isExonerated: true },
    { id: 2167, productCode: '10000103', qtyRec: 2.5, qty: 10, qtyReceived: 1, price: 8, discountPercent: 10, taxPercent: 0, isExonerated: true }
  ];
  const FORM = {
    documentCode: 'CPA', date: '2026-10-20', providerId: 45, cai: '', invoiceNumber: '000-001-01-00001234', typeFp: 2, dateOut: '2026-11-20',
    paymentTypeId: 2, freight: 0, otherCharges: 5, purchaseOrderId: 801, requestedBy: 'Ana', description: 'D', providerType: 1,
    subTotal: 99, tax: 99, total: 99, documentId: 7, expenseCtaCode: 'X'
  };

  it('solo van las líneas con algo recibido, con lo recibido ahora (no lo pedido) y su línea de la orden', () => {
    expect(processOrderLines(PRODUCTS)).toEqual([
      { productCode: 'EQL-00052', qty: 4, price: 12.5, discountPercent: 0, taxPercent: 15, isBonus: 0, isExonerated: 0, lotCode: '', dateOut: '1900-01-01', orderDetailId: 2165 },
      { productCode: '10000103', qty: 2.5, price: 8, discountPercent: 10, taxPercent: 0, isBonus: 0, isExonerated: 1, lotCode: '', dateOut: '1900-01-01', orderDetailId: 2167 }
    ]);
  });
  it('sin nada recibido, o sin lista, no hay líneas', () => {
    expect(processOrderLines([{ ...PRODUCTS[0], qtyRec: 0 }])).toEqual([]);
    expect(processOrderLines(undefined)).toEqual([]);
  });
  it('la compra nace de una orden: fromOrderProcess, sin almacén y con los datos de la orden', () => {
    const body = buildProcessOrderPayload(FORM, PRODUCTS);
    expect(body).toMatchObject({
      fromOrderProcess: true, storeId: 0, purchaseOrderId: 801, documentCode: 'CPA', providerId: 45, typeFp: 2, dateOut: '2026-11-20',
      freight: 0, otherCharges: 5, requestedBy: 'Ana'
    });
    expect(body.details).toHaveLength(2);
  });
  it('no manda importes, correlativo ni cuenta de gasto: los decide el back', () => {
    const body = buildProcessOrderPayload(FORM, PRODUCTS);
    ['subtotal', 'subTotal', 'tax', 'total', 'discount', 'documentId', 'valueTaxable', 'valueExempt', 'valueExonerated', 'state', 'forma', 'expenseCtaCode'].forEach(
      (key) => expect(body[key]).toBeUndefined()
    );
  });
  it('en contado el vencimiento es la fecha de la factura', () => {
    expect(buildProcessOrderPayload({ ...FORM, typeFp: 1, dateOut: '2027-01-01' }, PRODUCTS).dateOut).toBe('2026-10-20');
  });
});

describe('línea nueva desde el catálogo de productos (modal Buscar)', () => {
  const PRODUCT = {
    id: 670, code: 'HPL-00227', name: 'FRANELA MEMBER SELECTIONS MULTIUSOS', chargesTax: 1, percentTax: '15.00', inputUnit: 'UNIDAD',
    packQty: '36.00000', costValue: '13.06670'
  };
  it('llena código, nombre, impuesto, unidad, factor de empaque y costo anterior; arranca con cantidad 1 y precio 0', () => {
    expect(lineFromProduct(PRODUCT)).toEqual({
      idProd: 0, productCode: 'HPL-00227', nameProduct: 'FRANELA MEMBER SELECTIONS MULTIUSOS', qty: 1, price: 0, discountPercent: 0, taxPercent: 15,
      isBonus: 0, isExonerated: 0, lotCode: '', dateOut: '', nameUM: 'UNIDAD', packQty: 36, previousCost: 13.0667, currentExistence: 0
    });
  });
  it('un producto que no cobra impuesto arranca con 0 % aunque tenga porcentaje', () => {
    expect(lineFromProduct({ ...PRODUCT, chargesTax: 0 }).taxPercent).toBe(0);
  });
  it('sin factor de empaque válido no hay conversión', () => {
    expect(lineFromProduct({ ...PRODUCT, packQty: '0.00000' }).packQty).toBe(1);
    expect(lineFromProduct({ ...PRODUCT, packQty: undefined }).packQty).toBe(1);
  });
  it('la línea resultante convierte a unidad base al enviar (2 paquetes de 36 = 72 unidades)', () => {
    expect(buildDetailLine({ ...lineFromProduct(PRODUCT), qty: 2, price: 360 })).toMatchObject({ productCode: 'HPL-00227', qty: 72, price: 10 });
  });
});

describe('existencia del almacén (getStock)', () => {
  const STOCK = { applies: true, rows: [{ storeId: 1, storeName: 'SPS', qty: 16 }, { storeId: 11, storeName: 'TEGU', qty: 10.5 }], total: 26.5 };
  it('toma la del almacén de la compra', () => {
    expect(existenceInStore(STOCK, 1)).toBe(16);
    expect(existenceInStore(STOCK, '11')).toBe(10.5);
  });
  it('sin fila para el almacén, un servicio o una respuesta vacía es 0', () => {
    expect(existenceInStore(STOCK, 87)).toBe(0);
    expect(existenceInStore({ applies: false, rows: [], total: 0 }, 1)).toBe(0);
    expect(existenceInStore(undefined, 1)).toBe(0);
    expect(existenceInStore({ applies: true }, 1)).toBe(0);
  });
});
