// Reglas de campos del Ajuste de costos y cantidades del kardex (SPEC v2-56-sr). Son las mismas que aplica el back (kardexAdjustmentRules y
// CostAdjustmentDTO de modules/inventory/costAdjustment): el back es quien decide; esto solo evita una llamada que ya se sabe rechazada y
// calcula en pantalla los valores igual que el back (costo x cantidad al centavo, mitades hacia arriba).
import { round2 } from '../../settings/productsCatalog/priceRules';

export const MAX_RANGE_DAYS = 366;
export const MAX_ROWS = 500;
export const MAX_REASON = 250;
export const MAX_DECIMALS = 5;
export const MAX_VALUE = Number('999999999999.99999'); // DECIMAL(17,5); como texto: el literal numérico pierde precisión
export const ADJUST_PRIVILEGE_CODE = '11.01.033';
export const MOVEMENTS_PATH = 'inventory/process/costAdjustment/movements';
export const ADJUST_PATH = 'inventory/process/costAdjustment';

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const isBlank = (value) => value === undefined || value === null || text(value) === '' && typeof value === 'string';
const isNumber = (value) => !isBlank(value) && typeof value !== 'boolean' && Number.isFinite(Number(value));
const round5 = (value) => Math.round((Number(value) || 0) * 1e5) / 1e5;

// Privilegio "Ajustar Costos y Cantidades del Kardex" (usu_accniv): `active` en `mw_current_userModules`. El back vuelve a exigirlo.
export const hasAdjustPrivilege = (privilege) => Boolean(privilege && privilege.active);

// Decimales del texto del número.
export const decimalsOf = (value) => {
  const plain = /e/i.test(String(value)) ? Number(value).toFixed(12) : String(value).trim();
  const [, fraction = ''] = plain.split('.');
  return fraction.replace(/0+$/, '').length;
};

// valor = costo x cantidad al centavo (igual que el back).
export const computeValue = (cost, qty) => round2((Number(cost) || 0) * (Number(qty) || 0));
export const computeValues = (row) => ({ debitValue: computeValue(row.costValue, row.debitQty), creditValue: computeValue(row.costValue, row.creditQty) });

const parseDay = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(value));
  if (!match) return null;
  const [, y, m, d] = match.map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? date : null;
};

/**
 * Valida el filtro de la consulta. Devuelve { campo: idDeTraducción } con solo los campos inválidos ({} = válido).
 * Almacén y producto obligatorios; fechas obligatorias, válidas, desde <= hasta y de como máximo 366 días entre ellas.
 */
export const validateFilter = ({ storeId, productCode, dateFrom, dateTo } = {}) => {
  const errors = {};
  if (!Number.isInteger(Number(storeId)) || Number(storeId) <= 0) errors.storeId = 'msg.required.select.warehouse';
  if (!text(productCode)) errors.productCode = 'msg.required.input.codeProduct';
  if (!text(dateFrom)) errors.dateFrom = 'msg.costAdjustment.dateFromRequired';
  if (!text(dateTo)) errors.dateTo = 'msg.costAdjustment.dateToRequired';
  if (!errors.dateFrom && !errors.dateTo) {
    const from = parseDay(dateFrom);
    const to = parseDay(dateTo);
    if (!from) errors.dateFrom = 'page.costAdjustment.error.dateInvalid';
    if (!to) errors.dateTo = 'page.costAdjustment.error.dateInvalid';
    if (from && to) {
      if (from > to) errors.dateTo = 'page.costAdjustment.error.rangeInvalid';
      else if (Math.round((to.getTime() - from.getTime()) / 86400000) > MAX_RANGE_DAYS) errors.dateTo = 'page.costAdjustment.error.rangeTooLarge';
    }
  }
  return errors;
};

// Errores de campo de una fila: costo y cantidades no negativos, de máximo 5 decimales, y sin entrada y salida a la vez.
export const validateRow = (row = {}) => {
  const errors = {};
  [['costValue', 'costValue'], ['debitQty', 'debitQty'], ['creditQty', 'creditQty']].forEach(([field]) => {
    const value = row[field];
    if (!isNumber(value)) errors[field] = 'page.costAdjustment.error.number';
    else if (Number(value) < 0) errors[field] = 'page.costAdjustment.error.negative';
    else if (decimalsOf(value) > MAX_DECIMALS) errors[field] = 'page.costAdjustment.error.decimals';
    else if (Number(value) > MAX_VALUE) errors[field] = 'page.costAdjustment.error.number';
  });
  if (!errors.debitQty && !errors.creditQty && Number(row.debitQty) > 0 && Number(row.creditQty) > 0) errors.creditQty = 'page.costAdjustment.error.bothSides';
  return errors;
};

// ¿La fila cambió respecto a lo consultado? Costo y cantidades a 5 decimales (el valor sale de ellos).
export const isEdited = (row) => ['costValue', 'debitQty', 'creditQty'].some((field) => round5(row[field]) !== round5(row.original?.[field]));

// Una fila recién consultada: guarda sus valores originales para saber qué cambió y poder descartar.
export const toRow = (item) => ({ ...item, original: { costValue: item.costValue, debitQty: item.debitQty, creditQty: item.creditQty } });

// Cambia un campo de una fila y recalcula sus valores en pantalla (igual que el back). Una fila no editable no cambia.
export const changeRow = (row, field, value) => {
  if (!row.editable) return row;
  const next = { ...row, [field]: value };
  return { ...next, ...computeValues({ costValue: next.costValue, debitQty: next.debitQty, creditQty: next.creditQty }) };
};

// Filas que cambiaron y su primer error (si hay): { edited, errors: { [id]: { campo: idDeTraducción } } }.
export const collectEdits = (rows = []) => {
  const edited = rows.filter((row) => row.editable && isEdited(row));
  const errors = {};
  edited.forEach((row) => {
    const rowErrors = validateRow(row);
    if (Object.keys(rowErrors).length > 0) errors[row.id] = rowErrors;
  });
  return { edited, errors };
};

// Motivo obligatorio (máximo 250).
export const validateReason = (reason) => {
  if (!text(reason)) return 'page.costAdjustment.error.reasonRequired';
  if (text(reason).length > MAX_REASON) return 'page.costAdjustment.error.reasonTooLong';
  return null;
};

// Cuerpo del PUT: el mismo filtro consultado, el motivo y solo las filas editadas con id, costo y cantidades (el valor lo calcula el back).
export const buildPayload = (filter, reason, edited) => ({
  storeId: Number(filter.storeId),
  productCode: text(filter.productCode),
  dateFrom: text(filter.dateFrom),
  dateTo: text(filter.dateTo),
  reason: text(reason),
  rows: edited.map((row) => ({ id: row.id, costValue: Number(row.costValue), debitQty: Number(row.debitQty), creditQty: Number(row.creditQty) }))
});

// Texto del aviso de una fila: traslado (editar una sola mitad desbalancea los almacenes) o línea no editable. null si no hay aviso.
export const rowNotice = (row) => {
  if (!row.editable) return 'page.costAdjustment.notice.valueMismatch';
  if (row.isTransfer) return 'page.costAdjustment.notice.transfer';
  return null;
};

// Resumen del resultado del PUT para mostrarlo: existencia nueva y cuántas líneas cambiaron.
export const summarizeResult = (result = {}) => ({
  updated: Number(result.updated) || 0,
  unchanged: Number(result.unchanged) || 0,
  existence: Number(result.stock?.existence) || 0,
  transferWarnings: Array.isArray(result.warnings) ? result.warnings.filter((item) => item.code === 'transfer.half').length : 0
});
