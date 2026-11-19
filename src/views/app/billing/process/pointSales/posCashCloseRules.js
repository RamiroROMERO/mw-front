// Cierre de caja del POS (SPEC v2-87-sr). El navegador NO calcula: todas las cifras salen de `GET /preview`. Aquí solo hay validación local de lo digitado y formato.
export const CASH_CLOSE_PATH = 'billing/process/pointSales/cashClose';

const text = (value) => String(value ?? '').trim();

// Monto digitado desde 0 con hasta 2 decimales (0 es válido; vacío cuenta como 0 solo en depósito y fondo, no en el efectivo contado).
export const isValidAmount = (value) => /^\d+(\.\d{1,2})?$/.test(text(value));

// Errores por campo (claves de traducción). Vacío = válido.
export const validateCashClose = ({ cashValue, depositValue, initialValue, editableInitial }) => {
  const errors = {};
  if (text(cashValue) === '' || !isValidAmount(cashValue)) errors.cashValue = 'msg.required.input.cashValue';
  if (text(depositValue) !== '' && !isValidAmount(depositValue)) errors.depositValue = 'page.pointSales.modal.cashClose.validation.amount';
  if (editableInitial && text(initialValue) !== '' && !isValidAmount(initialValue)) errors.initialValue = 'page.pointSales.modal.cashClose.validation.amount';
  return errors;
};

// Cuerpo del guardado: solo lo digitado. Las cifras, la caja y la empresa las pone el back.
export const buildPayload = (form, { isNew = true, editableInitial = false } = {}) => ({
  cashValue: text(form.cashValue),
  depositNumber: text(form.depositNumber),
  depositValue: text(form.depositValue),
  ...(editableInitial ? { initialValue: text(form.initialValue) } : {}),
  ...(isNew ? { date: text(form.date), allCashiers: Boolean(form.allCashiers), cashierId: Number(form.cashierId) || undefined } : {})
});

// Consulta de las cifras vigentes: de un cierre guardado (closeId) o de la fecha, el cajero y lo digitado.
export const buildPreviewQuery = ({ sessionId, closeId, date, cashierId, allCashiers, cashValue, initialValue }) => (
  closeId > 0
    ? { sessionId, closeId }
    : { sessionId, date, cashierId, allCashiers: allCashiers ? 'true' : undefined, cashValue: isValidAmount(cashValue) ? text(cashValue) : undefined, initialValue: text(initialValue) || undefined }
);

// El fondo inicial solo se digita cuando no sale de la apertura de la sesión (día histórico, otro cajero o todos).
export const isInitialEditable = ({ sessionDate, sessionCashierId, date, cashierId, allCashiers }) => (
  String(date).slice(0, 10) !== String(sessionDate).slice(0, 10) || Number(cashierId) !== Number(sessionCashierId) || Boolean(allCashiers)
);

export const differenceKind = (difference) => (Number(difference) < 0 ? 'shortage' : Number(difference) > 0 ? 'excess' : 'exact');

export const canApply = (close) => Boolean(close) && Number(close.id) > 0 && !close.isApplied;
export const canVoid = (close, isSupervisor) => Boolean(close) && Number(close.id) > 0 && close.isApplied && Boolean(isSupervisor);
export const canDelete = (close) => Boolean(close) && Number(close.id) > 0 && !close.isApplied;
