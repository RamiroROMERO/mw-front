// Modal "Agregar producto a los siguientes almacenes" (SPEC v2-08-sr; inv_prod_sele_store_add del legacy).
// `selected` es un objeto { [storeId]: boolean } con las casillas del modal.

export const toggleStore = (selected, storeId, checked) => ({ ...selected, [storeId]: !!checked });

// Los ids marcados, como enteros positivos y sin repetir, en el orden de las casillas.
export const buildStoreIds = (selected = {}) => {
  const ids = Object.keys(selected)
    .filter((key) => selected[key])
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
  return [...new Set(ids)];
};

// Cancelar, cerrar o aceptar sin marcar ninguno no llama al back (como el legacy).
export const shouldAssignStores = (productCode, storeIds) => String(productCode ?? '').trim() !== '' && Array.isArray(storeIds) && storeIds.length > 0;
