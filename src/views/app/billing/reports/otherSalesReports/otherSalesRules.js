// Otros reportes de ventas (SPEC v2-109-sr / v2-110-sr). El back decide (`validateOtherSalesQuery`): fechas obligatorias, válidas y en orden (salvo en la Última compra), rango
// máximo de 366 días, moneda, cliente, facturador, afiliados, días mínimos, clasificaciones, comparación del promedio y formato (json, pdf o xlsx). Esto solo evita una llamada que
// ya se sabe rechazada y arma la petición. Los casos son los del back.
import { validateReportRange, isValidCalendarDate } from '@Views/app/inventory/reports/purchaseReport/purchaseReportRules';
import { defaultRange } from '@Views/app/billing/reports/salesReport/salesReportRules';
import { normalizeSettings, effectiveForm, CURRENCY_LEMPIRAS, CURRENCY_DOLLARS } from '@Views/app/billing/reports/summaryByProduct/summaryByProductRules';

export { validateReportRange, isValidCalendarDate, defaultRange, normalizeSettings, effectiveForm, CURRENCY_LEMPIRAS, CURRENCY_DOLLARS };

export const REPORT_URL = 'billing/reports/otherSales';
export const SETTINGS_URL = `${REPORT_URL}/settings`;
export const FILTERS_URL = `${REPORT_URL}/filters`;
// Buscador de clientes del filtro: histórico de ventas, así que incluye inactivos y eliminados.
export const CUSTOMERS_URL = `${REPORT_URL}/customers`;

const text = (value) => String(value ?? '').trim();
const num = (field, label) => ({ field, label, isNumber: true });
const col = (field, label, extra = {}) => ({ field, label, ...extra });

const INVOICE_LEAD = [col('date', 'table.column.date', { isDate: true }), col('number', 'page.invoicing.table.invoice'), col('customerCode', 'table.column.rtn'), col('customerName', 'table.column.customer')];
const INVOICE_AMOUNTS = [
  num('subtotal', 'page.invoicing.input.subtotal'), num('discount', 'page.invoicing.input.discValue'), num('taxedValue', 'page.invoicing.input.taxed'),
  num('exemptValue', 'page.invoicing.input.exempt'), num('tax', 'page.invoicing.input.taxValue'), num('total', 'table.column.total')
];
const SIMPLE_AMOUNTS = [num('subtotal', 'page.invoicing.input.subtotal'), num('discount', 'page.invoicing.input.discValue'), num('tax', 'page.invoicing.input.taxValue'), num('total', 'table.column.total')];

