// Reglas de campos de Otras Compras (Facturas de Costos y Gastos independientes). Son las mismas que aplica el back
// (OtherPurchaseDTO y otherPurchaseRules.js de modules/inventory/otherPurchases): el back es quien decide; esto solo evita una
// llamada que ya se sabe rechazada y calcula el subtotal y el total mientras se captura. Los números y casos son los de
// modules/inventory/otherPurchases/__tests__ del back (SPEC v2-30-sr).
import { round2 } from '../purchaseOrders/purchaseOrderRules';

export const CASH = 1;
export const CREDIT = 2;
export const SUPPLIER = 1;
export const CREDITOR = 2;
export const EMPTY_DATE = '1900-01-01';

// Máximos de los textos (los mismos del DTO del back).
export const MAX = {
  documentCode: 5, invoiceNumber: 40, cai: 50, requestedBy: 50, description: 250, expenseCtaCode: 20,
  exemptedCertificate: 100, exemptedNumber: 100, exemptedRecord: 100
};

// Importes que captura el usuario. Subtotal y total se calculan.
export const AMOUNT_FIELDS = ['discount', 'valueExonerated', 'valueExempt', 'valueTaxable', 'tax', 'freight', 'otherCharges'];
// Campos que el back no deja cambiar con pagos o anticipos en la cuenta por pagar (FINANCIAL_FIELDS menos los calculados).
export const LOCKABLE_FIELDS = ['providerId', 'invoiceNumber', 'date', 'dateOut', 'typeFp', 'paymentTypeId', ...AMOUNT_FIELDS];
export const LOCK_REASONS = ['payments', 'advances'];
export const NOT_LOCKED = Object.freeze({ financial: false, reasons: Object.freeze([]) });

