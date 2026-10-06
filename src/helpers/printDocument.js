import { request, notifyError } from './core';
import notification from '@Containers/ui/Notifications';

// Arma la URL y los parámetros de una impresión (SPEC v2-21). Las impresiones del back son GET: no exigen el permiso
// de crear y envían los parámetros por query. `path` no lleva el id (por ejemplo 'banks/process/transfers').
export const buildPrintRequest = ({ path, id, suffix = 'print', query = {} }) => {
  const clean = Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
  );
  return { url: `${path}/${id}/${suffix}`, params: Object.keys(clean).length ? clean : undefined };
};

// El back imprime lo GUARDADO en DB, así que el documento tiene que existir (id > 0).
export const canPrint = (id) => Number(id) > 0;

/**
 * Descarga el PDF de un documento guardado. Sin id avisa que hay que guardar primero; si el back rechaza (por
 * ejemplo un cheque anulado) muestra su mensaje real y no deja la pantalla cargando.
 * Devuelve false si no se pudo ni intentar (documento sin guardar).
 */
export const printDocument = ({ path, id, fileName, suffix, query, setLoading }) => {
  if (!canPrint(id)) {
    notification('warning', 'msg.print.saveFirst', 'alert.warning.title');
    return false;
  }

  const { url, params } = buildPrintRequest({ path, id, suffix, query });
  const stopLoading = () => { if (typeof setLoading === 'function') setLoading(false); };
  if (typeof setLoading === 'function') setLoading(true);

  request.GETPdf(url, params, fileName, (err) => {
    stopLoading();
    notifyError(err, 'msg.print.error');
  }, 'GET', stopLoading);
  return true;
};
