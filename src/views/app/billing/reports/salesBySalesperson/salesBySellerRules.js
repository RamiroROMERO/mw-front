// Ventas por vendedor (SPEC v2-103-sr / v2-104-sr). El back decide (`validateSalesBySellerQuery`): fechas obligatorias, válidas y en orden, rango máximo de 366 días, vendedor,
// moneda, mayoristas y formato (json, pdf o xlsx). Esto solo evita una llamada que ya se sabe rechazada y arma la petición. Los casos son los del back.
import { validateReportRange, isValidCalendarDate } from '@Views/app/inventory/reports/purchaseReport/purchaseReportRules';
import { defaultRange } from '@Views/app/billing/reports/salesReport/salesReportRules';
import { normalizeSettings, effectiveForm, CURRENCY_LEMPIRAS, CURRENCY_DOLLARS } from '@Views/app/billing/reports/summaryByProduct/summaryByProductRules';

export { validateReportRange, isValidCalendarDate, defaultRange, normalizeSettings, effectiveForm, CURRENCY_LEMPIRAS, CURRENCY_DOLLARS };

export const REPORT_URL = 'billing/reports/salesBySeller';
export const SETTINGS_URL = `${REPORT_URL}/settings`;
export const TYPE_DETAIL = 'detail';
export const TYPE_SUMMARY = 'summary';
export const TYPE_NEW_CUSTOMERS = 'newCustomers';

const text = (value) => String(value ?? '').trim();

/**
 * Arma la petición de un tipo de reporte. `request.GET` (json) o `request.GETPdf` (pdf o xlsx): GETPdf agrega `?` + `params` a la URL en un GET, así que los parámetros
 * van en `params` y no escritos en la URL (lección de la v2-12-sr). El formulario usa startDate/endDate; el back, dateStart/dateEnd. Sin vendedor ("todos"), en Lempiras
 * y sin el filtro de mayoristas no viajan; la moneda solo aplica a las ventas y los mayoristas solo a los clientes nuevos.
 */
export const buildSellerRequest = (type, form = {}, format = 'json') => {
  const params = { dateStart: text(form.startDate), dateEnd: text(form.endDate) };
  const seller = text(form.sellerCode);
  if (seller !== '' && seller !== '0') params.sellerCode = seller;
  if (type === TYPE_NEW_CUSTOMERS) {
    if (Number(form.partnersOnly) === 1) params.partnersOnly = '1';
  } else if (Number(form.currency) === CURRENCY_DOLLARS) {
    params.currency = String(CURRENCY_DOLLARS);
  }
  if (format === 'pdf' || format === 'xlsx') params.format = format;
  return { url: `${REPORT_URL}/${type}`, params };
};

export const REPORT_TITLES = {
  [TYPE_DETAIL]: 'Reporte de Ventas por Vendedor',
  [TYPE_SUMMARY]: 'Resumen de Ventas por Vendedor y Producto',
  [TYPE_NEW_CUSTOMERS]: 'Reporte de Clientes Registrados por Vendedor'
};
export const reportFileName = (type, format) => `${REPORT_TITLES[type] || 'Reporte de Ventas por Vendedor'}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

// Columnas de las tablas en pantalla (las mismas del back: salesBySellerDefinitions). `label` es una clave de traducción.
const num = (field, label) => ({ field, label, isNumber: true });
const seller = { field: 'sellerName', label: 'table.column.seller' };
export const COLUMNS = {
  [TYPE_DETAIL]: [
    seller, { field: 'date', label: 'table.column.date', isDate: true }, { field: 'number', label: 'table.column.noInvoice' }, { field: 'customerName', label: 'table.column.customer' },
    { field: 'productName', label: 'page.purchaseReport.table.column.description' }, num('qty', 'table.column.qty'), num('price', 'table.column.price'),
    num('subtotal', 'table.column.subtotal'), num('tax', 'table.column.tax'), num('total', 'table.column.total'),
    num('commissionPercent', 'table.column.commissionPercent'), num('commissionValue', 'table.column.commissionValue')
  ],
  [TYPE_SUMMARY]: [
    seller, { field: 'productCode', label: 'table.column.productCode' }, { field: 'productName', label: 'table.column.productName' }, num('qty', 'table.column.qty'),
    num('subtotal', 'table.column.subtotal'), num('tax', 'table.column.tax'), num('total', 'table.column.total'), num('commissionValue', 'table.column.commissionValue')
  ],
  [TYPE_NEW_CUSTOMERS]: [
    seller, { field: 'dateIn', label: 'table.column.dateIn', isDate: true }, { field: 'customerCode', label: 'table.column.rtn' }, { field: 'customerName', label: 'table.column.customer' },
    { field: 'phone1', label: 'table.column.phone' }, { field: 'deptoName', label: 'select.department' }
  ]
};

// La respuesta json del back: { rows, totals }. Cualquier forma rara se normaliza a vacío para que la pantalla nunca reviente.
export const normalizeSellerReport = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: data?.totals && typeof data.totals === 'object' ? data.totals : {}
});
