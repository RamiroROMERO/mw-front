// Reglas de campos de Traslados entre almacenes. Son las mismas que aplica el back (TransferDTO y TransactionDTO de
// modules/inventory, SPEC v2-49-sr): el back es quien decide; esto solo evita una llamada que ya se sabe rechazada.
// Los números y casos son los de TransferDTO.test.js del back.

export const EMPTY_DATE = '1900-01-01';
export const TRANSFER_DOCUMENT = 'TRL';
export const MAX_LINES = 200;
export const APPLY_TO = ['Inventario', 'Costo', 'Gasto'];
export const MAX = { documentCode: 5, senderName: 50, receiverName: 50, lotCode: 20, productCode: 30 };

const text = (value) => String(value ?? '').trim();
const isBlank = (value) => value === undefined || value === null || text(value) === '';
const isNumber = (value) => !isBlank(value) && Number.isFinite(Number(value));
const isPositiveInt = (value) => isNumber(value) && Number.isInteger(Number(value)) && Number(value) > 0;
const day = (value) => {
  const date = text(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date !== EMPTY_DATE && date !== '0000-00-00' ? date : '';
};

// Fecha de hoy del navegador por calendario local (YYYY-MM-DD).
export const localToday = (now = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// Llave de línea: producto + lote + vencimiento (la misma del back).
export const lineKey = (line = {}) => `${text(line.productCode)}|${text(line.lotCode)}|${day(line.expirationDate)}`;

const round5 = (value) => Math.round((Number(value) || 0) * 1e5) / 1e5;

// Suma `line` al detalle: si ya hay una línea con la misma llave suma la cantidad (y recalcula el total), si no la agrega.
// No muta `details`.
export const mergeLine = (details = [], line = {}) => {
  const key = lineKey(line);
  const index = details.findIndex((item) => lineKey(item) === key);
  if (index < 0) return [...details, line];
  return details.map((item, i) => {
    if (i !== index) return item;
    const qty = round5(Number(item.qty) + Number(line.qty));
    return { ...item, qty, total: round5(qty * Number(item.cost || line.cost || 0)) };
  });
};

/**
 * Valida el formulario y el detalle. Devuelve { campo: idDeTraducción } con solo los campos inválidos ({} = válido).
 * `form`: documentCode, date, sourceStoreId, assignStoreId, applyTo, physicalNumber, senderName, receiverName.
 * `details`: líneas con productCode, qty, lotCode y expirationDate.
 */
export const validateTransfer = (form = {}, details = [], { today = localToday() } = {}) => {
  const errors = {};
  const set = (field, id) => { if (!errors[field]) errors[field] = id; };

  if (isBlank(form.documentCode)) set('documentCode', 'msg.required.select.typeDocument');
  else if (text(form.documentCode).length > MAX.documentCode) set('documentCode', 'page.transfersToStores.error.tooLong');

  const date = day(form.date);
  if (!date) set('date', 'msg.required.input.date');
  else if (date > today) set('date', 'page.transfersToStores.error.dateFuture');

  if (!isPositiveInt(form.sourceStoreId)) set('sourceStoreId', 'msg.required.select.warehouse');
  if (!isPositiveInt(form.assignStoreId)) set('assignStoreId', 'msg.required.select.destinationId');
  else if (isPositiveInt(form.sourceStoreId) && Number(form.sourceStoreId) === Number(form.assignStoreId)) {
    set('assignStoreId', 'page.transfersToStores.error.sameStores');
  }

  if (!isBlank(form.applyTo) && !APPLY_TO.includes(text(form.applyTo))) set('applyTo', 'page.transfersToStores.error.applyTo');
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

// Cuerpo de POST/PUT: solo lo que el back acepta (él calcula costo, total, cuentas, correlativo y estado).
export const buildTransferPayload = (form = {}, details = []) => ({
  documentCode: text(form.documentCode),
  date: day(form.date) || text(form.date).slice(0, 10),
  sourceStoreId: Number(form.sourceStoreId),
  assignStoreId: Number(form.assignStoreId),
  applyTo: text(form.applyTo) || 'Inventario',
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
});

// Líneas del back (`GET /:id`) para el detalle de pantalla: con el nombre del producto y el vencimiento vacío si es 1900-01-01.
export const detailsFromApi = (details = []) => (Array.isArray(details) ? details : []).map((item) => ({
  ...item,
  nameProduct: item.invProduct ? item.invProduct.name : (item.nameProduct || ''),
  qty: Number(item.qty),
  cost: Number(item.cost),
  total: Number(item.total),
  expirationDate: day(item.expirationDate)
}));

// Textos de los avisos de existencia que devuelve el back tras guardar.
export const warningTexts = (warnings) => (Array.isArray(warnings) ? warnings : [])
  .map((warning) => (warning && warning.message ? String(warning.message) : ''))
  .filter(Boolean);

// El modal "Agregar varios" solo se abre con origen y destino elegidos y el documento sin aplicar ni anular.
export const canOpenAddMany = ({ sourceStoreId, assignStoreId, disabled } = {}) => (
  isPositiveInt(sourceStoreId) && isPositiveInt(assignStoreId) && !disabled
);

// Convierte los productos marcados del modal en líneas de detalle. `selected`: { [productCode]: { product, qty } }.
export const linesFromSelection = (selected = {}) => Object.values(selected)
  .filter((item) => item && Number(item.qty) > 0)
  .map(({ product, qty }) => ({
    idTemp: `${product.productCode}-${Math.random().toString(36).slice(2, 8)}`,
    productCode: product.productCode,
    nameProduct: product.name,
    qty: Number(qty),
    cost: Number(product.cost),
    total: round5(Number(qty) * Number(product.cost)),
    lotCode: '',
    expirationDate: ''
  }));

/**
 * Estado del documento para decidir qué acciones ofrece la pantalla (SPEC v2-50-sr). "Aplicado" es `isApplied` o partida
 * (con Contabilidad apagada se aplica sin partida); "anulado" es `status` falso en un documento guardado.
 *  - canProcess: Contabilizar, solo en un traslado guardado, sin aplicar ni anular.
 *  - canVoid: Anular, solo en uno aplicado y no anulado.
 *  - locked: el documento no se edita ni se elimina (aplicado o anulado).
 */
export const transferState = ({ id, isApplied, pdaNumber, status } = {}) => {
  const saved = Number(id) > 0;
  const voided = saved && (status === false || Number(status) === 0);
  const applied = saved && !voided && (isApplied === true || Number(isApplied) === 1 || Number(pdaNumber) > 0);
  return {
    saved,
    applied,
    voided,
    canProcess: saved && !applied && !voided,
    canVoid: applied,
    locked: applied || voided
  };
};
