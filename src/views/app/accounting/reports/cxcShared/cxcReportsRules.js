// Reglas compartidas de los reportes de Cuentas por Cobrar (SPEC v2-132-sr), las mismas del back (`modules/accounting/cxcReports/cxcReportRules.js`): rutas, validación de filtros y lectura segura de las respuestas.
// El back decide y calcula (semanas, antigüedad, totales y saldos); aquí se evita el viaje y se explica el error antes de pedir.
export const BASE_PATH = 'accounting/reports/cxcReports';
export const CXC_PROCESS_PATH = 'accounting/process/cxc';
export const MIN_SEARCH_CHARS = 3;
export const CURRENCY_LEMPIRAS = 1;
export const CURRENCY_DOLLARS = 2;

export const WEEK_FIELDS = ['week1', 'week2', 'week3', 'week4', 'week5', 'week6', 'week7', 'week8', 'weekLater', 'weekTotal'];
export const AGING_FIELDS = ['valCurr', 'val30', 'val60', 'val90', 'val120', 'val150', 'valMore'];

const pad = (n) => String(n).padStart(2, '0');
export const localToday = (now = new Date()) => `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

export const isRealDate = (value) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? '').trim());
  if (!m) return false;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.getUTCFullYear() === Number(m[1]) && d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[3]);
};

// Id de traducción del error de la fecha de corte, o vacío si está bien (puede ser futura: una proyección lo permite).
export const validateAsOfDate = (date) => (isRealDate(date) ? '' : 'page.cxcReports.msg.dateInvalid');

// Histórico: cliente o rango completo de FECHAS DE FACTURA (ambas, reales y desde <= hasta).
export const validateHistoryFilter = ({ customerId, dateStart, dateEnd }) => {
  const hasStart = String(dateStart ?? '').trim() !== '';
  const hasEnd = String(dateEnd ?? '').trim() !== '';
  if (hasStart !== hasEnd) return 'page.cxcReports.msg.historyRangeIncomplete';
  if (hasStart) {
    if (!isRealDate(dateStart) || !isRealDate(dateEnd)) return 'page.cxcReports.msg.dateInvalid';
    if (dateStart > dateEnd) return 'page.cxcReports.msg.historyRangeInverted';
  }
  if (!(Number(customerId) > 0) && !hasStart) return 'page.cxcReports.msg.historyFilterRequired';
  return '';
};

// Buscador de facturas del rastreo: un cliente o al menos 3 caracteres del documento.
export const validateSearch = ({ customerId, documentCode }) => {
  const text = String(documentCode ?? '').trim();
  if (!(Number(customerId) > 0) && text === '') return 'page.cxcReports.msg.searchFilterRequired';
  if (!(Number(customerId) > 0) && text.length < MIN_SEARCH_CHARS) return 'page.cxcReports.msg.searchTooShort';
  return '';
};

export const validateInsurer = ({ insurerId }) => (Number(insurerId) > 0 ? '' : 'page.cxcReports.msg.insurerRequired');

export const normalizeSettings = (data) => ({ hasDualCurrency: data?.hasDualCurrency === true });
export const effectiveCurrency = (currency, settings) => (settings?.hasDualCurrency === true && Number(currency) === CURRENCY_DOLLARS ? CURRENCY_DOLLARS : CURRENCY_LEMPIRAS);

// Consulta de semanal y proyección: fecha de corte, moneda (dólares solo si la empresa factura en ambas) y filtros opcionales en 0 = todos.
export const buildAsOfQuery = ({ date, currency, customerId, customerTypeId }, settings) => {
  const query = { date, currency: effectiveCurrency(currency, settings) };
  if (Number(customerId) > 0) query.customerId = Number(customerId);
  if (Number(customerTypeId) > 0) query.customerTypeId = Number(customerTypeId);
  return query;
};

// Histórico: cuerpo/consulta con solo lo que se llenó.
export const buildHistoryQuery = ({ customerId, dateStart, dateEnd }) => {
  const query = {};
  if (Number(customerId) > 0) query.customerId = Number(customerId);
  if (String(dateStart ?? '').trim() !== '') { query.dateStart = dateStart; query.dateEnd = dateEnd; }
  return query;
};

const zero = (fields) => Object.fromEntries(fields.map((f) => [f, 0]));
export const normalizeWeekly = (data) => ({ date: data?.date || '', rows: Array.isArray(data?.rows) ? data.rows : [], totals: { ...zero(WEEK_FIELDS), ...(data?.totals || {}) } });
export const normalizeProjection = (data) => ({
  date: data?.date || '', rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: { ...zero([...AGING_FIELDS, 'total']), ...(data?.totals || {}) }, percents: { ...zero(AGING_FIELDS), ...(data?.percents || {}) }
});
export const normalizeHistory = (data) => ({ rows: Array.isArray(data?.rows) ? data.rows : [], totals: { totalDocuments: 0, totalPaid: 0, ...(data?.totals || {}) } });
export const normalizeInsurer = (data) => ({ rows: Array.isArray(data?.rows) ? data.rows : [], totals: { balance: 0, ...(data?.totals || {}) } });

// Los clientes del combo salen del selector corto (`getSL`), no del listado completo.
export const customerOptions = (rows) => (Array.isArray(rows) ? rows : []).map((item) => ({ label: `${item.id} | ${item.name}`, value: item.id }));