const text = (value) => String(value ?? '').trim();
const num = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};
const isBlank = (value) => value === undefined || value === null || text(value) === '';
const isPositiveInt = (value) => !isBlank(value) && Number.isInteger(Number(value)) && Number(value) > 0;
const isMoney = (value) => !isBlank(value) && Number.isFinite(Number(value));
const toCents = (value) => Math.round(round2(num(value)) * 100);
const day = (value) => {
  const date = text(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date !== EMPTY_DATE && date !== '0000-00-00' ? date : '';
};

// Fecha de hoy del navegador por calendario local (YYYY-MM-DD).
export const localToday = (now = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// Subtotal = exonerado + gravado + exento; total = subtotal - descuento + impuesto + flete + otros recargos (en centavos).
export const calculateTotals = (form = {}) => {
  const subtotal = toCents(form.valueExonerated) + toCents(form.valueTaxable) + toCents(form.valueExempt);
  const total = subtotal - toCents(form.discount) + toCents(form.tax) + toCents(form.freight) + toCents(form.otherCharges);
  return { subtotal: subtotal / 100, total: total / 100 };
};

/**
 * Valida el formulario. Devuelve { campo: idDeTraducción } con solo los campos inválidos ({} = válido). Mismas reglas que el DTO:
 * obligatorios, máximos, Contado/Crédito, fecha no futura, vencimiento >= fecha, importes >= 0 y total distinto de 0.
 */
export const validateOtherPurchase = (form = {}, { today = localToday() } = {}) => {
  const errors = {};
  const required = (field, id, valid) => {
    if (!valid(form[field])) errors[field] = id;
  };
  const maxLength = (field) => {
    if (!errors[field] && text(form[field]).length > MAX[field]) errors[field] = 'page.otherPurchases.validation.tooLong';
  };
  const code = (value) => !isBlank(value) && text(value) !== '0';

  required('documentCode', 'msg.required.select.typeDocument', code);
  required('typeTax', 'msg.required.select.typeTax', isPositiveInt);
  required('providerId', 'msg.required.select.provider', isPositiveInt);
  required('invoiceNumber', 'msg.required.input.numInvoice', (v) => !isBlank(v));
  required('paymentTypeId', 'msg.required.select.paymentType', isPositiveInt);
  required('typeFp', 'msg.required.select.typePurchase', (v) => [CASH, CREDIT].includes(Number(v)));
  required('expenseCtaCode', 'msg.required.select.noCtaExpense', code);
  required('description', 'msg.required.input.description', (v) => !isBlank(v));
  required('requestedBy', 'msg.required.input.name', (v) => !isBlank(v));
  required('date', 'msg.required.input.date', (v) => day(v) !== '');
  required('dateOut', 'msg.required.input.date', (v) => day(v) !== '');

  Object.keys(MAX).forEach(maxLength);

  if (!errors.date && day(form.date) > today) errors.date = 'page.otherPurchases.validation.dateFuture';
  if (!errors.date && !errors.dateOut && day(form.dateOut) < day(form.date)) errors.dateOut = 'page.otherPurchases.validation.dateOutBeforeDate';

  AMOUNT_FIELDS.forEach((field) => {
    if (!isBlank(form[field]) && (!isMoney(form[field]) || Number(form[field]) < 0)) errors[field] = 'page.otherPurchases.validation.negative';
  });
  if (!isMoney(form.total) || Number(form.total) === 0) errors.total = 'msg.required.input.total';
  else if (Number(form.total) < 0) errors.total = 'page.otherPurchases.validation.negative';
  return errors;
};

// Campos de la cabecera que se envían (el resto lo fija el back: isExpense, fatherId, correlativo, partida, almacén, estado...).
const PAYLOAD_TEXT = ['documentCode', 'invoiceNumber', 'cai', 'requestedBy', 'description', 'expenseCtaCode', 'exemptedCertificate', 'exemptedNumber', 'exemptedRecord'];
const PAYLOAD_INTS = ['providerId', 'providerType', 'typeTax', 'typeFp', 'paymentTypeId', 'workOrderId'];
const PAYLOAD_MONEY = ['subtotal', 'discount', 'valueExonerated', 'valueExempt', 'valueTaxable', 'tax', 'freight', 'otherCharges', 'total'];

// Cuerpo del POST o PUT: el documento completo, con textos recortados y números. Nunca `id`, `documentId`, `pdaNumber` ni
// `purchaseOrderId`. La orden de trabajo vacía o '0' va como 0.
export const buildPayload = (form = {}) => {
  const payload = { date: day(form.date), dateOut: day(form.dateOut) };
  PAYLOAD_TEXT.forEach((field) => { payload[field] = text(form[field]); });
  PAYLOAD_INTS.forEach((field) => { payload[field] = isBlank(form[field]) ? 0 : Number(form[field]); });
  if (!payload.providerType) payload.providerType = SUPPLIER;
  PAYLOAD_MONEY.forEach((field) => { payload[field] = num(form[field]); });
  return payload;
};

export const INITIAL_FORM = Object.freeze({
  id: 0, documentCode: '', documentId: 0, typeTax: 0, providerId: 0, providerType: SUPPLIER, paymentTypeId: 0, purchaseOrderId: 0,
  workOrderId: 0, cai: '', invoiceNumber: '', date: '', dateOut: '', typeFp: 0, description: '', exemptedCertificate: '',
  exemptedNumber: '', exemptedRecord: '', requestedBy: '', expenseCtaCode: '', pdaNumber: 0, status: 0, subtotal: 0, discount: 0,
  valueExonerated: 0, valueExempt: 0, valueTaxable: 0, tax: 0, freight: 0, otherCharges: 0, total: 0
});

// Documento del back (decimales de MySQL como texto, nulos, fechas vacías) -> valores del formulario. Todo campo del formulario
// queda definido (un null en un input controlado rompe React).
export const formFromDocument = (item = {}) => {
  const form = { ...INITIAL_FORM };
  Object.keys(INITIAL_FORM).forEach((field) => {
    const value = item[field];
    if (value === undefined || value === null) return;
    if (['date', 'dateOut'].includes(field)) form[field] = day(value);
    else if (typeof INITIAL_FORM[field] === 'number') form[field] = Number(value);
    else form[field] = String(value);
  });
  if (!form.providerType) form.providerType = SUPPLIER;
  return form;
};

// Respuesta de `GET :id` -> editLock. Cualquier cosa rara cuenta como "no bloqueado": decide el back al guardar.
export const normalizeEditLock = (lock) => {
  if (!lock || typeof lock !== 'object' || Array.isArray(lock)) return NOT_LOCKED;
  const raw = Array.isArray(lock.reasons) ? lock.reasons : [];
  return { financial: lock.financial === true, reasons: LOCK_REASONS.filter((reason) => raw.includes(reason)) };
};

export const isFieldLocked = (editLock, field) => Boolean(editLock?.financial) && LOCKABLE_FIELDS.includes(field);

// Ids de traducción de los motivos del bloqueo, en orden fijo.
export const lockReasonIds = (reasons = []) => LOCK_REASONS
  .filter((reason) => reasons.includes(reason))
  .map((reason) => `page.otherPurchases.locked.reason.${reason}`);

// Aviso "cambios pendientes de contabilizar": el documento ya tiene partida y la cuenta de gasto del formulario no es la de la
// partida. El guardado no regenera la partida (eso es el botón Re-contabilizar, que quita el aviso al terminar).
export const hasPendingAccounting = ({ pdaNumber, expenseCtaCode, postedAccountCode }) => Number(pdaNumber) > 0
  && text(postedAccountCode) !== '' && text(expenseCtaCode) !== text(postedAccountCode);

// SPEC v2-31-sr: qué hace el botón de contabilizar. Sin documento guardado no hay nada que contabilizar; sin partida es la primera
// contabilización; con partida (`pdaNumber` > 0) es "Re-contabilizar" y regenera la misma partida. Siempre pide confirmación.
export const accountingAction = ({ id, pdaNumber } = {}) => {
  if (!(Number(id) > 0)) return { mode: 'none', buttonId: 'button.count', confirmId: 'msg.question.accountDocument.title' };
  if (Number(pdaNumber) > 0) {
    return { mode: 'reaccount', buttonId: 'page.otherPurchases.button.reaccount', confirmId: 'page.otherPurchases.msg.reaccount.title' };
  }
  return { mode: 'account', buttonId: 'button.count', confirmId: 'msg.question.accountDocument.title' };
};

export const paymentStatusId = (status) => (['paid', 'pending'].includes(status) ? `page.otherPurchases.paymentStatus.${status}` : null);

// Con Contado en un documento nuevo el vencimiento es la fecha del documento (el back exige vencimiento >= fecha en ambos tipos).
export const dueDateFor = ({ id, typeFp, date, dateOut }) => (Number(id) === 0 && Number(typeFp) === CASH ? date : dateOut);

// SPEC v2-32-sr: la impresión es un GET sin cuerpo a `<ruta>/:id/print` y el back imprime lo GUARDADO (el formato lo elige por
// `pdaNumber`). Aquí solo se fijan la ruta y el nombre del archivo; el aviso de "guarde primero" lo da `printDocument`.
export const PRINT_PATH = 'inventory/process/otherPurchases';
export const PRINT_FILE_NAME = 'Factura de Costos y Gastos.pdf';
export const printOptions = (id) => ({ path: PRINT_PATH, id, fileName: PRINT_FILE_NAME });
