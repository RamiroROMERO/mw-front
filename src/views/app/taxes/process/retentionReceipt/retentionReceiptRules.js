import { round2 } from '../../../inventory/settings/productsCatalog/priceRules';

// Reglas del Comprobante de retención (SPEC v2-113-sr). Son las mismas que valida el back (WithholdingReceiptDTO y WithholdingReceiptService): el back es quien decide
// (documento, proveedor, período, saldo de la cuenta por pagar y facturas ya retenidas) y esto solo evita una llamada que ya se sabe rechazada y muestra el valor de
// cada línea igual que lo calcula el back. Los números y casos son los de WithholdingReceiptDTO.test.js y withholdingReceiptRules.test.js del back.

export const RECEIPT_URL = 'tax/process/withholdingReceipts';
export const PRINT_FILE_NAME = 'Comprobante de Retención.pdf';
export const MAX_LINES = 200;
export const MAX_AMOUNT = 999999999999.99;

export const INITIAL_RECEIPT = Object.freeze({
  id: 0, date: '', documentCode: '', documentId: '', cai: '', numberCAI: '', rangeCAI: '', limitDate: '', providerId: '', providerName: '', pdaNumber: 0, total: 0, status: true
});

export const INITIAL_LINE = Object.freeze({
  invoiceId: 0, invoiceNumber: '', invoiceTotal: 0, balance: 0, withholdingTypeId: '', description: '', baseValue: '', percentValue: ''
});

const text = (value) => String(value ?? '').trim();
const cents = (value) => Math.round(Number(value) * 100);

export const isValidAmount = (value) => /^\d+(\.\d{1,2})?$/.test(text(value)) && Number(value) > 0 && Number(value) <= MAX_AMOUNT;
export const isValidPercent = (value) => /^\d+(\.\d{1,2})?$/.test(text(value)) && Number(value) > 0 && Number(value) <= 100;
export const isPositiveInt = (value) => /^\d+$/.test(text(value)) && Number(value) > 0;

/** Retención de una línea: ROUND(base x % / 100, 2), igual que el back. Vacío o inválido da 0. */
export const lineTotal = (baseValue, percentValue) => (isValidAmount(baseValue) && isValidPercent(percentValue)
  ? round2((Number(baseValue) * Number(percentValue)) / 100) : 0);

/** Total del comprobante: suma en centavos de las retenciones de las líneas. */
export const receiptTotal = (details = []) => details.reduce((sum, line) => sum + cents(lineTotal(line.baseValue, line.percentValue)), 0) / 100;

/** Estado del comprobante cargado y lo que se puede hacer con él (el back es quien decide). */
export const receiptState = (receipt = {}) => {
  const saved = Number(receipt.id) > 0;
  const isVoided = receipt.status === false || Number(receipt.status) === 0 && receipt.status !== undefined && receipt.status !== true;
  const isPosted = Number(receipt.pdaNumber) > 0;
  const hasCai = text(receipt.numberCAI) !== '';
  return {
    saved,
    isVoided,
    isPosted,
    hasCai,
    locked: isVoided || isPosted,
    canGenerateCai: saved && !isVoided && !hasCai,
    canAccount: saved && !isVoided && !isPosted && hasCai,
    canCancel: saved && !isVoided
  };
};

/** Acción de un botón: 'ok' o el id de traducción del aviso (sin llamar al back). */
export const caiAction = (receipt) => {
  const state = receiptState(receipt);
  if (!state.saved) return 'page.retentionReceipt.msg.saveFirst';
  if (state.isVoided) return 'page.retentionReceipt.msg.voided';
  if (state.hasCai) return 'page.retentionReceipt.msg.caiAlready';
  return 'ok';
};
export const accountAction = (receipt) => {
  const state = receiptState(receipt);
  if (!state.saved) return 'page.retentionReceipt.msg.saveFirst';
  if (state.isVoided) return 'page.retentionReceipt.msg.voided';
  if (state.isPosted) return 'page.retentionReceipt.msg.alreadyPosted';
  if (!state.hasCai) return 'page.retentionReceipt.msg.caiRequired';
  return 'ok';
};

