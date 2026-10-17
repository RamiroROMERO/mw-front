// Exportar el Catálogo de productos a Excel (SPEC v2-12-sr). El back exporta lo guardado en la DB, no lo que está en el
// formulario; la única decisión del usuario es "Incluir deshabilitados" (desmarcada por defecto = solo habilitados).
export const EXPORT_FILE_NAME = 'Catálogo de Productos.xlsx';
export const EXPORT_URL = 'inventory/settings/products/export';

// Arma la petición para `request.GETPdf(url, params, ...)`. GETPdf agrega `?` + `params` a la URL en un GET, así que el
// booleano va en `params` y no escrito en la URL (con ambos quedaría `...=true?` y el back lo leería como false).
// Solo el booleano true incluye los deshabilitados, igual que el back (que solo acepta el texto exacto 'true').
export const buildExportRequest = (includeDisabled) => ({
  url: EXPORT_URL,
  params: { includeDisabled: includeDisabled === true }
});
