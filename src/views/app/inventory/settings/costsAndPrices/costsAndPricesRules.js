// Reglas de la pantalla Costos y Precios. Son las mismas que valida el back (CostsAndPricesRowsDTO y CostsAndPricesService.save):
// el back es quien decide, y esto solo evita llamadas que ya se sabe que serán rechazadas. Mismos casos que
// CostsAndPricesRowsDTO.test.js y CostsAndPricesService.test.js del back.
//
// Nombres de la API: cada fila trae campos del producto (se repiten en las filas de sus distribuciones) y de su distribución.
// El tipo del producto: 1 = Producto, 2 = Servicio (solo un servicio puede tener el costo en 0).

export const MAX_ROWS = 1000;
export const MAX_NAME = 120;
export const MAX_DESCRIPTION = 120;
export const TAX_PERCENTS = [0, 15, 18];
export const TYPE_SERVICE = 2;
// Tope de cada columna decimal(p,s); los literales con muchos decimales se escriben como texto porque el número pierde precisión.
export const LIMITS = {
  costValue: Number('99999999999.99999'), // decimal(17,5)
  submConversion: Number('999999999.99999'), // decimal(14,5)
  valChange: Number('9999999.99999'), // decimal(12,5)
  localPrice: 9999999999.99, // decimal(12,2)
  foranPrice: 999999.99 // decimal(8,2)
};

// Privilegio "Editar Costos Promedio" (usu_accniv): `active` en `mw_current_userModules`. El back vuelve a exigirlo.
export const COSTS_PRIVILEGE_CODE = '11.01.003';
export const hasCostsPrivilege = (privilege) => Boolean(privilege && privilege.active);

// Campos del producto (se repiten en cada fila de sus distribuciones: al editar uno se copia a las demás filas del mismo producto).
export const PRODUCT_FIELDS = ['name', 'description', 'typeId', 'tradeId', 'packId', 'submConversion', 'undinId', 'paymentTax', 'percentTax', 'costValue'];
const ID_FIELDS = ['typeId', 'tradeId', 'packId', 'undinId'];
const LOCAL_PRICES = ['localMinPrice', 'localMedPrice', 'localMaxPrice'];
const FORAN_PRICES = ['foranMinPrice', 'foranMedPrice', 'foranMaxPrice'];

// Etiqueta (id de traducción) de la columna de cada campo, para decir cuál falló.
export const FIELD_LABELS = {
  name: 'page.costsAndPrices.table.name',
  description: 'page.costsAndPrices.table.description',
  typeId: 'page.costsAndPrices.table.classification',
  tradeId: 'page.costsAndPrices.table.trademark',
  packId: 'page.costsAndPrices.table.packaging',
  submConversion: 'page.costsAndPrices.table.submConversion',
  undinId: 'page.costsAndPrices.table.inputUnit',
  percentTax: 'page.costsAndPrices.table.taxPercent',
  costValue: 'page.costsAndPrices.table.cost',
  valChange: 'page.costsAndPrices.table.valChange',
  localMinPrice: 'page.costsAndPrices.table.price1',
  localMedPrice: 'page.costsAndPrices.table.price2',
  localMaxPrice: 'page.costsAndPrices.table.price3',
  foranMinPrice: 'page.costsAndPrices.table.price1Foran',
  foranMedPrice: 'page.costsAndPrices.table.price2Foran',
  foranMaxPrice: 'page.costsAndPrices.table.price3Foran'
};

const E = {
  required: 'page.costsAndPrices.error.required',
  number: 'page.costsAndPrices.error.number',
  positive: 'page.costsAndPrices.error.positive',
  negative: 'page.costsAndPrices.error.negative',
  max: 'page.costsAndPrices.error.max',
  length: 'page.costsAndPrices.error.length',
  taxPercent: 'page.costsAndPrices.error.taxPercent',
  taxRequired: 'page.costsAndPrices.error.taxRequired',
  costZero: 'page.costsAndPrices.error.costZero',
  costForbidden: 'page.costsAndPrices.error.costForbidden'
};

const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
const toNumber = (v) => (isBlank(v) || typeof v === 'boolean' ? NaN : Number(v));
const isOn = (v) => v === true || v === 1 || v === '1' || v === 'true';
const round5 = (v) => Math.round(Number(v) * 1e5) / 1e5;

export const isService = (type) => Number(type) === TYPE_SERVICE;

// ¿La fila cambió el costo respecto del que se cargó? Comparación a 5 decimales, como la del back.
export const hasCostChanged = (row, originalCost) => {
  const value = toNumber(row?.costValue);
  const original = toNumber(originalCost);
  if (!Number.isFinite(value)) return !isBlank(row?.costValue) || Number.isFinite(original);
  return !Number.isFinite(original) || round5(value) !== round5(original);
};

