// Reglas puras de editar y eliminar un movimiento del Libro de Bancos (SPEC v2-29, front). El back decide siempre (período,
// privilegios y qué filas se pueden tocar); esto evita llamadas inútiles y arma lo que el back espera.

export const PRIVILEGE_SCREEN = '04.01.022'; // Libro de Bancos (fn_update para editar, fn_delete para eliminar)
export const PRIVILEGE_EDIT_POSTED = '11.01.015'; // tocar un movimiento de un documento con partida
export const PRIVILEGE_DELETE = '11.01.022'; // Anular Documentos Bancarios (eliminar un movimiento)
export const NO_DATE = '1900-01-01';

const day = (value) => (value ? String(value).slice(0, 10) : '');
const num = (value) => Number(value) || 0;
const cents = (value) => Math.round(num(value) * 100);
const rate = (value) => Math.round(num(value) * 10000);

export const hasEntry = (row = {}) => num(row.pdaNumber) > 0;
export const isReconciled = (row = {}) => Boolean(num(row.isConBank)) || Boolean(num(row.isConBook));
// Montos y tipo de cambio: solo de una fila suelta (sin partida) y sin conciliar.
export const canEditAmounts = (row) => !hasEntry(row) && !isReconciled(row);

// Fecha de anulación para el formulario: el centinela 1900-01-01 se muestra vacío.
export const formDateNull = (row = {}) => (day(row.dateNull) === NO_DATE ? '' : day(row.dateNull));

// privileges: { update, delete } (fnUpdate/fnDelete de 04.01.022), { editPosted } (11.01.015), { deleteDocument } (11.01.022)
export const getEditStatus = (row, privileges = {}) => {
  if (!privileges.update) return 'noPermission';
  if (hasEntry(row) && !privileges.editPosted) return 'noPostedPermission';
  return 'ok';
};

export const getDeleteStatus = (row, privileges = {}) => {
  if (!privileges.delete || !privileges.deleteDocument) return 'noPermission';
  if (row.annulled) return 'reversal';
  if (hasEntry(row)) return 'posted';
  if (isReconciled(row)) return 'reconciled';
  return 'ok';
};

export const EDIT_MESSAGES = {
  noPermission: 'page.banksBook.msg.noPermission',
  noPostedPermission: 'page.banksBook.msg.noPostedPermission'
};
export const DELETE_MESSAGES = {
  noPermission: 'page.banksBook.msg.noDeletePermission',
  reversal: 'page.banksBook.msg.deleteReversal',
  posted: 'page.banksBook.msg.deletePosted',
  reconciled: 'page.banksBook.msg.deleteReconciled'
};

// Solo los campos que cambiaron (el back ignora lo demás y no registra bitácora si nada cambia).
export const buildChanges = (row, form) => {
  const changes = {};
  if (String(form.description || '').trim() !== String(row.description || '')) changes.description = String(form.description || '').trim();
  if (String(form.reference || '').trim() !== String(row.reference || '')) changes.reference = String(form.reference || '').trim();
  if ((form.dateNull || '') !== formDateNull(row)) changes.dateNull = form.dateNull || '';
  if (canEditAmounts(row)) {
    if (cents(form.valueDebit) !== cents(row.valueDebit)) changes.valueDebit = num(form.valueDebit);
    if (cents(form.valueCredit) !== cents(row.valueCredit)) changes.valueCredit = num(form.valueCredit);
    if (rate(form.exchangeRate) !== rate(row.exchangeRate)) changes.exchangeRate = num(form.exchangeRate);
  }
  return changes;
};

// Clave de traducción del primer problema del formulario, o null si se puede guardar.
export const validateEditForm = (row, form) => {
  if (!String(form.description || '').trim()) return 'page.banksBook.msg.descriptionRequired';
  const changes = buildChanges(row, form);
  if (Object.keys(changes).length === 0) return 'page.banksBook.msg.noChanges';
  if (canEditAmounts(row)) {
    const debit = changes.valueDebit !== undefined ? changes.valueDebit : num(row.valueDebit);
    const credit = changes.valueCredit !== undefined ? changes.valueCredit : num(row.valueCredit);
    if (debit < 0 || credit < 0 || (cents(debit) === 0 && cents(credit) === 0)) return 'page.banksBook.msg.amountsRequired';
    if (changes.exchangeRate !== undefined && !(changes.exchangeRate > 0)) return 'page.banksBook.msg.rateInvalid';
  }
  return null;
};

// Filtro de texto de la pantalla: documento, beneficiario, descripción o referencia. Sin texto devuelve todas las líneas.
export const filterBookLines = (lines = [], text = '') => {
  const value = String(text || '').trim().toUpperCase();
  if (!value) return lines;
  return lines.filter((item) => (
    `${item.documentCode || ''}${item.benefName || ''}${item.description || ''}${item.reference || ''}`.toUpperCase().includes(value)
  ));
};
