// Páginas y búsqueda en el servidor del Catálogo de productos (SPEC v2-18-sr). Reglas puras: sin red ni React.
// El back acota `limit` a 500; aquí se piden páginas de 50 para los combos y el modal Buscar, y de 500 para "Distribuir Todos".

export const COMBO_PAGE_SIZE = 50;
export const SEARCH_PAGE_SIZE = 50;
export const PENDING_PAGE_SIZE = 500;
export const SEARCH_DEBOUNCE_MS = 300;

const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

// Parámetros de GET products/getSL para un combo con búsqueda en el servidor. Sin texto no se manda `search`.
export const buildComboParams = (text, limit = COMBO_PAGE_SIZE) => {
  const params = { limit };
  const search = isBlank(text) ? '' : String(text).trim();
  if (search) params.search = search;
  return params;
};

// Opciones del combo a partir de las filas de getSL.
export const toProductOptions = (rows) => (rows || []).map((item) => ({ value: item.code, label: `${item.code} - ${item.name}` }));

// react-select avisa de cada cambio del texto del input con una `action`; solo `input-change` es una búsqueda del usuario
// (`input-blur`, `menu-close` y `set-value` limpian el texto y no deben pedir nada).
export const isUserSearch = (meta) => meta?.action === 'input-change';

// El valor elegido tiene que seguir apareciendo en el combo aunque la búsqueda actual no lo traiga (si no, el combo se
// ve vacío). Busca su etiqueta en las filas ya conocidas (por ejemplo los componentes cargados) y, si no, usa el código.
export const withSelectedOption = (options, selectedCode, knownLabels = []) => {
  const list = options || [];
  if (isBlank(selectedCode) || String(selectedCode) === '0') return list;
  if (list.some((option) => option.value === selectedCode)) return list;
  const known = (knownLabels || []).find((item) => item.value === selectedCode);
  return [{ value: selectedCode, label: known ? known.label : String(selectedCode) }, ...list];
};

// ¿Una respuesta vieja puede aplicarse? Solo la de la última solicitud (la búsqueda sigue cambiando mientras el usuario escribe).
export const isLatestRequest = (requestId, latestId) => requestId === latestId;

// Modal Buscar: parámetros de la página `pageIndex` (0 = primera) con el texto de búsqueda.
export const buildSearchPageParams = (text, pageIndex = 0, pageSize = SEARCH_PAGE_SIZE) => {
  const params = { limit: pageSize, offset: Math.max(0, pageIndex) * pageSize };
  const search = isBlank(text) ? '' : String(text).trim();
  if (search) params.search = search;
  return params;
};

// Rango mostrado ("1-50 de 321") y si hay página anterior o siguiente, con la paginación que devuelve el back
// ({ totalRecords, limit, offset }).
export const describePage = (pagination, rowsShown) => {
  const total = Number(pagination?.totalRecords) || 0;
  const offset = Number(pagination?.offset) || 0;
  const limit = Number(pagination?.limit) || SEARCH_PAGE_SIZE;
  const shown = Number.isFinite(Number(rowsShown)) ? Number(rowsShown) : 0;
  return {
    from: shown === 0 ? 0 : offset + 1,
    to: offset + shown,
    total,
    hasPrev: offset > 0,
    hasNext: offset + limit < total
  };
};

// "Distribuir Todos": lee todas las páginas de pendingProducts (por llave, hasta que `nextAfterId` sea null) y las junta.
// `fetchPage(afterId)` devuelve { rows, total, nextAfterId }. El total es el del servidor en la primera página. Un fallo
// en cualquier página se propaga (no se distribuye con una lista a medias).
export const loadAllPending = async (fetchPage, { maxPages = 1000 } = {}) => {
  const rows = [];
  let afterId = 0;
  let total = 0;
  for (let page = 0; page < maxPages; page += 1) {
    const result = await fetchPage(afterId);
    if (page === 0) total = Number(result?.total) || 0;
    rows.push(...(result?.rows || []));
    if (result?.nextAfterId === null || result?.nextAfterId === undefined) return { rows, total };
    afterId = result.nextAfterId;
  }
  throw new Error('pending.too.many.pages');
};
