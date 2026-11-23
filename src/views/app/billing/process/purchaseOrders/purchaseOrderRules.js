// Reglas de Órdenes de compra de clientes (revisión de pantalla #7 de Facturación, SPEC v2-67-sr). Son las de Cotizaciones (`../quotes/quoteRules`) más las propias de la
// orden: cliente CREADO obligatorio, forma de pago, teléfono opcional y orden exonerada (constancia obligatoria). Las mismas que valida el back (PurchaseOrderDTO y
// PurchaseOrderService): el back decide y esto solo evita una llamada que ya se sabe rechazada.
import {
  MAX, MAX_LINES, calculateTotals, formFromQuote, isQuoteLocked, isWithinLimit, localToday, validateLine, buildLinePayload
} from '../quotes/quoteRules';

export { MAX, calculateTotals, isQuoteLocked, lineFromApi, lineFromProduct, productFromSearchRow, calculateLine, priceChoices, discountPercentFromValue } from '../quotes/quoteRules';

export const MAX_EXONERATION = 50;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

const isRealDay = (text) => {
  if (!DATE.test(text)) return false;
  const [y, m, d] = text.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

export const buildInitialForm = () => ({
  id: 0, date: '', customerId: 0, customerCode: '', customerName: '', customerPhone: '', customerEmail: '', customerAddress: '', sellerId: 0, storeId: 0, paymentTypeId: 0,
  deliveryTime: '', paymentTerms: '', notes: '', subtotal: 0, discountValue: 0, exoneratedValue: 0, exemptValue: 0, taxedValue: 0, taxValue: 0, total: 0, quoteId: 0,
  isExonerated: false, exonerationNumber: '', status: true
});

/** Normaliza una orden leída del back al formulario: sin `null`, fecha como texto y la casilla de exonerada como booleano. */
export const formFromOrder = (order) => {
  const base = formFromQuote(order);
  const initial = buildInitialForm();
  const form = { ...initial };
  Object.keys(initial).forEach((key) => {
    const value = order?.[key] ?? base[key];
    form[key] = value === undefined || value === null ? initial[key] : value;
  });
  form.date = String(form.date || '').slice(0, 10);
  form.isExonerated = Number(form.isExonerated) === 1 || form.isExonerated === true;
  return form;
};

/**
 * Valida la orden completa antes de llamar al back. Devuelve `{ campo: idDeTraducción }` solo con los campos inválidos.
 * Obligatorios: fecha (válida, no futura y dentro del límite de edición), vendedor, **cliente creado**, nombre y RTN/ID, forma de pago, la constancia si la orden
 * es exonerada y al menos una línea. El teléfono, el correo y la dirección son opcionales.
 */
export const validateOrder = (form, details, { timeQuote = 0, now = new Date() } = {}) => {
  const errors = {};
  const date = String(form?.date || '').slice(0, 10);
  if (!date) errors.date = 'page.common.validation.date';
  else if (!isRealDay(date)) errors.date = 'page.quotes.error.date.invalid';
  else if (date > localToday(now)) errors.date = 'page.quotes.error.date.future';
  else if (!isWithinLimit(date, timeQuote, now)) errors.date = 'page.billingPurchaseOrders.error.date.expired';
  if (!(Number(form?.sellerId) > 0)) errors.sellerId = 'msg.required.select.seller';
  if (!(Number(form?.customerId) > 0)) errors.customerId = 'page.billingPurchaseOrders.error.customer.required';
  if (isBlank(form?.customerName)) errors.customerName = 'page.common.validation.customerName';
  else if (String(form.customerName).trim().length > MAX.customerName) errors.customerName = 'page.quotes.error.customerName.max';
  if (isBlank(form?.customerCode)) errors.customerCode = 'page.quotes.error.customerCode.required';
  else if (String(form.customerCode).trim().length > MAX.customerCode) errors.customerCode = 'page.quotes.error.customerCode.max';
  if (!isBlank(form?.customerPhone) && String(form.customerPhone).trim().length > MAX.customerPhone) errors.customerPhone = 'page.quotes.error.customerPhone.max';
  if (!isBlank(form?.customerEmail) && !EMAIL.test(String(form.customerEmail).trim())) errors.customerEmail = 'page.quotes.error.customerEmail.invalid';
  if (!(Number(form?.paymentTypeId) > 0)) errors.paymentTypeId = 'msg.required.select.paymentType';
  if (form?.isExonerated) {
    if (isBlank(form?.exonerationNumber)) errors.exonerationNumber = 'page.billingPurchaseOrders.error.exonerationNumber.required';
    else if (String(form.exonerationNumber).trim().length > MAX_EXONERATION) errors.exonerationNumber = 'page.billingPurchaseOrders.error.exonerationNumber.max';
  }
  if (!details || details.length === 0) errors.details = 'page.quotes.error.details.required';
  else if (details.length > MAX_LINES) errors.details = 'page.quotes.error.details.max';
  else {
    const bad = details.map(validateLine).find(Boolean);
    if (bad) errors.details = bad;
  }
  return errors;
};

/** Cuerpo del `POST`/`PUT`: encabezado con los campos del cliente, la forma de pago, la exoneración y la cotización de origen, más `details`. Sin importes ni nombre de la forma de pago. */
export const buildOrderPayload = (form, details) => {
  const exonerated = Boolean(form.isExonerated);
  return {
    date: String(form.date || '').slice(0, 10),
    customerId: Number(form.customerId) || 0,
    customerCode: String(form.customerCode ?? '').trim(),
    customerName: String(form.customerName ?? '').trim(),
    customerPhone: String(form.customerPhone ?? '').trim(),
    customerEmail: String(form.customerEmail ?? '').trim(),
    customerAddress: String(form.customerAddress ?? '').trim(),
    sellerId: Number(form.sellerId) || 0,
    storeId: Number(form.storeId) || 0,
    paymentTypeId: Number(form.paymentTypeId) || 0,
    deliveryTime: String(form.deliveryTime ?? '').trim(),
    notes: String(form.notes ?? '').trim(),
    quoteId: Number(form.quoteId) || 0,
    isExonerated: exonerated,
    exonerationNumber: exonerated ? String(form.exonerationNumber ?? '').trim() : '',
    details: (details || []).map(buildLinePayload)
  };
};

/**
 * Totales de la pantalla: los mismos del back. Con la casilla de exonerada la base de las líneas con impuesto pasa a "exonerado" y el impuesto queda en 0.
 * `lines` son las filas de la tabla (con `taxPercent` del producto); el impuesto de cada línea se recalcula en 0 si la orden es exonerada.
 */
export const orderTotals = (lines, isExonerated) => calculateTotals(
  (lines || []).map((line) => (isExonerated ? { ...line, taxValue: 0, total: Number(line.subtotal || 0) - Number(line.discountValue || 0) } : line)),
  { isExonerated: Boolean(isExonerated) }
);
