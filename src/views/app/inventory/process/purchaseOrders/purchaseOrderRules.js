// Reglas de campos y de cálculo de las Órdenes de Compra. Son las mismas que aplica el back (PurchaseOrderDTO,
// PurchaseOrderDetailDTO y purchaseOrderRules.js): el back es quien decide y recalcula todo al guardar; esto solo evita una
// llamada que ya se sabe rechazada y muestra los totales mientras se captura. Los números y casos son los de
// modules/inventory/purchaseOrders/__tests__ del back. Tabla de campos obligatorios en
// specs/migration-review/inv_process_purchase_orders_specs_list.md del back.

export const MAX_PRODUCT_CODE = 30;
export const MAX_APPLICANT = 50;
export const MAX_DESCRIPTION_OTHERS = 100;
export const MAX_LINES = 500;
export const EMPTY_DATE = '1900-01-01';

const toNumber = (value) => (value === '' || value === null || value === undefined ? NaN : Number(value));
const num = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};
const text = (value) => String(value ?? '').trim();
const isFlag = (value) => value === true || value === 1 || value === '1' || value === 'true';

// Redondeo con las mitades hacia arriba (en valor absoluto) desplazando el punto sobre el texto del número, para no depender
// de la coma flotante. El legacy redondea a 5 decimales (Round(x, 5)).
export const roundTo = (value, decimals) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  const digits = String(Math.abs(number));
  if (/e/i.test(digits)) return Number(Math.abs(number).toFixed(decimals)) * (number < 0 ? -1 : 1);
  const [intPart, fracPart = ''] = digits.split('.');
  let scaled = BigInt(intPart + fracPart.slice(0, decimals).padEnd(decimals, '0'));
  if (fracPart.length > decimals && fracPart[decimals] >= '5') scaled += 1n;
  const result = Number(scaled) / (10 ** decimals);
  return number < 0 && result !== 0 ? -result : result;
};
export const round5 = (value) => roundTo(value, 5);
export const round2 = (value) => roundTo(value, 2);

// Valores de una línea (legacy fncalculateitem). Un producto exonerado va con impuesto cero.
export const calculateLine = ({ qty, price, percentDiscount, percentTax, isExonerated }) => {
  const percentTaxApplied = isFlag(isExonerated) ? 0 : num(percentTax);
  const subTotal = round5(num(qty) * num(price));
  const discount = round5(subTotal * num(percentDiscount) / 100);
  const tax = round5((subTotal - discount) * percentTaxApplied / 100);
  const total = round5(subTotal - discount + tax);
  return { subTotal, discount, tax, total, percentTax: percentTaxApplied };
};

// Totales del encabezado (legacy fnCalculateTotals): gravado = subtotales con impuesto; exento = sin impuesto y no exonerados;
// exonerado = subtotales de las líneas exoneradas (no se guarda, pero entra al total).
export const calculateTotals = (lines, valueOthers = 0) => {
  let taxed = 0;
  let exempt = 0;
  let exonerated = 0;
  let discount = 0;
  let tax = 0;
  lines.forEach((line) => {
    const subTotal = round5(num(line.subTotal));
    if (isFlag(line.isExonerated)) exonerated += subTotal;
    else if (num(line.tax) !== 0) taxed += subTotal;
    else exempt += subTotal;
    discount += round5(num(line.discount));
    tax += round5(num(line.tax));
  });
  const others = round5(num(valueOthers));
  const total = round5(round5(exempt) + round5(taxed) + round5(exonerated) - round5(discount) + round5(tax) + others);
  return {
    valueExempt: round2(round5(exempt)),
    valueTaxed: round2(round5(taxed)),
    valueExonerated: round2(round5(exonerated)),
    valueDiscount: round2(round5(discount)),
    valueTax: round2(round5(tax)),
    valueOthers: round2(others),
    valueTotal: round2(total)
  };
};

// Recalcula una línea ya cargada (cantidad, precio y porcentajes) y devuelve la línea con los valores nuevos.
export const recalculateLine = (line) => ({ ...line, ...calculateLine(line) });

// Descuento manual a todo el detalle (legacy Inv_OCDescMan): por porcentaje o por valor. Por valor, el porcentaje es
// valor / suma de subtotales x 100. Devuelve { details } o { error } con el id de traducción del motivo.
export const applyManualDiscount = (details, { mode, amount }) => {
  const value = toNumber(amount);
  if (!Number.isFinite(value) || value < 0) return { error: 'msg.purchaseOrder.discount.invalid' };
  const sumSubTotal = details.reduce((sum, line) => sum + num(line.subTotal), 0);
  let percent = value;
  if (mode === 'value') {
    if (sumSubTotal <= 0) return { error: 'msg.purchaseOrder.discount.invalid' };
    percent = (value / sumSubTotal) * 100;
  }
  if (percent > 100) return { error: 'msg.purchaseOrder.discount.invalid' };
  return { details: details.map((line) => recalculateLine({ ...line, percentDiscount: percent })) };
};

