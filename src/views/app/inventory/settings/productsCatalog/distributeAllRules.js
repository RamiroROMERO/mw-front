// "Distribuir Todos" del Catálogo de productos (SPEC v2-09-sr): reglas puras del diálogo. El cálculo de precios y el armado de
// las filas están en priceRules.js (buildBulkRows, chunkRows).
import { chunkRows, BULK_BATCH_SIZE } from './priceRules';

export const PERCENT_FIELDS = ['localMin', 'localMid', 'localMax', 'foranMin', 'foranMid', 'foranMax'];
const MAX_LISTED = 50; // productos omitidos que se listan en el diálogo

const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

export const emptyBulkPercents = () => Object.fromEntries(PERCENT_FIELDS.map((field) => [field, '']));

// Porcentajes sugeridos (los de `productsPercentages/default`) como texto para las casillas: un 0 queda vacío, que en el
// diálogo significa "usar los precios actuales del producto".
export const suggestedPercents = (data) =>
  Object.fromEntries(PERCENT_FIELDS.map((field) => {
    const value = Number(data?.[field]);
    return [field, Number.isFinite(value) && value > 0 ? String(value) : ''];
  }));

// Cada casilla puede quedar vacía; si trae un valor debe ser un número de 0 a menos de 100 (con 100 o más no hay precio).
export const validateBulkPercents = (percents) => {
  const errors = {};
  PERCENT_FIELDS.forEach((field) => {
    const value = percents?.[field];
    if (isBlank(value)) return;
    const number = typeof value === 'boolean' ? NaN : Number(value);
    if (!(Number.isFinite(number) && number >= 0 && number < 100)) errors[field] = 'page.productsCatalog.error.distAll.percent';
  });
  return errors;
};

// Distribuye en lotes (el back acepta hasta 200 por llamada). `post(batch)` devuelve una promesa con la respuesta del back
// ({ data: { created } }). Un lote que falla detiene el proceso: lo ya creado no se deshace y se devuelve el error junto con
// cuántos lotes se completaron, para que el diálogo lo muestre y se pueda repetir (el back rechaza los productos ya
// distribuidos con `distribution.bulk.notPending`, así que repetir con la lista recargada no duplica).
export const runBulkDistribution = async ({ rows, post, batchSize = BULK_BATCH_SIZE, onProgress }) => {
  const batches = chunkRows(rows || [], batchSize);
  let created = 0;

  for (let index = 0; index < batches.length; index += 1) {
    try {
      const response = await post(batches[index]);
      const reported = Number(response?.data?.created);
      created += Number.isFinite(reported) ? reported : batches[index].length;
    } catch (error) {
      return { created, completedBatches: index, totalBatches: batches.length, failed: true, error };
    }
    if (typeof onProgress === 'function') onProgress({ done: index + 1, total: batches.length });
  }
  return { created, completedBatches: batches.length, totalBatches: batches.length, failed: false, error: null };
};

// Productos omitidos para listarlos: los primeros `limit` y cuántos más hay.
export const summarizeSkipped = (skipped, limit = MAX_LISTED) => ({
  listed: (skipped || []).slice(0, limit),
  hidden: Math.max(0, (skipped || []).length - limit)
});
