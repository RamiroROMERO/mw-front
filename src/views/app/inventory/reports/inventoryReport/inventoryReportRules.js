// Reportes de inventarios (SPEC v2-60-sr). El back decide (`validateInventoryReportQuery`): tipo, fechas, almacén obligatorio, filtros y formato; esto solo evita
// una llamada que ya se sabe rechazada y arma la petición. Los casos son los del back. `columns` son las del back (`inventoryReportDefinitions`) con claves de traducción.
import { isValidCalendarDate, MAX_RANGE_DAYS, daysBetween } from './dateRules';

export const REPORT_BASE_URL = 'inventory/reports/inventoryReports';

const PRE = 'page.inventoryReport.column.';
const date = { field: 'date', label: 'table.column.date', isDate: true };
const num = (field, label) => ({ field, label, isNumber: true });
const text = (field, label) => ({ field, label });
const MONTHS = (make) => Array.from({ length: 12 }, (_, i) => make(`m${i + 1}`, `page.purchaseReport.table.column.month${i + 1}`));
const PRODUCT = text('productName', 'page.purchaseReport.table.column.description');

// `id` lo usa el RadioGroup; `type` y `title` (nombre del archivo) son los del back. `filters` dice qué campos usa el reporte.
export const REPORT_TYPES = [
  {
    id: 1, type: 'detailByDestination', title: 'Reporte Detallado por Centro de Destino', needsStore: true, filters: ['destination', 'product'], dates: true,
    label: 'page.inventoryReport.modal.otherReports.radio.detailByDestination',
    columns: [date, text('document', 'table.column.documentId'), text('docType', `${PRE}docType`), text('destinationName', 'table.column.destination'), text('productCode', 'table.column.code'), PRODUCT,
      text('unit', `${PRE}unit`), num('qty', 'table.column.qty'), num('value', `${PRE}value`)]
  },
  {
    id: 2, type: 'summaryByDestination', title: 'Reporte Resumido por Centro de Destino', needsStore: true, filters: ['destination'], dates: true,
    label: 'page.inventoryReport.modal.otherReports.radio.summarizedByDestination',
    columns: [text('destinationName', 'table.column.destination'), num('value', `${PRE}value`)]
  },
  {
    id: 3, type: 'monthlyDetail', title: 'Reporte Detallado de Gasto Mensual', needsStore: true, filters: ['product'], dates: true,
    label: 'page.inventoryReport.modal.otherReports.radio.detailExpense',
    columns: [text('productCode', 'table.column.code'), PRODUCT, ...MONTHS(num), num('totalQty', 'table.column.total'), num('cost', 'table.column.cost'), num('totalValue', `${PRE}value`)]
  },
  {
    id: 4, type: 'monthlySummary', title: 'Reporte Resumido de Gasto Mensual', needsStore: true, filters: ['destination'], dates: true,
    label: 'page.inventoryReport.modal.otherReports.radio.summarizedExpense',
    columns: [text('destinationName', 'table.column.destination'), ...MONTHS(num), num('total', 'table.column.total')]
  },
  {
    id: 5, type: 'byProductAndDestination', title: 'Salidas por Almacén, Resumido por Producto', needsStore: true, filters: ['destination', 'product'], dates: true,
    label: 'page.inventoryReport.modal.otherReports.radio.byStore',
    columns: [text('destinationName', 'table.column.destination'), text('productCode', 'table.column.code'), PRODUCT, text('unit', `${PRE}unit`), num('qty', 'table.column.qty'), num('value', `${PRE}value`)]
  },
  {
    id: 6, type: 'generalProducts', title: 'Reporte General de Productos', needsStore: false, filters: [], dates: false,
    label: 'page.inventoryReport.modal.otherReports.radio.general',
    columns: [text('productCode', 'table.column.code'), PRODUCT, text('classification', `${PRE}classification`), text('taxText', `${PRE}tax`), text('unitIn', `${PRE}unitIn`), text('unitOut', `${PRE}unitOut`),
      num('cost', 'table.column.cost'), num('price1', `${PRE}price1`), num('price2', `${PRE}price2`), num('price3', `${PRE}price3`)]
  },
  {
    id: 7, type: 'generalDocuments', title: 'Reporte General de Documentos', needsStore: false, filters: [], dates: true, optionalStore: true,
    label: 'page.inventoryReport.modal.otherReports.radio.documents',
    columns: [date, text('document', 'table.column.documentId'), text('docType', `${PRE}docType`), text('storeName', 'table.column.store'), text('destinationName', 'table.column.destination'),
      text('statusText', `${PRE}status`), num('total', 'table.column.total')]
  },
  {
    id: 8, type: 'incomesAndReintegros', title: 'Reporte de Ingresos y Reintegros', needsStore: false, filters: [], dates: true, optionalStore: true,
    label: 'page.inventoryReport.modal.otherReports.radio.incomes',
    columns: [date, text('document', 'table.column.documentId'), text('taxNumber', `${PRE}taxNumber`), text('storeName', 'table.column.store'), text('providerName', 'table.column.provider'),
      text('productCode', 'table.column.code'), PRODUCT, num('qty', 'table.column.qty'), num('cost', 'table.column.cost'), num('total', 'table.column.total'), text('kindText', `${PRE}docType`)]
  }
];

