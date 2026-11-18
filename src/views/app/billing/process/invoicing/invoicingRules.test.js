import { describe, expect, test } from 'vitest';
import {
  buildInvoicePayload, buildLinePayload, headerFromApi, lineFromApi, listParams, localToday, validateInvoice, validateLine
} from './invoicingRules';

// Mismos casos que modules/billing/invoicing/__tests__ del back (InvoicingDTO).
const NOW = new Date(2026, 10, 18, 12, 0, 0); // 2026-11-18
const LINE = { productCode: 'A', unitId: 6, qty: 2, price: 100, areaId: 2, discountPercent: 0, typePrice: 2, storeId: 1 };
const FORM = { documentCode: 'FAC', date: '2026-11-10', customerId: 5, customerName: 'Ana', customerDNI: '0801', documentType: 1, currency: 1, cashierId: 13, documentExo: false, notes: '' };

describe('localToday', () => {
  test('usa la fecha local y no la UTC', () => expect(localToday(new Date(2026, 10, 18, 23, 30))).toBe('2026-11-18'));
});

describe('validateLine', () => {
  test('una línea válida', () => expect(validateLine(LINE)).toBeNull());
  test.each([
    [{ productCode: '' }, 'msg.required.input.codeProduct'],
    [{ unitId: 0 }, 'page.invoicing.error.line.unit'],
    [{ qty: 0 }, 'msg.required.input.qty'],
    [{ qty: 1.234 }, 'msg.required.input.qty'],
    [{ price: 0 }, 'msg.required.input.price'],
    [{ discountPercent: 101 }, 'page.invoicing.error.line.discount'],
    [{ taxPercent: -1 }, 'page.invoicing.error.line.tax'],
    [{ areaId: 0 }, 'page.invoicing.error.line.area']
  ])('rechaza %j', (patch, id) => expect(validateLine({ ...LINE, ...patch })).toBe(id));
});

describe('validateInvoice', () => {
  const run = (patch = {}, details = [LINE], options = {}) => validateInvoice({ ...FORM, ...patch }, details, { now: NOW, ...options });
  test('una factura válida no tiene errores', () => expect(run()).toEqual({}));
  test.each([
    [{ documentCode: '0' }, 'documentCode'], [{ documentCode: '' }, 'documentCode'], [{ date: '' }, 'date'], [{ date: '2026-02-30' }, 'date'],
    [{ date: '2026-11-19' }, 'date'], [{ customerId: 0 }, 'customerId'], [{ documentType: 3 }, 'documentType'], [{ currency: 5 }, 'currency']
  ])('rechaza %j en %s', (patch, field) => expect(run(patch)[field]).toBeDefined());
  test('hoy sí es válido', () => expect(run({ date: '2026-11-18' })).toEqual({}));
  test('el consumidor final (cliente 1) debe digitar el nombre', () => {
    expect(run({ customerId: 1, customerName: '' }).customerName).toBeDefined();
    expect(run({ customerId: 1, customerName: 'Pedro' })).toEqual({});
  });
  test('el vendedor solo es obligatorio si la empresa maneja vendedores', () => {
    expect(run({ cashierId: 0 }, [LINE], { hasSellerControl: true }).cashierId).toBeDefined();
    expect(run({ cashierId: 0 }, [LINE], { hasSellerControl: false })).toEqual({});
  });
  test('sin líneas o con más de 500 se rechaza', () => {
    expect(run({}, []).details).toBe('msg.required.select.product');
    expect(run({}, Array(501).fill(LINE)).details).toBe('page.invoicing.error.details.max');
  });
  test('una línea inválida se reporta en details', () => expect(run({}, [{ ...LINE, areaId: 0 }]).details).toBe('page.invoicing.error.line.area'));
});

describe('buildInvoicePayload', () => {
  test('cabecera con los nombres nuevos y sin importes, número fiscal ni usuarios', () => {
    const payload = buildInvoicePayload({ ...FORM, total: 999, subTotalValue: 9, numcai: 'X', documentId: 7, id: 3 }, [LINE]);
    expect(Object.keys(payload).sort()).toEqual(['currency', 'customerDNI', 'customerId', 'customerName', 'date', 'details', 'documentCode', 'exonerationOrderNumber', 'isExonerated', 'notes', 'saleType', 'sellerId'].sort());
    expect(payload).toMatchObject({ saleType: 1, sellerId: 13, isExonerated: 0, currency: 1 });
  });
  test('isExonerated se normaliza y la fecha vacía toma hoy', () => {
    expect(buildInvoicePayload({ ...FORM, documentExo: 'true', date: '' }, [LINE], { today: '2026-11-18' })).toMatchObject({ isExonerated: 1, date: '2026-11-18' });
  });
  test('la línea solo manda lo que decide el usuario', () => {
    const line = buildLinePayload({ ...LINE, total: 1, unitedCoste: 5, qtyDist: 3, unitedOut: 'X', dateOut: '2026-11-20T00:00:00', taxPercent: '' });
    expect(Object.keys(line).sort()).toEqual(['areaId', 'discountPercent', 'expirationDate', 'lotCode', 'price', 'priceType', 'productCode', 'qty', 'storeId', 'taxPercent', 'unitId'].sort());
    expect(line).toMatchObject({ expirationDate: '2026-11-20', priceType: 2, taxPercent: undefined });
  });
});

describe('traducción de lo que llega del back', () => {
  test('headerFromApi devuelve los nombres que usa el formulario', () => {
    const header = headerFromApi({ id: 7, fiscalNumber: '001', fiscalCode: 'CAI', saleType: 2, exchangeRate: '1.0000', isExonerated: 1, sellerId: 13, subtotal: '200.00', subtotalTaxValue: '180', subtotalExeValue: '20', subtotalExoValue: '0', isVoided: 0, voidReason: '' });
    expect(header).toMatchObject({ id: 7, numcai: '001', cai: 'CAI', documentType: 2, typeChange: '1.0000', documentExo: true, cashierId: 13, subTotalValue: '200.00', subtotTaxValue: '180', subTotExeValue: '20', subTotExoValue: '0', isDeleted: 0 });
  });
  test('lineFromApi usa los nombres del detalle y reparte gravado y exento', () => {
    const taxed = lineFromApi({ id: 1, productCode: 'A', productName: 'Jarabe', unitId: 6, unitName: 'CAJA', qty: '2.00000', price: '100', subtotal: '200', taxValue: '30', total: '230', unitCost: '60', distributionQty: '12', priceType: 2, expirationDate: '2026-12-01' });
    expect(taxed).toMatchObject({ description: 'Jarabe', unitId: 6, unitedOut: 'CAJA', unitedCoste: '60', qtyDist: '12', typePrice: 2, dateOut: '2026-12-01', subtotTaxValue: 200, subTotExeValue: 0 });
    expect(lineFromApi({ subtotal: '50', taxValue: '0' })).toMatchObject({ subtotTaxValue: 0, subTotExeValue: 50 });
  });
  test('una línea cuya unidad ya no existe llega con unitId 0 y se rechaza al guardar', () => {
    expect(validateLine(lineFromApi({ productCode: 'A', unitName: 'VIEJA', qty: 1, price: 10, areaId: 1 }))).toBe('page.invoicing.error.line.unit');
  });
});

describe('listParams', () => {
  test('paginación y búsqueda', () => {
    expect(listParams()).toEqual({ limit: 100, offset: 0 });
    expect(listParams({ search: ' ana ', offset: 100 })).toEqual({ limit: 100, offset: 100, search: 'ana' });
  });
});
