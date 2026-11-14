// Reglas de campos de Compras por ticket (Boletas de Compra), screen-review #13. Son las mismas que aplica el back (TicketPurchaseDTO y
// ticketPurchaseRules de modules/inventory/ticketPurchase): el back es quien decide, y esto solo evita una llamada que ya se sabe
// rechazada y calcula el total mientras se captura. Los números y casos son los de TicketPurchaseDTO.test.js y ticketPurchaseRules.test.js.
//
// Límites de la tabla: cantidad, precio y total de la línea son DECIMAL(8,2) (máximo 999,999.99). El legacy dejaba digitar el precio con
// 6 decimales y la columna redondeaba en silencio; aquí cantidad y precio llevan a lo sumo 2 decimales y el total lo calcula el back.

export const MAX_AMOUNT = 999999.99;
export const MAX_CENTS = 99999999;
export const MAX = { productCode: 20, name: 250, expenseCtaCode: 15 };

const text = (value) => (value === null || value === undefined ? '' : String(value).trim());
const isOn = (value) => value === true || value === 1 || value === '1' || value === 'true';

export const asNumber = (value) => {
  if (value === null || value === undefined || text(value) === '') return NaN;
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
};

// Centavos enteros desplazando el punto sobre el texto del número (mitades hacia arriba): sin Math.round(x * 100).
export const toCents = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  const match = /^(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i.exec(String(Math.abs(number)));
  if (!match) return 0;
  const digits = match[1] + (match[2] || '');
  const pointPos = match[1].length + Number(match[3] || 0) + 2;
  let intPart;
  let fracPart;
  if (pointPos <= 0) {
    intPart = '0';
    fracPart = '0'.repeat(-pointPos) + digits;
  } else if (pointPos >= digits.length) {
    intPart = digits + '0'.repeat(pointPos - digits.length);
    fracPart = '';
  } else {
    intPart = digits.slice(0, pointPos);
    fracPart = digits.slice(pointPos);
  }
  let cents = BigInt(intPart);
  if (fracPart.length > 0 && fracPart[0] >= '5') cents += 1n;
  const result = Number(cents);
  return number < 0 && result !== 0 ? -result : result;
};
export const fromCents = (cents) => Number(cents) / 100;
export const round2 = (value) => fromCents(toCents(value));

// Fecha de hoy del navegador por calendario local (YYYY-MM-DD).
export const localToday = (now = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// Texto YYYY-MM-DD con un día que existe en ese mes (2024-02-30 no).
export const isValidCalendarDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(value));
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
};

const EMPTY_DATE = '1900-01-01';
const day = (value) => {
  const date = text(value).slice(0, 10);
  return date === EMPTY_DATE || date === '0000-00-00' ? '' : date;
};

export const hasAtMostTwoDecimals = (value) => {
  const number = asNumber(value);
  return Number.isFinite(number) && fromCents(toCents(number)) === number;
};

// Cantidad o precio válido: 'invalid' (no es número), 'notPositive', 'decimals' o 'tooLarge'; null si está bien.
export const checkAmount = (value) => {
  const number = asNumber(value);
  if (Number.isNaN(number)) return 'invalid';
  if (number <= 0) return 'notPositive';
  if (!hasAtMostTwoDecimals(number)) return 'decimals';
  if (number > MAX_AMOUNT) return 'tooLarge';
  return null;
};

// total = round2(cantidad × precio) en centavos enteros (BigInt: 99,999,999 × 99,999,999 pasa de 2^53). Mitades hacia arriba.
export const calculateLineTotalCents = (quantity, price) => Number((BigInt(toCents(quantity)) * BigInt(toCents(price)) + 50n) / 100n);
export const calculateLineTotal = (quantity, price) => fromCents(calculateLineTotalCents(quantity, price));
// Total que se muestra mientras se digita: 0 si cantidad o precio todavía no son números.
export const lineTotalOrZero = (quantity, price) => {
  const qty = asNumber(quantity);
  const unit = asNumber(price);
  return Number.isFinite(qty) && Number.isFinite(unit) ? calculateLineTotal(qty, unit) : 0;
};
export const lineTotalFits =(quantity, price) => calculateLineTotalCents(quantity, price) <= MAX_CENTS;

