// Reglas de la pantalla Partidas de Diario (SPEC v2-125-sr), las mismas del back (`modules/accounting/dailyItems/dailyItemRules.js`): fecha, líneas, cuadre en centavos y qué se puede hacer con
// una partida. El back es quien decide; aquí se evita el viaje y se explica el motivo.
export const PRIVILEGE_SCREEN = '03.02.003';
export const MAX_LINES = 1000;
export const MAX_VALUE = 999999999999.99;
export const DEFAULT_CURRENCY = 'Lempiras'; // el back guarda el NOMBRE de la moneda (set_currency.name), no su código

export const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Fecha de calendario `AAAA-MM-DD` real (también bisiestos).
export const isValidDate = (text) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text ?? '').trim().slice(0, 10));
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const check = new Date(Date.UTC(y, m - 1, d));
  return check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d;
};

// Monto no negativo con máximo 2 decimales; vacío cuenta como 0. NaN si no es válido.
export const money = (value) => {
  if (value === undefined || value === null || String(value).trim() === '') return 0;
  const raw = String(value).trim();
  if (!(/^\d+(\.\d+)?$/.test(String(raw).trim()) && Number.isInteger(Number((Number(raw) * 100).toPrecision(12))))) return NaN;
  const number = Number(raw);
  return number > MAX_VALUE ? NaN : number;
};

export const toCents = (value) => Math.round(Number((Number(value || 0) * 100).toPrecision(15)));

// Errores del encabezado (id de traducción por campo); vacío si está bien.
export const validateHeader = ({ documentCode, date }, today = todayLocal()) => {
  const errors = {};
  if (!String(documentCode ?? '').trim()) errors.documentCode = 'page.dailyItems.error.documentCode.required';
  const day = String(date ?? '').slice(0, 10);
  if (!isValidDate(day)) errors.date = 'page.dailyItems.error.date.invalid';
  else if (day > today) errors.date = 'page.dailyItems.error.date.future';
  return errors;
};

// Una línea: id de traducción del primer problema, o '' si está bien (cuenta y descripción obligatorias, montos válidos, no en cero y no a la vez en Debe y Haber).
export const lineProblem = (line = {}) => {
  if (!String(line.accountNumber ?? '').trim() || !String(line.description ?? '').trim()) return 'page.dailyItems.msg.missingData';
  const debit = money(line.valueDebit);
  const credit = money(line.valueCredit);
  if (Number.isNaN(debit) || Number.isNaN(credit)) return 'page.dailyItems.error.value.invalid';
  if (toCents(debit) === 0 && toCents(credit) === 0) return 'page.dailyItems.msg.zeroItem';
  if (toCents(debit) !== 0 && toCents(credit) !== 0) return 'page.dailyItems.error.bothSides';
  return '';
};

// Totales en centavos (sin arrastre de coma flotante).
export const totalsOf = (lines = []) => {
  const debit = lines.reduce((sum, l) => sum + toCents(l.valueDebit), 0);
  const credit = lines.reduce((sum, l) => sum + toCents(l.valueCredit), 0);
  return { totalDebit: debit / 100, totalCredit: credit / 100, diff: (debit - credit) / 100 };
};

// Primer problema para guardar (id de traducción) o ''.
export const saveProblem = ({ header, lines }, today = todayLocal()) => {
  const headerErrors = validateHeader(header, today);
  if (Object.keys(headerErrors).length > 0) return Object.values(headerErrors)[0];
  if (!lines || lines.length === 0) return 'page.dailyItems.msg.noDetail';
  if (lines.length > MAX_LINES) return 'page.dailyItems.error.lines.tooMany';
  for (const line of lines) {
    const problem = lineProblem(line);
    if (problem) return problem;
  }
  if (totalsOf(lines).diff !== 0) return 'page.dailyItems.msg.unbalanced';
  return '';
};

// Una partida guardada es "manual" si se creó aquí; las de otros módulos se editan solo con 99.20.006 y no se eliminan desde esta pantalla.
export const isManualEntry = (header) => header?.isManual !== false;
export const isReadOnly = ({ id, header }, privileges) => Number(id) > 0 && !isManualEntry(header) && privileges?.canEditOther !== true;
export const canDeleteEntry = ({ id, header }, privileges) => Number(id) > 0 && isManualEntry(header) && privileges?.canDelete === true;