// Los 17 reportes: `columns` (tabla fija) o `isPivot` (las columnas por mes o vendedor las manda el back en `columns`), `hasCurrency` (los montos respetan la moneda),
// `filters` (los campos opcionales que muestra el encabezado) y `noDates` (la Última compra no usa fechas). `title` es el nombre del archivo que arma el back.
export const REPORT_TYPES = [
  { key: 'resumeByArea', title: 'Resumen de Ventas por Área', hasCurrency: true, filters: [], columns: [col('areaName', 'table.column.area'), ...SIMPLE_AMOUNTS] },
  {
    key: 'detailByArea', title: 'Detalle de Ventas por Área', hasCurrency: true, filters: [],
    columns: [col('areaName', 'table.column.area'), col('productCode', 'page.invoicing.table.code'), col('productName', 'page.invoicing.input.descriptionProd'), num('qty', 'page.invoicing.input.qtyProd'), ...SIMPLE_AMOUNTS]
  },
  { key: 'byCustomer', title: 'Reporte de Ventas por Cliente', hasCurrency: true, filters: ['customerId', 'isPartner'], columns: [...INVOICE_LEAD, ...INVOICE_AMOUNTS] },
  {
    key: 'cashExpenses', title: 'Reporte de Gastos en Efectivo', hasCurrency: false, filters: [],
    columns: [col('date', 'table.column.date', { isDate: true }), col('rtnBenefit', 'table.column.rtn'), col('nameBenefit', 'table.column.customer'), col('description', 'page.custCreditNotes.input.concept'), num('value', 'table.column.value')]
  },
  {
    key: 'byCashier', title: 'Reporte de Ventas por Facturador', hasCurrency: true, filters: ['cashierId'],
    columns: [col('cashierName', 'page.boxesReport.select.cashierId'), ...INVOICE_LEAD, ...INVOICE_AMOUNTS]
  },
  { key: 'cashSales', title: 'Reporte de Ventas al Contado', hasCurrency: true, filters: [], columns: [...INVOICE_LEAD, ...INVOICE_AMOUNTS] },
  { key: 'creditSales', title: 'Reporte de Ventas al Crédito', hasCurrency: true, filters: [], columns: [...INVOICE_LEAD, ...INVOICE_AMOUNTS] },
  {
    key: 'resumeByDepartment', title: 'Ventas por Departamento Resumido', hasCurrency: true, filters: ['isPartner'],
    columns: [col('departmentName', 'page.otherSalesReports.table.department'), ...INVOICE_AMOUNTS]
  },
  {
    key: 'byCustomerAndDepartment', title: 'Ventas por Cliente y Departamento', hasCurrency: true, filters: ['isPartner'],
    columns: [col('departmentName', 'page.otherSalesReports.table.department'), ...INVOICE_LEAD, ...INVOICE_AMOUNTS]
  },
  {
    key: 'resumeByProductType', title: 'Resumen de Ventas por Tipo de Producto', hasCurrency: true, filters: [],
    columns: [col('productType', 'page.otherSalesReports.table.productType'), num('qty', 'page.invoicing.input.qtyProd'), ...SIMPLE_AMOUNTS]
  },
  {
    key: 'dailySummary', title: 'Resumen de Ventas por Día', hasCurrency: true, filters: [],
    columns: [
      col('date', 'table.column.date', { isDate: true }), col('documentCode', 'page.invoicing.table.doc'), col('qtyDocuments', 'page.otherSalesReports.table.qtyDocuments'),
      col('numberMin', 'page.otherSalesReports.table.numberMin'), col('numberMax', 'page.otherSalesReports.table.numberMax'), ...INVOICE_AMOUNTS.slice(0, 4),
      num('exoneratedValue', 'page.otherSalesReports.table.exonerated'), num('tax', 'page.invoicing.input.taxValue'), num('total', 'table.column.total')
    ]
  },
  { key: 'salesBySellerMonthlyDetail', title: 'Ventas por Vendedor y Tipo Mensual', hasCurrency: true, filters: [], isPivot: true },
  { key: 'salesByProductTypeMonthly', title: 'Ventas por Tipo de Producto Mensual', hasCurrency: true, filters: [], isPivot: true },
  { key: 'salesByDepartmentMonthly', title: 'Ventas por Departamento Mensual', hasCurrency: true, filters: ['isPartner'], isPivot: true },
  { key: 'purchaseFrequencyByCustomer', title: 'Frecuencia de Compra por Cliente', hasCurrency: true, filters: ['isPartner'], isPivot: true },
  { key: 'averageMonthlyByCustomer', title: 'Ventas por Cliente: Promedio Mensual y Clasificación', hasCurrency: true, filters: ['classification', 'average'], isPivot: true },
  {
    key: 'lastPurchase', title: 'Última Compra de Clientes', hasCurrency: false, filters: ['isPartner', 'minDays'], noDates: true,
    columns: [
      col('customerName', 'table.column.customer'), col('lastDate', 'page.otherSalesReports.table.lastDate', { isDate: true }), col('days', 'page.otherSalesReports.table.days'),
      col('phone1', 'page.otherSalesReports.table.phone1'), col('phone2', 'page.otherSalesReports.table.phone2'), col('phone3', 'page.otherSalesReports.table.phone3')
    ]
  }
];

export const findType = (key) => REPORT_TYPES.find((item) => item.key === key) || REPORT_TYPES[0];

export const AVG_OPS = ['lt', 'gt', 'between'];
const positive = (value) => /^\d{1,12}(\.\d{1,2})?$/.test(text(value)) && Number(value) > 0;

