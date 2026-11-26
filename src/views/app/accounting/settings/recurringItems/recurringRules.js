import { formatAccountCode } from '@Helpers/accountFormat';
// Reglas de Partidas Recurrentes (cont_pdas_pre.sc2, SPEC v2-121-sr): las MISMAS del RecurringItemDTO y del servicio del back, para avisar por campo sin llamar al back.
// Los textos son ids de traducción (el componente los traduce).
export const PRIVILEGE_SCREEN = '03.01.014';
export const MAX_NAME = 80;
export const MAX_REFERENCE = 50;
export const MAX_LINES = 500;

const MAX_AMOUNT_CENTS = 999999999999;
const text = (value) => String(value ?? '').trim();

export const toCents = (value) => {
  const raw = text(value);
  if (raw === '') return 0;
  const [whole, frac = ''] = raw.split('.');
  return Number(whole) * 100 + Number(`${frac}00`.slice(0, 2));
};

// Monto no negativo con hasta 2 decimales y dentro de decimal(12,2).
export const isValidAmount = (value) => {
  const raw = text(value);
  return /^\d+(\.\d{1,2})?$/.test(raw) && toCents(raw) <= MAX_AMOUNT_CENTS;
};

// Encabezado: devuelve { campo: idDeTraducción } (vacío si todo está bien).
export const validateHeader = ({ name, descrip, dayRun }) => {
  const errors = {};
  if (!text(name)) errors.name = 'page.recurringItems.error.required';
  else if (text(name).length > MAX_NAME) errors.name = 'page.recurringItems.error.maxName';
  if (!text(descrip)) errors.descrip = 'page.recurringItems.error.required';
  const day = Number(dayRun);
  if (!text(dayRun) || !Number.isInteger(day) || day < 1 || day > 31) errors.dayRun = 'page.recurringItems.error.dayRun';
  return errors;
};

// Una línea (al agregar o editar): devuelve el id de traducción del primer problema o ''.
export const validateLine = (line) => {
  if (!text(line.idCtaAccount)) return 'page.recurringItems.msg.missingAccount';
  if (!text(line.name)) return 'page.recurringItems.msg.missingSynopsis';
  if (text(line.referenceCode).length > MAX_REFERENCE) return 'page.recurringItems.error.maxReference';
  const debit = text(line.valDebe) === '' ? 0 : line.valDebe;
  const credit = text(line.valHaber) === '' ? 0 : line.valHaber;
  if (!isValidAmount(debit) || !isValidAmount(credit)) return 'page.recurringItems.error.amount';
  if (toCents(debit) === 0 && toCents(credit) === 0) return 'page.recurringItems.msg.zeroItem';
  return '';
};

// Documento completo antes de guardar: { headerErrors, documentError } con el id de traducción del primer problema del documento.
export const validateDocument = ({ header, lines }) => {
  const headerErrors = validateHeader(header);
  let documentError = '';
  if (!Array.isArray(lines) || lines.length === 0) documentError = 'page.recurringItems.msg.noDetail';
  else if (lines.length > MAX_LINES) documentError = 'page.recurringItems.error.maxLines';
  else if (lines.some((line) => validateLine(line))) documentError = validateLine(lines.find((line) => validateLine(line)));
  else {
    const debit = lines.reduce((sum, l) => sum + toCents(l.valDebe), 0);
    const credit = lines.reduce((sum, l) => sum + toCents(l.valHaber), 0);
    if (debit !== credit) documentError = 'page.recurringItems.msg.unbalanced';
  }
  return { headerErrors, documentError };
};

// Cuenta de una línea del detalle: "código - descripción". Las líneas que vienen del back traen solo el nombre y las agregadas en pantalla ya traen "código - nombre" (la etiqueta del combo): se
// quita el código repetido para no mostrarlo dos veces.
export const describeLineAccount = (line, format = '') => {
  const code = String(line?.idCtaAccount ?? '').trim();
  let name = String(line?.accountName ?? '').trim();
  if (code && name.startsWith(code)) name = name.slice(code.length).replace(/^\s*-\s*/, '').trim();
  const shown = formatAccountCode(code, format);
  if (!code) return name;
  return name && name !== code ? `${shown} - ${name}` : shown;
};
