// Reglas puras de la edición posterior de facturas fiscales (SPEC v2-72-sr). Mismas reglas del back (`postEditRules.js`): el back vuelve a validar todo.
export const REASON_MAX = 200;
export const API_PATH = 'billing/process/invoicePostEdit';

// Edición posterior de facturas del POS (SPEC v2-83-sr): las mismas pantallas de Facturación con otra ruta y la sesión de caja en la consulta.
export const POS_API_PATH = 'billing/process/pointSales/postEdit';
export const withSession = (url, sessionId) => (Number(sessionId) > 0 ? `${url}${url.includes('?') ? '&' : '?'}sessionId=${Number(sessionId)}` : url);

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const text = (value) => String(value ?? '').trim();
const truthy = (value) => value === true || value === 1 || value === '1' || value === 'true';

const TEXT_FIELDS = ['customerDNI', 'customerName', 'notes', 'purchaseOrderNumber', 'exemptedCertificate', 'exemptedNumber', 'exemptedRecord'];

/**
 * Solo lo que el usuario cambió (el back no borra lo omitido): comparado contra lo cargado. `sellerId` solo si se eligió uno distinto del actual.
 * Un vencimiento vacío se manda como `null` solo si antes tenía fecha.
 */
export const buildInfoPatch = (original = {}, form = {}) => {
  const patch = {};
  TEXT_FIELDS.forEach((key) => {
    if (text(form[key]) !== text(original[key])) patch[key] = text(form[key]);
  });
  if (num(form.documentType) !== num(original.documentType) && num(form.documentType) > 0) patch.documentType = num(form.documentType);
  if (truthy(form.isExonerated) !== truthy(original.isExonerated)) patch.isExonerated = truthy(form.isExonerated);
  const before = String(original.expirationDate ?? '').slice(0, 10);
  const after = String(form.expirationDate ?? '').slice(0, 10);
  if (after !== before) patch.expirationDate = after || null;
  if (num(form.sellerId) > 0 && num(form.sellerId) !== num(original.sellerId)) patch.sellerId = num(form.sellerId);
  return patch;
};

// Cambiar el tipo de venta o la exoneración regenera la partida y la CxC (en el servidor): pide motivo.
export const regeneratesAccounting = (patch = {}) => patch.documentType !== undefined || patch.isExonerated !== undefined;

export const validateInfoForm = (form = {}, patch = {}, reason = '') => {
  const errors = {};
  if (Object.keys(patch).length === 0) errors.patch = 'page.invoicing.modal.postEdit.error.noChanges';
  if ('customerName' in patch && !patch.customerName) errors.customerName = 'msg.required.input.name';
  if ('customerDNI' in patch && !patch.customerDNI) errors.customerDNI = 'msg.required.input.rtn';
  if (truthy(form.isExonerated) && !text(form.exemptedCertificate)) errors.exemptedCertificate = 'page.invoicing.error.exonerationNumber';
  if (regeneratesAccounting(patch) && !text(reason)) errors.reason = 'page.invoicing.modal.postEdit.error.reason';
  if (text(reason).length > REASON_MAX) errors.reason = 'page.invoicing.modal.postEdit.error.reason';
  return errors;
};

export const buildInfoBody = (patch, reason) => ({ ...patch, ...(text(reason) ? { reason: text(reason).slice(0, REASON_MAX) } : {}) });

// Costo y distribución: solo las filas con AMBOS valores nuevos (como el legacy), mayores que 0.
export const changedCostRows = (rows = []) => rows.filter((row) => num(row.newCost) !== 0 && num(row.newQtyDist) !== 0);

export const validateCostRows = (rows = [], reason = '') => {
  const changed = changedCostRows(rows);
  if (changed.length === 0) return 'page.invoicing.modal.editCostDist.msg.noChanges';
  if (changed.some((row) => !(num(row.newCost) > 0) || !(num(row.newQtyDist) > 0))) return 'page.invoicing.modal.postEdit.error.values';
  if (!text(reason) || text(reason).length > REASON_MAX) return 'page.invoicing.modal.postEdit.error.reason';
  return null;
};

export const buildCostBody = (rows, reason) => ({
  rows: changedCostRows(rows).map((row) => ({ id: row.id, newCost: num(row.newCost), newQtyDist: num(row.newQtyDist) })),
  reason: text(reason).slice(0, REASON_MAX)
});

export const validateChangeProduct = ({ selectedCode, currentCode, reason }) => {
  if (!text(selectedCode)) return 'page.invoicing.modal.changeProduct.msg.selectProduct';
  if (text(selectedCode) === text(currentCode)) return 'page.invoicing.modal.postEdit.error.sameProduct';
  if (!text(reason) || text(reason).length > REASON_MAX) return 'page.invoicing.modal.postEdit.error.reason';
  return null;
};

export const buildChangeProductBody = ({ detailId, selectedCode, reason }) => ({ detailId, newProductCode: text(selectedCode), reason: text(reason).slice(0, REASON_MAX) });
