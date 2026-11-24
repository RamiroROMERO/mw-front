// Reglas de Gastos Administrativos (cont_gastadmin.sc2, SPEC v2-121-sr): las MISMAS del AdminExpenseDTO del back, para avisar por campo sin llamar al back.
// Los textos son ids de traducción (el componente los traduce).
export const PRIVILEGE_SCREEN = '03.02.006';
export const MAX_DESCRIPTION = 200;
export const MAX_RESPONSIBLE = 50;
export const MAX_DOCUMENT = 20;
export const MAX_LINE_TEXT = 120;
export const MAX_LINES = 500;

const MAX_AMOUNT_CENTS = 999999999999;
const text = (value) => String(value ?? '').trim();

export const toCents = (value) => {
  const raw = text(value);
  if (raw === '') return 0;
  const [whole, frac = ''] = raw.split('.');
  return Number(whole) * 100 + Number(`${frac}00`.slice(0, 2));
};

export const isValidAmount = (value) => {
  const raw = text(value);
  return /^\d+(\.\d{1,2})?$/.test(raw) && toCents(raw) <= MAX_AMOUNT_CENTS;
};

export const isRealDate = (value) => {
  const d = text(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const parsed = new Date(`${d}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === d;
};

export const localToday = (now = new Date()) => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

// Valor de una línea: exento + gravado + impuesto en centavos (como el back).
export const lineValueCents = (line) => toCents(line.valExent) + toCents(line.valGrav) + toCents(line.valTax);

export const validateHeader = ({ date, description, responsible }, today = localToday()) => {
  const errors = {};
  if (!text(date)) errors.date = 'page.adminExpenses.error.required';
  else if (!isRealDate(date)) errors.date = 'page.adminExpenses.error.date';
  else if (text(date).slice(0, 10) > today) errors.date = 'page.adminExpenses.error.futureDate';
  if (!text(description)) errors.description = 'page.adminExpenses.error.required';
  else if (text(description).length > MAX_DESCRIPTION) errors.description = 'page.adminExpenses.error.maxLength';
  if (text(responsible).length > MAX_RESPONSIBLE) errors.responsible = 'page.adminExpenses.error.maxLength';
  return errors;
};

// Una línea (al agregar o editar): id de traducción del primer problema o ''.
export const validateLine = (line) => {
  if (!text(line.documentCode)) return 'page.adminExpenses.msg.missingDocumentCode';
  if (text(line.documentCode).length > MAX_DOCUMENT) return 'page.adminExpenses.error.maxLength';
  if (!text(line.date)) return 'page.adminExpenses.msg.missingDate';
  if (!isRealDate(line.date)) return 'page.adminExpenses.error.date';
  if (!text(line.name)) return 'page.adminExpenses.msg.missingDescription';
  if (!text(line.provider)) return 'page.adminExpenses.msg.missingProvider';
  if (text(line.name).length > MAX_LINE_TEXT || text(line.provider).length > MAX_LINE_TEXT) return 'page.adminExpenses.error.maxLength';
  if (!text(line.idCtaCont)) return 'page.adminExpenses.msg.missingAccount';
  if (['valExent', 'valGrav', 'valTax'].some((f) => text(line[f]) !== '' && !isValidAmount(line[f]))) return 'page.adminExpenses.error.amount';
  if (lineValueCents(line) === 0) return 'page.adminExpenses.msg.zeroItem';
  return '';
};

export const validateDocument = ({ header, lines }, today = localToday()) => {
  const headerErrors = validateHeader(header, today);
  let documentError = '';
  if (!Array.isArray(lines) || lines.length === 0) documentError = 'page.adminExpenses.msg.noDetail';
  else if (lines.length > MAX_LINES) documentError = 'page.adminExpenses.error.maxLines';
  else {
    const bad = lines.find((line) => validateLine(line));
    if (bad) documentError = validateLine(bad);
  }
  return { headerErrors, documentError };
};
