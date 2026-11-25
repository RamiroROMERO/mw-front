// Reglas del Registro de Activos (SPEC v2-141-sr). Mismas reglas y casos que RegisterDTO del back (af_activos.sc2); el back es quien decide. Devuelven ids de traducción por campo.
export const CONDITIONS = ['Nuevo', 'Semi-Nuevo', 'Usado', 'Reparado', 'Casa'];
export const MAX = { name: 100, short: 50, provider: 100, invoice: 20, text: 2000, description: 200, value: 9999999999.99 };
export const NULL_DATE = '1900-01-01'; // la fecha vacía del sistema (lo que el back guarda sin fecha de compra)

const text = (value) => String(value ?? '').trim();
const dateText = (value) => text(value).slice(0, 10);

export const localToday = (now = new Date()) => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

export const isRealDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text(value));
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

const isPastOrToday = (value, today) => isRealDate(value) && dateText(value) <= today;
export const isAmount = (value, { allowZero = false } = {}) => {
  if (value === '' || value === null || value === undefined) return false;
  const n = Number(value);
  if (!Number.isFinite(n) || n > MAX.value || Math.round(n * 100) / 100 !== n) return false;
  return allowZero ? n >= 0 : n > 0;
};
const isEmptyDate = (value) => text(value) === '' || dateText(value) === NULL_DATE;

export const validateRegister = (form, today = localToday()) => {
  const errors = {};
  if (!(Number(form.typeId) > 0)) errors.typeId = 'page.fixedAssets.msg.typeRequired';
  if (!CONDITIONS.includes(form.condition)) errors.condition = 'page.fixedAssets.msg.conditionRequired';
  if (text(form.name) === '' || text(form.name).length > MAX.name) errors.name = 'page.fixedAssets.msg.nameRequired';
  if (!isPastOrToday(form.dateIn, today)) errors.dateIn = 'page.fixedAssets.msg.dateInRequired';
  if (!isEmptyDate(form.dateBuy) && !isPastOrToday(form.dateBuy, today)) errors.dateBuy = 'page.fixedAssets.msg.dateBuyInvalid';
  if (!isAmount(form.valueBuy)) errors.valueBuy = 'page.fixedAssets.msg.valueRequired';
  if (!isAmount(form.valueIn)) errors.valueIn = 'page.fixedAssets.msg.valueRequired';
  ['trademark', 'model', 'serial1', 'serial2'].forEach((f) => { if (text(form[f]).length > MAX.short) errors[f] = 'page.fixedAssets.msg.tooLong'; });
  if (text(form.providerName).length > MAX.provider) errors.providerName = 'page.fixedAssets.msg.tooLong';
  if (text(form.invoiceNumber).length > MAX.invoice) errors.invoiceNumber = 'page.fixedAssets.msg.tooLong';
  if (text(form.description).length > MAX.text) errors.description = 'page.fixedAssets.msg.tooLong';
  if (text(form.notes).length > MAX.text) errors.notes = 'page.fixedAssets.msg.tooLong';
  return errors;
};

// Línea del historial de cambios (misma regla que el servicio: fecha real y no futura, descripción obligatoria, valor de 0 en adelante con 2 decimales).
export const validateChange = (line, today = localToday()) => {
  const errors = {};
  if (!isPastOrToday(line.date, today)) errors.date = 'page.fixedAssets.msg.changeDate';
  if (text(line.description) === '' || text(line.description).length > MAX.description) errors.description = 'page.fixedAssets.msg.changeDescription';
  if (!isAmount(line.value, { allowZero: true })) errors.value = 'page.fixedAssets.msg.changeValue';
  return errors;
};

// Lo que viaja al back: el código lo asigna el back (nunca se manda) y el tipo no se manda al editar (no cambia). Una fecha de compra vacía viaja vacía.
export const buildHeaderPayload = (form) => {
  const isNew = !Number(form.id);
  const payload = {
    condition: form.condition,
    name: text(form.name),
    trademark: text(form.trademark),
    model: text(form.model),
    serial1: text(form.serial1),
    serial2: text(form.serial2),
    dateBuy: isEmptyDate(form.dateBuy) ? '' : dateText(form.dateBuy),
    dateIn: dateText(form.dateIn),
    providerName: text(form.providerName),
    invoiceNumber: text(form.invoiceNumber),
    valueBuy: Number(form.valueBuy),
    valueIn: Number(form.valueIn),
    description: text(form.description),
    notes: text(form.notes),
    isActive: Number(form.isActive) === 2 ? 2 : 1
  };
  if (isNew) payload.typeId = Number(form.typeId);
  return payload;
};
