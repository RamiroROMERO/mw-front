// Reporte de ventas (SPEC v2-98-sr). El back decide (`validateSalesReportQuery`): fechas obligatorias, válidas y en orden, rango máximo de 366 días, filtros y
// formato (json o xlsx). Esto solo evita una llamada que ya se sabe rechazada y arma la petición. Los casos son los del back.
import { validateReportRange, isValidCalendarDate } from '@Views/app/inventory/reports/purchaseReport/purchaseReportRules';

export { validateReportRange, isValidCalendarDate };

export const REPORT_BASE_URL = 'billing/reports/sales';
export const PRIVILEGE_COSTS = '99.01.006'; // Ver Costos y Utilidad en Reportes de Ventas (el back decide; el front solo muestra lo que llega).
export const TYPE_DETAIL = 'detail';
export const TYPE_SUMMARY = 'summary';

const text = (value) => String(value ?? '').trim();
const pad = (n) => String(n).padStart(2, '0');
const toText = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Rango por defecto: del primer día del mes a hoy (fecha LOCAL: sin depender de UTC).
export const defaultRange = (now = new Date()) => ({
  startDate: toText(new Date(now.getFullYear(), now.getMonth(), 1)),
  endDate: toText(now)
});

// Un id en 0, vacío o ausente significa "todos" y no viaja; tampoco el producto, el vendedor o "todos" los tipos de venta (3).
const idParam = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? String(n) : null;
};

/**
 * Arma la petición. `request.GET` (json) o `request.GETPdf` (xlsx): GETPdf agrega `?` + `params` a la URL en un GET, así que los parámetros van en `params`
 * y no escritos en la URL (lección de la v2-12-sr). El formulario usa startDate/endDate; el back, dateStart/dateEnd.
 */
export const buildSalesRequest = (type, form = {}, format = 'json') => {
  const params = { dateStart: text(form.startDate), dateEnd: text(form.endDate) };
  const customer = idParam(form.customerId);
  const store = idParam(form.storeId);
  const documentType = Number(form.documentType);
  if (customer) params.customerId = customer;
  if (store) params.storeId = store;
  if (text(form.productCode) !== '' && text(form.productCode) !== '0') params.productCode = text(form.productCode);
  if (text(form.sellerCode) !== '' && text(form.sellerCode) !== '0') params.sellerCode = text(form.sellerCode);
  if (documentType === 1 || documentType === 2) params.documentType = String(documentType);
  if (format === 'xlsx') params.format = 'xlsx';
  return { url: `${REPORT_BASE_URL}/${type}`, params };
};

export const REPORT_TITLES = { detail: 'Reporte General de Ventas', summary: 'Reporte de Ventas Resumido' };
export const reportFileName = (type) => `${REPORT_TITLES[type] || 'Reporte de Ventas'}.xlsx`;

// Columnas de la tabla en pantalla (las mismas del back: salesReportDefinitions). `label` es una clave de traducción.
const date = { field: 'date', label: 'table.column.date', isDate: true };
const num = (field, label) => ({ field, label, isNumber: true });
const DETAIL_COLUMNS = [
  date, { field: 'customerName', label: 'table.column.customer' }, { field: 'number', label: 'table.column.noInvoice' },
  { field: 'productName', label: 'page.purchaseReport.table.column.description' }, { field: 'undOut', label: 'table.column.outputUnit' },
  num('qty', 'table.column.qty'), num('price', 'table.column.price'), num('subtotal', 'table.column.subtotal'), num('discount', 'table.column.discount'),
  num('tax', 'table.column.tax'), num('total', 'table.column.total'), { field: 'storeName', label: 'table.column.store' }
];
const SUMMARY_COLUMNS = [
  date, { field: 'customerName', label: 'table.column.customer' }, { field: 'number', label: 'table.column.noInvoice' },
  num('subtotal', 'table.column.subtotal'), num('discount', 'table.column.discount'), num('tax', 'table.column.tax'), num('total', 'table.column.total')
];
const COST_COLUMNS = [num('costValue', 'table.column.cost'), num('profit', 'input.saleDiff')];

// El back solo devuelve costo y utilidad con el privilegio: el front lo sabe por los TOTALES (una clave `costValue` en la respuesta).
export const hasCosts = (totals) => Boolean(totals) && typeof totals === 'object' && totals.costValue !== undefined;

export const columnsFor = (type, withCosts) => {
  const base = type === TYPE_SUMMARY ? SUMMARY_COLUMNS : DETAIL_COLUMNS;
  return withCosts ? [...base, ...COST_COLUMNS] : base;
};

// La respuesta json del back: { rows, totals }. Cualquier forma rara se normaliza a vacío para que la pantalla nunca reviente.
export const normalizeSalesReport = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: data?.totals && typeof data.totals === 'object' ? data.totals : {}
});

// Dólares a partir del tipo de cambio; sin tipo de cambio válido (0, vacío o negativo) no se divide: 0.
export const toUsd = (value, rate) => {
  const r = Number(rate);
  const v = Number(value);
  if (!Number.isFinite(v) || !Number.isFinite(r) || r <= 0) return 0;
  return v / r;
};