// Lo que el back rechazaría: fechas (salvo en la Última compra), días mínimos y la comparación del promedio. Devuelve `{ campo: claveDeTraducción }`; `{}` si es válido.
export const validateOtherForm = (type, form = {}) => {
  const config = findType(type);
  const errors = {};
  if (!config.noDates) {
    const found = validateReportRange({ dateStart: form.startDate, dateEnd: form.endDate });
    if (found.dateStart) errors.startDate = found.dateStart;
    if (found.dateEnd) errors.endDate = found.dateEnd;
  }
  if (config.filters.includes('minDays') && text(form.minDays) !== '' && !/^\d{1,4}$/.test(text(form.minDays))) errors.minDays = 'page.otherSalesReports.msg.minDays';
  if (config.filters.includes('average') && AVG_OPS.includes(form.avgOp)) {
    if (!positive(form.avgValue)) errors.avgValue = 'page.otherSalesReports.msg.average';
    else if (form.avgOp === 'between' && (!positive(form.avgValue2) || Number(form.avgValue) > Number(form.avgValue2))) errors.avgValue2 = 'page.otherSalesReports.msg.average';
  }
  return errors;
};

/**
 * Arma la petición de un reporte. `request.GET` (json) o `request.GETPdf` (pdf o xlsx): GETPdf agrega `?` + `params` a la URL en un GET, así que los parámetros van en `params`
 * y no escritos en la URL (lección de la v2-12-sr). El formulario usa startDate/endDate; el back, dateStart/dateEnd. Solo viajan los filtros que el reporte admite y los que
 * no son "todos": Lempiras, cliente o facturador en 0, sin afiliados y sin días mínimos no viajan. `typeIds` son las clasificaciones elegidas (ids).
 */
export const buildOtherRequest = (type, form = {}, format = 'json', typeIds = []) => {
  const config = findType(type);
  const params = {};
  if (!config.noDates) {
    params.dateStart = text(form.startDate);
    params.dateEnd = text(form.endDate);
  }
  if (config.hasCurrency && Number(form.currency) === CURRENCY_DOLLARS) params.currency = String(CURRENCY_DOLLARS);
  const customer = Number(form.customerId);
  if (config.filters.includes('customerId') && Number.isInteger(customer) && customer > 0) params.customerId = String(customer);
  const cashier = Number(form.cashierId);
  if (config.filters.includes('cashierId') && Number.isInteger(cashier) && cashier > 0) params.cashierId = String(cashier);
  if (config.filters.includes('isPartner') && (Number(form.isPartner) === 1 || form.isPartner === true)) params.isPartner = '1';
  if (config.filters.includes('minDays') && Number(form.minDays) > 0) params.minDays = String(Number(form.minDays));
  if (config.filters.includes('classification') && typeIds.length > 0) params.productTypeIds = typeIds.join(',');
  if (config.filters.includes('average') && AVG_OPS.includes(form.avgOp)) {
    params.avgOp = form.avgOp;
    params.avgValue = text(form.avgValue);
    if (form.avgOp === 'between') params.avgValue2 = text(form.avgValue2);
  }
  if (format === 'pdf' || format === 'xlsx') params.format = format;
  return { url: `${REPORT_URL}/${type}`, params };
};

export const reportFileName = (type, format) => `${findType(type).title}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

// Las clasificaciones marcadas: el formulario guarda una casilla `type_<id>` por cada una (1 marcada).
export const selectedTypeIds = (form = {}, productTypes = []) => productTypes.filter((item) => Number(form[`type_${item.id}`]) === 1 || form[`type_${item.id}`] === true).map((item) => item.id);

// La respuesta json del back: { rows, totals, columns? }. Cualquier forma rara se normaliza a vacío para que la pantalla nunca reviente.
export const normalizeReport = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: data?.totals && typeof data.totals === 'object' ? data.totals : {},
  columns: Array.isArray(data?.columns) ? data.columns : []
});

// Las columnas que manda el back (meses, vendedores o promedio) a columnas de la tabla: texto del encabezado tal cual y número con 2 decimales.
export const pivotTableColumns = (columns = []) => columns.map((c) => ({ field: c.key, header: c.header, isNumber: c.type === 'number', isInteger: c.type === 'integer' }));

// El total que muestra la pantalla: el de la columna `total` (o `value` en los gastos de caja); sin ese total (última compra) no hay recuadro.
export const grandTotal = (totals = {}) => (totals.total !== undefined ? totals.total : totals.value);

export const normalizeFilters = (data) => {
  const options = (list) => (Array.isArray(list) ? list.map((item) => ({ label: String(item.name ?? ''), value: item.id })) : []);
  return {
    cashiers: options(data?.cashiers),
    productTypes: Array.isArray(data?.productTypes) ? data.productTypes.map((item) => ({ id: item.id, name: String(item.name ?? '') })) : []
  };
};