// Validación de la línea que se va a agregar (o editar). Devuelve { campo: idDeTraducción } solo con los que fallan.
export const validateLine = (form) => {
  const errors = {};
  if (text(form.productCode) === '') errors.productCode = 'msg.required.input.codeProduct';
  else if (text(form.productCode).length > MAX_PRODUCT_CODE) errors.productCode = 'msg.required.input.codeProduct';
  const undId = toNumber(form.undId);
  if (!Number.isInteger(undId) || undId <= 0) errors.undId = 'msg.required.select.units';
  const qty = toNumber(form.qty);
  if (!Number.isFinite(qty) || qty <= 0) errors.qty = 'msg.required.input.qty';
  const price = toNumber(form.price);
  if (!Number.isFinite(price) || price <= 0) errors.price = 'msg.required.input.price';
  ['percentDiscount', 'percentTax'].forEach((field) => {
    if (form[field] === undefined || form[field] === null || form[field] === '') return;
    const value = toNumber(form[field]);
    if (!Number.isFinite(value) || value < 0 || value > 100) errors[field] = 'msg.purchaseOrder.percent.range';
  });
  return errors;
};

// Validación del documento (encabezado y detalle). `details` es el arreglo de líneas ya agregadas.
export const validateOrder = (form, details) => {
  const errors = {};
  if (text(form.date) === '') errors.date = 'msg.required.input.date';
  const providerId = toNumber(form.providerId);
  if (!Number.isInteger(providerId) || providerId <= 0) errors.providerId = 'msg.required.select.provider';
  const paymentTypeId = toNumber(form.paymentTypeId);
  if (!Number.isInteger(paymentTypeId) || paymentTypeId <= 0) errors.paymentTypeId = 'msg.required.select.paymentType';
  if (form.creditDays !== undefined && form.creditDays !== null && form.creditDays !== '') {
    const days = toNumber(form.creditDays);
    if (!Number.isInteger(days) || days < 0) errors.creditDays = 'msg.purchaseOrder.integer.invalid';
  }
  if (form.valueOthers !== undefined && form.valueOthers !== null && form.valueOthers !== '') {
    const others = toNumber(form.valueOthers);
    if (!Number.isFinite(others) || others < 0) errors.valueOthers = 'msg.purchaseOrder.amount.invalid';
  }
  if (text(form.applicantName).length > MAX_APPLICANT) errors.applicantName = 'msg.purchaseOrder.maxLength';
  if (text(form.descriptionOthers).length > MAX_DESCRIPTION_OTHERS) errors.descriptionOthers = 'msg.purchaseOrder.maxLength';
  if (!Array.isArray(details) || details.length === 0) errors.details = 'msg.required.select.product';
  else if (details.length > MAX_LINES) errors.details = 'msg.purchaseOrder.maxLines';
  else if (details.some((line) => !(num(line.price) > 0))) errors.details = 'msg.purchaseOrder.priceZero';
  return errors;
};

// Cuerpo del POST/PUT: encabezado y líneas SIN totales ni valores calculados (los calcula el back). Sin ids locales.
export const buildOrderPayload = (form, details) => ({
  date: form.date,
  providerId: validIntOrZero(form.providerId),
  paymentTypeId: validIntOrZero(form.paymentTypeId),
  applicantName: text(form.applicantName),
  notes: form.notes ?? '',
  expectedDate: text(form.expectedDate) === '' ? EMPTY_DATE : form.expectedDate,
  creditDays: validIntOrZero(form.creditDays),
  workOrderId: validIntOrZero(form.workOrderId),
  valueOthers: num(form.valueOthers),
  descriptionOthers: text(form.descriptionOthers),
  details: details.map((line) => ({
    productCode: text(line.productCode),
    undId: validIntOrZero(line.undId),
    qty: num(line.qty),
    price: num(line.price),
    percentDiscount: num(line.percentDiscount),
    percentTax: num(line.percentTax),
    isExonerated: isFlag(line.isExonerated) ? 1 : 0,
    conversionFactor: num(line.conversionFactor) > 0 ? num(line.conversionFactor) : 1
  }))
});

function validIntOrZero(value) {
  const number = toNumber(value);
  return Number.isInteger(number) && number > 0 ? number : 0;
}

// La fecha de recepción vacía del back es 1900-01-01: en pantalla se muestra vacía.
export const displayExpectedDate = (value) => (!value || String(value).startsWith(EMPTY_DATE) ? '' : value);

// Línea cargada del back (GET purchaseOrderDetail) lista para el grid: agrega el nombre y la marca del producto y deja
// en 0 lo que se va a recibir ahora.
export const lineFromServer = (row) => ({
  ...row,
  nameProduct: row.productData?.name ?? '',
  marca: row.productData?.tradeMark ?? '',
  qtyRec: 0,
  isExonerated: Number(row.isExonerated) === 1
});
