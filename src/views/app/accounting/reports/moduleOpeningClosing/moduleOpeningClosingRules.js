// Reglas de la pantalla Apertura y Cierre de Módulos (SPEC v2-130-sr), las mismas del back (`modules/accounting/moduleOpeningClosing/moduleOpeningClosingRules.js`): año, estado 0/1 y lectura de la matriz mes x módulo.
// El back decide y valida; aquí se evita el viaje y se explica cada cambio antes de confirmarlo.
export const PRIVILEGE_SCREEN = '03.01.017';
export const BASE_PATH = 'accounting/reports/moduleOpeningClosing';
export const MIN_YEAR = 2010;
export const STATUS_CLOSED = 0;
export const STATUS_OPEN = 1;

export const maxYear = (now = new Date()) => now.getFullYear() + 1;

// Error del año (id de traducción) o vacío si está bien.
export const validateYear = (year, now = new Date()) => {
  const text = String(year ?? '').trim();
  if (!/^\d{4}$/.test(text)) return 'page.moduleOpeningClosing.msg.yearInvalid';
  const n = Number(text);
  if (n < MIN_YEAR || n > maxYear(now)) return 'page.moduleOpeningClosing.msg.yearInvalid';
  return '';
};

export const yearPath = (year) => `${BASE_PATH}/year/${Number(year)}`;
export const generateBody = (monthIndex, year) => ({ monthIndex: Number(monthIndex), year: Number(year) });
export const statusBody = (status) => ({ status: status === STATUS_OPEN ? STATUS_OPEN : STATUS_CLOSED });
export const bulkBody = (headerId, status) => ({ headerId: Number(headerId), status: status === STATUS_OPEN ? STATUS_OPEN : STATUS_CLOSED });

// Estado de una celda (módulo de un mes): `none` si el período aún no tiene detalle de ese módulo.
export const cellState = (cell) => {
  if (!cell || cell.status === null || cell.status === undefined) return 'none';
  return Number(cell.status) === STATUS_OPEN ? 'open' : 'closed';
};

// Al pulsar una celda se pide el estado contrario.
export const nextStatus = (cell) => (cellState(cell) === 'open' ? STATUS_CLOSED : STATUS_OPEN);

// Estado del mes completo: sin generar, todo abierto, todo cerrado o mixto.
export const monthState = (month) => {
  if (!month || !month.generated) return 'notGenerated';
  const total = month.cells.filter((c) => cellState(c) !== 'none').length;
  if (total === 0) return 'empty';
  if (month.open === total) return 'allOpen';
  if (month.closed === total) return 'allClosed';
  return 'mixed';
};

const zeroMonth = (i) => ({ monthIndex: i + 1, monthName: '', year: 0, periodId: null, dateIn: '', dateOut: '', generated: false, cells: [], open: 0, closed: 0 });

// Respuesta del back con valores seguros para pintar.
export const normalizeYear = (data) => ({
  year: Number(data?.year || 0),
  modules: Array.isArray(data?.modules) ? data.modules : [],
  months: Array.isArray(data?.months) && data.months.length > 0 ? data.months : Array.from({ length: 12 }, (_, i) => zeroMonth(i))
});

export const normalizeSettings = (data) => ({ closingEnforced: Boolean(data?.closingEnforced), globalCloseDate: String(data?.globalCloseDate || '') });

// Cantidad de módulos cerrados del año (para el aviso del encabezado).
export const closedCount = (year) => year.months.reduce((acc, m) => acc + m.closed, 0);
