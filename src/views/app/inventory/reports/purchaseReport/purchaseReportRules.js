// Reportes de compras (SPEC v2-57-sr). El back decide (`validatePurchaseReportQuery`): fechas obligatorias y válidas, `range.invalid`, rango máximo
// de 366 días, tipo y formato. Esto solo evita una llamada que ya se sabe rechazada y arma la petición. Los casos son los del back.
export const REPORT_BASE_URL = 'inventory/reports/purchases';
export const MAX_RANGE_DAYS = 366;

// Opción del modal "Otros reportes" (legacy inv_repocompras.sc2) -> tipo del back. 6, 10 y 11 llegan con la SPEC v2-58-sr.
export const RADIO_TO_TYPE = {
  1: 'byStore', 2: 'byProvider', 3: 'byStore', 4: 'byProvider', 5: 'detailByProduct', 7: 'bonus', 8: 'taxedDetail', 9: 'taxedSummary', 12: 'byProductQty', 13: 'services'
};

const text = (value) => String(value ?? '').trim();

export const isValidCalendarDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(value));
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
};

const daysBetween = (from, to) => {
  const parse = (v) => Date.UTC(Number(v.slice(0, 4)), Number(v.slice(5, 7)) - 1, Number(v.slice(8, 10)));
  return Math.round((parse(to) - parse(from)) / 86400000);
};

/** Valida el rango. Devuelve { dateStart?, dateEnd? } con el id de traducción de cada error ({} = válido). Mismo orden que el back. */
export const validateReportRange = ({ dateStart, dateEnd } = {}) => {
  const errors = {};
  const check = (field, value) => {
    const date = text(value);
    if (date === '') errors[field] = 'msg.required.input.date';
    else if (!isValidCalendarDate(date)) errors[field] = 'page.fuelPurchases.report.error.dateInvalid';
  };
  check('dateStart', dateStart);
  check('dateEnd', dateEnd);
  if (!errors.dateStart && !errors.dateEnd) {
    if (text(dateStart) > text(dateEnd)) errors.dateEnd = 'page.fuelPurchases.report.error.range';
    else if (daysBetween(text(dateStart), text(dateEnd)) > MAX_RANGE_DAYS) errors.dateEnd = 'page.purchaseReport.report.error.tooLarge';
  }
  return errors;
};

// Un id (almacén, proveedor) en 0, vacío o ausente significa "todos" y no viaja; el producto en blanco tampoco.
const idParam = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? String(n) : null;
};

/**
 * Arma la petición para `request.GET` (json) o `request.GETPdf` (pdf y xlsx). GETPdf agrega `?` + `params` a la URL en un GET, así que
 * los parámetros van en `params` y no escritos en la URL (lección de la v2-12-sr). Solo viajan los filtros con valor.
 */
export const buildReportRequest = (type, { dateStart, dateEnd, storeId, providerId, productCode } = {}, format = 'json') => {
  const params = { dateStart: text(dateStart), dateEnd: text(dateEnd) };
  const store = idParam(storeId);
  const provider = idParam(providerId);
  if (store) params.storeId = store;
  if (provider) params.providerId = provider;
  if (text(productCode) !== '' && text(productCode) !== '0') params.productCode = text(productCode);
  if (format === 'pdf' || format === 'xlsx') params.format = format;
  return { url: `${REPORT_BASE_URL}/${type}`, params };
};

export const REPORT_TITLES = {
  byStore: 'Reporte de Compras por Almacén', byProvider: 'Reporte de Compras por Proveedor', detailByProduct: 'Reporte de Compras Detallado por Producto',
  bonus: 'Reporte de Bonificaciones', taxedDetail: 'Compras Gravadas, Exentas y Exoneradas (Detallado)', taxedSummary: 'Compras Gravadas, Exentas y Exoneradas (Resumido)',
  byProductQty: 'Reporte de Compras por Producto y Cantidad', services: 'Reporte de Compras de Servicios'
};

export const reportFileName = (title, format) => `${title}.${format === 'xlsx' ? 'xlsx' : 'pdf'}`;

// Columnas de la tabla en pantalla por tipo (las mismas del back: purchaseReportDefinitions). `label` es una clave de traducción.
const date = { field: 'date', label: 'table.column.date', isDate: true };
const num = (field, label) => ({ field, label, isNumber: true });
const MONEY = [num('subtotal', 'table.column.subtotal'), num('discount', 'table.column.discount'), num('tax', 'table.column.tax'), num('total', 'table.column.total')];
const HEADER_COLUMNS = [date, { field: 'providerName', label: 'table.column.provider' }, { field: 'storeName', label: 'table.column.store' }, { field: 'number', label: 'table.column.documentId' }, ...MONEY];
const LINE_COLUMNS = [
  date, { field: 'purchaseCode', label: 'table.column.noPurchase' }, { field: 'providerName', label: 'table.column.provider' }, { field: 'storeName', label: 'table.column.store' },
  { field: 'productCode', label: 'table.column.code' }, { field: 'productName', label: 'page.purchaseReport.table.column.description' }, num('qty', 'table.column.qty'), ...MONEY
];

export const COLUMNS_BY_TYPE = {
  byStore: HEADER_COLUMNS,
  byProvider: HEADER_COLUMNS,
  detailByProduct: LINE_COLUMNS,
  bonus: LINE_COLUMNS,
  taxedDetail: [date, { field: 'purchaseCode', label: 'table.column.noPurchase' }, { field: 'productCode', label: 'table.column.code' },
    { field: 'productName', label: 'page.purchaseReport.table.column.description' }, { field: 'taxCategory', label: 'page.purchaseReport.table.column.taxCategory' },
    num('subtotal', 'table.column.subtotal'), num('tax', 'table.column.tax'), num('total', 'table.column.total')],
  taxedSummary: [{ field: 'taxCategory', label: 'page.purchaseReport.table.column.taxCategory' }, num('qty', 'table.column.qty'), ...MONEY],
  byProductQty: [{ field: 'productCode', label: 'table.column.code' }, { field: 'productName', label: 'page.purchaseReport.table.column.description' }, num('qty', 'table.column.qty'), ...MONEY],
  services: [{ field: 'number', label: 'table.column.documentId' }, date, { field: 'providerName', label: 'table.column.provider' },
    { field: 'productName', label: 'table.column.product' }, ...MONEY, { field: 'orderId', label: 'page.purchaseReport.table.column.order' },
    { field: 'description', label: 'table.column.description' }]
};

// La respuesta json del back: { rows, groups, totals }. Cualquier forma rara se normaliza a vacío para que la pantalla nunca reviente.
export const normalizeReport = (data) => ({
  title: typeof data?.title === 'string' ? data.title : '',
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: data?.totals && typeof data.totals === 'object' ? data.totals : {}
});