// Suma del documento en centavos (sin ruido de coma flotante).
export const sumTotals = (lines = []) => fromCents(lines.reduce((sum, line) => sum + toCents(line?.total), 0));

const AMOUNT_ERRORS = {
  notPositive: 'page.ticketPurchase.error.notPositive',
  decimals: 'page.ticketPurchase.error.decimals',
  tooLarge: 'page.ticketPurchase.error.tooLarge'
};
const amountError = (value, invalidId) => {
  const result = checkAmount(value);
  if (!result) return null;
  return result === 'invalid' ? invalidId : AMOUNT_ERRORS[result];
};

/**
 * Cabecera. Devuelve { campo: idDeTraducción } con solo los campos inválidos ({} = válido). Mismas reglas que el DTO: tipo de documento,
 * proveedor y forma de pago obligatorios y la fecha obligatoria, válida y no futura.
 */
export const validateHeader = (form = {}, { today = localToday() } = {}) => {
  const errors = {};
  if (!text(form.documentCode)) errors.documentCode = 'msg.required.select.typeDocument';

  const date = day(form.date);
  if (!date) errors.date = 'msg.required.input.date';
  else if (!isValidCalendarDate(date)) errors.date = 'page.ticketPurchase.error.dateInvalid';
  else if (date > today) errors.date = 'page.ticketPurchase.error.dateFuture';

  const providerId = asNumber(form.providerId);
  if (!Number.isInteger(providerId) || providerId <= 0) errors.providerId = 'msg.required.select.provider';
  const paymentTypeId = asNumber(form.paymentTypeId);
  if (!Number.isInteger(paymentTypeId) || paymentTypeId <= 0) errors.paymentTypeId = 'msg.required.select.paymentMethod';
  return errors;
};

/**
 * Una línea (la del formulario "agregar producto" o una del grid). Mismas reglas que el DTO: nombre obligatorio, cantidad y precio
 * > 0 con 2 decimales y tope, el total no puede pasar del tope, con "Al Inventario" se exigen producto y almacén y la cuenta de
 * costo/gasto es obligatoria solo con Contabilidad activa (`accountingActive`).
 */
export const validateLine = (line = {}, { accountingActive = true } = {}) => {
  const errors = {};
  const name = text(line.nameProduct);
  if (!name) errors.nameProduct = 'page.ticketPurchase.error.nameRequired';
  else if (name.length > MAX.name) errors.nameProduct = 'page.ticketPurchase.error.nameMax';

  const productCode = text(line.productCode);
  if (productCode.length > MAX.productCode) errors.productCode = 'page.ticketPurchase.error.productMax';

  const qtyError = amountError(line.qty, 'msg.required.input.qty');
  if (qtyError) errors.qty = qtyError;
  const priceError = amountError(line.price, 'msg.required.input.price');
  if (priceError) errors.price = priceError;
  if (!qtyError && !priceError && !lineTotalFits(asNumber(line.qty), asNumber(line.price))) errors.total = 'page.ticketPurchase.error.totalTooLarge';

  if (accountingActive) {
    const code = text(line.expenseCtaCode);
    if (!code || code === '0') errors.expenseCtaCode = 'msg.required.input.account';
    else if (code.length > MAX.expenseCtaCode) errors.expenseCtaCode = 'page.ticketPurchase.error.accountMax';
  }

  if (accountingActive && isOn(line.toInventory)) {
    if (!productCode && !errors.productCode) errors.productCode = 'page.ticketPurchase.error.productToInventory';
    const storeId = asNumber(line.storeId);
    if (!Number.isInteger(storeId) || storeId <= 0) errors.storeId = 'page.ticketPurchase.error.storeToInventory';
  }
  return errors;
};

// Todas las líneas del grid: [{ index (1 = primera), errors }] solo con las que fallan.
export const validateLines = (lines = [], options = {}) => lines
  .map((line, position) => ({ index: position + 1, errors: validateLine(line, options) }))
  .filter((item) => Object.keys(item.errors).length > 0);

// { campo: id } -> { campoValid: id } (la forma que consumen los componentes).
export const toFormValidation = (errors = {}) => Object.fromEntries(Object.entries(errors).map(([field, id]) => [`${field}Valid`, id]));

