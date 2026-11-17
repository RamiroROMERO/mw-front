// Reglas de campos de Requisiciones. Son las mismas que aplica el back (RequisitionDTO y TransactionDTO de modules/inventory,
// SPEC v2-52-sr): el back es quien decide; esto solo evita una llamada que ya se sabe rechazada. Los números y casos son los de
// RequisitionDTO.test.js del back. Lo común con Traslados (fecha, estado, avisos) se reutiliza de transferRules.
import {
  EMPTY_DATE, MAX, MAX_LINES, APPLY_TO, localToday, warningTexts, transferState, canOpenAddMany
} from '../transferToStores/transferRules';

export {
  EMPTY_DATE, MAX_LINES, APPLY_TO, MAX, localToday, warningTexts, canOpenAddMany
};
export const REQUISITION_DOCUMENT = 'REQ';
export const DEFAULT_APPLY_TO = 'Costo';

const text = (value) => String(value ?? '').trim();
const isBlank = (value) => value === undefined || value === null || text(value) === '';
const isNumber = (value) => !isBlank(value) && Number.isFinite(Number(value));
const isPositiveInt = (value) => isNumber(value) && Number.isInteger(Number(value)) && Number(value) > 0;
const day = (value) => {
  const date = text(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date !== EMPTY_DATE && date !== '0000-00-00' ? date : '';
};
const round5 = (value) => Math.round((Number(value) || 0) * 1e5) / 1e5;

// Llave de línea: producto + lote + vencimiento + empleado (la misma del back; sin empleado vale 0).
export const lineKey = (line = {}) => `${text(line.productCode)}|${text(line.lotCode)}|${day(line.expirationDate)}|${Number(line.employeeId) || 0}`;

// Suma `line` al detalle: con la misma llave suma la cantidad (y recalcula el total); si no, la agrega. No muta `details`.
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
 * Diferencias con Traslados: "Aplicar a" es obligatorio y el destino es un centro de costo (otro tipo de almacén, así que no hay
 * regla de "distinto del origen").
 */
export const validateRequisition = (form = {}, details = [], { today = localToday() } = {}) => {
  const errors = {};
  const set = (field, id) => { if (!errors[field]) errors[field] = id; };

  if (isBlank(form.documentCode)) set('documentCode', 'msg.required.select.typeDocument');
  else if (text(form.documentCode).length > MAX.documentCode) set('documentCode', 'page.transfersToStores.error.tooLong');

  const date = day(form.date);
  if (!date) set('date', 'msg.required.input.date');
  else if (date > today) set('date', 'page.transfersToStores.error.dateFuture');

  if (!isPositiveInt(form.sourceStoreId)) set('sourceStoreId', 'msg.required.select.warehouse');
  if (!isPositiveInt(form.assignStoreId)) set('assignStoreId', 'msg.required.select.destinationId');

  if (isBlank(form.applyTo) || !APPLY_TO.includes(text(form.applyTo))) set('applyTo', 'page.transfersToStores.error.applyTo');

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
      if (keys.has(key)) set('details', 'page.requisitions.error.duplicateLine');
      keys.add(key);
    });
  }
  return errors;
};

/**
 * Cuerpo de POST/PUT: solo lo que el back acepta (él calcula costo, total, cuentas, correlativo y estado). El empleado por línea
 * solo se manda con RRHH activo (`withEmployees`); sin RRHH el back lo ignoraría de todos modos.
 */
export const buildRequisitionPayload = (form = {}, details = [], { withEmployees = false } = {}) => ({
  documentCode: text(form.documentCode),
  date: day(form.date) || text(form.date).slice(0, 10),
  sourceStoreId: Number(form.sourceStoreId),
  assignStoreId: Number(form.assignStoreId),
  applyTo: text(form.applyTo),
  physicalNumber: isBlank(form.physicalNumber) ? 0 : Number(form.physicalNumber),
  notes: text(form.notes),
  senderName: text(form.senderName),
  receiverName: text(form.receiverName),
  details: details.map((line) => ({
    productCode: text(line.productCode),
    qty: Number(line.qty),
    lotCode: text(line.lotCode),
    expirationDate: day(line.expirationDate),
    ...(withEmployees ? { employeeId: Number(line.employeeId) || 0 } : {})
  }))
});

// Líneas del back (`GET /:id`) para el detalle de pantalla: nombre del producto, vencimiento vacío si es 1900-01-01 y el empleado.
export const detailsFromApi = (details = []) => (Array.isArray(details) ? details : []).map((item) => ({
  ...item,
  nameProduct: item.invProduct ? item.invProduct.name : (item.nameProduct || ''),
  qty: Number(item.qty),
  cost: Number(item.cost),
  total: Number(item.total),
  expirationDate: day(item.expirationDate),
  employeeId: Number(item.employeeId) || 0,
  employeeName: item.employeeName || ''
}));

// Productos marcados en "Agregar varios" a líneas de detalle. `employee`: { id, name } opcional (el mismo para todas las que se agregan).
export const lineFromSelection = (product, qty, employee = null) => ({
  idTemp: `${product.productCode}-${Math.random().toString(36).slice(2, 8)}`,
  productCode: product.productCode,
  nameProduct: product.name,
  qty: Number(qty),
  cost: Number(product.cost),
  total: round5(Number(qty) * Number(product.cost)),
  lotCode: '',
  expirationDate: '',
  employeeId: employee ? Number(employee.id) || 0 : 0,
  employeeName: employee ? employee.name || '' : ''
});

// Opciones del selector de empleado: { value, label } con el documento y el nombre.
export const employeeOptions = (employees = []) => (Array.isArray(employees) ? employees : []).map((item) => ({
  value: Number(item.id),
  label: item.code ? `${item.code} - ${item.name}` : String(item.name || '')
}));

// El estado del documento es el mismo que el de Traslados (aplicado, anulado, qué acciones se ofrecen).
export const requisitionState = transferState;

// El empleado elegido siempre debe seguir en las opciones aunque la búsqueda del servidor ya no lo traiga.
export const ensureSelectedEmployee = (options = [], employeeId = 0, employeeName = '') => {
  const id = Number(employeeId) || 0;
  if (id <= 0 || options.some((item) => item.value === id)) return options;
  return [{ value: id, label: employeeName || String(id) }, ...options];
};
