// Cálculo de precios del Catálogo de productos (SPEC v2-09-sr). Funciones puras: el cálculo vive solo en el front.
// Fórmula del legacy (fnCalculatePrice): precio = costo / (1 - margen/100), más el impuesto si el precio lo incluye.

export const BULK_BATCH_SIZE = 200; // máximo de filas por llamada a productsDistributions/bulkDefault

const toNumber = (value) => {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

// Desplaza el exponente decimal sobre el texto del número (sirve también para la notación exponencial).
const shift = (value, places) => {
  const [mantissa, exponent = '0'] = String(value).split('e');
  return Number(`${mantissa}e${Number(exponent) + places}`);
};

// Redondeo a 2 decimales con las mitades hacia arriba, desplazando el exponente sobre el texto del número (sin toFixed ni
// Math.round(x * 100), que fallan con 1.005 o 10.475).
export const round2 = (value) => shift(Math.round(shift(toNumber(value), 2)), -2);

// Con costo o margen <= 0 (o un margen de 100 o más, que no tiene precio) el precio es 0.
export const calculatePrice = (cost, marginPercent, taxPercent, includeTax) => {
  const base = toNumber(cost);
  const margin = toNumber(marginPercent);
  if (base <= 0 || margin <= 0 || margin >= 100) return 0;

  let price = base / (1 - margin / 100);
  const tax = toNumber(taxPercent);
  if (includeTax && tax > 0) price += price * (tax / 100);
  return round2(price);
};

// Costo base según el tipo de cálculo de costo del producto: 1 promedio, 2 último, 3 máximo (otro valor: promedio).
export const costByType = (product, typeCalculateCost = product?.typeCalculateCost) => {
  switch (Number(typeCalculateCost)) {
    case 2: return toNumber(product?.lastCostValue);
    case 3: return toNumber(product?.maxCostValue);
    default: return toNumber(product?.costValue);
  }
};

const isIncludeTax = (value) => value === true || Number(value) === 1;

// Precios de una distribución: costo (según el tipo de costo) x factor de cambio, cada uno de los seis precios con su propio
// porcentaje del producto (los foráneos 2 y 3 no repiten el cuarto, como hacía el legacy por error).
export const calculateDistributionPrices = (product, valChange) => {
  const factor = toNumber(valChange);
  const cost = factor > 0 ? costByType(product) * factor : 0;
  const tax = toNumber(product?.percentTax);
  const includeTax = isIncludeTax(product?.priceIncludeTax);
  const price = (percent) => calculatePrice(cost, percent, tax, includeTax);

  return {
    localMinPrice: price(product?.percentLocalPriceMin),
    localMedPrice: price(product?.percentLocalPriceMid),
    localMaxPrice: price(product?.percentLocalPriceMax),
    foranMinPrice: price(product?.percentOutsidePriceMin),
    foranMedPrice: price(product?.percentOutsidePriceMid),
    foranMaxPrice: price(product?.percentOutsidePriceMax)
  };
};

// Las seis casillas del diálogo de "Distribuir Todos" y el precio actual que cada una reemplaza si queda vacía.
const BULK_SLOTS = [
  { percent: 'localMin', price: 'localMinPrice', current: 'priceLocalMin' },
  { percent: 'localMid', price: 'localMedPrice', current: 'priceLocalMid' },
  { percent: 'localMax', price: 'localMaxPrice', current: 'priceLocalMax' },
  { percent: 'foranMin', price: 'foranMinPrice', current: 'priceOutsideMin' },
  { percent: 'foranMid', price: 'foranMedPrice', current: 'priceOutsideMid' },
  { percent: 'foranMax', price: 'foranMaxPrice', current: 'priceOutsideMax' }
];

// Filas para `bulkDefault` a partir de los productos pendientes. Con un porcentaje (> 0) el precio se calcula con el costo del
// producto (factor 1, la distribución por defecto); con la casilla vacía o en 0 se conserva el precio actual del producto, como
// el legacy. Los productos que quedan con algún precio local <= 0, o sin unidad de salida, se omiten y se devuelven en `skipped`
// (reason 'price' o 'unit') para que el diálogo los liste.
export const buildBulkRows = (products, percents = {}) => {
  const rows = [];
  const skipped = [];

  (products || []).forEach((product) => {
    const cost = costByType(product);
    const tax = toNumber(product.percentTax);
    const includeTax = isIncludeTax(product.priceIncludeTax);

    const prices = {};
    BULK_SLOTS.forEach(({ percent, price, current }) => {
      const margin = toNumber(percents[percent]);
      prices[price] = margin > 0 ? calculatePrice(cost, margin, tax, includeTax) : toNumber(product[current]);
    });

    if (!(Number(product.undoutId) > 0)) {
      skipped.push({ code: product.code, name: product.name, reason: 'unit' });
      return;
    }
    if (prices.localMinPrice <= 0 || prices.localMedPrice <= 0 || prices.localMaxPrice <= 0) {
      skipped.push({ code: product.code, name: product.name, reason: 'price' });
      return;
    }

    rows.push({
      productCode: product.code,
      undoutId: Number(product.undoutId),
      ...prices,
      localOtherPrice: toNumber(product.priceLocalOther),
      foranOtherPrice: toNumber(product.priceOutsideOther)
    });
  });

  return { rows, skipped };
};

// Parte una lista en lotes del tamaño máximo que acepta el back.
export const chunkRows = (rows, size = BULK_BATCH_SIZE) => {
  const batches = [];
  for (let index = 0; index < rows.length; index += size) batches.push(rows.slice(index, index + size));
  return batches;
};

// ---------------------------------------------------------------------------------------------------------------------
// Pestaña Precios del formulario (SPEC v2-09-sr): por cada casilla de porcentaje se calcula el valor (precio sin impuesto) y el
// total (con impuesto si "incluye ISV"). Solo se calculan las casillas con porcentaje mayor a 0: las demás conservan lo que tengan.
// ---------------------------------------------------------------------------------------------------------------------

export const PRICE_SLOTS = [
  { percent: 'percentLocalPriceMin', value: 'valuePercentLocalPriceMin', price: 'priceLocalMin' },
  { percent: 'percentLocalPriceMid', value: 'valuePercentLocalPriceMid', price: 'priceLocalMid' },
  { percent: 'percentLocalPriceMax', value: 'valuePercentLocalPriceMax', price: 'priceLocalMax' },
  { percent: 'percentOutsidePriceMin', value: 'valuePercentOutsidePriceMin', price: 'priceOutsideMin' },
  { percent: 'percentOutsidePriceMid', value: 'valuePercentOutsidePriceMid', price: 'priceOutsideMid' },
  { percent: 'percentOutsidePriceMax', value: 'valuePercentOutsidePriceMax', price: 'priceOutsideMax' }
];

// Valor y total de una casilla con el estado actual del formulario (costo según el tipo de cálculo, impuesto e "incluye ISV").
const calculateSlot = (form, slot) => {
  const cost = costByType(form);
  const margin = toNumber(form[slot.percent]);
  const tax = toNumber(form.percentTax);
  return {
    [slot.value]: calculatePrice(cost, margin, 0, false),
    [slot.price]: calculatePrice(cost, margin, tax, isIncludeTax(form.priceIncludeTax))
  };
};

// Al salir de una casilla de porcentaje: valor y total de esa casilla. Con porcentaje en 0 no cambia nada.
export const recalculatePrice = (form, percentField) => {
  const slot = PRICE_SLOTS.find((item) => item.percent === percentField);
  if (!slot || toNumber(form?.[percentField]) <= 0) return {};
  return calculateSlot(form, slot);
};

// Al cambiar el costo, el tipo de costo, el impuesto o "incluye ISV": todas las casillas con porcentaje mayor a 0.
export const recalculateAllPrices = (form) =>
  PRICE_SLOTS.reduce((patch, slot) => (toNumber(form?.[slot.percent]) > 0 ? { ...patch, ...calculateSlot(form, slot) } : patch), {});

// Valor del impuesto sobre el costo promedio (campo informativo "Valor del impuesto").
export const calculateTaxValue = (form) => round2((toNumber(form?.percentTax) / 100) * toNumber(form?.costValue));

// Respuesta de `productsPercentages/default` -> campos del formulario (ceros si falta algo).
export const defaultPercentsPatch = (data) => ({
  percentLocalPriceMin: toNumber(data?.localMin),
  percentLocalPriceMid: toNumber(data?.localMid),
  percentLocalPriceMax: toNumber(data?.localMax),
  percentOutsidePriceMin: toNumber(data?.foranMin),
  percentOutsidePriceMid: toNumber(data?.foranMid),
  percentOutsidePriceMax: toNumber(data?.foranMax)
});
