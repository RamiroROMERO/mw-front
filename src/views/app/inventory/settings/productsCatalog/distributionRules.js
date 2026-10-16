// Reglas del modal de Distribución del Catálogo de productos (SPEC v2-09-sr). Son las mismas que valida el back
// (ProductDistributionDTO): el back es quien decide, y esto solo evita una llamada que ya se sabe rechazada. Mismos casos que
// modules/inventory/productsDistributions/__tests__/ProductDistributionDTO.test.js del back.
//
// Nombres de la API: `undoutId` (unidad de salida), `undOutName` (su nombre), `valChange` (cantidad base), `localMin/Med/MaxPrice`,
// `localOtherPrice`, `foranMin/Med/Max/OtherPrice`, `isDefault` y `status` (0/1).

const REQUIRED_PRICES = ['localMinPrice', 'localMedPrice', 'localMaxPrice'];
const OPTIONAL_PRICES = ['localOtherPrice', 'foranMinPrice', 'foranMedPrice', 'foranMaxPrice', 'foranOtherPrice'];
const ALL_PRICES = [...REQUIRED_PRICES, ...OPTIONAL_PRICES];

const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
const toNumber = (v) => (isBlank(v) || typeof v === 'boolean' ? NaN : Number(v));
const toAmount = (v) => (Number.isFinite(toNumber(v)) ? toNumber(v) : 0);

export const isDefaultRow = (row) => row?.isDefault === true || Number(row?.isDefault) === 1;

// La default no se elimina ni se desactiva.
export const canDeleteDistribution = (row) => !isDefaultRow(row);

export const emptyDistributionForm = () => ({
  id: 0,
  undoutId: 0,
  valChange: 1,
  localMinPrice: 0,
  localMedPrice: 0,
  localMaxPrice: 0,
  localOtherPrice: 0,
  foranMinPrice: 0,
  foranMedPrice: 0,
  foranMaxPrice: 0,
  foranOtherPrice: 0,
  isDefault: false,
  status: true
});

// Fila de la API -> formulario (status e isDefault llegan como 0/1).
export const mapDistributionToForm = (row) => ({
  ...emptyDistributionForm(),
  id: row.id,
  undoutId: row.undoutId,
  valChange: row.valChange,
  ...Object.fromEntries(ALL_PRICES.map((field) => [field, row[field] ?? 0])),
  isDefault: isDefaultRow(row),
  status: row.status === true || Number(row.status) === 1
});

// Errores por campo (ids de traducción). Un objeto vacío significa que se puede enviar. Los tres precios locales se exigen
// también al editar, como el legacy.
export const validateDistribution = (form) => {
  const errors = {};
  const unit = toNumber(form?.undoutId);
  if (!(Number.isInteger(unit) && unit > 0)) errors.undoutId = 'page.productsCatalog.error.dist.undoutId';
  if (!(toNumber(form?.valChange) > 0)) errors.valChange = 'page.productsCatalog.error.dist.valChange';
  REQUIRED_PRICES.forEach((field) => {
    if (!(toNumber(form?.[field]) > 0)) errors[field] = 'page.productsCatalog.error.dist.price';
  });
  OPTIONAL_PRICES.forEach((field) => {
    const value = form?.[field];
    if (isBlank(value)) return;
    if (!(toNumber(value) >= 0)) errors[field] = 'page.productsCatalog.error.dist.priceInvalid';
  });
  return errors;
};

// Cuerpo de POST / PUT. Los precios opcionales vacíos van en 0. La default siempre queda activa. `isDefault` no se envía (lo
// decide el back).
export const buildDistributionPayload = (form, productCode) => ({
  productCode: String(productCode ?? '').trim(),
  undoutId: Number(form.undoutId),
  valChange: toAmount(form.valChange),
  ...Object.fromEntries(ALL_PRICES.map((field) => [field, toAmount(form[field])])),
  status: isDefaultRow(form) || form.status === true || Number(form.status) === 1 ? 1 : 0
});

// "Calcular Precios": solo se reemplazan los precios que salieron mayores a 0 (los de una casilla sin porcentaje se conservan).
export const pickCalculatedPrices = (calculated) =>
  Object.fromEntries(Object.entries(calculated || {}).filter(([, price]) => Number(price) > 0));
