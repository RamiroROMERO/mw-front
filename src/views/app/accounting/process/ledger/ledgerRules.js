// Reglas de la pantalla Libro Mayor (SPEC v2-127-sr), las mismas del back (`modules/accounting/ledger/ledgerRules.js`): rango (por defecto el mes en curso), cuenta o cuentas, página y texto del rango.
// El back es quien decide; aquí se evita el viaje y se explica el motivo.
export const PRIVILEGE_SCREEN = '03.02.005';
export const PAGE_SIZE = 50;
export const MAX_ACCOUNTS = 50;
export const BASE_PATH = 'accounting/process/ledger';

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Primer y último día del mes en curso (el rango por defecto: consulta corta).
export const currentMonthRange = (now = new Date()) => ({
  dateStart: ymd(new Date(now.getFullYear(), now.getMonth(), 1)),
  dateEnd: ymd(new Date(now.getFullYear(), now.getMonth() + 1, 0))
});

export const isValidDate = (text) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text ?? '').trim().slice(0, 10));
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const check = new Date(Date.UTC(y, m - 1, d));
  return check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d;
};

const day = (value) => String(value ?? '').trim().slice(0, 10);
// SearchSelect vuelve a "0" (string) al limpiar la selección.
export const normalizeAccount = (accountCode) => (String(accountCode ?? '').trim() === '0' ? '' : String(accountCode ?? '').trim());

// Errores por campo (id de traducción); vacío si está bien.
export const validateQuery = ({ mode, dateStart, dateEnd, accountCode, accountCodes }) => {
  const errors = {};
  if (!day(dateStart)) errors.dateStart = 'page.diaryBook.error.date.required';
  else if (!isValidDate(dateStart)) errors.dateStart = 'page.diaryBook.error.date.invalid';
  if (!day(dateEnd)) errors.dateEnd = 'page.diaryBook.error.date.required';
  else if (!isValidDate(dateEnd)) errors.dateEnd = 'page.diaryBook.error.date.invalid';
  if (!errors.dateStart && !errors.dateEnd && day(dateStart) > day(dateEnd)) errors.dateEnd = 'page.diaryBook.msg.invalidDateRange';
  if (mode === 'multi') {
    const list = (accountCodes || []).filter(Boolean);
    if (list.length === 0) errors.accounts = 'page.ledger.msg.missingAccounts';
    else if (list.length > MAX_ACCOUNTS) errors.accounts = 'page.ledger.msg.tooManyAccounts';
  } else if (!normalizeAccount(accountCode)) {
    errors.account = 'page.ledger.msg.missingAccount';
  }
  return errors;
};

// Cuerpo de la consulta y del Excel (misma forma). `page` solo aplica a la pantalla.
export const buildQuery = ({ mode, dateStart, dateEnd, accountCode, accountCodes }, { page } = {}) => {
  const body = { startDate: day(dateStart), endDate: day(dateEnd) };
  if (mode === 'multi') body.accountCodes = (accountCodes || []).filter(Boolean);
  else body.accountCode = normalizeAccount(accountCode);
  if (page) { body.page = page; body.pageSize = PAGE_SIZE; }
  return body;
};

export const exportPath = (mode) => (mode === 'multi' ? `${BASE_PATH}/multi/exportXLSX` : `${BASE_PATH}/exportXLSX`);
export const searchPath = (mode) => (mode === 'multi' ? `${BASE_PATH}/multi` : BASE_PATH);

export const totalPages = (totalRecords) => Math.max(1, Math.ceil(Number(totalRecords || 0) / PAGE_SIZE));

export const rangeSummary = (page, totalRecords) => {
  const total = Number(totalRecords || 0);
  if (total === 0) return '0';
  const from = (page - 1) * PAGE_SIZE + 1;
  return `${from}-${Math.min(page * PAGE_SIZE, total)} / ${total}`;
};

// Respuesta del back (cuenta actual o varias cuentas) con valores seguros para pintar.
export const normalizeResponse = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: { count: Number(data?.totals?.count || 0), debit: Number(data?.totals?.debit || 0), credit: Number(data?.totals?.credit || 0) },
  totalRecords: Number(data?.pagination?.totalRecords || 0),
  account: data?.account || null,
  openingBalance: Number(data?.openingBalance || 0),
  closingBalance: Number(data?.closingBalance || 0)
});
