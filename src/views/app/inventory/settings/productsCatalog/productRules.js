// Reglas de campos del Catálogo de Productos. Son las mismas que valida el back (ProductDTO y productRules.js): el back es
// quien decide, y esto solo evita una llamada que ya se sabe rechazada. Los números y casos son los de
// modules/inventory/products/__tests__/ProductDTO.test.js y productRules.test.js del back.
//
// Nombres de la API: `packQty` (cantidad por empaque), `chargesTax` (cobra impuesto), `isDisabled` (casilla "Deshabilitado").

export const MAX_CODE = 20;
export const MAX_NAME = 120;
export const MAX_DESCRIPTION = 120;
export const TAX_PERCENTS = [0, 15, 18];
export const TYPE_SERVICE = 2;

const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
const toNumber = (v) => (isBlank(v) || typeof v === 'boolean' ? NaN : Number(v));
const isPositiveInt = (v) => { const n = toNumber(v); return Number.isInteger(n) && n > 0; };
const isOn = (v) => v === true || v === 1 || v === '1' || v === 'true';

// Errores por campo (ids de traducción). Un objeto vacío significa que se puede enviar.
export const validateProduct = (form) => {
  const errors = {};
  const code = String(form?.code ?? '').trim();
  const name = String(form?.name ?? '').trim();

  if (!code) errors.code = 'msg.required.input.code';
  else if (code.length > MAX_CODE) errors.code = 'page.productsCatalog.error.codeMax';

  if (!name) errors.name = 'msg.required.input.name';
  else if (name.length > MAX_NAME) errors.name = 'page.productsCatalog.error.nameMax';

  if (String(form?.description ?? '').trim().length > MAX_DESCRIPTION) errors.description = 'page.productsCatalog.error.descriptionMax';

  if (!isPositiveInt(form?.typeId)) errors.typeId = 'msg.required.select.classification2';
  if (![1, 2].includes(toNumber(form?.type))) errors.type = 'msg.required.radio.type';
  if (!isPositiveInt(form?.packId)) errors.packId = 'msg.required.select.packaging';
  if (!isPositiveInt(form?.undinId)) errors.undinId = 'msg.required.select.units';
  if (!isPositiveInt(form?.undoutId)) errors.undoutId = 'msg.required.select.units';
  if (!isPositiveInt(form?.tradeId)) errors.tradeId = 'msg.required.select.trademark';

  const packQty = toNumber(form?.packQty);
  if (!(packQty > 0)) errors.packQty = 'page.productsCatalog.error.packQty';

  // Costo: obligatorio salvo en servicios (el legacy: "El Costo de este Producto Esta en Cero").
  const cost = toNumber(form?.costValue);
  if (Number.isNaN(cost) || cost < 0) errors.costValue = 'page.productsCatalog.error.costInvalid';
  else if (toNumber(form?.type) !== TYPE_SERVICE && cost <= 0) errors.costValue = 'msg.required.input.averageCost';

  if (![1, 2, 3].includes(toNumber(form?.typeCalculateCost))) errors.typeCalculateCost = 'msg.required.select.typeCalculatePrice';
  if (![1, 2, 3].includes(toNumber(form?.typeCalculatePrice))) errors.typeCalculatePrice = 'msg.required.select.typeCalculatePrice';

  const percentTax = toNumber(form?.percentTax);
  if (!isBlank(form?.percentTax) && !TAX_PERCENTS.includes(percentTax)) errors.percentTax = 'page.productsCatalog.error.percentTax';
  else if (isOn(form?.chargesTax) && !(percentTax > 0)) errors.percentTax = 'page.productsCatalog.error.percentTax';

  return errors;
};

// Campos que se envían al back. No se mandan los textos denormalizados (tipo, marca, presentación, unidades: el back los rellena
// desde los ids), ni `status` (la casilla "Deshabilitado" es `isDisabled`), ni nada que solo exista en pantalla. El producto
// padre es el propio código en un producto nuevo.
const PAYLOAD_FIELDS = [
  'code', 'name', 'description', 'type', 'chargesTax', 'percentTax', 'typeId', 'undinId', 'undoutId', 'packId', 'tradeId', 'packQty',
  'typeCalculateCost', 'typeCalculatePrice', 'enableForPurchase', 'enableForSale', 'requireExpLot', 'validToSale', 'paymentComiss',
  'priceIncludeTax', 'isDisabled',
  'percentLocalPriceMin', 'valuePercentLocalPriceMin', 'priceLocalMin', 'percentLocalPriceMid', 'valuePercentLocalPriceMid', 'priceLocalMid',
  'percentLocalPriceMax', 'valuePercentLocalPriceMax', 'priceLocalMax', 'percentOutsidePriceMin', 'valuePercentOutsidePriceMin', 'priceOutsideMin',
  'percentOutsidePriceMid', 'valuePercentOutsidePriceMid', 'priceOutsideMid', 'percentOutsidePriceMax', 'valuePercentOutsidePriceMax', 'priceOutsideMax',
  'costValue', 'lastCostValue', 'maxCostValue', 'notes'
];

export const buildProductPayload = (form, { isNew = false } = {}) => {
  const payload = {};
  PAYLOAD_FIELDS.forEach((field) => {
    if (form?.[field] !== undefined) payload[field] = form[field];
  });
  if (typeof payload.code === 'string') payload.code = payload.code.trim();
  if (typeof payload.name === 'string') payload.name = payload.name.trim();
  // INTEGER en la DB: la casilla entrega booleano.
  ['chargesTax', 'isDisabled'].forEach((f) => { if (payload[f] !== undefined) payload[f] = isOn(payload[f]) ? 1 : 0; });
  payload.parentProduct = isNew || isBlank(form?.parentProduct) || form?.parentProduct === 0 ? payload.code : form.parentProduct;
  return payload;
};
