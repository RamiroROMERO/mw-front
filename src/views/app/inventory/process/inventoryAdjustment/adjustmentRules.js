// Reglas de campos de Ajustes de inventario. Son las mismas que aplica el back (AdjustmentDTO y AdjustmentService de modules/inventory,
// SPEC v2-54-sr): el back es quien decide; esto solo evita una llamada que ya se sabe rechazada. Los números y casos son los de
// AdjustmentDTO.test.js y adjustmentRules.test.js del back. Lo común con Traslados (fecha, estado, avisos) se reutiliza de transferRules.
import {
  EMPTY_DATE, MAX_LINES, APPLY_TO, localToday, warningTexts, transferState, detailsFromApi
} from '../transferToStores/transferRules';

export { EMPTY_DATE, MAX_LINES, APPLY_TO, localToday, warningTexts, detailsFromApi };
export const ADJUSTMENT_DOCUMENT = 'AJU';
export const DEFAULT_APPLY_TO = 'Inventario';

const text = (value) => String(value ?? '').trim();
const isBlank = (value) => value === undefined || value === null || text(value) === '';
const isNumber = (value) => !isBlank(value) && Number.isFinite(Number(value));
const isPositiveInt = (value) => isNumber(value) && Number.isInteger(Number(value)) && Number(value) > 0;
const day = (value) => {
  const date = text(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date !== EMPTY_DATE && date !== '0000-00-00' ? date : '';
};
const round5 = (value) => Math.round((Number(value) || 0) * 1e5) / 1e5;

// Llave de línea (la misma del back): el producto; si el producto exige lote o vencimiento, producto + lote + vencimiento.
export const lineKey = (line = {}) => (line.requireExpLot
  ? `${text(line.productCode)}|${text(line.lotCode)}|${day(line.expirationDate)}`
  : text(line.productCode));

// Una línea de un producto que exige lote o vencimiento debe traer uno de los dos.
export const needsLot = (line = {}) => Boolean(line.requireExpLot) && isBlank(line.lotCode) && !day(line.expirationDate);

// "Hoy" del navegador por calendario local: el conteo debe fecharse el día en que se contó.
export const isNotToday = (date, today = localToday()) => Boolean(day(date)) && day(date) !== today;

/**
 * Valida el formulario y el detalle. Devuelve { campo: idDeTraducción } con solo los campos inválidos ({} = válido).
 * Un solo almacén (sin destino); "Aplicar a" obligatorio; la cantidad contada puede ser 0.
 */
export const validateAdjustment = (form = {}, details = [], { today = localToday() } = {}) => {
  const errors = {};
  const set = (field, id) => { if (!errors[field]) errors[field] = id; };

  if (isBlank(form.documentCode)) set('documentCode', 'msg.required.select.typeDocument');
  const date = day(form.date);
  if (!date) set('date', 'msg.required.input.date');
  else if (date > today) set('date', 'page.transfersToStores.error.dateFuture');
  if (!isPositiveInt(form.sourceStoreId)) set('sourceStoreId', 'msg.required.select.warehouse');
  if (isBlank(form.applyTo) || !APPLY_TO.includes(text(form.applyTo))) set('applyTo', 'page.transfersToStores.error.applyTo');

  if (!Array.isArray(details) || details.length === 0) set('details', 'msg.required.documentDetail');
  else if (details.length > MAX_LINES) set('details', 'page.transfersToStores.error.tooManyLines');
  else {
    if (details.some((line) => isBlank(line.productCode))) set('details', 'msg.required.input.codeProduct');
    if (details.some((line) => !isNumber(line.qty) || Number(line.qty) < 0)) set('details', 'page.inventoryAdjustment.error.qtyInvalid');
    if (details.some(needsLot)) set('details', 'page.inventoryAdjustment.error.lotRequired');
    const keys = new Set();
    details.forEach((line) => {
      const key = lineKey(line);
      if (keys.has(key)) set('details', 'page.inventoryAdjustment.error.duplicateLine');
      keys.add(key);
    });
  }
  return errors;
};

// Cuerpo de POST/PUT: solo lo que el back acepta (él calcula costo, total y cuentas, asigna el correlativo y fija el estado).
export const buildAdjustmentPayload = (form = {}, details = []) => ({
  documentCode: text(form.documentCode),
  date: day(form.date) || text(form.date).slice(0, 10),
  sourceStoreId: Number(form.sourceStoreId),
  applyTo: text(form.applyTo),
  notes: text(form.notes),
  details: details.map((line) => ({
    productCode: text(line.productCode),
    qty: Number(line.qty),
    lotCode: text(line.lotCode),
    expirationDate: day(line.expirationDate)
  }))
});

// Línea de detalle a partir de un producto de "Agregar varios" (availableProducts): `qty` es la existencia CONTADA (puede ser 0).
export const lineFromProduct = (product, qty) => ({
  idTemp: `${product.productCode}-${Math.random().toString(36).slice(2, 8)}`,
  productCode: product.productCode,
  nameProduct: product.name,
  qty: Number(qty),
  cost: Number(product.cost),
  total: round5(Number(qty) * Number(product.cost)),
  lotCode: '',
  expirationDate: '',
  requireExpLot: Boolean(product.requireExpLot)
});

// Cantidad digitada en "Agregar varios": vacía o negativa no vale; 0 sí ("conté cero").
export const isValidCount = (qty) => isNumber(qty) && Number(qty) >= 0;

// Contar dos veces el mismo producto no suma: el conteo nuevo reemplaza al anterior (llave de línea del producto).
export const upsertLine = (details = [], line = {}) => {
  const key = lineKey(line);
  const index = details.findIndex((item) => lineKey(item) === key);
  if (index < 0) return [...details, line];
  return details.map((item, i) => (i === index ? { ...item, qty: line.qty, total: round5(Number(line.qty) * Number(item.cost || line.cost || 0)) } : item));
};

/**
 * "Agregar Rest.": los productos del almacén que todavía no están en el detalle, con cantidad 0. Omite los de costo 0 en la ficha (el back
 * los rechazaría) y los que exigen lote o vencimiento (necesitan un dato que aquí no hay) y cuenta cuántos omitió de cada tipo.
 */
export const restLines = ({ products = [], details = [] } = {}) => {
  const present = new Set((details || []).map((line) => text(line.productCode)));
  const lines = [];
  let omittedCost = 0;
  let omittedLot = 0;
  (products || []).forEach((product) => {
    if (present.has(text(product.productCode))) return;
    if (!(Number(product.cost) > 0)) { omittedCost += 1; return; }
    if (product.requireExpLot) { omittedLot += 1; return; }
    present.add(text(product.productCode));
    lines.push(lineFromProduct(product, 0));
  });
  return { lines, omittedCost, omittedLot };
};

// Resumen de lo que devolvió Contabilizar: cuántas líneas entran y salen y el valor absoluto total.
export const summarizeAdjustments = (adjustments = []) => {
  const list = Array.isArray(adjustments) ? adjustments : [];
  const entries = list.filter((item) => Number(item.difference) > 0).length;
  const exits = list.filter((item) => Number(item.difference) < 0).length;
  const total = Math.round(list.reduce((sum, item) => sum + Math.abs(Math.round(Number(item.value) * 100)), 0)) / 100;
  return { entries, exits, total };
};

// El estado del documento es el mismo que el de Traslados (aplicado, anulado, qué acciones se ofrecen).
export const adjustmentState = transferState;
