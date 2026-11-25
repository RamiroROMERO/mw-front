import { isRealDate, localToday, MIN_SEARCH_CHARS, AGING_FIELDS } from '../cxcShared/cxcReportsRules';

// Reglas compartidas de los reportes de Cuentas por Pagar (SPEC v2-133-sr), las mismas del back (`modules/accounting/cxpReports/cxpReportRules.js`): ruta, validación de filtros y lectura segura de las
// respuestas. El back decide y calcula (antigüedad, saldos, totales); aquí se evita el viaje y se explica el error antes de pedir.
export const BASE_PATH = 'accounting/reports/cxpReports';
export { isRealDate, localToday, MIN_SEARCH_CHARS, AGING_FIELDS };

const hasProvider = (providerId) => Number(providerId) > 0;
const filled = (value) => String(value ?? '').trim() !== '';

// Fecha de corte de la proyección (puede ser futura).
export const validateAsOfDate = (date) => (isRealDate(date) ? '' : 'page.cxpReports.msg.dateInvalid');

// Rango obligatorio (saldos y pagos, historial por proveedor): ambas fechas reales y desde <= hasta.
export const validateRange = ({ dateStart, dateEnd }) => {
  if (!filled(dateStart) || !filled(dateEnd)) return 'page.cxpReports.msg.rangeRequired';
  if (!isRealDate(dateStart) || !isRealDate(dateEnd)) return 'page.cxpReports.msg.dateInvalid';
  if (dateStart > dateEnd) return 'page.cxpReports.msg.rangeInverted';
  return '';
};

export const validateProviderHistory = ({ providerId, dateStart, dateEnd }) => (hasProvider(providerId) ? validateRange({ dateStart, dateEnd }) : 'page.cxpReports.msg.providerRequired');

// Historial de pagos: proveedor o rango completo de FECHAS DE FACTURA (así los pagos de esas facturas salen completos y el saldo corrido es correcto).
export const validateHistoryFilter = ({ providerId, dateStart, dateEnd }) => {
  const hasStart = filled(dateStart);
  const hasEnd = filled(dateEnd);
  if (hasStart !== hasEnd) return 'page.cxpReports.msg.historyRangeIncomplete';
  if (hasStart) {
    if (!isRealDate(dateStart) || !isRealDate(dateEnd)) return 'page.cxpReports.msg.dateInvalid';
    if (dateStart > dateEnd) return 'page.cxpReports.msg.rangeInverted';
  }
  if (!hasProvider(providerId) && !hasStart) return 'page.cxpReports.msg.historyFilterRequired';
  return '';
};

// Buscador de documentos del rastreo: un proveedor o al menos 3 caracteres del documento.
export const validateSearch = ({ providerId, documentCode }) => {
  const text = String(documentCode ?? '').trim();
  if (!hasProvider(providerId) && text === '') return 'page.cxpReports.msg.searchFilterRequired';
  if (!hasProvider(providerId) && text.length < MIN_SEARCH_CHARS) return 'page.cxpReports.msg.searchTooShort';
  return '';
};

// Consulta/cuerpo con solo lo que se llenó (proveedor 0 = todos).
export const buildAsOfQuery = ({ date, providerId }) => {
  const query = {};
  if (filled(date)) query.date = date;
  if (hasProvider(providerId)) query.providerId = Number(providerId);
  return query;
};
export const buildHistoryQuery = ({ providerId, dateStart, dateEnd }) => {
  const query = {};
  if (hasProvider(providerId)) query.providerId = Number(providerId);
  if (filled(dateStart)) { query.dateStart = dateStart; query.dateEnd = dateEnd; }
  return query;
};
export const buildRangeQuery = ({ dateStart, dateEnd, providerId }) => ({ ...(hasProvider(providerId) ? { providerId: Number(providerId) } : {}), dateStart, dateEnd });

const zero = (fields) => Object.fromEntries(fields.map((f) => [f, 0]));
const rowsOf = (data) => (Array.isArray(data?.rows) ? data.rows : []);
export const normalizeProjection = (data) => ({
  date: data?.date || '', rows: rowsOf(data), totals: { ...zero([...AGING_FIELDS, 'total']), ...(data?.totals || {}) }, percents: { ...zero(AGING_FIELDS), ...(data?.percents || {}) }
});
export const normalizeCash = (data) => ({ date: data?.date || '', rows: rowsOf(data), totals: { originalValue: 0, creditNotes: 0, debitNotes: 0, payments: 0, balance: 0, ...(data?.totals || {}) } });
export const normalizePeriod = (data) => ({
  rows: rowsOf(data), totals: { accumulated: 0, added: 0, total: 0, paid: 0, balance: 0, ...(data?.totals || {}) },
  orphans: { count: 0, total: 0, rows: [], ...(data?.orphans || {}) }
});
export const normalizeHistory = (data) => ({ rows: rowsOf(data), totals: { totalDocuments: 0, totalPaid: 0, ...(data?.totals || {}) } });
export const normalizeProviderHistory = (data) => ({ rows: rowsOf(data), totals: { originalValue: 0, creditNoteValue: 0, debitNoteValue: 0, balance: 0, ...(data?.totals || {}) } });

// Los proveedores del combo salen del selector corto (`getSL`), no del listado completo.
export const providerOptions = (rows) => (Array.isArray(rows) ? rows : []).map((item) => ({ label: `${item.id} | ${item.name}`, value: item.id }));

// Estado de un documento respecto de su vencimiento. `numDays` = días de vencido (negativo si aún no vence; null sin vencimiento).
export const dueStatus = (numDays) => {
  if (numDays === null || numDays === undefined) return { code: 'noDue', days: 0 };
  return numDays > 0 ? { code: 'overdue', days: numDays } : { code: 'toDue', days: Math.abs(numDays) };
};