/** Errores de la línea que se va a agregar (ids de traducción); `lines` son las ya agregadas (no se repite factura + tipo). */
export const validateLine = (line = {}, lines = []) => {
  const errors = {};
  if (!isPositiveInt(line.invoiceId)) errors.invoiceId = 'page.retentionReceipt.error.invoice';
  if (!isPositiveInt(line.withholdingTypeId)) errors.withholdingTypeId = 'page.retentionReceipt.error.type';
  if (!isValidAmount(line.baseValue)) errors.baseValue = 'page.retentionReceipt.error.base';
  else if (Number(line.invoiceTotal) > 0 && cents(line.baseValue) > cents(line.invoiceTotal)) errors.baseValue = 'page.retentionReceipt.error.baseExceeded';
  if (!isValidPercent(line.percentValue)) errors.percentValue = 'page.retentionReceipt.error.percent';
  if (Object.keys(errors).length === 0) {
    const duplicated = lines.some((item) => Number(item.invoiceId) === Number(line.invoiceId) && Number(item.withholdingTypeId) === Number(line.withholdingTypeId));
    if (duplicated) errors.withholdingTypeId = 'page.retentionReceipt.error.duplicated';
    else if (lineTotal(line.baseValue, line.percentValue) <= 0) errors.baseValue = 'page.retentionReceipt.error.totalZero';
    else {
      const retained = lines.filter((item) => Number(item.invoiceId) === Number(line.invoiceId)).reduce((sum, item) => sum + cents(lineTotal(item.baseValue, item.percentValue)), 0)
        + cents(lineTotal(line.baseValue, line.percentValue));
      if (Number(line.balance) > 0 && retained > cents(line.balance)) errors.baseValue = 'page.retentionReceipt.error.balance';
    }
  }
  return errors;
};

/** Errores de la cabecera y de que haya líneas. Un objeto vacío significa que se puede enviar. */
export const validateReceipt = (form = {}, details = []) => {
  const errors = {};
  if (!text(form.date)) errors.date = 'msg.required.input.date';
  if (!text(form.documentCode)) errors.documentCode = 'msg.required.input.codeDocument';
  if (!isPositiveInt(form.providerId)) errors.providerId = 'msg.required.select.provider';
  if (details.length === 0) errors.details = 'msg.required.select.retentionDocument';
  else if (details.length > MAX_LINES) errors.details = 'page.retentionReceipt.error.maxLines';
  return errors;
};

/** Cuerpo que se envía al back: solo lo que el cliente decide (el back calcula importes, descripción, número y CAI). */
export const buildPayload = (form = {}, details = []) => ({
  date: text(form.date).slice(0, 10),
  documentCode: text(form.documentCode),
  providerId: Number(form.providerId),
  details: details.map((line) => ({
    invoiceId: Number(line.invoiceId),
    withholdingTypeId: Number(line.withholdingTypeId),
    baseValue: Number(text(line.baseValue)),
    percentValue: Number(text(line.percentValue))
  }))
});

const cleanDate = (value) => (text(value) === '1900-01-01' ? '' : text(value).slice(0, 10));

/** Carga la cabecera guardada al formulario. */
export const mapReceiptToForm = (data = {}) => ({
  ...INITIAL_RECEIPT,
  id: data.id ?? 0,
  date: text(data.date).slice(0, 10),
  documentCode: text(data.documentCode),
  documentId: Number(data.documentId) > 0 ? String(data.documentId) : '',
  cai: text(data.cai),
  numberCAI: text(data.numberCAI),
  rangeCAI: text(data.rangeCAI),
  limitDate: cleanDate(data.limitDate),
  providerId: data.providerId ? String(data.providerId) : '',
  providerName: text(data.providerName),
  pdaNumber: Number(data.pdaNumber) || 0,
  total: Number(data.total) || 0,
  status: data.status === undefined ? true : data.status === true || Number(data.status) === 1
});

/** Carga las líneas guardadas (los importes llegan como número; una anulada llega en cero). */
export const mapDetailToLines = (details = []) => details.map((line) => ({
  ...INITIAL_LINE,
  invoiceId: Number(line.invoiceId) || 0,
  invoiceNumber: text(line.invoiceNumber),
  withholdingTypeId: String(line.withholdingTypeId ?? ''),
  description: text(line.description),
  baseValue: String(Number(line.baseValue) || 0),
  percentValue: String(Number(line.percentValue) || 0)
}));

/** Opciones del combo de tipos de retención (activos; el porcentaje sugerido es el del tipo). */
export const typeOptions = (types = []) => types.map((type) => ({ value: String(type.id), label: type.name, percentValue: Number(type.percentValue) || 0, name: type.name }));

/** Opciones del combo de proveedores. */
export const providerOptions = (providers = []) => providers.map((provider) => ({ value: String(provider.id), label: `${provider.dni ?? ''} | ${provider.name}`.trim(), name: provider.name }));

/** Una factura retenible del back pasa a la línea que se edita (la base sugerida es el subtotal, como el legacy). */
export const invoiceToLine = (invoice = {}) => ({
  ...INITIAL_LINE,
  invoiceId: Number(invoice.id) || 0,
  invoiceNumber: text(invoice.invoiceNumber),
  invoiceTotal: Math.max(Number(invoice.total) || 0, Number(invoice.subtotal) || 0), // máximo de base: el mayor entre subtotal y total, como el back
  balance: Number(invoice.balance) || 0,
  baseValue: invoice.subtotal === undefined || invoice.subtotal === null ? '' : String(round2(invoice.subtotal))
});

/** Parámetros de impresión: original por defecto; la copia agrega `copy=1`. */
export const printOptions = (id, copy = false) => ({ path: RECEIPT_URL, id, fileName: PRINT_FILE_NAME, query: copy ? { copy: 1 } : {} });
