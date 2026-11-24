// Reglas de la pantalla Flujo de Efectivo (SPEC v2-128-sr), las mismas del back (`modules/accounting/cashFlow/cashFlowRules.js`): fecha de corte, columnas de la proyección y de la antigüedad, y respuesta segura.
// El back es quien decide y calcula todo (semanas, rangos, totales y saldo proyectado); aquí solo se valida la fecha y se ordena lo que se muestra.
export const PRIVILEGE_SCREEN = '03.02.007';
export const BASE_PATH = 'accounting/process/cashFlow';
export const WEEK_FIELDS = ['week1', 'week2', 'week3', 'week4', 'week5', 'week6', 'week7', 'week8', 'weekLater', 'weekTotal'];
export const AGING_FIELDS = ['valCurr', 'val30', 'val60', 'val90', 'val120', 'val150', 'valMore', 'agingTotal'];
export const SECTIONS = { 1: 'summary', 2: 'payable', 3: 'receivable' };

export const FIELD_LABELS = {
  week1: 'page.cashFlow.table.week1', week2: 'page.cashFlow.table.week2', week3: 'page.cashFlow.table.week3', week4: 'page.cashFlow.table.week4',
  week5: 'page.cashFlow.table.week5', week6: 'page.cashFlow.table.week6', week7: 'page.cashFlow.table.week7', week8: 'page.cashFlow.table.week8',
  weekLater: 'page.cashFlow.table.weekLater', weekTotal: 'table.column.total',
  valCurr: 'page.cashFlow.table.current', val30: 'page.cashFlow.table.days30', val60: 'page.cashFlow.table.days60', val90: 'page.cashFlow.table.days90',
  val120: 'page.cashFlow.table.days120', val150: 'page.cashFlow.table.days150', valMore: 'page.cashFlow.table.daysMore', agingTotal: 'table.column.total'
};

const pad = (n) => String(n).padStart(2, '0');
export const todayLocal = (now = new Date()) => `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

// Fecha de calendario `AAAA-MM-DD` real (también bisiestos). Acepta fechas con hora (los primeros 10 caracteres).
export const isValidDate = (text) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text ?? '').trim().slice(0, 10));
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const check = new Date(Date.UTC(y, m - 1, d));
  return check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d;
};

const day = (value) => String(value ?? '').trim().slice(0, 10);

// Errores por campo (id de traducción); vacío si está bien.
export const validateQuery = ({ date }) => {
  const errors = {};
  if (!day(date)) errors.date = 'page.diaryBook.error.date.required';
  else if (!isValidDate(date)) errors.date = 'page.diaryBook.error.date.invalid';
  return errors;
};

export const buildQuery = ({ date }) => ({ date: day(date) });
export const buildExport = ({ date }, tab) => ({ date: day(date), section: SECTIONS[tab] || 'summary' });
export const exportFileName = (tab, format) => {
  const names = { summary: 'FlujoEfectivo', payable: 'FlujoEfectivoCuentasPorPagar', receivable: 'FlujoEfectivoCuentasPorCobrar' };
  return `${names[SECTIONS[tab] || 'summary']}.${format}`;
};
export const buildDocumentsQuery = ({ date }, kind, entityId) => ({ date: day(date), kind, entityId });

const zeroTotals = () => Object.fromEntries([...WEEK_FIELDS, ...AGING_FIELDS].map((f) => [f, 0]));
const safeSection = (section) => ({ rows: Array.isArray(section?.rows) ? section.rows : [], byType: Array.isArray(section?.byType) ? section.byType : [], totals: { ...zeroTotals(), ...(section?.totals || {}) } });

// Respuesta del back con valores seguros para pintar. Sin respuesta devuelve null (la pantalla no muestra nada).
export const normalizeSummary = (data) => {
  if (!data) return null;
  return {
    date: data.date || '',
    banks: Array.isArray(data.banks) ? data.banks : [],
    bankTotal: Number(data.bankTotal || 0),
    payable: safeSection(data.payable),
    receivable: safeSection(data.receivable),
    diff: { ...zeroTotals(), ...(data.diff || {}) },
    projection: { ...zeroTotals(), ...(data.projection || {}) }
  };
};

// Filas del resumen semanal (por cobrar, por pagar, diferencia y saldo proyectado) y del de antigüedad (sin proyección).
export const weekSummaryRows = (summary) => [
  { key: 'cxc', label: 'page.cashFlow.table.cxc', totals: summary.receivable.totals },
  { key: 'cxp', label: 'page.cashFlow.table.cxp', totals: summary.payable.totals },
  { key: 'diff', label: 'page.cashFlow.table.difference', totals: summary.diff },
  { key: 'projection', label: 'page.cashFlow.table.projected', totals: summary.projection }
];
export const agingSummaryRows = (summary) => weekSummaryRows(summary).filter((r) => r.key !== 'projection');

// Sub-rangos que le tocan a un documento (texto de las columnas): semana y antigüedad.
export const bucketLabels = (doc) => ({ week: FIELD_LABELS[doc.weekField] || '', aging: FIELD_LABELS[doc.agingField] || '' });

// Banco sin cuenta contable: el back lo deja en 0 y lo marca; se avisa con cuántos hay.
export const banksWithoutAccount = (banks) => banks.filter((b) => b.missingAccount).length;
