// Reglas de campos y de cálculo de las Compras de Inventario. Son las mismas que aplica el back (PurchaseDTO y PurchaseDetailDTO
// de modules/inventory/purchases y purchaseDetail): el back es quien decide; esto solo evita una llamada que ya se sabe rechazada
// y muestra los totales mientras se captura. Los casos y números son los de PurchaseDTO.test.js y PurchaseDetailDTO.test.js del
// back. Tabla de campos obligatorios en specs/migration-review/inv_process_purchases_specs_list.md del back.
import { round2, round5 } from '../purchaseOrders/purchaseOrderRules';

export const CASH = 1;
export const CREDIT = 2;
export const MAX_DOCUMENT_CODE = 5;
export const MAX_INVOICE_NUMBER = 40;
export const MAX_CAI = 50;
export const MAX_PRODUCT_CODE = 30;
export const MAX_LOT_CODE = 20;
export const EMPTY_DATE = '1900-01-01';

const toNumber = (value) => (value === '' || value === null || value === undefined ? NaN : Number(value));
const num = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};
const text = (value) => String(value ?? '').trim();
const isFlag = (value) => value === true || value === 1 || value === '1' || value === 'true';
const isPositiveInt = (value) => Number.isInteger(toNumber(value)) && toNumber(value) > 0;

