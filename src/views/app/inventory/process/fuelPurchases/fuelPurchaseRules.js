// Reglas de campos de Compras de Combustible. Son las mismas que aplica el back (PurchaseGasDTO de
// modules/inventory/purchaseGas): el back es quien decide; esto solo evita una llamada que ya se sabe rechazada y
// calcula el total mientras se captura. Los números y casos son los de PurchaseGasDTO.test.js del back (screen-review #12).

export const EMPTY_DATE = '1900-01-01';
export const INVOICE_MIN_LENGTH = 19;
export const INVOICE_MAX_LENGTH = 20;
export const FUEL_FIELDS = ['qtyDiesel', 'qtyGasoline', 'qtyOil', 'qtyOthers'];
export const AMOUNT_FIELDS = ['subtotal', 'discount', 'tax'];

// Máximos de los textos (los mismos del DTO y de las columnas).
export const MAX = { concept: 80, invoiceNumber: INVOICE_MAX_LENGTH, expenseCtaCode: 20, documentCode: 5 };

const text = (value) => String(value ?? '').trim();
const isBlank = (value) => value === undefined || value === null || text(value) === '';
const isNumber = (value) => !isBlank(value) && Number.isFinite(Number(value));
const isNonNegativeInt = (value) => isNumber(value) && Number.isInteger(Number(value)) && Number(value) >= 0;
const isPositiveInt = (value) => isNonNegativeInt(value) && Number(value) > 0;
const toCents = (value) => {
  const number = Number(value) || 0;
  return Math.round(number * 100 + Math.sign(number) * 1e-8);
};
const day = (value) => {
  const date = text(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date !== EMPTY_DATE && date !== '0000-00-00' ? date : '';
};

// Fecha de hoy del navegador por calendario local (YYYY-MM-DD).
export const localToday = (now = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// total = subtotal + impuesto - descuento, en centavos enteros (0.1 + 0.2 = 0.3).
export const calculateTotal = ({ subtotal, tax, discount } = {}) => (toCents(subtotal) + toCents(tax) - toCents(discount)) / 100;

/**
 * Valida el formulario. Devuelve { campo: idDeTraducción } con solo los campos inválidos ({} = válido). Mismas reglas
 * que el DTO: obligatorios, máximos, fechas, al menos un combustible, producto con almacén y total distinto de 0.
 */
export const validateFuelPurchase = (form = {}, { today = localToday() } = {}) => {
  const errors = {};
  const set = (field, id) => { if (!errors[field]) errors[field] = id; };

  if (isBlank(form.documentTypeId) || !isPositiveInt(form.documentTypeId)) set('documentTypeId', 'msg.required.select.typeDocument');

  const date = day(form.date);
  if (!date) set('date', 'msg.required.input.date');
  else if (date > today) set('date', 'page.fuelPurchases.error.dateFuture');

  if (!isPositiveInt(form.machineId)) set('machineId', 'msg.required.select.carId');
  if (!isPositiveInt(form.driverId)) set('driverId', 'msg.required.select.driverId');
  if (isBlank(form.concept)) set('concept', 'msg.required.input.concept');
  else if (text(form.concept).length > MAX.concept) set('concept', 'page.fuelPurchases.error.tooLong');
  if (!isPositiveInt(form.providerId)) set('providerId', 'msg.required.select.provider');

  const invoice = text(form.invoiceNumber);
  if (invoice.length < INVOICE_MIN_LENGTH || invoice.length > INVOICE_MAX_LENGTH || invoice.includes('.')) {
    set('invoiceNumber', 'msg.required.input.numInvoice');
  }

  if (!isPositiveInt(form.paymentTypeId)) set('paymentTypeId', 'msg.required.select.paymentMethod');
  if (isBlank(form.expenseCtaCode) || text(form.expenseCtaCode) === '0') set('expenseCtaCode', 'msg.required.input.account');

  const invoiceDate = day(form.invoiceDate);
  const dueDate = day(form.dueDate);
  if (!invoiceDate) set('invoiceDate', 'page.fuelPurchases.error.invoiceDateRequired');
  else if (invoiceDate > today) set('invoiceDate', 'page.fuelPurchases.error.invoiceDateFuture');
  if (!dueDate) set('dueDate', 'page.fuelPurchases.error.dueDateRequired');
  else if (invoiceDate && dueDate < invoiceDate) set('dueDate', 'page.fuelPurchases.error.dueDateBefore');

  FUEL_FIELDS.forEach((field) => {
    if (!isBlank(form[field]) && (!isNumber(form[field]) || Number(form[field]) < 0)) set(field, 'page.fuelPurchases.error.amountInvalid');
  });
  if (!FUEL_FIELDS.some((field) => Number(form[field]) > 0)) set('qtyDiesel', 'msg.required.input.fuel');

  AMOUNT_FIELDS.forEach((field) => {
    if (!isBlank(form[field]) && (!isNumber(form[field]) || Number(form[field]) < 0)) set(field, 'page.fuelPurchases.error.amountInvalid');
  });
  if (!isBlank(form.kilometers) && !isNonNegativeInt(form.kilometers)) set('kilometers', 'page.fuelPurchases.error.integerInvalid');
  if (!isBlank(form.orderNumber) && !isNonNegativeInt(form.orderNumber)) set('orderNumber', 'page.fuelPurchases.error.integerInvalid');

  if (isPositiveInt(form.storeId) && isBlank(form.productCode)) set('productCode', 'page.fuelPurchases.error.productRequired');

  if (!AMOUNT_FIELDS.some((field) => errors[field]) && calculateTotal(form) === 0) set('total', 'msg.required.input.totalInvoice');

  return errors;
};

// { campo: id } -> { campoValid: id } (la forma que consumen los componentes).
export const toFormValidation = (errors = {}) => Object.fromEntries(Object.entries(errors).map(([field, id]) => [`${field}Valid`, id]));

// Cuerpo del POST/PUT. El total, el número de partida, el estado y el correlativo los fija el back.
export const buildPayload = (form = {}, documentCode = '') => ({
  documentCode,
  date: day(form.date),
  orderNumber: form.orderNumber === '' ? 0 : form.orderNumber,
  machineId: form.machineId,
  driverId: form.driverId,
  kilometers: form.kilometers === '' ? 0 : form.kilometers,
  concept: text(form.concept),
  qtyDiesel: form.qtyDiesel === '' ? 0 : form.qtyDiesel,
  qtyGasoline: form.qtyGasoline === '' ? 0 : form.qtyGasoline,
  qtyOil: form.qtyOil === '' ? 0 : form.qtyOil,
  qtyOthers: form.qtyOthers === '' ? 0 : form.qtyOthers,
  providerId: form.providerId,
  storeId: form.storeId || 0,
  productCode: text(form.productCode),
  invoiceNumber: text(form.invoiceNumber),
  invoiceDate: day(form.invoiceDate) || EMPTY_DATE,
  dueDate: day(form.dueDate) || EMPTY_DATE,
  paymentTypeId: form.paymentTypeId,
  expenseCtaCode: text(form.expenseCtaCode),
  subtotal: form.subtotal === '' ? 0 : form.subtotal,
  discount: form.discount === '' ? 0 : form.discount,
  tax: form.tax === '' ? 0 : form.tax,
  notes: form.notes ?? ''
});

const num = (value) => Number(value) || 0;

// Fila que devuelve el back (con driverData, machineData, documentData...) -> estado del formulario.
export const formFromPurchase = (row = {}, documents = []) => {
  const documentCode = row.documentCode ?? row.documentData?.code ?? '';
  const document = documents.find((item) => item.code === documentCode);
  return {
    id: row.id,
    documentTypeId: document ? document.value : 0,
    date: day(row.date),
    orderNumber: num(row.orderNumber),
    machineId: num(row.machineId),
    plate: row.machineData?.code ?? '',
    driverId: num(row.driverId),
    kilometers: num(row.kilometers),
    concept: row.concept ?? '',
    qtyDiesel: num(row.qtyDiesel),
    qtyGasoline: num(row.qtyGasoline),
    qtyOil: num(row.qtyOil),
    qtyOthers: num(row.qtyOthers),
    providerId: num(row.providerId),
    storeId: num(row.storeId),
    productCode: row.productCode ?? '',
    invoiceNumber: row.invoiceNumber ?? '',
    invoiceDate: day(row.invoiceDate),
    dueDate: day(row.dueDate),
    paymentTypeId: num(row.paymentTypeId),
    expenseCtaCode: row.expenseCtaCode ?? '',
    subtotal: num(row.subtotal),
    discount: num(row.discount),
    tax: num(row.tax),
    total: num(row.total),
    pdaNumber: num(row.pdaNumber),
    notes: row.notes ?? ''
  };
};

// Una orden contabilizada (con número de partida) solo admite cambiar las observaciones (SPEC v2-33-sr). El back es quien decide
// (`purchaseGas.locked.processed`); esto solo bloquea los campos en pantalla y evita mandar lo que ya se sabe rechazado.
export const isProcessed = (form = {}) => Number(form.pdaNumber) > 0;

// Cuerpo del guardado: una orden procesada manda solo `notes`; una sin procesar, el documento completo.
export const buildSavePayload = (form = {}, documentCode = '') => (
  isProcessed(form) ? { notes: form.notes ?? '' } : buildPayload(form, documentCode)
);

// SPEC v2-34-sr: la impresión es un GET sin cuerpo a `<ruta>/:id/print` y el back imprime lo GUARDADO. Aquí solo se fijan la ruta
// y el nombre del archivo; el aviso de "guarde primero" lo da `printDocument`.
export const PRINT_PATH = 'inventory/process/purchaseGas';
export const PRINT_FILE_NAME = 'Orden de Combustible.pdf';
export const printOptions = (id) => ({ path: PRINT_PATH, id, fileName: PRINT_FILE_NAME });
