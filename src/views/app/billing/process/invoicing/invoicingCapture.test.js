import { describe, expect, test } from 'vitest';
import {
  applyGlobalDiscount, buildInvoicePayload, GLOBAL_DISCOUNT_PERCENT, GLOBAL_DISCOUNT_VALUE, globalDiscountPercent, hasStockProblem, headerFromDocument, lineFromDocument, lineFromProduct, needsLotOrDate, priceByType, totalsFromLines, validateGlobalDiscount, validateInvoice, validateLine, warningTexts
} from './invoicingRules';

// SPEC v2-71-sr: captura de líneas y carga de una cotización u orden de compra de clientes.
const NOW = new Date(2026, 10, 18, 12, 0, 0);
const LINE = { productCode: 'A', unitId: 6, qty: 2, price: 100, areaId: 2, discountPercent: 0, typePrice: 2, storeId: 1 };
const FORM = { documentCode: 'FAC', date: '2026-11-10', customerId: 5, customerName: 'Ana', customerDNI: '0801', documentType: 1, currency: 1, cashierId: 13, documentExo: false, notes: '' };
const PRODUCT = { code: 'HPL-00001', name: 'Jarabe', unitId: 6, unitName: 'CAJA', unitFactor: 12, taxPercent: 15, minPrice: 90, midPrice: 100, maxPrice: 110, stock: 7.5, hasCommission: true, kind: 1, requireExpLot: false };

describe('priceByType', () => {
  test.each([[1, 90], [2, 100], [3, 110], [0, 0], [4, 0], [undefined, 0]])('tipo %p -> %p', (type, price) => expect(priceByType(PRODUCT, type)).toBe(price));
});

describe('lineFromProduct', () => {
  test('toma el precio medio por defecto, calcula el impuesto y conserva área, almacén y tipo de precio', () => {
    const line = lineFromProduct(PRODUCT, { areaId: 2, storeId: 1, typePrice: 2 });
    expect(line).toMatchObject({ areaId: 2, storeId: 1, typePrice: 2, productCode: 'HPL-00001', description: 'Jarabe', unitId: 6, unitedOut: 'CAJA', qtyDist: 12, qty: 1, price: 100, subtotal: 100, taxValue: 15, total: 115 });
  });

  test('el precio sigue el tipo elegido', () => {
    expect(lineFromProduct(PRODUCT, { typePrice: 1 })).toMatchObject({ price: 90, taxValue: 13.5, total: 103.5 });
    expect(lineFromProduct(PRODUCT, { typePrice: 3 })).toMatchObject({ price: 110, total: 126.5 });
  });

  test('un producto sin impuesto no suma ISV', () => {
    expect(lineFromProduct({ ...PRODUCT, taxPercent: 0 }, { typePrice: 2 })).toMatchObject({ taxValue: 0, total: 100 });
  });

  test('el costo no viene del cliente (queda en 0), la comisión y la existencia salen del producto', () => {
    expect(lineFromProduct(PRODUCT)).toMatchObject({ unitedCoste: 0, haveComiss: 1, existQty: 7.5, productType: 1, requireExpLot: 0 });
    expect(lineFromProduct({ ...PRODUCT, hasCommission: false, requireExpLot: true })).toMatchObject({ haveComiss: 0, requireExpLot: 1 });
  });

  test('el factor vacío o 0 cuenta como 1', () => {
    expect(lineFromProduct({ ...PRODUCT, unitFactor: 0 }).qtyDist).toBe(1);
  });

  test('la línea que sale es válida para el guardado (unidad, cantidad, precio, área)', () => {
    expect(validateLine(lineFromProduct(PRODUCT, { areaId: 2, storeId: 1 }))).toBeNull();
  });
});

describe('hasStockProblem', () => {
  const on = { hasStoreControl: true, hasStockControl: true };
  test('compara contra cantidad x factor: 1 caja de 12 con existencia 7.5 no alcanza', () => {
    expect(hasStockProblem({ productType: 1, qty: 1, qtyDist: 12, existQty: 7.5 }, on)).toBe(true);
    expect(hasStockProblem({ productType: 1, qty: 1, qtyDist: 12, existQty: 12 }, on)).toBe(false);
  });
  test('sin controles de la empresa, o un servicio, no hay problema', () => {
    expect(hasStockProblem({ productType: 1, qty: 99, qtyDist: 1, existQty: 0 }, { hasStoreControl: true, hasStockControl: false })).toBe(false);
    expect(hasStockProblem({ productType: 2, qty: 99, qtyDist: 1, existQty: 0 }, on)).toBe(false);
  });
  test('el factor vacío cuenta como 1', () => {
    expect(hasStockProblem({ productType: 1, qty: 3, qtyDist: 0, existQty: 2 }, on)).toBe(true);
  });
});

