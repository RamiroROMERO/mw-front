// Detalle de Kardex de Existencias (Inventario > Proceso > Existencias). El back calcula todo (saldo inicial, existencia corrida y
// totales) en GET inventory/process/stocks/kardex; aquí solo se valida el filtro (mismas reglas y casos que
// modules/inventory/stocks/kardexRules.js del back, que es quien decide) y se normaliza la respuesta.

export const KARDEX_PATH = 'inventory/process/stocks/kardex';

// Texto `YYYY-MM-DD` con la fecha local de hoy (el legacy arranca con hoy en las dos fechas).
export const todayText = (now = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const INITIAL_FILTER = Object.freeze({ storeId: 0, productCode: '', dateStart: '', dateEnd: '' });

// `YYYY-MM-DD` con un día que existe en ese mes (2026-02-30 no).
export const isValidCalendarDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ''));
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
};

// Errores por campo (ids de traducción). Un objeto vacío significa que se puede consultar.
export const validateKardexFilter = (form) => {
  const errors = {};
  const storeId = Number(form?.storeId);
  if (!Number.isInteger(storeId) || storeId <= 0) errors.storeId = 'msg.required.select.storeId';

  const productCode = String(form?.productCode ?? '').trim();
  if (productCode === '' || productCode === '0') errors.productCode = 'msg.required.select.product';

  if (!isValidCalendarDate(form?.dateStart)) errors.dateStart = 'msg.required.select.dateStart';
  if (!isValidCalendarDate(form?.dateEnd)) errors.dateEnd = 'msg.required.select.dateEnd';
  if (!errors.dateStart && !errors.dateEnd && form.dateStart > form.dateEnd) errors.dateEnd = 'msg.required.input.range';
  return errors;
};

// Parámetros de la consulta (el back vuelve a validar todo).
export const buildKardexParams = (form) => ({
  storeId: Number(form.storeId),
  productCode: String(form.productCode).trim(),
  dateStart: form.dateStart,
  dateEnd: form.dateEnd
});

// Costo vigente del producto según su tipo de costo (inv_prod.tipoc): 1 costo promedio (`costo`), 2 costo máximo (`costom`), otro última compra (`ultcosto`).
// Es el mismo con que el back valora el saldo inicial y el total.
export const currentCost = (product) => {
  const type = Number(product?.costType);
  if (type === 1) return Number(product.cost) || 0;
  if (type === 2) return Number(product.maxCost) || 0;
  return Number(product?.lastCost) || 0;
};

export const EMPTY_KARDEX = Object.freeze({
  product: null,
  rows: [],
  totals: { qtyIn: 0, qtyOut: 0, stock: 0, value: 0, maxCost: 0, minCost: 0 }
});

const num = (value) => Number(value) || 0;

// Respuesta ausente o rota: detalle vacío. Todo número llega ya redondeado del back.
export const normalizeKardex = (data) => {
  if (!data || typeof data !== 'object') return { ...EMPTY_KARDEX, rows: [] };
  const totals = data.totals || {};
  return {
    product: data.product || null,
    rows: Array.isArray(data.rows) ? data.rows : [],
    totals: {
      qtyIn: num(totals.qtyIn),
      qtyOut: num(totals.qtyOut),
      stock: num(totals.stock),
      value: num(totals.value),
      maxCost: num(totals.maxCost),
      minCost: num(totals.minCost)
    }
  };
};

// Texto de una cantidad: 2 decimales y hasta 5 si el saldo los tiene (el kardex guarda 5).
export const formatQty = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0.00';
  const text = String(Math.round(n * 1e5) / 1e5);
  const decimals = text.includes('.') ? text.split('.')[1].length : 0;
  return n.toFixed(Math.min(5, Math.max(2, decimals)));
};

// Documento mostrado: código y número (p. ej. "FAC 1234"); sin código solo el número, y sin ninguno de los dos queda vacío.
export const documentLabel = (row) => {
  const code = String(row?.documentCode ?? '').trim();
  const number = Number(row?.documentId) > 0 ? String(row.documentId) : '';
  return [code, number].filter(Boolean).join(' ');
};

// Campos del panel de totales (texto ya formateado), con los mismos datos que el legacy: costo máximo y mínimo de los movimientos del
// rango, costo promedio (`costo`) y última compra (`ultcosto`) de la ficha, y el valor = costo vigente x existencia.
export const buildSummary = (kardex) => {
  const { product, totals } = normalizeKardex(kardex);
  return {
    maximumCost: formatQty(totals.maxCost),
    minimumCost: formatQty(totals.minCost),
    averageCost: formatQty(product ? product.cost : 0),
    lastPurchaseCost: formatQty(product ? product.lastCost : 0),
    currentExistence: formatQty(totals.stock),
    totalInputs: formatQty(totals.qtyIn),
    totalOutputs: formatQty(totals.qtyOut),
    totalValue: Number(totals.value).toFixed(2)
  };
};
