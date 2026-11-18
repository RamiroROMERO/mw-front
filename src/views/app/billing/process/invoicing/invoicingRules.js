// Reglas de Facturación (revisión de pantalla #8 de Facturación, SPEC v2-68-sr). Son las mismas que valida el back (InvoicingDTO e InvoicingService): el back
// decide y esto solo evita una llamada que ya se sabe rechazada. Los casos son los de modules/billing/invoicing/__tests__ del back.
//
// La pantalla conserva internamente los nombres anteriores del formulario (`documentType`, `documentExo`, `cashierId`, `numcai`, ...). Este archivo es la frontera con
// la API nueva (`/billing/process/invoicing`, nombres nuevos sin alias): `buildInvoicePayload` traduce lo que se envía y `headerFromApi` / `lineFromApi` lo que llega.
import { round5, roundTo } from '../../../inventory/process/purchaseOrders/purchaseOrderRules';

export const MAX_LINES = 500;
export const CONSUMER_CUSTOMER_ID = 1;
export const API_PATH = 'billing/process/invoicing';
export const PRODUCTS_PATH = `${API_PATH}/products`;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const pad = (n) => String(n).padStart(2, '0');
const num = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};
const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';
const truthy = (value) => value === true || value === 1 || value === '1' || value === 'true';
const hasAtMostTwoDecimals = (value) => Math.abs(Math.round(Number(value) * 100) - Number(value) * 100) < 1e-6;