describe('needsLotOrDate', () => {
  const on = { hasDateOutControl: true };
  test('exige lote o fecha solo con control de la empresa y producto que lo pide', () => {
    expect(needsLotOrDate({ requireExpLot: 1, lotCode: '', dateOut: '' }, on)).toBe(true);
    expect(needsLotOrDate({ requireExpLot: 1, lotCode: 'L1', dateOut: '' }, on)).toBe(false);
    expect(needsLotOrDate({ requireExpLot: 1, lotCode: '', dateOut: '2027-01-31' }, on)).toBe(false);
    expect(needsLotOrDate({ requireExpLot: 1, lotCode: '  ', dateOut: null }, on)).toBe(true);
    expect(needsLotOrDate({ requireExpLot: 0, lotCode: '', dateOut: '' }, on)).toBe(false);
    expect(needsLotOrDate({ requireExpLot: 1, lotCode: '', dateOut: '' }, { hasDateOutControl: false })).toBe(false);
  });
});

describe('warningTexts', () => {
  test('un texto por aviso de existencia y nada con otra cosa', () => {
    const warnings = [{ code: 'stock.insufficient', productCode: 'A', requested: 24, available: 15 }, { code: 'otro' }, null];
    expect(warningTexts(warnings)).toEqual(['A: 24 / 15']);
    expect(warningTexts(undefined)).toEqual([]);
    expect(warningTexts(warnings, (item) => item.productCode)).toEqual(['A']);
  });
});

describe('lineFromDocument', () => {
  const QUOTE_LINE = { id: 9, productCode: 'A', productData: { name: 'Jarabe' }, unitData: { name: 'CAJA' }, unitId: 6, qty: '2.00', price: '100.00000', subtotal: '200', discountPercent: '10', discountValue: '20', taxPercent: '15', taxValue: '27', total: '207', priceType: 1, unitFactor: '12', lotCode: 'L1', expirationDate: '2027-01-31' };

  test('copia las cantidades y los precios del documento (no los vigentes) con el área y el almacén de la factura', () => {
    const line = lineFromDocument(QUOTE_LINE, { areaId: 2, storeId: 1, sellerCode: 'V1', seed: 'x' });
    expect(line).toMatchObject({
      id: 'x-9', productCode: 'A', description: 'Jarabe', unitId: 6, unitedOut: 'CAJA', qty: 2, price: 100, discountPercent: 10, taxPercent: 15, taxValue: 27, total: 207,
      areaId: 2, storeId: 1, sellerCode: 'V1', typePrice: 1, qtyDist: 12, lotCode: 'L1', dateOut: '2027-01-31', unitedCoste: 0, haveComiss: 0
    });
  });

  test('reparte gravado y exento sobre la base ya descontada', () => {
    expect(lineFromDocument(QUOTE_LINE)).toMatchObject({ subtotTaxValue: 180, subTotExeValue: 0 });
    expect(lineFromDocument({ ...QUOTE_LINE, taxValue: 0 })).toMatchObject({ subtotTaxValue: 0, subTotExeValue: 180 });
  });

  test('sin tipo de precio usa el medio y sin factor 1', () => {
    expect(lineFromDocument({ ...QUOTE_LINE, priceType: 0, unitFactor: 0 })).toMatchObject({ typePrice: 2, qtyDist: 1 });
  });

  test('la línea cargada es válida para el guardado', () => {
    expect(validateLine(lineFromDocument(QUOTE_LINE, { areaId: 2, storeId: 1 }))).toBeNull();
  });
});

describe('headerFromDocument', () => {
  test('cliente, vendedor y, de la orden, la exoneración con su constancia', () => {
    expect(headerFromDocument({ customerId: 5, customerName: ' Ana ', customerCode: '0801', sellerId: 13, isExonerated: 1, exonerationNumber: ' EX-1 ' })).toEqual({
      customerId: 5, customerName: 'Ana', customerDNI: '0801', cashierId: 13, documentExo: true, exonerationOrderNumber: 'EX-1'
    });
  });

  test('no pisa con vacío: un cliente 0, nombre vacío o sin vendedor no cambian nada', () => {
    expect(headerFromDocument({ customerId: 0, customerName: '', customerCode: '', sellerId: 0, isExonerated: 0 })).toEqual({});
    expect(headerFromDocument(undefined)).toEqual({});
  });
});

