// Notas de crédito de proveedores. El back calcula todos los importes al guardar (la devolución con el costo, descuento e impuesto de
// la compra origen y los demás tipos con lo aplicado, validado contra el saldo de la CxP); aquí solo se arman las líneas para
// mostrarlas, se validan los campos sin llamar al back y se arma el cuerpo. Los números y casos son los de
// modules/inventory/creditNotes/__tests__/creditNoteRules.test.js del back.
import { round2 } from '@Views/app/inventory/settings/productsCatalog/priceRules';

export const TYPE_DISCOUNT = 1;
export const TYPE_CANCEL = 2;
export const TYPE_RETURN = 3;
export const TYPE_OTHER = 4;

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

export const isReturnType = (typeId) => Number(typeId) === TYPE_RETURN;

// Importes de una línea de la devolución: subtotal = cantidad x costo; descuento sobre el subtotal; impuesto sobre el subtotal ya
// descontado (0 en una línea exonerada), con mitades hacia arriba a centavos (igual que el back).
export const calculateReturnLine = (line, quantity) => {
  const qty = num(quantity);
  const subtotal = round2(qty * num(line.price));
  const discountValue = round2(subtotal * (num(line.discountPercent) > 0 ? num(line.discountPercent) / 100 : 0));
  const taxPercent = line.isExonerated ? 0 : num(line.taxPercent);
  const taxValue = round2((subtotal - discountValue) * (taxPercent > 0 ? taxPercent / 100 : 0));
  const total = round2(subtotal - discountValue + taxValue);
  return { subtotal, discountValue, taxValue, total };
};

// Líneas devolubles de una compra: las bonificadas no se devuelven (el back las rechaza). Arrancan con la cantidad comprada.
export const buildReturnLinesFromPurchase = (purchaseLines) => (purchaseLines || [])
  .filter((item) => !item.isBonus)
  .map((item) => {
    const base = {
      id: item.id,
      productCode: item.productCode,
      description: item.productData ? item.productData.name : item.productCode,
      qty: num(item.qty),
      price: num(item.price),
      discountPercent: num(item.discountPercent),
      taxPercent: num(item.taxPercent),
      isExonerated: Boolean(item.isExonerated)
    };
    return { ...base, qtyReturn: base.qty, ...calculateReturnLine(base, base.qty) };
  });

// Cambia la cantidad a devolver de una línea (0 a lo comprado) y recalcula sus importes.
export const setReturnQty = (line, value) => {
  let qtyReturn = num(value);
  if (qtyReturn > line.qty) qtyReturn = line.qty;
  if (qtyReturn < 0) qtyReturn = 0;
  return { ...line, qtyReturn, ...calculateReturnLine(line, qtyReturn) };
};

export const sumReturn = (lines) => round2((lines || []).reduce((sum, line) => sum + round2(num(line.qtyReturn) > 0 ? num(line.total) : 0), 0));
export const sumApplied = (rows) => round2((rows || []).reduce((sum, row) => sum + num(row.appliedValue), 0));

// % aplicado a una compra <-> valor aplicado (sobre el saldo).
export const appliedFromPercent = (percent, balance) => round2((num(percent) * num(balance)) / 100);
export const percentFromApplied = (applied, balance) => (num(balance) > 0 ? round2((num(applied) * 100) / num(balance)) : 0);

// Una compra pendiente (CxP) como línea del detalle 1: arranca aplicando todo su saldo.
export const buildInvoiceLine = (pending) => ({
  id: `${pending.documentCode}`,
  invoiceNumber: pending.documentCode,
  invoiceDate: pending.date,
  invoiceCai: '',
  invoiceOrderCode: '',
  balance: num(pending.balance),
  percent: 100,
  appliedValue: num(pending.balance)
});