/** Fecha local de hoy (`YYYY-MM-DD`): `toJSON()` usa UTC y adelantaría el día en la noche de Honduras. */
export const localToday = (now = new Date()) => `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

const isRealDay = (text) => {
  if (!DATE.test(text)) return false;
  const [y, m, d] = text.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

/** Valida una línea (mismas reglas del DTO). Devuelve el id de traducción del primer error o `null`. */
export const validateLine = (line) => {
  if (isBlank(line?.productCode)) return 'msg.required.input.codeProduct';
  if (!(num(line?.unitId) > 0)) return 'page.invoicing.error.line.unit';
  if (!(num(line?.qty) > 0) || !hasAtMostTwoDecimals(line.qty) || num(line.qty) > 999999.99) return 'msg.required.input.qty';
  if (!(num(line?.price) > 0)) return 'msg.required.input.price';
  if (!isBlank(line?.discountPercent) && !(num(line.discountPercent) >= 0 && num(line.discountPercent) <= 100)) return 'page.invoicing.error.line.discount';
  if (!isBlank(line?.taxPercent) && !(num(line.taxPercent) >= 0 && num(line.taxPercent) <= 100)) return 'page.invoicing.error.line.tax';
  if (!(num(line?.areaId) > 0)) return 'page.invoicing.error.line.area';
  return null;
};

/**
 * Valida la factura completa antes de llamar al back. Devuelve `{ campo: idDeTraducción }` solo con los campos inválidos.
 * Obligatorios: documento, fecha (válida y no futura), cliente, tipo de venta y al menos una línea; el consumidor final (cliente 1) digita su nombre;
 * el vendedor solo si la empresa maneja vendedores.
 */
export const validateInvoice = (form, details, { hasSellerControl = false, now = new Date() } = {}) => {
  const errors = {};
  if (isBlank(form?.documentCode) || String(form.documentCode) === '0') errors.documentCode = 'msg.required.select.typeDocument';
  const date = String(form?.date || '').slice(0, 10);
  if (!date) errors.date = 'page.common.validation.date';
  else if (!isRealDay(date)) errors.date = 'page.invoicing.error.date.invalid';
  else if (date > localToday(now)) errors.date = 'page.invoicing.error.date.future';
  if (!(num(form?.customerId) > 0)) errors.customerId = 'msg.required.select.customer';
  else if (num(form.customerId) === CONSUMER_CUSTOMER_ID && isBlank(form.customerName)) errors.customerName = 'page.invoicing.error.consumerName';
  if (truthy(form?.documentExo) && isBlank(form?.exonerationOrderNumber)) errors.exonerationOrderNumber = 'page.invoicing.error.exonerationNumber';
  if (![1, 2].includes(num(form?.documentType))) errors.documentType = 'msg.required.select.salesType';
  if (![1, 2].includes(num(form?.currency))) errors.currency = 'msg.required.select.currency';
  if (hasSellerControl && !(num(form?.cashierId) > 0)) errors.cashierId = 'msg.required.select.seller';
  if (!details || details.length === 0) errors.details = 'msg.required.select.product';
  else if (details.length > MAX_LINES) errors.details = 'page.invoicing.error.details.max';
  else {
    const bad = details.map(validateLine).find(Boolean);
    if (bad) errors.details = bad;
  }
  return errors;
};

/** Línea que viaja al back: solo lo que decide el usuario (el back calcula importes, costo, distribución y unidad). */
export const buildLinePayload = (line) => ({
  productCode: String(line.productCode ?? '').trim(),
  unitId: num(line.unitId),
  qty: num(line.qty),
  price: num(line.price),
  discountPercent: num(line.discountPercent),
  taxPercent: isBlank(line.taxPercent) ? undefined : num(line.taxPercent),
  priceType: num(line.typePrice),
  areaId: num(line.areaId),
  storeId: num(line.storeId),
  lotCode: isBlank(line.lotCode) ? '' : String(line.lotCode).trim(),
  expirationDate: isBlank(line.dateOut) ? null : String(line.dateOut).slice(0, 10)
});

/** Cuerpo del `POST` / `PUT`: cabecera con los nombres nuevos y `details`. Sin importes, número fiscal, partida ni usuarios (el back los fija). */
export const buildInvoicePayload = (form, details, { today = localToday() } = {}) => ({
  documentCode: String(form.documentCode ?? '').trim(),
  date: isBlank(form.date) ? today : String(form.date).slice(0, 10),
  customerId: num(form.customerId),
  customerName: String(form.customerName ?? '').trim(),
  customerDNI: String(form.customerDNI ?? '').trim(),
  sellerId: num(form.cashierId),
  saleType: num(form.documentType),
  currency: num(form.currency) || 1,
  isExonerated: truthy(form.documentExo) ? 1 : 0,
  exonerationOrderNumber: truthy(form.documentExo) ? String(form.exonerationOrderNumber ?? '').trim() : '',
  notes: String(form.notes ?? ''),
  details: details.map(buildLinePayload)
});

/** Cabecera que llega del back (nombres nuevos) con los nombres que usa el formulario de la pantalla. */
export const headerFromApi = (header = {}) => ({
  ...header,
  numcai: header.fiscalNumber ?? '',
  cai: header.fiscalCode ?? '',
  documentType: header.saleType,
  typeChange: header.exchangeRate,
  documentExo: truthy(header.isExonerated),
  cashierId: header.sellerId,
  subTotalValue: header.subtotal,
  subtotTaxValue: header.subtotalTaxValue,
  subTotExeValue: header.subtotalExeValue,
  subTotExoValue: header.subtotalExoValue,
  dateOut: header.fiscalLimitDate,
  isDeleted: header.isVoided,
  nulledNotes: header.voidReason
});

/** Línea que llega del back (nombres nuevos) con los nombres que usa el detalle de la pantalla. */
export const lineFromApi = (line = {}) => ({
  id: line.id,
  productCode: line.productCode,
  description: line.productName || '',
  unitId: num(line.unitId),
  unitedOut: line.unitName,
  qty: num(line.qty),
  price: num(line.price),
  subtotal: num(line.subtotal),
  discountPercent: num(line.discountPercent),
  discountValue: num(line.discountValue),
  taxPercent: num(line.taxPercent),
  taxValue: num(line.taxValue),
  subtotTaxValue: num(line.taxValue) > 0 ? num(line.subtotal) : 0,
  subTotExeValue: num(line.taxValue) === 0 ? num(line.subtotal) : 0,
  total: num(line.total),
  areaId: line.areaId,
  storeId: line.storeId,
  unitedCoste: line.unitCost,
  typePrice: line.priceType,
  sellerCode: line.sellerCode,
  qtyDist: line.distributionQty,
  haveComiss: line.hasCommission,
  lotCode: line.lotCode,
  dateOut: line.expirationDate
});

/** Fila del listado paginado: el valor formateado lo agrega la pantalla. */
export const listParams = ({ limit = 100, offset = 0, search = '' } = {}) => {
  const params = { limit, offset };
  if (!isBlank(search)) params.search = String(search).trim();
  return params;
};

// ----- Captura de líneas (SPEC v2-71-sr) -----

/** Precio de la distribución según el tipo de precio elegido (1 mínimo, 2 medio, 3 máximo); sin tipo válido, 0. */
export const priceByType = (product, priceType) => {
  const price = { 1: product?.minPrice, 2: product?.midPrice, 3: product?.maxPrice }[num(priceType)];
  return num(price);
};

/**
 * Valores del formulario de la línea al elegir un producto del buscador. Los precios del buscador ya vienen sin el ISV incluido (los que acepta el guardado sin el
 * permiso de editar precio). El costo y la comisión los fija el back: aquí no se calculan. El área, el almacén y el tipo de precio elegidos arriba se conservan.
 */
export const lineFromProduct = (product, { areaId = 0, storeId = 0, typePrice = 2 } = {}) => {
  const price = priceByType(product, typePrice);
  const taxPercent = num(product?.taxPercent);
  const taxValue = round5(price * (taxPercent > 0 ? taxPercent / 100 : 0));
  return {
    areaId,
    storeId,
    typePrice,
    productCode: product.code,
    description: product.name,
    unitProd: product.unitName,
    unitedOut: product.unitName,
    unitId: num(product.unitId),
    qtyDist: num(product.unitFactor) || 1,
    taxPercent,
    qty: 1,
    priceLocalMin: num(product.minPrice),
    priceLocalMid: num(product.midPrice),
    priceLocalMax: num(product.maxPrice),
    price,
    subtotal: price,
    taxValue,
    total: round5(price + taxValue),
    unitedCoste: 0,
    haveComiss: product.hasCommission ? 1 : 0,
    productType: num(product.kind),
    existQty: num(product.stock),
    requireExpLot: product.requireExpLot ? 1 : 0
  };
};

/** Existencia insuficiente al agregar: solo productos (tipo 1), con el control de almacén y de existencias de la empresa; lo que sale es cantidad x factor de la unidad. */
export const hasStockProblem = ({ productType, qty, qtyDist, existQty }, { hasStoreControl = false, hasStockControl = false } = {}) => (
  hasStoreControl && hasStockControl && num(productType) === 1 && num(existQty) < num(qty) * (num(qtyDist) || 1)
);

/** Lote o vencimiento obligatorio al agregar: la empresa controla la fecha de salida y el producto lo exige. */
export const needsLotOrDate = ({ requireExpLot, lotCode, dateOut }, { hasDateOutControl = false } = {}) => (
  hasDateOutControl && truthy(requireExpLot) && isBlank(lotCode) && isBlank(dateOut)
);

/** Avisos de existencia que devuelve el guardado: un texto por producto (el aviso no bloquea; generar el documento sí). */
export const warningTexts = (warnings = [], format = (item) => `${item.productCode}: ${item.requested} / ${item.available}`) => (
  (Array.isArray(warnings) ? warnings : []).filter((item) => item && item.code === 'stock.insufficient').map(format)
);

// ----- Cargar una cotización u orden de compra de clientes (SPEC v2-71-sr) -----

/** Línea del detalle de una cotización u orden (GET quotes/:id, purchaseOrders/:id) con los nombres del detalle de la pantalla. Se conservan sus precios. */
export const lineFromDocument = (line = {}, { areaId = 0, storeId = 0, sellerCode = '', seed = Date.now() } = {}) => ({
  id: `${seed}-${line.id ?? Math.random()}`,
  productCode: line.productCode,
  description: line.productData?.name || line.productName || '',
  unitId: num(line.unitId),
  unitedOut: line.unitData?.name || '',
  qty: num(line.qty),
  price: num(line.price),
  subtotal: num(line.subtotal),
  discountPercent: num(line.discountPercent),
  discountValue: num(line.discountValue),
  taxPercent: num(line.taxPercent),
  taxValue: num(line.taxValue),
  subtotTaxValue: num(line.taxValue) > 0 ? num(line.subtotal) - num(line.discountValue) : 0,
  subTotExeValue: num(line.taxValue) === 0 ? num(line.subtotal) - num(line.discountValue) : 0,
  total: num(line.total),
  areaId,
  storeId,
  unitedCoste: 0,
  typePrice: num(line.priceType) || 2,
  sellerCode,
  qtyDist: num(line.unitFactor) || 1,
  haveComiss: 0,
  lotCode: line.lotCode || '',
  dateOut: line.expirationDate || null
});

/**
 * Cabecera que se copia al cargar una cotización u orden en una factura nueva: cliente (con su nombre y RTN digitados), vendedor, y de la orden la exoneración con su
 * constancia. Solo trae lo que el documento tiene (no pisa con vacío); la fecha, el documento, el área y el almacén los elige el usuario.
 */
export const headerFromDocument = (document = {}) => {
  const patch = {};
  if (num(document.customerId) > 0) patch.customerId = num(document.customerId);
  if (!isBlank(document.customerName)) patch.customerName = String(document.customerName).trim();
  if (!isBlank(document.customerCode)) patch.customerDNI = String(document.customerCode).trim();
  if (num(document.sellerId) > 0) patch.cashierId = num(document.sellerId);
  if (truthy(document.isExonerated)) {
    patch.documentExo = true;
    patch.exonerationOrderNumber = String(document.exonerationNumber ?? '').trim();
  }
  return patch;
};

/**
 * Totales del formulario a partir de las líneas (nombres del formulario): suma de las líneas con el redondeo a centavos una sola vez al final. Una factura exonerada
 * pasa el gravado a exonerado, sin impuesto (el servidor calcula lo mismo al guardar y esos valores son los que se recargan).
 */
export const totalsFromLines = (lines = [], isExonerated = false) => {
  const sum = (field) => lines.reduce((total, line) => total + num(line[field]), 0);
  const cents = (value) => roundTo(round5(value), 2);
  const taxed = sum('subtotTaxValue');
  const taxes = sum('taxValue');
  const total = sum('total');
  return {
    subTotalValue: cents(sum('subtotal')),
    discountValue: cents(sum('discountValue')),
    subTotExeValue: cents(sum('subTotExeValue')),
    subTotExoValue: isExonerated ? cents(taxed) : 0,
    subtotTaxValue: isExonerated ? 0 : cents(taxed),
    taxValue: isExonerated ? 0 : cents(taxes),
    total: cents(isExonerated ? total - taxes : total)
  };
};

/**
 * Descuento global (SPEC v2-71-sr; "Descuento Global" del POS del legacy): un porcentaje o un valor que se reparte sobre todas las líneas. Por valor el porcentaje
 * es valor / subtotal de las líneas (a 5 decimales), así el descuento total queda en el valor digitado (el legacy lo dividía entre el total con impuesto y quedaba
 * corto). Reemplaza los descuentos que ya tengan las líneas; el servidor vuelve a calcular y validar todo al guardar.
 */
export const GLOBAL_DISCOUNT_PERCENT = 1;
export const GLOBAL_DISCOUNT_VALUE = 2;

export const validateGlobalDiscount = ({ type, value }, lines = []) => {
  const amount = num(value);
  if (lines.length === 0) return 'msg.required.select.product';
  if (!(amount > 0)) return 'page.invoicing.error.globalDiscount.value';
  if (type === GLOBAL_DISCOUNT_PERCENT) return amount > 100 ? 'page.invoicing.error.globalDiscount.percent' : null;
  if (type !== GLOBAL_DISCOUNT_VALUE) return 'page.invoicing.error.globalDiscount.type';
  const subtotal = lines.reduce((sum, line) => sum + num(line.subtotal), 0);
  return amount > subtotal ? 'page.invoicing.error.globalDiscount.exceeds' : null;
};

export const globalDiscountPercent = ({ type, value }, lines = []) => {
  if (type === GLOBAL_DISCOUNT_PERCENT) return num(value);
  const subtotal = lines.reduce((sum, line) => sum + num(line.subtotal), 0);
  return subtotal > 0 ? Math.min(100, round5((num(value) / subtotal) * 100)) : 0;
};

export const applyGlobalDiscount = (lines = [], percent = 0) => lines.map((line) => {
  const subtotal = num(line.subtotal);
  const discountValue = round5((subtotal * num(percent)) / 100);
  const base = round5(subtotal - discountValue);
  const taxValue = round5((base * num(line.taxPercent)) / 100);
  const taxed = num(line.taxPercent) > 0;
  return {
    ...line,
    discountPercent: num(percent),
    discountValue,
    taxValue,
    subtotTaxValue: taxed ? base : 0,
    subTotExeValue: taxed ? 0 : base,
    total: round5(base + taxValue)
  };
});