describe('totalsFromLines', () => {
  // 207 (200 - 20 + 27 de ISV) gravado sobre 180, y una línea exenta de 50
  const LINES = [
    { subtotal: 200, discountValue: 20, subtotTaxValue: 180, subTotExeValue: 0, taxValue: 27, total: 207 },
    { subtotal: 50, discountValue: 0, subtotTaxValue: 0, subTotExeValue: 50, taxValue: 0, total: 50 }
  ];

  test('suma las líneas', () => {
    expect(totalsFromLines(LINES)).toEqual({ subTotalValue: 250, discountValue: 20, subTotExeValue: 50, subTotExoValue: 0, subtotTaxValue: 180, taxValue: 27, total: 257 });
  });

  test('exonerada: el gravado pasa a exonerado y el total no lleva impuesto', () => {
    expect(totalsFromLines(LINES, true)).toEqual({ subTotalValue: 250, discountValue: 20, subTotExeValue: 50, subTotExoValue: 180, subtotTaxValue: 0, taxValue: 0, total: 230 });
  });

  test('redondea una sola vez al final (tres líneas de 0.335 dan 1.01, no 1.02)', () => {
    const line = { subtotal: 0.335, discountValue: 0, subtotTaxValue: 0, subTotExeValue: 0.335, taxValue: 0, total: 0.335 };
    expect(totalsFromLines([line, line, line]).total).toBe(1.01);
  });

  test('sin líneas todo es 0', () => {
    expect(totalsFromLines([])).toEqual({ subTotalValue: 0, discountValue: 0, subTotExeValue: 0, subTotExoValue: 0, subtotTaxValue: 0, taxValue: 0, total: 0 });
  });
});

describe('exoneración en la factura', () => {
  test('exonerada exige la constancia y la manda; sin exoneración va vacía', () => {
    expect(validateInvoice({ ...FORM, documentExo: true, exonerationOrderNumber: '' }, [LINE], { now: NOW }).exonerationOrderNumber).toBe('page.invoicing.error.exonerationNumber');
    expect(validateInvoice({ ...FORM, documentExo: true, exonerationOrderNumber: 'EX-1' }, [LINE], { now: NOW })).toEqual({});
    expect(buildInvoicePayload({ ...FORM, documentExo: true, exonerationOrderNumber: ' EX-1 ' }, [LINE])).toMatchObject({ isExonerated: 1, exonerationOrderNumber: 'EX-1' });
    expect(buildInvoicePayload({ ...FORM, documentExo: false, exonerationOrderNumber: 'EX-1' }, [LINE])).toMatchObject({ isExonerated: 0, exonerationOrderNumber: '' });
  });
});

describe('descuento global', () => {
  const lines = [
    { subtotal: 200, taxPercent: 15, discountPercent: 5, discountValue: 10, taxValue: 28.5, total: 218.5 },
    { subtotal: 100, taxPercent: 0, discountPercent: 0, discountValue: 0, taxValue: 0, total: 100 }
  ];

  test('por porcentaje se aplica igual a todas las líneas y reemplaza el descuento anterior', () => {
    const out = applyGlobalDiscount(lines, 10);
    expect(out[0]).toMatchObject({ discountPercent: 10, discountValue: 20, taxValue: 27, subtotTaxValue: 180, subTotExeValue: 0, total: 207 });
    expect(out[1]).toMatchObject({ discountPercent: 10, discountValue: 10, taxValue: 0, subtotTaxValue: 0, subTotExeValue: 90, total: 90 });
  });

  test('por valor el porcentaje es valor / subtotal y el descuento total queda en el valor', () => {
    const percent = globalDiscountPercent({ type: GLOBAL_DISCOUNT_VALUE, value: 30 }, lines);
    expect(percent).toBe(10);
    const out = applyGlobalDiscount(lines, globalDiscountPercent({ type: GLOBAL_DISCOUNT_VALUE, value: 50 }, lines));
    expect(totalsFromLines(out).discountValue).toBe(50);
  });

  test('un valor con porcentaje periódico igual suma el valor al centavo', () => {
    const three = [100, 100, 100].map((subtotal) => ({ subtotal, taxPercent: 15, discountValue: 0, taxValue: 15, total: 115 }));
    const out = applyGlobalDiscount(three, globalDiscountPercent({ type: GLOBAL_DISCOUNT_VALUE, value: 100 }, three));
    expect(totalsFromLines(out).discountValue).toBe(100);
  });

  test('el porcentaje por tipo Porcentaje es el digitado', () => {
    expect(globalDiscountPercent({ type: GLOBAL_DISCOUNT_PERCENT, value: '12.5' }, lines)).toBe(12.5);
  });

  test.each([
    [{ type: 1, value: 0 }, 'page.invoicing.error.globalDiscount.value'],
    [{ type: 1, value: 101 }, 'page.invoicing.error.globalDiscount.percent'],
    [{ type: 2, value: 301 }, 'page.invoicing.error.globalDiscount.exceeds'],
    [{ type: 3, value: 5 }, 'page.invoicing.error.globalDiscount.type']
  ])('rechaza %j', (input, id) => expect(validateGlobalDiscount(input, lines)).toBe(id));

  test('sin líneas se rechaza y un descuento válido no tiene error', () => {
    expect(validateGlobalDiscount({ type: 1, value: 5 }, [])).toBe('msg.required.select.product');
    expect(validateGlobalDiscount({ type: 1, value: 100 }, lines)).toBeNull();
    expect(validateGlobalDiscount({ type: 2, value: 300 }, lines)).toBeNull();
  });
});
