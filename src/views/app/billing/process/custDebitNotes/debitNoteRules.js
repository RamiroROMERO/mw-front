// Reglas de la nota de débito de clientes (screen-review #10). Mismos casos que DebitNoteDTO del back; el back decide.
// Tipos: 1 recargos por mora, 2 otros recargos, 3 ajuste a precios y cantidades, 4 otros (con descripción).
export const TYPE = { LATE_FEE: 1, OTHER_CHARGE: 2, ADJUSTMENT: 3, OTHER: 4 };
export const CURRENCY = { LEMPIRAS: 1, DOLLARS: 2 };

const blank = (v) => v === undefined || v === null || String(v).trim() === '';
const num = (v) => Number(v);

export const localToday = (now = new Date()) => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

const isRealDay = (text) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [y, m, d] = text.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

// Devuelve { field, messageId } del primer problema de la cabecera, o null. Los ids son claves de traducción existentes o nuevas (es/en).
export const findHeaderProblem = (form, { today = localToday() } = {}) => {
  const day = String(form.date || '').slice(0, 10);
  if (blank(form.date) || !isRealDay(day)) return { field: 'date', messageId: 'msg.error.debitNote.date.invalid' };
  if (day > today) return { field: 'date', messageId: 'msg.error.debitNote.date.future' };
  if (blank(form.documentCode)) return { field: 'documentCode', messageId: 'msg.required.select.typeDocument' };
  if (!(num(form.customerId) > 0)) return { field: 'customerId', messageId: 'msg.required.select.customer' };
  const type = num(form.typeId);
  if (!Object.values(TYPE).includes(type)) return { field: 'typeId', messageId: 'msg.error.debitNote.type.invalid' };
  if (type === TYPE.OTHER && blank(form.typeOther)) return { field: 'typeOther', messageId: 'msg.error.debitNote.typeOther.required' };
  if (type !== TYPE.ADJUSTMENT && blank(form.incomeCtaCode)) return { field: 'incomeCtaCode', messageId: 'msg.required.select.account' };
  if (!(num(form.valueLps) > 0)) return { field: 'valueLps', messageId: 'msg.error.invalidValue' };
  if (num(form.currencyId) === CURRENCY.DOLLARS && !(num(form.exchangeRate) > 0)) return { field: 'exchangeRate', messageId: 'msg.error.debitNote.exchangeRate.invalid' };
  return null;
};

// Detalle: tipo 3 exige factura de origen y líneas; los demás, al menos una factura aplicada con valor mayor que cero.
export const findDetailProblem = ({ typeId, detail1 = [], detail2 = [], originInvoice = null }) => {
  if (num(typeId) === TYPE.ADJUSTMENT) {
    if (!originInvoice) return { messageId: 'msg.required.select.originInvoice' };
    if (detail2.length === 0) return { messageId: 'msg.required.select.originInvoice' };
    return null;
  }
  if (detail1.length === 0) return { messageId: 'msg.required.select.invoiceToApply' };
  if (detail1.some((row) => !(num(row.appliedValue) > 0))) return { messageId: 'msg.error.invalidValue' };
  return null;
};

// Cuerpo del guardado único (SPEC v2-92-sr): cabecera con lo que digita el usuario y el detalle sin importes, saldos ni fechas de factura. El back calcula
// valores, desglose, total y dólares; una nota de débito SUBE la deuda y el valor aplicado no se limita por el saldo de la factura.
export const buildNotePayload = (form, { originInvoice = null, detail1 = [], detail2 = [] } = {}) => {
  const isAdjustment = num(form.typeId) === TYPE.ADJUSTMENT;
  const payload = {
    documentCode: form.documentCode,
    date: form.date,
    customerId: form.customerId,
    typeId: form.typeId,
    typeOther: num(form.typeId) === TYPE.OTHER ? form.typeOther : '',
    description: form.description,
    exchangeRate: form.exchangeRate,
    discountPercent: form.discountPercent,
    incomeCtaCode: isAdjustment ? '' : form.incomeCtaCode,
    currencyId: form.currencyId
  };
  if (isAdjustment) {
    return {
      ...payload,
      originInvoiceId: originInvoice ? originInvoice.id : 0,
      products: detail2.map((line) => ({ productCode: line.productCode, quantity: line.quantity, price: line.price }))
    };
  }
  return { ...payload, invoices: detail1.map((line) => ({ invoiceNumber: line.invoiceNumber, percent: line.percent, appliedValue: line.appliedValue })) };
};

// Una nota con número fiscal o partida ya no se edita ni se elimina (se anula): el back responde debitNote.locked.fiscal.
export const isNoteLocked = ({ pdaNumber, numberCAI }) => num(pdaNumber) > 0 || !blank(numberCAI);
