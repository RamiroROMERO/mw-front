// Reglas puras del modal de búsqueda en el servidor (sin red ni React).
// Contrato por defecto del back: GET <url>?limit=&offset=&search= -> { data: [...], pagination: { totalRecords, limit, offset } }.

export const DEFAULT_PAGE_SIZE = 50;
export const DEFAULT_DEBOUNCE_MS = 300;

const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

// Parámetros de la página `page` (desde 1) con el texto de búsqueda. Sin texto no se manda `search`.
export const buildPageParams = ({ search, page = 1, pageSize = DEFAULT_PAGE_SIZE, searchParam = 'search', extraParams = {} }) => {
  const params = { ...extraParams, limit: pageSize, offset: Math.max(0, page - 1) * pageSize };
  if (!isBlank(search)) params[searchParam] = String(search).trim();
  return params;
};

// Respuesta del back -> { rows, pagination }. Una respuesta vacía o sin paginación no rompe la tabla.
export const parsePage = (res, pageSize = DEFAULT_PAGE_SIZE) => ({
  rows: Array.isArray(res?.data) ? res.data : [],
  pagination: res?.pagination || { totalRecords: 0, limit: pageSize, offset: 0 }
});

export const countPages = (pagination, pageSize = DEFAULT_PAGE_SIZE) => {
  const total = Number(pagination?.totalRecords) || 0;
  const limit = Number(pagination?.limit) || pageSize;
  return Math.max(1, Math.ceil(total / limit));
};

// Texto de rango: "1-50 / 321".
export const describeRange = (pagination, rowsShown) => {
  const total = Number(pagination?.totalRecords) || 0;
  const offset = Number(pagination?.offset) || 0;
  const shown = Number(rowsShown) || 0;
  return `${shown === 0 ? 0 : offset + 1}-${offset + shown} / ${total}`;
};

// Solo la última solicitud puede aplicarse: la búsqueda sigue cambiando mientras el usuario escribe.
export const isLatestRequest = (requestId, latestId) => requestId === latestId;
