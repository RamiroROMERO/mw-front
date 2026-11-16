// Reportes de existencias (SPEC v2-44-sr): existencias, general, sin movimiento y por vencimiento, en PDF o Excel. El back decide
// (`validateReportQuery`: tipo, fecha, almacén, filtro y formato); esto solo evita una llamada que ya se sabe rechazada y arma la petición.
// Los casos son los de stockReportRules.test.js del back. Sin fecha inicial: los reportes son "al" una fecha (la fija 2011 del legacy se quitó).
import { isValidCalendarDate, todayText } from './kardexRules';

export const REPORT_URL = 'inventory/process/stocks/reports';

// `id` lo usa el RadioGroup (números); `type` y `value` son los del back.
export const REPORT_TYPES = [
  { id: 1, type: 'stock', label: 'page.stock.modal.stockReports.radio.stockReport', fileName: 'Reporte de Existencias' },
  { id: 2, type: 'general', label: 'page.stock.modal.stockReports.radio.generalStock', fileName: 'Reporte General de Existencias' },
  { id: 3, type: 'nonMoving', label: 'page.stock.modal.stockReports.radio.nonMovingProducts', fileName: 'Productos sin Movimiento' },
  { id: 4, type: 'expiry', label: 'page.stock.modal.stockReports.radio.expiry', fileName: 'Existencias por Fecha de Vencimiento' }
];

export const VALUE_FILTERS = [
  { id: 1, value: 'nonPositive', label: 'page.stock.modal.stockReports.radio.negatives' },
  { id: 2, value: 'positive', label: 'page.stock.modal.stockReports.radio.existence' },
  { id: 3, value: 'all', label: 'page.stock.modal.stockReports.radio.all' }
];

export const INITIAL_REPORT_FORM = Object.freeze({ typeId: 1, storeId: 0, dateEnd: '', valueFilterId: 3 });

const text = (value) => String(value ?? '').trim();
export const reportTypeOf = (typeId) => REPORT_TYPES.find((item) => item.id === Number(typeId)) || null;
const filterOf = (id) => VALUE_FILTERS.find((item) => item.id === Number(id)) || VALUE_FILTERS[2];

// El reporte general recorre todos los almacenes tipo 1: no pide almacén.
export const needsStore = (typeId) => Boolean(reportTypeOf(typeId)) && reportTypeOf(typeId).type !== 'general';

/**
 * Valida el filtro. Devuelve { typeId?, storeId?, dateEnd? } con el id de traducción de cada error ({} = válido). Mismo orden que el back:
 * tipo, fecha y almacén.
 */
export const validateStockReport = (form = {}) => {
  const errors = {};
  if (!reportTypeOf(form.typeId)) errors.typeId = 'msg.required.select';
  const date = text(form.dateEnd);
  if (date === '') errors.dateEnd = 'msg.required.input.date';
  else if (!isValidCalendarDate(date)) errors.dateEnd = 'page.stock.report.error.dateInvalid';
  if (needsStore(form.typeId) && !(Number(form.storeId) > 0)) errors.storeId = 'msg.required.select';
  return errors;
};

// Petición para `request.GETPdf(url, params, fileName, ...)`. GETPdf agrega `?` + `params` a la URL en un GET, así que los parámetros
// van en `params` y no escritos en la URL (lección de la v2-12-sr). Cualquier formato distinto de xlsx es pdf, igual que el botón. El
// almacén no se envía en el reporte general.
export const buildStockReportRequest = (form = {}, format = 'pdf') => {
  const finalFormat = format === 'xlsx' ? 'xlsx' : 'pdf';
  const reportType = reportTypeOf(form.typeId) || REPORT_TYPES[0];
  const params = { type: reportType.type, dateEnd: text(form.dateEnd), valueFilter: filterOf(form.valueFilterId).value, format: finalFormat };
  if (reportType.type !== 'general') params.storeId = Number(form.storeId);
  return { url: REPORT_URL, params, fileName: `${reportType.fileName}.${finalFormat}` };
};

export const defaultReportForm = (today = todayText()) => ({ ...INITIAL_REPORT_FORM, dateEnd: today });
