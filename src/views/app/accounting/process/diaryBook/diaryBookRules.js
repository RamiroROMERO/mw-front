// Reglas de la pantalla Libro Diario (SPEC v2-126-sr), las mismas del back (`modules/accounting/diaryBook/diaryBookRules.js`): rango de fechas (por defecto el mes en curso), cuenta, página y texto del rango.
// El back es quien decide; aquí se evita el viaje y se explica el motivo.
export const PRIVILEGE_SCREEN = '03.02.004';
export const PAGE_SIZE = 50;
export const MAX_ACCOUNT = 20;
export const BASE_PATH = 'accounting/process/diaryBook';

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Primer y último día del mes en curso (el rango por defecto: consulta corta).
export const currentMonthRange = (now = new Date()) => ({
  dateStart: ymd(new Date(now.getFullYear(), now.getMonth(), 1)),
  dateEnd: ymd(new Date(now.getFullYear(), now.getMonth() + 1, 0))
});

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
export const validateQuery = ({ dateStart, dateEnd }) => {
  const errors = {};
  if (!day(dateStart)) errors.dateStart = 'page.diaryBook.error.date.required';
  else if (!isValidDate(dateStart)) errors.dateStart = 'page.diaryBook.error.date.invalid';
  if (!day(dateEnd)) errors.dateEnd = 'page.diaryBook.error.date.required';
  else if (!isValidDate(dateEnd)) errors.dateEnd = 'page.diaryBook.error.date.invalid';
  if (Object.keys(errors).length === 0 && day(dateStart) > day(dateEnd)) errors.dateEnd = 'page.diaryBook.msg.invalidDateRange';
  return errors;
};

// SearchSelect vuelve a "0" (string) al limpiar la selección, no a "": nunca se filtra por una cuenta literal "0".
export const normalizeAccount = (accountCode) => (String(accountCode ?? '').trim() === '0' ? '' : String(accountCode ?? '').trim());

// Cuerpo de la consulta y del Excel (misma forma). `page` solo aplica a la pantalla.
export const buildQuery = ({ dateStart, dateEnd, accountCode }, { page, search } = {}) => {
  const body = { startDate: day(dateStart), endDate: day(dateEnd), accountCode: normalizeAccount(accountCode) };
  if (search) body.search = String(search).trim();
  if (page) { body.page = page; body.pageSize = PAGE_SIZE; }
  return body;
};

export const totalPages = (totalRecords) => Math.max(1, Math.ceil(Number(totalRecords || 0) / PAGE_SIZE));

// Texto de rango bajo la tabla, por ejemplo "1-50 / 321" ("0" si no hay filas).
export const rangeSummary = (page, totalRecords) => {
  const total = Number(totalRecords || 0);
  if (total === 0) return '0';
  const from = (page - 1) * PAGE_SIZE + 1;
  return `${from}-${Math.min(page * PAGE_SIZE, total)} / ${total}`;
};

// Respuesta del back con valores seguros para pintar.
export const normalizeResponse = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: { count: Number(data?.totals?.count || 0), debit: Number(data?.totals?.debit || 0), credit: Number(data?.totals?.credit || 0), diff: Number(data?.totals?.diff || 0) },
  totalRecords: Number(data?.pagination?.totalRecords || 0)
});