export const typeOf = (typeId) => REPORT_TYPES.find((item) => item.id === Number(typeId)) || null;
const clean = (value) => String(value ?? '').trim();

// ¿El reporte usa este campo? (almacén: obligatorio u opcional; destino y producto: solo donde el back los admite)
export const usesStore = (typeId) => Boolean(typeOf(typeId)) && (typeOf(typeId).needsStore || Boolean(typeOf(typeId).optionalStore));
export const usesField = (typeId, field) => Boolean(typeOf(typeId)) && typeOf(typeId).filters.includes(field);
export const usesDates = (typeId) => Boolean(typeOf(typeId)) && typeOf(typeId).dates;

/**
 * Valida el filtro de un tipo. Devuelve { typeId?, storeId?, dateStart?, dateEnd? } con el id de traducción de cada error ({} = válido). Mismo orden que
 * el back: tipo, fechas (obligatorias, válidas, en orden y de hasta 366 días) y almacén obligatorio.
 */
export const validateInventoryReport = (typeId, form = {}) => {
  const errors = {};
  const def = typeOf(typeId);
  if (!def) { errors.typeId = 'msg.required.select'; return errors; }
  if (def.dates) {
    const check = (field, value) => {
      const d = clean(value);
      if (d === '') errors[field] = 'msg.required.input.date';
      else if (!isValidCalendarDate(d)) errors[field] = 'page.fuelPurchases.report.error.dateInvalid';
    };
    check('dateStart', form.dateStart);
    check('dateEnd', form.dateEnd);
    if (!errors.dateStart && !errors.dateEnd) {
      if (clean(form.dateStart) > clean(form.dateEnd)) errors.dateEnd = 'page.fuelPurchases.report.error.range';
      else if (daysBetween(clean(form.dateStart), clean(form.dateEnd)) > MAX_RANGE_DAYS) errors.dateEnd = 'page.purchaseReport.report.error.tooLarge';
    }
  }
  if (def.needsStore && !(Number(form.storeId) > 0)) errors.storeId = 'msg.required.select.warehouse';
  return errors;
};

const idParam = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? String(n) : null;
};

/**
 * Arma la petición para `request.GET` (json) o `request.GETPdf` (pdf y xlsx). GETPdf agrega `?` + `params` a la URL en un GET, así que los parámetros van en
 * `params` y no escritos en la URL (lección de la v2-12-sr). Solo viajan los filtros que el reporte usa y que tienen valor.
 */
export const buildInventoryRequest = (typeId, form = {}, format = 'json') => {
  const def = typeOf(typeId) || REPORT_TYPES[0];
  const params = {};
  if (def.dates) { params.dateStart = clean(form.dateStart); params.dateEnd = clean(form.dateEnd); }
  const store = usesStore(def.id) ? idParam(form.storeId) : null;
  if (store) params.storeId = store;
  const destination = usesField(def.id, 'destination') ? idParam(form.destinationId) : null;
  if (destination) params.destinationId = destination;
  if (usesField(def.id, 'product') && clean(form.productCode) !== '' && clean(form.productCode) !== '0') params.productCode = clean(form.productCode);
  if (format === 'pdf' || format === 'xlsx') params.format = format;
  return { url: `${REPORT_BASE_URL}/${def.type}`, params, fileName: `${def.title}.${format === 'xlsx' ? 'xlsx' : 'pdf'}` };
};

// La respuesta json del back: { rows, groups, totals }. Cualquier forma rara se normaliza a vacío para que la pantalla nunca reviente.
export const normalizeReport = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: data?.totals && typeof data.totals === 'object' ? data.totals : {}
});
