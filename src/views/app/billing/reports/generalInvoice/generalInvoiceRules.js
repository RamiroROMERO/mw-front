// Factura general (SPEC v2-99-sr / v2-100-sr). El back decide (`validateGeneralInvoiceQuery`): fechas obligatorias, válidas y en orden, rango máximo de 366 días,
// filtros, moneda y formato (json, pdf o xlsx). Esto solo evita una llamada que ya se sabe rechazada y arma la petición. Los casos son los del back.
import { validateReportRange, isValidCalendarDate } from '@Views/app/inventory/reports/purchaseReport/purchaseReportRules';
import { defaultRange } from '@Views/app/billing/reports/salesReport/salesReportRules';

export { validateReportRange, isValidCalendarDate, defaultRange };

export const REPORT_URL = 'billing/reports/generalInvoice';
export const REPORT_TITLE = 'Reporte de Ventas';
export const CURRENCY_LEMPIRAS = 1;
export const CURRENCY_DOLLARS = 2;

const text = (value) => String(value ?? '').trim();

// Un cliente en 0, vacío o inválido significa "todos" y no viaja; el tipo de venta 3 ("todas") tampoco; la moneda 1 (Lempiras) es la del back por defecto.
const idParam = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? String(n) : null;
};

/**
 * Arma la petición. `request.GET` (json) o `request.GETPdf` (pdf o xlsx): GETPdf agrega `?` + `params` a la URL en un GET, así que los parámetros van en `params`
 * y no escritos en la URL (lección de la v2-12-sr). El formulario usa startDate/endDate; el back, dateStart/dateEnd.
 */
export const buildGeneralInvoiceRequest = (form = {}, format = 'json') => {
  const params = { dateStart: text(form.startDate), dateEnd: text(form.endDate) };
  const customer = idParam(form.customerId);
  const saleType = Number(form.typeDocto);
  if (customer) params.customerId = customer;
  if (saleType === 1 || saleType === 2) params.saleType = String(saleType);
  if (Number(form.currency) === CURRENCY_DOLLARS) params.currency = String(CURRENCY_DOLLARS);
  if (format === 'pdf' || format === 'xlsx') params.format = format;
  return { url: REPORT_URL, params };
};

export const reportFileName = (format) => `${REPORT_TITLE}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

// Columnas de la tabla en pantalla (las mismas del back: generalInvoiceDefinitions). `label` es una clave de traducción.
const num = (field, label) => ({ field, label, isNumber: true });
export const COLUMNS = [
  { field: 'date', label: 'table.column.date', isDate: true },
  { field: 'number', label: 'table.column.noInvoice' },
  { field: 'customerCode', label: 'table.column.rtn' },
  { field: 'customerName', label: 'table.column.customer' },
  num('subtotal', 'table.column.subtotal'),
  num('discount', 'table.column.discount'),
  num('taxedValue', 'table.column.taxed'),
  num('exemptValue', 'table.column.exempt'),
  num('exoneratedValue', 'table.column.exonerated'),
  num('tax', 'table.column.tax'),
  num('total', 'table.column.total')
];

// La respuesta json del back: { rows, totals }. Cualquier forma rara se normaliza a vacío para que la pantalla nunca reviente.
export const normalizeGeneralInvoice = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: data?.totals && typeof data.totals === 'object' ? data.totals : {}
});

// La moneda solo se ofrece si la empresa factura en Lempiras y Dólares (`dual_curr`): lo dice `GET generalInvoice/settings`. Cualquier forma rara cuenta como "no".
export const SETTINGS_URL = `${REPORT_URL}/settings`;
export const normalizeSettings = (data) => ({ hasDualCurrency: data?.hasDualCurrency === true });

// Sin facturación dual la moneda es siempre Lempiras, aunque el formulario guarde otro valor.
export const effectiveForm = (form, settings) => (settings?.hasDualCurrency === true ? form : { ...form, currency: CURRENCY_LEMPIRAS });
