// Resumen por producto (SPEC v2-101-sr / v2-102-sr). El back decide (`validateSummaryByProductQuery`): fechas obligatorias, válidas y en orden, rango máximo de 366 días,
// moneda, tipo de producto y formato (json, pdf o xlsx). Esto solo evita una llamada que ya se sabe rechazada y arma la petición. Los casos son los del back.
import { validateReportRange, isValidCalendarDate } from '@Views/app/inventory/reports/purchaseReport/purchaseReportRules';
import { defaultRange } from '@Views/app/billing/reports/salesReport/salesReportRules';

export { validateReportRange, isValidCalendarDate, defaultRange };

export const REPORT_URL = 'billing/reports/summaryByProduct';
export const SETTINGS_URL = `${REPORT_URL}/settings`;
export const REPORT_TITLE = 'Reporte de Ventas por Producto';
export const CURRENCY_LEMPIRAS = 1;
export const CURRENCY_DOLLARS = 2;
export const ITEM_ALL = 0;
export const ITEM_PRODUCTS = 1;
export const ITEM_SERVICES = 2;

const text = (value) => String(value ?? '').trim();

/**
 * Arma la petición. `request.GET` (json) o `request.GETPdf` (pdf o xlsx): GETPdf agrega `?` + `params` a la URL en un GET, así que los parámetros van en `params`
 * y no escritos en la URL (lección de la v2-12-sr). El formulario usa startDate/endDate; el back, dateStart/dateEnd. La moneda Lempiras y el tipo "todos" no viajan.
 */
export const buildSummaryRequest = (form = {}, format = 'json') => {
  const params = { dateStart: text(form.startDate), dateEnd: text(form.endDate) };
  const itemType = Number(form.itemType);
  if (itemType === ITEM_PRODUCTS || itemType === ITEM_SERVICES) params.itemType = String(itemType);
  if (Number(form.currency) === CURRENCY_DOLLARS) params.currency = String(CURRENCY_DOLLARS);
  if (format === 'pdf' || format === 'xlsx') params.format = format;
  return { url: REPORT_URL, params };
};

export const reportFileName = (format) => `${REPORT_TITLE}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

// Columnas de la tabla en pantalla (las mismas del back: summaryByProductDefinitions). `label` es una clave de traducción.
const num = (field, label) => ({ field, label, isNumber: true });
export const COLUMNS = [
  { field: 'productCode', label: 'table.column.productCode' },
  { field: 'productName', label: 'table.column.productName' },
  num('qty', 'table.column.qty'),
  num('subtotal', 'table.column.subtotal'),
  num('discount', 'table.column.discount'),
  num('tax', 'table.column.tax'),
  num('total', 'table.column.total')
];

// La respuesta json del back: { rows, totals }. Cualquier forma rara se normaliza a vacío para que la pantalla nunca reviente.
export const normalizeSummary = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: data?.totals && typeof data.totals === 'object' ? data.totals : {}
});

// La moneda solo se ofrece si la empresa factura en Lempiras y Dólares (`dual_curr`): lo dice `GET summaryByProduct/settings`. Cualquier forma rara cuenta como "no".
export const normalizeSettings = (data) => ({ hasDualCurrency: data?.hasDualCurrency === true });

// Sin facturación dual la moneda es siempre Lempiras, aunque el formulario guarde otro valor.
export const effectiveForm = (form, settings) => (settings?.hasDualCurrency === true ? form : { ...form, currency: CURRENCY_LEMPIRAS });
