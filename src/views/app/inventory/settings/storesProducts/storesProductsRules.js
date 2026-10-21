// Reglas de campos de Almacenes y Productos. Son las mismas que valida el back (ProductStoreDTO y ProductStoreService): el back es
// quien decide, y esto solo evita una llamada que ya se sabe rechazada. Los números y casos son los de
// modules/inventory/productsStore/__tests__/ProductStoreDTO.test.js y ProductStoreService.records.test.js.
//
// Reglas del back que NO se replican porque necesitan la DB: que el almacén sea tipo 1 y esté activo, que el producto exista, que
// la ubicación exista, que el par almacén-producto no esté repetido y que no tenga kardex al eliminar.

export const MAX_PRODUCT_CODE = 20;
export const MAX_QTY = 999999999999.99; // DECIMAL(14,2)
export const DEFAULT_LOCATION_ID = 1; // "Ninguna"

const QTY_FORMAT = /^\d+(\.\d{1,2})?$/;

const isBlank = (value) => value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0 && !isBlank(value);

// Cantidad mínima o máxima: vacío vale 0; si no, un número >= 0 con máximo 2 decimales y no mayor al tope de la columna.
const qtyError = (value) => {
  if (isBlank(value)) return null;
  const text = String(value).trim();
  if (!QTY_FORMAT.test(text)) return 'page.storesProducts.error.qtyFormat';
  if (Number(text) > MAX_QTY) return 'page.storesProducts.error.qtyTooBig';
  return null;
};

// Errores por campo (ids de traducción). Un objeto vacío significa que se puede enviar. En edición el almacén y el producto no
// se cambian (el back responde productStore.immutable), así que no se validan.
export const validateStoreProduct = (form, { isEditing = false } = {}) => {
  const errors = {};

  if (!isEditing) {
    if (!isPositiveInteger(form?.storeId)) errors.storeId = 'msg.required.select.warehouse';

    const productCode = String(form?.productCode ?? '').trim();
    if (!productCode || productCode === '0') errors.productCode = 'msg.required.select.product';
    else if (productCode.length > MAX_PRODUCT_CODE) errors.productCode = 'msg.required.select.product';
  }

  // Ubicación: vacía o 0 equivale a la de por defecto ("Ninguna"); un valor que no sea un entero positivo no es válido.
  if (!isBlank(form?.locationId) && Number(form.locationId) !== 0 && !isPositiveInteger(form.locationId)) {
    errors.locationId = 'msg.required.select.location';
  }

  const minError = qtyError(form?.qtyMin);
  if (minError) errors.qtyMin = minError;
  const maxError = qtyError(form?.qtyMax);
  if (maxError) errors.qtyMax = maxError;

  // Regla nueva respecto al legacy: cuando ambos son mayores que 0, el máximo no puede ser menor que el mínimo.
  if (!minError && !maxError) {
    const min = Number(form?.qtyMin) || 0;
    const max = Number(form?.qtyMax) || 0;
    if (min > 0 && max > 0 && max < min) errors.qtyMax = 'page.storesProducts.error.qtyRange';
  }

  return errors;
};

const toNumberOrZero = (value) => (isBlank(value) ? 0 : Number(value));

// Cuerpo que se envía al back. Nunca lleva `stock` (lo recalcula updateStokManual) ni `id`. Al editar tampoco lleva almacén ni
// producto (son inmutables). La ubicación vacía o 0 se envía como la de por defecto.
export const buildStoreProductPayload = (form, { isEditing = false } = {}) => {
  const locationId = isBlank(form?.locationId) || Number(form.locationId) === 0 ? DEFAULT_LOCATION_ID : Number(form.locationId);
  const payload = {
    locationId,
    qtyMin: toNumberOrZero(form?.qtyMin),
    qtyMax: toNumberOrZero(form?.qtyMax),
    status: form?.status === true || form?.status === 1 || form?.status === '1' ? 1 : 0
  };
  if (!isEditing) {
    payload.storeId = Number(form?.storeId);
    payload.productCode = String(form?.productCode ?? '').trim();
  }
  return payload;
};

// Fila de la tabla (respuesta del back) -> valores del formulario.
export const rowToForm = (row) => ({
  id: row?.id ?? 0,
  storeId: row?.storeId ?? 0,
  productCode: row?.productCode ?? '',
  locationId: row?.locationId ?? DEFAULT_LOCATION_ID,
  stock: row?.stock ?? 0,
  qtyMin: row?.qtyMin ?? 0,
  qtyMax: row?.qtyMax ?? 0,
  status: row?.status === 1 || row?.status === true || row?.status === '1'
});

// Búsqueda con F1 (legacy inv_almac_prod.sc2): si el producto elegido ya está asignado al almacén elegido, se carga esa fila para
// editarla en vez de intentar un alta duplicada. Compara almacén y código exactos (la búsqueda del back es por texto parcial).
export const findExistingAssignment = (rows, storeId, productCode) => {
  const store = Number(storeId);
  const code = String(productCode ?? '').trim();
  if (!Number.isInteger(store) || store <= 0 || code === '') return null;
  return (Array.isArray(rows) ? rows : []).find((row) => Number(row?.storeId) === store && String(row?.productCode ?? '').trim() === code) || null;
};
