// Reglas de campos de Ingreso y Reintegros. Son las mismas que aplica el back (RefundDTO y TransactionDTO de modules/inventory,
// SPEC v2-53-sr): el back es quien decide; esto solo evita una llamada que ya se sabe rechazada. Los números y casos son los de
// RefundDTO.test.js del back. Lo común con Traslados (fecha, estado, avisos, mezcla de líneas) se reutiliza de transferRules.
import {
  EMPTY_DATE, MAX_LINES, APPLY_TO, MAX, localToday, lineKey, warningTexts, transferState, detailsFromApi, mergeLine, linesFromSelection
} from '../transferToStores/transferRules';

export {
  EMPTY_DATE, MAX_LINES, APPLY_TO, MAX, localToday, lineKey, warningTexts, detailsFromApi, mergeLine, linesFromSelection
};
export const REFUND_DOCUMENT = 'REI';
export const REINT_PROVIDER = 1; // a proveedor (valor inicial): genera una cuenta por pagar con vencimiento
export const REINT_STORE = 2; // a un almacén tipo 2 (afiliada)
export const DEFAULT_REINT_TYPE = REINT_PROVIDER;

const text = (value) => String(value ?? '').trim();
const isBlank = (value) => value === undefined || value === null || text(value) === '';
const isNumber = (value) => !isBlank(value) && Number.isFinite(Number(value));
const isPositiveInt = (value) => isNumber(value) && Number.isInteger(Number(value)) && Number(value) > 0;
const day = (value) => {
  const date = text(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date !== EMPTY_DATE && date !== '0000-00-00' ? date : '';
};

/**
 * Valida el formulario y el detalle. Devuelve { campo: idDeTraducción } con solo los campos inválidos ({} = válido).
 * Modo proveedor (1): proveedor y vencimiento (no menor que la fecha). Modo almacén (2): destino distinto del almacén del documento y
 * "Aplicar a". Los campos del otro modo no se validan (el back los ignora).
 */
export const validateRefund = (form = {}, details = [], { today = localToday() } = {}) => {
  const errors = {};
  const set = (field, id) => { if (!errors[field]) errors[field] = id; };
  const mode = Number(form.reintType);

  if (isBlank(form.documentCode)) set('documentCode', 'msg.required.select.typeDocument');
  else if (text(form.documentCode).length > MAX.documentCode) set('documentCode', 'page.transfersToStores.error.tooLong');

  const date = day(form.date);
  if (!date) set('date', 'msg.required.input.date');
  else if (date > today) set('date', 'page.transfersToStores.error.dateFuture');

  if (!isPositiveInt(form.sourceStoreId)) set('sourceStoreId', 'msg.required.select.warehouse');

  if (![REINT_PROVIDER, REINT_STORE].includes(mode)) set('reintType', 'page.refunds.error.reintType');

  if (mode === REINT_PROVIDER) {
    if (!isPositiveInt(form.providerId)) set('providerId', 'msg.required.select.provider');
    const expiration = day(form.expirationDate);
    if (!expiration) set('expirationDate', 'page.refunds.error.expirationRequired');
    else if (date && expiration < date) set('expirationDate', 'page.refunds.error.expirationBeforeDate');
  }

  if (mode === REINT_STORE) {
    if (!isPositiveInt(form.assignStoreId)) set('assignStoreId', 'msg.required.select.destinationId');
    else if (isPositiveInt(form.sourceStoreId) && Number(form.sourceStoreId) === Number(form.assignStoreId)) {
      set('assignStoreId', 'page.refunds.error.sameStores');
    }
    if (isBlank(form.applyTo) || !APPLY_TO.includes(text(form.applyTo))) set('applyTo', 'page.transfersToStores.error.applyTo');
  }

  if (!isBlank(form.physicalNumber) && !(isNumber(form.physicalNumber) && Number.isInteger(Number(form.physicalNumber)) && Number(form.physicalNumber) >= 0)) {
    set('physicalNumber', 'page.transfersToStores.error.physicalInvalid');
  }
  ['senderName', 'receiverName'].forEach((field) => {
    if (text(form[field]).length > MAX[field]) set(field, 'page.transfersToStores.error.tooLong');
  });

  if (!Array.isArray(details) || details.length === 0) set('details', 'msg.required.documentDetail');
  else if (details.length > MAX_LINES) set('details', 'page.transfersToStores.error.tooManyLines');
  else {
    if (details.some((line) => isBlank(line.productCode) || !(isNumber(line.qty) && Number(line.qty) > 0))) set('details', 'msg.required.input.qty');
    const keys = new Set();
    details.forEach((line) => {
      const key = lineKey(line);
      if (keys.has(key)) set('details', 'page.transfersToStores.error.duplicateLine');
      keys.add(key);
    });
  }
  return errors;
};

// Cuerpo de POST/PUT: solo lo que el back acepta y solo los campos del modo (él calcula costo, total, cuentas, correlativo y estado).
export const buildRefundPayload = (form = {}, details = []) => {
  const mode = Number(form.reintType);
  const payload = {
    documentCode: text(form.documentCode),
    date: day(form.date) || text(form.date).slice(0, 10),
    sourceStoreId: Number(form.sourceStoreId),
    reintType: mode,
    physicalNumber: isBlank(form.physicalNumber) ? 0 : Number(form.physicalNumber),
    notes: text(form.notes),
    senderName: text(form.senderName),
    receiverName: text(form.receiverName),
    details: details.map((line) => ({
      productCode: text(line.productCode),
      qty: Number(line.qty),
      lotCode: text(line.lotCode),
      expirationDate: day(line.expirationDate)
    }))
  };
  if (mode === REINT_PROVIDER) {
    payload.providerId = Number(form.providerId);
    payload.expirationDate = day(form.expirationDate);
  } else if (mode === REINT_STORE) {
    payload.assignStoreId = Number(form.assignStoreId);
    payload.applyTo = text(form.applyTo);
  }
  return payload;
};

// Lo que se limpia al cambiar de tipo: el modo nuevo parte sin los campos del anterior.
export const resetForType = (reintType) => (Number(reintType) === REINT_STORE
  ? { reintType: REINT_STORE, providerId: 0, expirationDate: '', assignCtaCode: '', applyTo: 'Inventario' }
  : { reintType: REINT_PROVIDER, assignStoreId: 0, applyTo: '', assignCtaCode: '' });

// Opciones del selector de proveedor: { value, label } con el RTN y el nombre.
export const providerOptions = (providers = []) => (Array.isArray(providers) ? providers : []).map((item) => ({
  value: Number(item.id),
  label: item.dni ? `${item.dni} - ${item.name}` : String(item.name || '')
}));

// El proveedor elegido siempre debe seguir en las opciones aunque la búsqueda del servidor ya no lo traiga.
export const ensureSelectedProvider = (options = [], providerId = 0, providerName = '') => {
  const id = Number(providerId) || 0;
  if (id <= 0 || options.some((item) => item.value === id)) return options;
  return [{ value: id, label: providerName || String(id) }, ...options];
};

// "Agregar varios" solo pide el almacén del documento (en el modo proveedor no hay destino) y un documento sin aplicar ni anular.
export const canOpenAddMany = ({ sourceStoreId, disabled } = {}) => isPositiveInt(sourceStoreId) && !disabled;

// El estado del documento es el mismo que el de Traslados (aplicado, anulado, qué acciones se ofrecen).
export const refundState = transferState;
