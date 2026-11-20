// Reglas de la nota de crédito de clientes (SPEC v2-95-sr). Mismos casos que CreditNoteDTO del back; el back decide.
// Tipos: 1 descuento, 2 anulación, 3 devolución de mercadería, 4 otros (con descripción).
export const TYPE = { DISCOUNT: 1, CANCEL: 2, RETURN: 3, OTHER: 4 };
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
  if (blank(form.date) || !isRealDay(day)) return { field: 'date', messageId: 'msg.error.creditNote.date.invalid' };
  if (day > today) return { field: 'date', messageId: 'msg.error.creditNote.date.future' };
  if (blank(form.documentCode)) return { field: 'documentCode', messageId: 'msg.required.select.typeDocument' };
  if (!(num(form.customerId) > 0)) return { field: 'customerId', messageId: 'msg.required.select.customer' };
  const type = num(form.typeId);
  if (!Object.values(TYPE).includes(type)) return { field: 'typeId', messageId: 'msg.error.creditNote.type.invalid' };
  if (type === TYPE.OTHER && blank(form.typeOther)) return { field: 'typeOther', messageId: 'msg.error.creditNote.typeOther.required' };
  if (type !== TYPE.RETURN && blank(form.incomeCtaCode)) return { field: 'incomeCtaCode', messageId: 'msg.required.select.account' };
  if (num(form.currencyId) === CURRENCY.DOLLARS && !(num(form.exchangeRate) > 0)) return { field: 'exchangeRate', messageId: 'msg.error.creditNote.exchangeRate.invalid' };
  return null;
};

// Líneas de la devolución que se envían: solo las de cantidad mayor que 0 (las demás son productos de la factura que no se devuelven).
export const returnedLines = (detail2 = []) => detail2.filter((line) => num(line.quantity) > 0);

// Detalle: la devolución exige factura de origen y al menos un producto con cantidad; los demás tipos, al menos una factura con valor mayor que cero.
export const findDetailProblem = ({ typeId, detail1 = [], detail2 = [], originInvoice = null }) => {
  if (num(typeId) === TYPE.RETURN) {
    if (!originInvoice) return { messageId: 'msg.required.select.originInvoice' };
    if (returnedLines(detail2).length === 0) return { messageId: 'msg.error.invalidValue' };
    return null;
  }
  if (detail1.length === 0) return { messageId: 'msg.required.select.invoiceToApply' };
  if (detail1.some((row) => !(num(row.appliedValue) > 0))) return { messageId: 'msg.error.invalidValue' };
  return null;
};

// Cuerpo del guardado único (SPEC v2-95-sr): cabecera con lo que digita el usuario y el detalle sin importes, saldos ni precios. El back calcula valores,
// desglose, total y dólares, y no deja aplicar más que el saldo de la factura ni devolver más de lo facturado.
export const buildNotePayload = (form, { originInvoice = null, detail1 = [], detail2 = [] } = {}) => {
  const isReturn = num(form.typeId) === TYPE.RETURN;
  const payload = {
    documentCode: form.documentCode,
    date: form.date,
    customerId: form.customerId,
    typeId: form.typeId,
    typeOther: num(form.typeId) === TYPE.OTHER ? form.typeOther : '',
    description: form.description,
    exchangeRate: form.exchangeRate,
    discountPercent: form.discountPercent,
    incomeCtaCode: isReturn ? '' : form.incomeCtaCode,
    currencyId: form.currencyId
  };
  if (isReturn) {
    return {
      ...payload,
      originInvoiceId: originInvoice ? originInvoice.id : 0,
      products: returnedLines(detail2).map((line) => ({ productCode: line.productCode, quantity: line.quantity }))
    };
  }
  return { ...payload, invoices: detail1.map((line) => ({ invoiceNumber: line.invoiceNumber, percent: line.percent, appliedValue: line.appliedValue })) };
};

// Línea de la devolución, solo para mostrar (el back calcula): precio, descuento % e impuesto % son los de la factura, a centavos por línea.
// Mitades hacia arriba desplazando el exponente sobre el texto (como el back): 3 x 10.125 = 30.375 -> 30.38 y no 30.37 por coma flotante.
const round2 = (value) => {
  const n = num(value);
  const rounded = Number(`${Math.round(Number(`${Math.abs(n)}e2`))}e-2`);
  return n < 0 ? -rounded : rounded;
};
export const calculateReturnLine = (line, quantity) => {
  let qty = num(quantity);
  if (!(qty > 0)) qty = 0;
  if (qty > num(line.quantityInvoiced)) qty = num(line.quantityInvoiced);
  const subtotal = round2(qty * num(line.price));
  const discountValue = round2((subtotal * num(line.discountPercent)) / 100);
  const taxValue = round2(((subtotal - discountValue) * num(line.taxPercent)) / 100);
  const total = round2(subtotal - discountValue + taxValue);
  return { ...line, quantity: qty, subtotal, discountValue, taxValue, total };
};

// Una nota con número fiscal o partida ya no se edita ni se elimina (se anula): el back responde creditNote.locked.fiscal.
export const isNoteLocked = ({ pdaNumber, numberCAI }) => num(pdaNumber) > 0 || !blank(numberCAI);

// Impresión (SPEC v2-97-sr): GET billing/process/creditNotes/:id/print descarga el PDF de lo guardado.
export const PRINT_PATH = 'billing/process/creditNotes';
export const PRINT_FILE_NAME = 'Nota de Credito.pdf';
