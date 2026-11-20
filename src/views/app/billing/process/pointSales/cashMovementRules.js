// Entradas y salidas de efectivo del POS (SPEC v2-86-sr). Mismas reglas que el back: el servidor decide; esto evita ir con datos inválidos.
export const CASH_MOVEMENT_PATH = 'billing/process/pointSales/cashMovement';
export const MOVEMENT_IN = 1;
export const MOVEMENT_OUT = 2;
const MIN_TEXT = 5;
const MAX_DESCRIPTION = 200;

const text = (value) => String(value ?? '').trim();

// Valor con hasta 2 decimales y mayor que 0 (sobre el texto, sin coma flotante).
export const isValidValue = (value) => {
  const raw = text(value);
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) return false;
  return Number(raw) > 0;
};

// Tipos de gasto que corresponden al movimiento elegido (Entrada o Salida).
export const typesFor = (types = [], movementType) => types.filter((type) => Number(type.movementType) === Number(movementType));

// Un tipo sin cuenta contra pide elegirla (los tipos de dipharma y de otras empresas vienen sin `expen_cta`).
export const needsAccount = (types = [], typeId) => {
  const type = types.find((item) => Number(item.id) === Number(typeId));
  return Boolean(type) && !type.hasAccount;
};

// Errores por campo (claves de traducción). Vacío = válido.
export const validateMovement = (form, { types = [] } = {}) => {
  const errors = {};
  if (text(form.documentCode) === '') errors.documentCode = 'msg.required.input.document';
  if (text(form.beneficName).length < MIN_TEXT && text(form.beneficDNI).length < MIN_TEXT) errors.beneficName = 'page.pointSales.modal.cashOut.msg.beneficiary';
  const description = text(form.description);
  if (description.length < MIN_TEXT || description.length > MAX_DESCRIPTION) errors.description = 'page.pointSales.modal.cashOut.msg.description';
  if (!(Number(form.typeId) > 0)) errors.typeId = 'page.pointSales.modal.cashOut.msg.type';
  else if (needsAccount(types, form.typeId) && text(form.outCtaCode) === '') errors.outCtaCode = 'page.pointSales.modal.cashOut.msg.account';
  if (!isValidValue(form.value)) errors.value = 'msg.required.input.value';
  return errors;
};

// Cuerpo del alta o la edición: solo lo que el back acepta. La caja, el cajero y la empresa salen de la sesión.
export const buildPayload = (form, { isNew = true } = {}) => {
  const payload = {
    typeId: Number(form.typeId),
    beneficDNI: text(form.beneficDNI),
    beneficName: text(form.beneficName),
    description: text(form.description),
    value: text(form.value),
    date: text(form.date),
    ...(text(form.outCtaCode) !== '' ? { outCtaCode: text(form.outCtaCode) } : {})
  };
  return isNew ? { ...payload, movementType: Number(form.movementType), documentCode: text(form.documentCode) } : payload;
};

// Un movimiento anulado, de un cierre o histórico sin tipo no se edita; uno con partida lo edita quien tiene 99.20.006 (el back decide).
export const canEdit = (item) => Boolean(item) && !item.isVoided && !item.isClosed && !item.isLegacyType;
export const canVoid = (item, canVoidPrivilege) => Boolean(item) && Boolean(canVoidPrivilege) && !item.isVoided && !item.isClosed;

// Filtros de la lista para la petición (solo los que el back admite).
export const buildListQuery = ({ sessionId, all = false, date, limit = 50, offset = 0 }) => ({
  sessionId, ...(all ? { all: 'true' } : date ? { dateStart: date, dateEnd: date } : {}), limit, offset
});
