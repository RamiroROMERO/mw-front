// Reglas puras de la pantalla "Cuentas bloqueadas" (SPEC v2-30, front). El back decide siempre (cuenta de detalle, bloqueo
// repetido, rango); esto arma el cuerpo y evita llamadas inútiles.

export const PRIVILEGE_SCREEN = '03.01.045';
export const NO_START = '1900-01-01';
export const NO_END = '2999-12-31';
export const MIN_REASON = 3;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const clean = (value) => String(value === undefined || value === null ? '' : value).trim();
const day = (value) => clean(value).slice(0, 10);

export const isActive = (row = {}) => Number(row.status) === 1;

// "Siempre" cuando el bloqueo no limita fechas; si no, el rango (o "desde"/"hasta" cuando solo limita un extremo).
export const rangeKind = (row = {}) => {
  const start = day(row.dateStart);
  const end = day(row.dateEnd);
  const openStart = !start || start === NO_START;
  const openEnd = !end || end === NO_END;
  if (openStart && openEnd) return 'always';
  if (openStart) return 'until';
  if (openEnd) return 'from';
  return 'range';
};

// Fecha para el formulario: el centinela se muestra vacío.
export const formDate = (value, sentinel) => (day(value) === sentinel ? '' : day(value));

// Clave de traducción del primer problema del formulario, o null si se puede enviar.
export const validateLockForm = (form = {}, { creating = true } = {}) => {
  if (creating && !clean(form.accountCode)) return 'page.lockedAccounts.msg.accountRequired';
  if (clean(form.reason).length < MIN_REASON) return 'page.lockedAccounts.msg.reasonRequired';
  const start = clean(form.dateStart);
  const end = clean(form.dateEnd);
  if ((start && !DATE.test(start)) || (end && !DATE.test(end))) return 'page.lockedAccounts.msg.rangeInvalid';
  if (start && end && start > end) return 'page.lockedAccounts.msg.rangeInvalid';
  return null;
};

// Cuerpo de POST (sin fechas vacías: el back usa "siempre").
export const buildLockBody = (form = {}) => {
  const body = { accountCode: clean(form.accountCode), reason: clean(form.reason) };
  if (clean(form.dateStart)) body.dateStart = clean(form.dateStart);
  if (clean(form.dateEnd)) body.dateEnd = clean(form.dateEnd);
  return body;
};

// Cuerpo de PUT: solo lo que cambió (el back no registra bitácora si nada cambia). Vaciar una fecha vuelve al "siempre".
export const buildUpdateBody = (row = {}, form = {}) => {
  const body = {};
  if (clean(form.reason) !== clean(row.reason)) body.reason = clean(form.reason);
  if (clean(form.dateStart) !== formDate(row.dateStart, NO_START)) body.dateStart = clean(form.dateStart) || NO_START;
  if (clean(form.dateEnd) !== formDate(row.dateEnd, NO_END)) body.dateEnd = clean(form.dateEnd) || NO_END;
  return body;
};

// Las cuentas que se pueden bloquear en el selector: las que aún no están bloqueadas (el back rechaza una repetida).
export const lockableAccounts = (accounts = []) => accounts.filter((account) => !account.blocked);

export const STATUS_FILTERS = ['1', '0', 'all'];
