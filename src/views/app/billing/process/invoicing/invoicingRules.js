// Reglas de Facturación (revisión de pantalla #8 de Facturación, SPEC v2-68-sr). Son las mismas que valida el back (InvoicingDTO e InvoicingService): el back
// decide y esto solo evita una llamada que ya se sabe rechazada. Los casos son los de modules/billing/invoicing/__tests__ del back.
//
// La pantalla conserva internamente los nombres anteriores del formulario (`documentType`, `documentExo`, `cashierId`, `numcai`, ...). Este archivo es la frontera con
// la API nueva (`/billing/process/invoicing`, nombres nuevos sin alias): `buildInvoicePayload` traduce lo que se envía y `headerFromApi` / `lineFromApi` lo que llega.
export const MAX_LINES = 500;
export const CONSUMER_CUSTOMER_ID = 1;
export const API_PATH = 'billing/process/invoicing';

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
