// Reporte de cajas (SPEC v2-107-sr / v2-108-sr). El back decide (`validateCashReportQuery`): fechas obligatorias, válidas y en orden, rango máximo de 366 días, ids de caja,
// cajero y forma de pago (0 = todos), agrupación de los cobros, casillas del resumen y formato (json, pdf o xlsx). Esto solo evita una llamada que ya se sabe rechazada y arma
// la petición. Los casos son los del back.
import { validateReportRange, isValidCalendarDate } from '@Views/app/inventory/reports/purchaseReport/purchaseReportRules';
import { defaultRange } from '@Views/app/billing/reports/salesReport/salesReportRules';

export { validateReportRange, isValidCalendarDate, defaultRange };

export const REPORT_URL = 'billing/reports/cashReport';
export const FILTERS_URL = `${REPORT_URL}/filters`;
export const ROUTE_PAYMENTS = 'payments';
export const ROUTE_SUMMARY = 'summary';
export const ROUTE_CLOSES = 'closes';
export const ROUTE_TIPS = 'tips';
// El `RadioGroup` compara ids numéricos: el formulario guarda 0, 1 o 2 y el back recibe none, cashier o paymentType.
export const GROUP_NONE = 0;
export const GROUP_CASHIER = 1;
export const GROUP_PAYMENT_TYPE = 2;
export const groupName = (value) => ({ [GROUP_CASHIER]: 'cashier', [GROUP_PAYMENT_TYPE]: 'paymentType' })[Number(value)] || 'none';

const text = (value) => String(value ?? '').trim();
// Un id en 0, vacío o ausente significa "todos" y no viaja.
const idParam = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? String(n) : null;
};
const flag = (value) => (Number(value) === 1 || value === true ? 1 : 0);

// El resumen exige al menos una agrupación: sin ella se marca y no llama al back. Devuelve `{}` si es válido.
export const validateSummaryFlags = (form = {}) =>
  (flag(form.byCash) || flag(form.byCashier) || flag(form.byPaymentType) ? {} : { summary: 'page.boxesReport.msg.summaryDimension' });

/**
 * Arma la petición de una ruta del reporte. `request.GET` (json) o `request.GETPdf` (pdf o xlsx): GETPdf agrega `?` + `params` a la URL en un GET, así que los parámetros van en
 * `params` y no escritos en la URL (lección de la v2-12-sr). El formulario usa startDate/endDate; el back, dateStart/dateEnd. Las propinas solo usan las fechas; los cierres no
 * usan la forma de pago.
 */
export const buildCashRequest = (route, form = {}, format = 'json') => {
  const params = { dateStart: text(form.startDate), dateEnd: text(form.endDate) };
  if (route !== ROUTE_TIPS) {
    const cash = idParam(form.cashId);
    const cashier = idParam(form.cashierId);
    if (cash) params.cashId = cash;
    if (cashier) params.cashierId = cashier;
    const paymentType = idParam(form.paymentTypeId);
    if (paymentType && route !== ROUTE_CLOSES) params.paymentTypeId = paymentType;
  }
  if (route === ROUTE_PAYMENTS && groupName(form.groupBy) !== 'none') params.groupBy = groupName(form.groupBy);
  if (route === ROUTE_SUMMARY) {
    params.byCash = String(flag(form.byCash));
    params.byCashier = String(flag(form.byCashier));
    params.byPaymentType = String(flag(form.byPaymentType));
  }
  if (format === 'pdf' || format === 'xlsx') params.format = format;
  return { url: `${REPORT_URL}/${route}`, params };
};

// Título del archivo descargado: el mismo que arma el back (cashReportDefinitions).
export const reportTitle = (route, form = {}) => {
  if (route === ROUTE_SUMMARY) return 'Resumen de Cobros en Caja';
  if (route === ROUTE_CLOSES) return 'Resumen de Cierres de Caja';
  if (route === ROUTE_TIPS) return 'Reporte de Propinas';
  if (groupName(form.groupBy) === 'cashier') return 'Reporte de Cobros por Cajero';
  if (groupName(form.groupBy) === 'paymentType') return 'Reporte de Cobros en Caja por Forma de Pago';
  return 'Reporte General de Cobros en Caja';
};
export const reportFileName = (route, form, format) => `${reportTitle(route, form)}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

// Columnas de las tablas en pantalla (las mismas del back: cashReportDefinitions). `label` es una clave de traducción.
const num = (field, label) => ({ field, label, isNumber: true });
export const PAYMENT_COLUMNS = [
  { field: 'date', label: 'table.column.date', isDate: true }, { field: 'number', label: 'table.column.noInvoice' }, { field: 'customerCode', label: 'table.column.rtn' },
  { field: 'customerName', label: 'table.column.customer' }, { field: 'cashName', label: 'table.column.cashName' }, { field: 'cashierName', label: 'table.column.cashierName' },
  { field: 'paymentTypeName', label: 'table.column.methodPayment' }, num('total', 'table.column.value')
];
export const CLOSE_COLUMNS = [
  { field: 'cashierName', label: 'table.column.cashierName' }, { field: 'date', label: 'table.column.date', isDate: true }, { field: 'cashName', label: 'table.column.cashName' },
  num('collected', 'page.boxesReport.table.paymentTypeTotal'), num('expenses', 'page.boxesReport.table.expenseValue'), num('net', 'table.column.value'),
  num('invoiced', 'page.boxesReport.table.totalInvoiced'), num('cashValue', 'page.boxesReport.table.cashValue')
];
export const TIP_COLUMNS = [
  { field: 'tipName', label: 'page.boxesReport.table.tipName' }, { field: 'date', label: 'table.column.date', isDate: true }, { field: 'number', label: 'table.column.noInvoice' },
  { field: 'customerName', label: 'table.column.customer' }, num('total', 'table.column.value'), num('tipValue', 'page.boxesReport.table.tipValue')
];
// El resumen muestra la columna de cada dimensión elegida y el total.
export const summaryColumns = (form = {}) => [
  ...(flag(form.byCash) ? [{ field: 'cashName', label: 'table.column.cashName' }] : []),
  ...(flag(form.byCashier) ? [{ field: 'cashierName', label: 'table.column.cashierName' }] : []),
  ...(flag(form.byPaymentType) ? [{ field: 'paymentTypeName', label: 'table.column.methodPayment' }] : []),
  num('total', 'table.column.total')
];

// La respuesta json del back: { rows, totals }. Cualquier forma rara se normaliza a vacío para que la pantalla nunca reviente.
export const normalizeCashReport = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: data?.totals && typeof data.totals === 'object' ? data.totals : {}
});

// Los combos del reporte: { cashes, cashiers, paymentTypes }, cada uno `{ id, name }`, a opciones de SearchSelect.
export const normalizeFilters = (data) => {
  const options = (list) => (Array.isArray(list) ? list.map((item) => ({ label: String(item.name ?? ''), value: item.id })) : []);
  return { cashes: options(data?.cashes), cashiers: options(data?.cashiers), paymentTypes: options(data?.paymentTypes) };
};