// Fecha local de hoy como texto YYYY-MM-DD (igual que localToday del back; no usa UTC).
export const localToday = (now = new Date()) => {
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};
export const isFutureDate = (value, now = new Date()) => {
  const date = text(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date > localToday(now);
};

// `VAL(SUBSTR(cFactura, LEN(cFactura)-5, LEN(cFactura)))` del legacy: los últimos 6 caracteres leídos como número.
export const lastSixAsNumber = (invoiceNumber) => {
  const tail = text(invoiceNumber).slice(-6);
  const match = tail.match(/^[+-]?(\d+\.?\d*|\.\d+)/);
  return match ? parseFloat(match[0]) : 0;
};

// En Contado el vencimiento es la fecha de la factura (el campo queda deshabilitado); en Crédito se respeta lo digitado.
export const resolveDateOut = ({ typeFp, date, dateOut }) => (Number(typeFp) === CASH ? date : dateOut);

// Facturas complementarias y de combustible usan el mismo modelo, pero no exigen almacén.
const isMainPurchase = (form) => !(isFlag(form.isExpense) || isFlag(form.doctoComb));

// Validación del encabezado. Devuelve { campo: idDeTraducción } solo con los que fallan. El CAI es opcional.
export const validateHeader = (form, now = new Date()) => {
  const errors = {};
  const documentCode = text(form.documentCode);
  if (documentCode === '' || documentCode.length > MAX_DOCUMENT_CODE) errors.documentCode = 'msg.required.select.typeDocument';

  if (text(form.date) === '') errors.date = 'msg.required.input.date';
  else if (isFutureDate(form.date, now)) errors.date = 'msg.purchase.date.future';

  const invoiceNumber = text(form.invoiceNumber);
  if (invoiceNumber === '') errors.invoiceNumber = 'msg.purchase.invoiceNumber.required';
  else if (invoiceNumber.length > MAX_INVOICE_NUMBER || lastSixAsNumber(invoiceNumber) <= 0) {
    errors.invoiceNumber = 'msg.purchase.invoiceNumber.invalid';
  }
  if (text(form.cai).length > MAX_CAI) errors.cai = 'msg.purchase.maxLength';

  if (!isPositiveInt(form.providerId)) errors.providerId = 'msg.required.select.provider';
  if (isMainPurchase(form) && !isPositiveInt(form.storeId)) errors.storeId = 'msg.required.select.storeId';
  if (!isPositiveInt(form.paymentTypeId)) errors.paymentTypeId = 'msg.required.select.paymentType';
  if (![CASH, CREDIT].includes(Number(form.typeFp))) errors.typeFp = 'msg.required.select.typePurchase';

  if (Number(form.typeFp) === CREDIT) {
    const dateOut = text(form.dateOut);
    if (dateOut === '' || dateOut.startsWith(EMPTY_DATE)) errors.dateOut = 'msg.purchase.dateOut.required';
    else if (text(form.date) !== '' && dateOut.slice(0, 10) < text(form.date).slice(0, 10)) {
      errors.dateOut = 'msg.purchase.dateOut.range';
    }
  }
  return errors;
};

// Valores de una línea (legacy `Textbox_hw40/41`, `fncalculateitem`): un producto exonerado va con impuesto cero.
export const calculatePurchaseLine = ({ qty, price, discountPercent, taxPercent, isExonerated }) => {
  const taxPercentApplied = isFlag(isExonerated) ? 0 : num(taxPercent);
  const subTotal = round5(num(qty) * num(price));
  const discount = round5(subTotal * num(discountPercent) / 100);
  const taxValue = round5((subTotal - discount) * taxPercentApplied / 100);
  const total = round5(subTotal - discount + taxValue);
  return { subTotal, discount, taxValue, total, taxPercent: taxPercentApplied };
};

// Validación de la línea que se va a agregar o editar. Devuelve { campo: idDeTraducción } solo con los que fallan.
export const validateLine = (form) => {
  const errors = {};
  const productCode = text(form.productCode);
  if (productCode === '' || productCode.length > MAX_PRODUCT_CODE) errors.productCode = 'msg.required.input.codeProduct';
  const qty = toNumber(form.qty);
  if (!Number.isFinite(qty) || qty <= 0) errors.qty = 'msg.required.input.qty';
  const price = toNumber(form.price);
  if (!Number.isFinite(price) || price <= 0) errors.price = 'msg.required.input.price';
  ['discountPercent', 'taxPercent'].forEach((field) => {
    if (form[field] === undefined || form[field] === null || form[field] === '') return;
    const value = toNumber(form[field]);
    if (!Number.isFinite(value) || value < 0 || value > 100) errors[field] = 'msg.purchase.percent.range';
  });
  if (text(form.lotCode).length > MAX_LOT_CODE) errors.lotCode = 'msg.purchase.maxLength';
  if (isFlag(form.isBonus) && isFlag(form.isExonerated)) errors.isExonerated = 'msg.purchase.line.exclusive';
  return errors;
};

// Totales del encabezado (legacy fnCalculateTotals): las bonificaciones no suman a los importes. Exonerado = líneas sin impuesto
// marcadas exoneradas; exento = sin impuesto y no exoneradas; gravado = con impuesto. Las tres bases van netas de descuento.
export const calculateTotals = (lines, { freight = 0, otherCharges = 0 } = {}) => {
  let subtotal = 0; let discount = 0; let tax = 0; let total = 0; let bonification = 0;
  let exonerated = 0; let exempt = 0; let taxable = 0;
  (lines || []).forEach((line) => {
    if (isFlag(line.isBonus)) { bonification += round2(num(line.total)); return; }
    const lineSubtotal = round2(num(line.subTotal ?? line.subtotal));
    const lineDiscount = round2(num(line.discount));
    const lineTax = round2(num(line.taxValue));
    subtotal += lineSubtotal;
    discount += lineDiscount;
    tax += lineTax;
    total += round2(num(line.total));
    if (lineTax !== 0) taxable += lineSubtotal - lineDiscount;
    else if (isFlag(line.isExonerated)) exonerated += lineSubtotal - lineDiscount;
    else exempt += lineSubtotal - lineDiscount;
  });
  return {
    valueSubtotal: round2(subtotal),
    valueDiscount: round2(discount),
    valueTax: round2(tax),
    valueExonerated: round2(exonerated),
    valueExempt: round2(exempt),
    valueTaxable: round2(taxable),
    bonification: round2(bonification),
    valueTotal: round2(round2(total) + round2(num(freight)) + round2(num(otherCharges)))
  };
};

// Cuerpo del POST/PUT de la compra completa: cabecera y `details` (SPEC v2-22-sr). El back calcula los importes y los totales,
// asigna el correlativo y el N° de factura final y decide `state`, `forma` y `pdaNumber`, así que no se mandan (ni `documentId`).
// El tipo de compra va solo como `typeFp` y en Contado el vencimiento es la fecha de la factura. `documentCode` solo va en el alta.
export const buildPurchasePayload = (form, lines, { isNew = true } = {}) => ({
  ...(isNew ? { documentCode: form.documentCode } : {}),
  date: form.date,
  providerId: form.providerId,
  cai: form.cai,
  invoiceNumber: text(form.invoiceNumber),
  storeId: form.storeId,
  typeFp: Number(form.typeFp),
  dateOut: resolveDateOut(form),
  paymentTypeId: form.paymentTypeId,
  freight: form.freight,
  otherCharges: form.otherCharges,
  purchaseOrderId: form.purchaseOrderId,
  requestedBy: form.requestedBy,
  description: form.description,
  providerType: form.providerType,
  exemptedCertificate: form.exemptedCertificate,
  exemptedNumber: form.exemptedNumber,
  exemptedRecord: form.exemptedRecord,
  importNumberDua: form.importNumberDua,
  importTicket: form.importTicket,
  importCif: form.importCif,
  importDai: form.importDai,
  importSelectiveTax: form.importSelectiveTax,
  details: (lines || []).map(buildDetailLine)
});

// Factor de empaque de la línea (`inv_prod.cantemp`, viene de `getStocks` como `packQty`). Sin factor válido no hay conversión.
export const packFactor = (line) => {
  const factor = Number(line?.packQty);
  return Number.isFinite(factor) && factor > 0 ? factor : 1;
};

// "Cant (ENT)" y "Precio (ENT)" se digitan en la unidad de entrada (empaque); el back recibe unidad base: la cantidad se
// multiplica por el factor y el costo se divide (el subtotal no cambia). La conversión es solo de pantalla y de envío.
export const toBaseUnits = (line) => {
  const factor = packFactor(line);
  return { qty: round5(num(line.qty) * factor), price: round5(num(line.price) / factor) };
};

// Una línea de `details`: solo lo que decide el cliente (cantidad y costo en unidad base, porcentajes y banderas). El back calcula
// `subTotal`, `discount`, `taxValue` y `total`. `orderDetailId` solo se manda en una compra creada desde una orden ("Procesar").
export const buildDetailLine = (line) => ({
  productCode: line.productCode,
  ...toBaseUnits(line),
  discountPercent: num(line.discountPercent),
  taxPercent: num(line.taxPercent),
  isBonus: isFlag(line.isBonus) ? 1 : 0,
  isExonerated: isFlag(line.isExonerated) ? 1 : 0,
  lotCode: line.lotCode || '',
  dateOut: text(line.dateOut) === '' ? EMPTY_DATE : line.dateOut,
  ...(Number(line.orderDetailId) > 0 ? { orderDetailId: Number(line.orderDetailId) } : {})
});

// Lo que decidió el back al guardar (id, correlativo, N° de factura final y totales) pasa al formulario.
export const formFromSaved = (saved) => ({
  id: saved.id,
  documentId: saved.documentId,
  invoiceNumber: saved.invoiceNumber,
  valueSubtotal: saved.subtotal,
  valueDiscount: saved.discount,
  valueExempt: saved.valueExempt,
  valueExonerated: saved.valueExonerated,
  valueTaxable: saved.valueTaxable,
  valueTax: saved.tax,
  freight: saved.freight,
  otherCharges: saved.otherCharges,
  valueTotal: saved.total,
  bonification: saved.bonification
});

// El back agrega el sufijo -1, -2... a un N° de factura repetido del proveedor: hay que avisarlo.
export const invoiceNumberChanged = (typed, saved) => text(typed) !== '' && text(saved) !== '' && text(typed) !== text(saved);

// Línea nueva a partir de una fila del catálogo de productos (modal "Buscar" de Compras: `inventory/settings/products`). El precio de
// compra lo digita el usuario (el legacy solo muestra el costo anterior): la línea arranca con cantidad 1 y precio 0. `packQty` es el
// factor de empaque del producto (`inv_prod.cantemp`). Un producto que no cobra impuesto arranca con 0 %.
export const lineFromProduct = (product) => ({
  idProd: 0,
  productCode: product.code,
  nameProduct: product.name,
  qty: 1,
  price: 0,
  discountPercent: 0,
  taxPercent: isFlag(product.chargesTax) ? num(product.percentTax) : 0,
  isBonus: 0,
  isExonerated: 0,
  lotCode: '',
  dateOut: '',
  nameUM: product.inputUnit || '',
  packQty: packFactor(product),
  previousCost: num(product.costValue),
  currentExistence: 0
});

// "Existencia Actual": la del almacén elegido en el resultado de `products/getStock/:code` ({ applies, rows: [{ storeId, qty }] }).
export const existenceInStore = (stock, storeId) => {
  if (!stock || !stock.applies) return 0;
  const row = (stock.rows || []).find((item) => Number(item.storeId) === Number(storeId));
  return row ? num(row.qty) : 0;
};

// El detalle que devuelve el back usa `subtotal`; la tabla y los cálculos del front usan `subTotal`. Lo guardado ya está en unidad
// base, así que la línea cargada no lleva conversión (`packQty` 1).
export const lineFromServer = (row) => ({
  ...row,
  subTotal: row.subtotal,
  packQty: 1,
  nameProduct: row.productData?.name ?? row.nameProduct ?? '',
  dateOut: text(row.dateOut).startsWith(EMPTY_DATE) ? '' : (row.dateOut || '')
});

// Línea de una orden de compra importada a la compra ("Cargar OC"). Solo se traen la orden y las líneas: el encabezado de la
// compra (fecha, id, totales) no se toca. Si la unidad de la línea es la de empaque del producto (`productData.packId`), la línea
// lleva el factor de la orden (`conversionFactor`) y se convierte a unidad base al guardar, igual que "Cant (ENT)". `orderDetailId`
// es la línea de la orden: lo usa "Procesar" para sumar lo recibido.
export const lineFromOrder = (row, index = 0) => {
  const factor = Number(row.conversionFactor);
  const isPack = Number(row.undId) > 0 && Number(row.undId) === Number(row.productData?.packId) && factor > 0;
  return {
    idTemp: Date.now() + index,
    orderDetailId: row.id,
    productCode: row.productCode,
    nameProduct: row.productData?.name ?? row.nameProduct ?? '',
    qty: num(row.qty),
    price: num(row.price),
    packQty: isPack ? factor : 1,
    subTotal: num(row.subTotal),
    discountPercent: num(row.percentDiscount),
    discount: num(row.discount),
    taxPercent: num(row.percentTax),
    taxValue: num(row.tax),
    total: num(row.total),
    isBonus: 0,
    isExonerated: isFlag(row.isExonerated) ? 1 : 0,
    lotCode: '',
    dateOut: ''
  };
};

// "Procesar" una orden (SPEC v2-22-sr): las líneas con algo recibido ahora (legacy: Cant = CantR, no lo pedido), cada una con su línea
// de la orden (`orderDetailId`) para que el back sume lo recibido a la orden en la misma transacción. El vencimiento queda vacío.
export const processOrderLines = (products) => (products || []).filter((item) => num(item.qtyRec) > 0).map((item) => buildDetailLine({
  productCode: item.productCode,
  qty: item.qtyRec,
  price: item.price,
  discountPercent: item.discountPercent,
  taxPercent: item.taxPercent,
  isBonus: 0,
  isExonerated: item.isExonerated ? 1 : 0,
  lotCode: '',
  dateOut: '',
  orderDetailId: item.id
}));

// Cuerpo de "Procesar": la compra nace cerrada y sin almacén (legacy inv_oc.sc2: Estado Cerrada, Forma 2, Bod 0); el back decide los
// importes, el correlativo, el estado y la forma.
export const buildProcessOrderPayload = (form, products) => ({
  ...buildPurchasePayload({ ...form, storeId: 0 }, processOrderLines(products)),
  fromOrderProcess: true
});

// Lo único que la compra toma de la orden en el encabezado.
export const headerFromOrder = (order) => ({ purchaseOrderId: order.id, requestedBy: order.applicantName || '' });