export const emptyForm = (today = localToday()) => ({
  id: 0,
  documentCode: '',
  documentId: 0,
  date: today,
  purchaseOrderId: 0,
  providerId: 0,
  paymentTypeId: 0,
  valueTotal: 0,
  notes: '',
  pdaNumber: 0,
  numberCAI: ''
});

export const emptyLine = () => ({
  idProd: 0,
  productCode: '',
  nameProduct: '',
  qty: 1,
  price: 0,
  total: 0,
  expenseCtaCode: '',
  toInventory: false,
  storeId: 0
});

// Cuerpo del POST/PUT. El total de cada línea, el número de partida, el CAI y el correlativo los fija el back (no se envían). Sin
// Contabilidad activa no hay cuenta, almacén ni "Al Inventario": se envían en 0 y vacío.
export const buildPayload = (form = {}, lines = [], { accountingActive = true } = {}) => ({
  documentCode: text(form.documentCode),
  date: day(form.date),
  providerId: form.providerId,
  paymentTypeId: form.paymentTypeId,
  purchaseOrderId: asNumber(form.purchaseOrderId) > 0 ? asNumber(form.purchaseOrderId) : 0,
  notes: form.notes ?? '',
  detail: lines.map((line) => {
    const toInventory = accountingActive && isOn(line.toInventory);
    return {
      productCode: text(line.productCode),
      name: text(line.nameProduct),
      quantity: asNumber(line.qty),
      price: asNumber(line.price),
      storeId: toInventory ? asNumber(line.storeId) || 0 : 0,
      expenseCtaCode: accountingActive ? text(line.expenseCtaCode) : '',
      sendInv: toInventory ? 1 : 0
    };
  })
});

// Línea del back (detalle) -> línea del grid.
export const lineFromServer = (row = {}) => ({
  id: row.id,
  productCode: row.productCode ?? '',
  nameProduct: row.name ?? '',
  qty: Number(row.quantity) || 0,
  price: Number(row.price) || 0,
  total: Number(row.total) || 0,
  expenseCtaCode: row.expenseCtaCode ?? '',
  toInventory: Number(row.sendInv) === 1,
  storeId: Number(row.storeId) || 0
});

// Línea de una orden de compra -> línea del grid. La orden guarda costos con hasta 5 decimales y la boleta solo admite 2: se redondea
// (el legacy también los guardaba con 2) y el total se recalcula. Almacén, cuenta y "Al Inventario" se aplican a todas (legacy).
export const lineFromOrder = (row = {}, { storeId = 0, expenseCtaCode = '', toInventory = false } = {}) => {
  const qty = round2(row.qty);
  const price = round2(row.price);
  return {
    id: row.id,
    productCode: row.productCode ?? '',
    nameProduct: row.productData?.name ?? row.nameProduct ?? '',
    qty,
    price,
    total: calculateLineTotal(qty, price),
    storeId: Number(storeId) || 0,
    expenseCtaCode: expenseCtaCode ? String(expenseCtaCode) : '',
    toInventory: isOn(toInventory)
  };
};

// Cabecera del back + líneas ya mapeadas -> estado del formulario.
export const formFromTicket = (row = {}, lines = []) => ({
  id: row.id,
  documentCode: row.documentCode ?? '',
  documentId: Number(row.documentId) || 0,
  date: day(row.date),
  purchaseOrderId: Number(row.purchaseOrderId) || 0,
  providerId: Number(row.providerId) || 0,
  paymentTypeId: Number(row.paymentTypeId) || 0,
  notes: row.notes ?? '',
  pdaNumber: Number(row.pdaNumber) || 0,
  numberCAI: row.numberCAI ?? '',
  valueTotal: sumTotals(lines)
});

// Una boleta con número de partida ya fue contabilizada: el back no la deja modificar.
export const isProcessed = (form = {}) => Number(form.pdaNumber) > 0;

// "Aplicar cuenta a todos": pone la cuenta en todas las líneas (el grid se guarda recién al pulsar Guardar).
export const applyAccountToAll = (lines = [], expenseCtaCode = '') => (text(expenseCtaCode) ? lines.map((line) => ({ ...line, expenseCtaCode: text(expenseCtaCode) })) : lines);
