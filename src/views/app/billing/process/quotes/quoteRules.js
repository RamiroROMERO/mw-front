// Reglas de Cotizaciones (revisión de pantalla #6 de Facturación, SPEC v2-66-sr). Son las mismas que valida el back (QuoteDTO, quoteRules y
// QuoteService): el back es quien decide y esto solo evita una llamada que ya se sabe rechazada, o un trabajo de edición que al final fallaría
// (la cotización vencida se avisa al cargarla). Los números y casos son los de modules/billing/quotes/__tests__ del back.
import { roundTo, round5 } from '../../../inventory/process/purchaseOrders/purchaseOrderRules';

export const MAX_LINES = 500;
export const MAX = { customerCode: 20, customerName: 120, customerPhone: 40, customerEmail: 100, deliveryTime: 50, paymentTerms: 50, notes: 130, lotCode: 50 };
export const PRICE_TYPES = [1, 2, 3];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const pad = (n) => String(n).padStart(2, '0');
const num = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};
const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

/** Fecha local de hoy (`YYYY-MM-DD`): `toJSON()` usa UTC y adelantaría el día en la noche de Honduras. */
export const localToday = (now = new Date()) => `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

const isRealDay = (text) => {
  if (!DATE.test(text)) return false;
  const [y, m, d] = text.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

/** Primera fecha que todavía se puede editar: hoy - `timeQuote` días. `null` si no hay límite (0 o vacío). */
export const limitDate = (timeQuote, now = new Date()) => {
  const days = Math.trunc(num(timeQuote));
  if (days <= 0) return null;
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
  return `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(from.getDate())}`;
};

/** true si la fecha cae dentro del límite de edición (inclusive). Sin límite, siempre. */
export const isWithinLimit = (date, timeQuote, now = new Date()) => {
  const limit = limitDate(timeQuote, now);
  if (!limit) return true;
  const day = String(date || '').slice(0, 10);
  return DATE.test(day) && day >= limit;
};

/** Una cotización guardada es de solo lectura cuando su fecha es anterior al límite (el back rechaza editarla y eliminarla). */
export const isQuoteLocked = (quote, timeQuote, now = new Date()) => Boolean(quote?.id) && !isWithinLimit(quote.date, timeQuote, now);

/** Precio sin impuesto cuando el precio del producto lo incluye: precio / (1 + %ISV/100) (la pantalla anterior hacía `precio / 1 + %`). */
export const priceWithoutTax = (price, { includesTax, taxPercent }) => (
  includesTax && num(taxPercent) > 0 ? round5(num(price) / (1 + num(taxPercent) / 100)) : round5(price)
);

/** Valores de una línea (fórmula del legacy, a 5 decimales): subtotal = cant x precio; descuento = subtotal x %; ISV = (subtotal - desc) x %; total. */
export const calculateLine = ({ qty, price, discountPercent, taxPercent }) => {
  const subtotal = round5(num(qty) * num(price));
  const discountValue = round5(subtotal * num(discountPercent) / 100);
  const taxValue = round5((subtotal - discountValue) * num(taxPercent) / 100);
  return { subtotal, discountValue, taxValue, total: round5(subtotal - discountValue + taxValue) };
};

/** Descuento por valor (F2 del legacy): el valor digitado se convierte a porcentaje del subtotal, a 2 decimales; nunca pasa de 100. */
export const discountPercentFromValue = (value, subtotal) => {
  const base = num(subtotal);
  if (base <= 0 || num(value) <= 0) return 0;
  return Math.min(100, roundTo((num(value) / base) * 100, 2));
};

const units = (value) => Math.round(round5(value) * 1e5);
const money = (cents) => roundTo(cents / 1e5, 2);

/** Totales de la cabecera: suma de las líneas con el redondeo a centavos UNA vez al final. Gravado = base de las líneas con impuesto; exento = las demás. */
export const calculateTotals = (lines) => {
  const sum = { subtotal: 0, discountValue: 0, taxValue: 0, total: 0, taxed: 0, exempt: 0 };
  (lines || []).forEach((line) => {
    sum.subtotal += units(line.subtotal);
    sum.discountValue += units(line.discountValue);
    sum.taxValue += units(line.taxValue);
    sum.total += units(line.total);
    const base = units(round5(num(line.subtotal) - num(line.discountValue)));
    if (num(line.taxValue) !== 0) sum.taxed += base; else sum.exempt += base;
  });
  return {
    subtotal: money(sum.subtotal),
    discountValue: money(sum.discountValue),
    taxValue: money(sum.taxValue),
    total: money(sum.total),
    taxedValue: money(sum.taxed),
    exemptValue: money(sum.exempt),
    exoneratedValue: 0
  };
};

const hasAtMostTwoDecimals = (value) => Math.abs(Math.round(Number(value) * 100) - Number(value) * 100) < 1e-6;

/** Valida una línea (mismas reglas del DTO). Devuelve el id de traducción del primer error o `null`. */
export const validateLine = (line) => {
  if (isBlank(line?.productCode)) return 'page.quotes.error.line.product';
  if (!(Number(line?.unitId) > 0)) return 'page.quotes.error.line.unit';
  if (!(num(line?.qty) > 0) || !hasAtMostTwoDecimals(line.qty) || num(line.qty) > 999999.99) return 'page.quotes.error.line.qty';
  if (!(num(line?.price) > 0)) return 'page.quotes.error.line.price';
  if (!isBlank(line?.discountPercent) && !(num(line.discountPercent) >= 0 && num(line.discountPercent) <= 100)) return 'page.quotes.error.line.discount';
  if (!isBlank(line?.taxPercent) && !(num(line.taxPercent) >= 0 && num(line.taxPercent) <= 100)) return 'page.quotes.error.line.tax';
  return null;
};

/**
 * Valida la cotización completa antes de llamar al back. Devuelve `{ field: idDeTraducción }` solo con los campos inválidos.
 * Obligatorios: fecha (válida, no futura y dentro del límite de edición), vendedor, nombre, RTN/ID y teléfono del cliente (sin validar contra
 * clientes existentes: una cotización puede ser para cualquier persona) y al menos una línea.
 */
export const validateQuote = (form, details, { timeQuote = 0, now = new Date() } = {}) => {
  const errors = {};
  const date = String(form?.date || '').slice(0, 10);
  if (!date) errors.date = 'page.common.validation.date';
  else if (!isRealDay(date)) errors.date = 'page.quotes.error.date.invalid';
  else if (date > localToday(now)) errors.date = 'page.quotes.error.date.future';
  else if (!isWithinLimit(date, timeQuote, now)) errors.date = 'page.quotes.error.date.expired';
  if (!(Number(form?.sellerId) > 0)) errors.sellerId = 'msg.required.select.seller';
  if (isBlank(form?.customerName)) errors.customerName = 'page.common.validation.customerName';
  else if (String(form.customerName).trim().length > MAX.customerName) errors.customerName = 'page.quotes.error.customerName.max';
  if (isBlank(form?.customerCode)) errors.customerCode = 'page.quotes.error.customerCode.required';
  else if (String(form.customerCode).trim().length > MAX.customerCode) errors.customerCode = 'page.quotes.error.customerCode.max';
  if (isBlank(form?.customerPhone)) errors.customerPhone = 'page.common.validation.phone';
  else if (String(form.customerPhone).trim().length > MAX.customerPhone) errors.customerPhone = 'page.quotes.error.customerPhone.max';
  if (!isBlank(form?.customerEmail) && !EMAIL.test(String(form.customerEmail).trim())) errors.customerEmail = 'page.quotes.error.customerEmail.invalid';
  if (!details || details.length === 0) errors.details = 'page.quotes.error.details.required';
  else if (details.length > MAX_LINES) errors.details = 'page.quotes.error.details.max';
  else {
    const bad = details.map(validateLine).find(Boolean);
    if (bad) errors.details = bad;
  }
  return errors;
};

/** Línea que viaja al back: solo lo que decide el usuario (el back calcula subtotal, descuento, impuesto y total). */
export const buildLinePayload = (line) => ({
  productCode: String(line.productCode ?? '').trim(),
  unitId: Number(line.unitId),
  qty: Number(line.qty),
  price: Number(line.price),
  discountPercent: num(line.discountPercent),
  taxPercent: isBlank(line.taxPercent) ? undefined : Number(line.taxPercent),
  priceType: Number(line.priceType) || 2,
  tempCode: line.tempCode || '',
  lotCode: line.lotCode || '',
  expirationDate: line.expirationDate ? String(line.expirationDate).slice(0, 10) : null
});

/** Cuerpo del `POST`/`PUT`: encabezado con los campos del cliente y `details`. Sin importes, estado, empresa ni usuarios. */
export const buildQuotePayload = (form, details) => ({
  date: String(form.date || '').slice(0, 10),
  customerId: Number(form.customerId) || 0,
  customerCode: String(form.customerCode ?? '').trim(),
  customerName: String(form.customerName ?? '').trim(),
  customerPhone: String(form.customerPhone ?? '').trim(),
  customerEmail: String(form.customerEmail ?? '').trim(),
  customerAddress: String(form.customerAddress ?? '').trim(),
  sellerId: Number(form.sellerId) || 0,
  storeId: Number(form.storeId) || 0,
  deliveryTime: String(form.deliveryTime ?? '').trim(),
  paymentTerms: String(form.paymentTerms ?? '').trim(),
  notes: String(form.notes ?? '').trim(),
  details: (details || []).map(buildLinePayload)
});

export const buildInitialForm = () => ({
  id: 0, date: '', customerId: 0, customerCode: '', customerName: '', customerPhone: '', customerEmail: '', customerAddress: '', sellerId: 0, storeId: 0,
  deliveryTime: '', paymentTerms: '', notes: '', subtotal: 0, discountValue: 0, exoneratedValue: 0, exemptValue: 0, taxedValue: 0, taxValue: 0, total: 0, status: true
});

/** Normaliza una cotización leída del back al formulario: sin `null` (React avisa de un `value` nulo) y con la fecha como texto `YYYY-MM-DD`. */
export const formFromQuote = (quote) => {
  const initial = buildInitialForm();
  const form = { ...initial };
  Object.keys(initial).forEach((key) => {
    const value = quote?.[key];
    form[key] = value === undefined || value === null ? initial[key] : value;
  });
  form.date = String(form.date || '').slice(0, 10);
  return form;
};

/** Línea del back a la fila de la tabla: nombre del producto y de la unidad, números reales y clave temporal estable para quitarla. */
export const lineFromApi = (line, index = 0) => ({
  ...line,
  tempCode: line.tempCode || `L${line.id ?? index}`,
  productName: line.productData?.name || '',
  unitProd: line.unitData?.name || '',
  qty: num(line.qty),
  price: num(line.price),
  subtotal: num(line.subtotal),
  discountPercent: num(line.discountPercent),
  discountValue: num(line.discountValue),
  taxPercent: num(line.taxPercent),
  // impuesto del producto (para alternar la línea exenta): el de la línea si tiene; una línea ya exenta no lo conoce y no se puede volver a gravar
  productTax: num(line.taxPercent),
  taxValue: num(line.taxValue),
  total: num(line.total)
});

/**
 * Línea nueva a partir de un producto del selector (distribución con sus tres precios). El precio inicial es el precio medio, ya sin el ISV
 * si el producto lo incluye; el impuesto es el del producto. Los precios del producto viajan en la línea solo para mostrarlos (el back los
 * vuelve a leer de la distribución).
 */
export const lineFromProduct = (product, tempCode) => {
  const taxPercent = num(product.percentTax);
  const price = priceWithoutTax(product.med, { includesTax: Boolean(product.includeTaxPrice), taxPercent });
  return {
    tempCode,
    productCode: product.productCode,
    productName: product.productName,
    unitId: product.undoutId,
    unitProd: product.undoutName,
    unitFactor: product.valChange,
    productTax: taxPercent,
    price,
    qty: 1,
    discountPercent: 0,
    taxPercent,
    priceType: 2,
    stock: product.stock,
    minPrice: product.min,
    midPrice: product.med,
    maxPrice: product.max,
    ...calculateLine({ qty: 1, price, discountPercent: 0, taxPercent })
  };
};

/**
 * Qué puede hacer el usuario con el precio de una línea: sin el permiso del perfil solo elige uno de los tres precios del producto
 * (mínimo, medio o máximo, ya sin el ISV incluido); con el permiso lo digita libremente.
 */
export const priceChoices = (line) => {
  const options = { includesTax: Boolean(line.includeTaxPrice), taxPercent: line.taxPercent };
  return [line.min ?? line.minPrice, line.med ?? line.midPrice, line.max ?? line.maxPrice]
    .filter((value) => num(value) > 0)
    .map((value) => priceWithoutTax(value, options));
};
