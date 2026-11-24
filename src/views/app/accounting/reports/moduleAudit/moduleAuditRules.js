// Reglas de la pantalla Auditoría de Módulos (SPEC v2-129-sr), las mismas del back (`modules/accounting/moduleAudit/moduleAuditRules.js`): rango (por defecto del 1 del mes a hoy), módulo, estado, página y respuesta segura.
// El back es quien decide y calcula (estado, diferencia, totales y contadores); aquí solo se valida y se ordena lo que se muestra.
export const PRIVILEGE_SCREEN = '03.03.001';
export const BASE_PATH = 'accounting/reports/moduleAudit';
export const PAGE_SIZE = 50;
export const STATUS_FILTERS = ['all', 'issues'];
export const STATUS_LABELS = {
  noPda: 'page.moduleAudit.table.status.noPda',
  missingPda: 'page.moduleAudit.table.status.missingPda',
  mismatch: 'page.moduleAudit.table.status.mismatch',
  ok: 'page.moduleAudit.table.status.ok'
};
// Color del texto del estado (sin partida y partida inexistente son lo más grave).
export const STATUS_CLASS = { noPda: 'text-danger', missingPda: 'text-danger', mismatch: 'text-warning', ok: 'text-success' };

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Del primer día del mes a hoy.
export const defaultRange = (now = new Date()) => ({ dateStart: ymd(new Date(now.getFullYear(), now.getMonth(), 1)), dateEnd: ymd(now) });

export const isValidDate = (text) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text ?? '').trim().slice(0, 10));
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const check = new Date(Date.UTC(y, m - 1, d));
  return check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d;
};

const day = (value) => String(value ?? '').trim().slice(0, 10);

// Errores por campo (id de traducción); vacío si está bien.
export const validateQuery = ({ moduleId, dateStart, dateEnd }) => {
  const errors = {};
  if (!Number(moduleId)) errors.moduleId = 'page.moduleAudit.msg.moduleRequired';
  if (!day(dateStart)) errors.dateStart = 'page.diaryBook.error.date.required';
  else if (!isValidDate(dateStart)) errors.dateStart = 'page.diaryBook.error.date.invalid';
  if (!day(dateEnd)) errors.dateEnd = 'page.diaryBook.error.date.required';
  else if (!isValidDate(dateEnd)) errors.dateEnd = 'page.diaryBook.error.date.invalid';
  if (!errors.dateStart && !errors.dateEnd && day(dateStart) > day(dateEnd)) errors.dateEnd = 'page.diaryBook.msg.invalidDateRange';
  return errors;
};

// Cuerpo de la consulta y del Excel (misma forma). `page` solo aplica a la pantalla.
export const buildQuery = ({ moduleId, dateStart, dateEnd }, { page, search, status } = {}) => {
  const body = { moduleId: Number(moduleId), startDate: day(dateStart), endDate: day(dateEnd) };
  if (status && status !== 'all') body.status = status;
  if (search) body.search = String(search).trim();
  if (page) { body.page = page; body.pageSize = PAGE_SIZE; }
  return body;
};
export const buildSummaryQuery = ({ dateStart, dateEnd }) => ({ startDate: day(dateStart), endDate: day(dateEnd) });

export const totalPages = (totalRecords) => Math.max(1, Math.ceil(Number(totalRecords || 0) / PAGE_SIZE));
export const rangeSummary = (page, totalRecords) => {
  const total = Number(totalRecords || 0);
  if (total === 0) return '0';
  const from = (page - 1) * PAGE_SIZE + 1;
  return `${from}-${Math.min(page * PAGE_SIZE, total)} / ${total}`;
};

const zeroCounts = { all: 0, noPda: 0, missingPda: 0, mismatch: 0, ok: 0, issues: 0 };

// Respuesta del detalle con valores seguros para pintar.
export const normalizeResponse = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: { count: Number(data?.totals?.count || 0), value: Number(data?.totals?.value || 0), accountingValue: Number(data?.totals?.accountingValue || 0), difference: Number(data?.totals?.difference || 0) },
  counts: { ...zeroCounts, ...(data?.counts || {}) },
  totalRecords: Number(data?.pagination?.totalRecords || 0)
});

export const normalizeSummary = (data) => (Array.isArray(data) ? data.map((r) => ({ ...r, counts: { ...zeroCounts, ...(r.counts || {}) } })) : []);

// Encabezado y líneas de la partida con totales (en centavos) para el modal.
export const normalizePdaDetail = (data, pdaNumber) => {
  const lines = Array.isArray(data?.lines) ? data.lines : [];
  const cents = (n) => Math.round(Number(n || 0) * 100);
  return {
    pdaNumber,
    header: data?.header || null,
    lines,
    totalDebit: lines.reduce((a, l) => a + cents(l.debit), 0) / 100,
    totalCredit: lines.reduce((a, l) => a + cents(l.credit), 0) / 100
  };
};
