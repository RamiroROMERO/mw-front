import { useCallback } from 'react';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

// Reemplaza el patrón `await request.fnExportToXLSX(...); setLoading(false);`
// repetido en ~17 pantallas de reportes. Ese patrón no tenía try/catch: si la
// descarga fallaba, la promesa quedaba rechazada sin manejar y setLoading(false)
// nunca se ejecutaba, dejando el loader trabado indefinidamente.
export const useExportExcel = (setLoading) => {
  const fnExport = useCallback(async (url, data, fileName) => {
    if (typeof setLoading === 'function') setLoading(true);
    try {
      await request.fnExportToXLSX(url, data, fileName);
    } catch (err) {
      console.error(err);
      notification('error', 'msg.export.record.error', 'alert.error.title');
    } finally {
      if (typeof setLoading === 'function') setLoading(false);
    }
  }, [setLoading]);

  return { fnExport };
};