// Devuelve { campo: idDeTraducción } con el primer error de cada campo; vacío si la fila es válida.
// `context.originalCost`: el costo con que se cargó la fila. `context.canEditCosts`: tiene el privilegio 11.01.003.
export const validateRow = (row, { originalCost, canEditCosts = false } = {}) => {
  const errors = {};
  const set = (field, id) => { if (!errors[field]) errors[field] = id; };
  const number = (field, { min = 0, exclusive = false, max, required = true } = {}) => {
    const raw = row?.[field];
    if (isBlank(raw)) { if (required) set(field, E.required); return; }
    const n = toNumber(raw);
    if (!Number.isFinite(n)) return set(field, E.number);
    if (exclusive ? n <= min : n < min) return set(field, exclusive ? E.positive : E.negative);
    if (max !== undefined && n > max) set(field, E.max);
  };

  if (isBlank(row?.name)) set('name', E.required);
  else if (String(row.name).trim().length > MAX_NAME) set('name', E.length);
  if (!isBlank(row?.description) && String(row.description).trim().length > MAX_DESCRIPTION) set('description', E.length);

  ID_FIELDS.forEach((field) => {
    const n = toNumber(row?.[field]);
    if (!Number.isInteger(n) || n <= 0) set(field, E.required);
  });

  number('submConversion', { exclusive: true, max: LIMITS.submConversion });
  const percent = toNumber(row?.percentTax);
  if (!Number.isFinite(percent) || !TAX_PERCENTS.includes(percent)) set('percentTax', E.taxPercent);
  else if (isOn(row?.paymentTax) && percent <= 0) set('percentTax', E.taxRequired);

  number('costValue', { max: LIMITS.costValue });
  if (!errors.costValue && hasCostChanged(row, originalCost)) {
    if (!isService(row?.productType) && !(toNumber(row.costValue) > 0)) set('costValue', E.costZero);
    else if (!canEditCosts) set('costValue', E.costForbidden);
  }

  number('valChange', { exclusive: true, max: LIMITS.valChange });
  LOCAL_PRICES.forEach((field) => number(field, { exclusive: true, max: LIMITS.localPrice }));
  FORAN_PRICES.forEach((field) => number(field, { max: LIMITS.foranPrice, required: false }));
  return errors;
};

// Valida las filas editadas. Devuelve { rowErrors: { rowKey: { campo: id } }, tooMany }.
// `originalCosts` es un objeto rowKey -> costo cargado.
export const validateRows = (rows, { originalCosts = {}, canEditCosts = false } = {}) => {
  const rowErrors = {};
  rows.forEach((row) => {
    const errors = validateRow(row, { originalCost: originalCosts[row.rowKey], canEditCosts });
    if (Object.keys(errors).length) rowErrors[row.rowKey] = errors;
  });
  return { rowErrors, tooMany: rows.length > MAX_ROWS };
};

// El primer problema, para el aviso: { rowKey, code, field, id } o null.
export const firstProblem = (rows, rowErrors) => {
  for (const row of rows) {
    const errors = rowErrors[row.rowKey];
    if (errors) {
      const field = Object.keys(errors)[0];
      return { rowKey: row.rowKey, code: row.code, field, id: errors[field] };
    }
  }
  return null;
};

// Cambia un campo de una fila. Un campo del producto se copia a las demás filas del mismo producto (cada fila repite los suyos y el
// back rechaza un guardado donde difieran). Todas las filas tocadas quedan `edited`.
export const applyRowChange = (rows, rowKey, field, value) => {
  const target = rows.find((row) => row.rowKey === rowKey);
  if (!target) return rows;
  const shared = PRODUCT_FIELDS.includes(field);
  return rows.map((row) => {
    if (row.rowKey === rowKey || (shared && row.productId === target.productId)) return { ...row, [field]: value, edited: true };
    return row;
  });
};

// Filas que se envían: solo las editadas. Números como número; precios foráneos vacíos como 0.
export const buildSavePayload = (rows) => rows.filter((row) => row.edited).map((row) => ({
  productId: row.productId,
  distId: row.distId,
  code: row.code,
  name: String(row.name ?? '').trim(),
  description: String(row.description ?? '').trim(),
  typeId: Number(row.typeId),
  tradeId: Number(row.tradeId),
  packId: Number(row.packId),
  submConversion: Number(row.submConversion),
  undinId: Number(row.undinId),
  paymentTax: isOn(row.paymentTax),
  percentTax: Number(row.percentTax),
  costValue: Number(row.costValue),
  undoutId: row.undoutId,
  valChange: Number(row.valChange),
  localMinPrice: Number(row.localMinPrice),
  localMedPrice: Number(row.localMedPrice),
  localMaxPrice: Number(row.localMaxPrice),
  foranMinPrice: isBlank(row.foranMinPrice) ? 0 : Number(row.foranMinPrice),
  foranMedPrice: isBlank(row.foranMedPrice) ? 0 : Number(row.foranMedPrice),
  foranMaxPrice: isBlank(row.foranMaxPrice) ? 0 : Number(row.foranMaxPrice)
}));

// Costos de partida de las filas cargadas: rowKey -> costo.
export const mapOriginalCosts = (rows) => Object.fromEntries(rows.map((row) => [row.rowKey, row.costValue]));