// Errores por campo y del detalle (ids de traducción). Un objeto vacío significa que se puede guardar.
export const validateNote = (form, { invoices = [], products = [] } = {}) => {
  const errors = {};
  if (isBlank(form?.documentCode)) errors.documentCode = 'msg.required.select.typeDocument';
  if (!(num(form?.providerId) > 0)) errors.providerId = 'msg.required.select.provider';
  if (isBlank(form?.cai)) errors.cai = 'msg.required.input.code';
  if (isBlank(form?.numberCAI)) errors.numberCAI = 'msg.required.input.code';

  if (isReturnType(form?.typeId)) {
    if (isBlank(form?.originInvoiceNumber)) errors.detail = 'msg.required.select.originInvoice';
    else if (!products.some((line) => num(line.qtyReturn) > 0)) errors.detail = 'msg.required.select.originInvoice';
  } else {
    if (!invoices.some((row) => num(row.appliedValue) > 0)) errors.detail = 'msg.required.select.invoiceToApply';
    else if (isBlank(form?.accCode)) errors.accCode = 'msg.required.select.account';
  }
  return errors;
};

// Cuerpo de POST y PUT: la cabecera más el detalle del tipo. No se mandan importes, ni `pdaNumber`, ni `documentId`: los calcula el back.
export const buildPayload = (form, { invoices = [], products = [] } = {}) => {
  const returnNote = isReturnType(form.typeId);
  const payload = {
    date: form.date,
    documentCode: form.documentCode,
    providerId: form.providerId,
    typeId: Number(form.typeId),
    typeOther: Number(form.typeId) === TYPE_OTHER ? form.typeOther : '',
    description: form.description,
    docValueUSD: num(form.docValueUSD),
    exchangeRate: num(form.exchangeRate) || 1,
    discountPercent: returnNote ? 0 : num(form.discountPercent),
    accCode: returnNote ? '' : form.accCode,
    currenId: form.currenId,
    cai: form.cai,
    numberCAI: form.numberCAI,
    originInvoiceNumber: returnNote ? form.originInvoiceNumber : '',
    isMixed: Boolean(form.isMixed)
  };
  if (returnNote) {
    payload.products = products.filter((line) => num(line.qtyReturn) > 0).map((line) => ({ productCode: line.productCode, quantity: num(line.qtyReturn) }));
  } else {
    payload.invoices = invoices.filter((row) => num(row.appliedValue) > 0).map((row) => ({
      invoiceNumber: row.invoiceNumber, appliedValue: num(row.appliedValue), percent: num(row.percent)
    }));
  }
  return payload;
};

// Estado de la nota: una nota contabilizada o anulada no se edita; solo una contabilizada y vigente se puede re-contabilizar.
export const noteState = ({ id, pdaNumber, status }) => {
  const saved = num(id) > 0;
  const processed = num(pdaNumber) > 0;
  const voided = saved && Number(status) === 0;
  return { saved, processed, voided, locked: processed || voided, canProcess: saved && !processed && !voided, canRepost: saved && processed && !voided, canVoid: saved && processed && !voided };
};

// Respuesta de GET /:id al formulario (detalle 1 con `balance`, detalle 2 con lo ya calculado por el back).
export const normalizeNote = (data) => {
  const note = data || {};
  const invoices = (note.invoices || []).map((row) => ({
    id: row.id,
    invoiceNumber: row.invoiceNumber,
    invoiceDate: row.invoiceDate,
    invoiceCai: row.invoiceCai || '',
    invoiceOrderCode: row.invoiceOrderCode || '',
    balance: num(row.invoiceBalance),
    percent: num(row.percent),
    appliedValue: num(row.appliedValue)
  }));
  const products = (note.products || []).map((row) => ({
    id: row.id,
    purchaseId: row.purchaseId,
    productCode: row.productCode,
    description: row.productData ? row.productData.name : row.productCode,
    qty: num(row.quantity),
    qtyReturn: num(row.quantity),
    subtotal: num(row.subtotal),
    discountValue: num(row.discountValue),
    taxValue: num(row.taxValue),
    total: num(row.total)
  }));
  return { invoices, products };
};

// Texto del documento para el aviso de anular / re-contabilizar.
export const noteLabel = (form) => `${form.documentCode}-${form.documentId}`;
