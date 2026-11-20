import { useCallback, useEffect, useRef, useState } from 'react';
import { request, buildUrl } from '@Helpers/core';
import { buildComboParams, isUserSearch, isLatestRequest, SEARCH_DEBOUNCE_MS } from '@Views/app/inventory/settings/productsCatalog/pagingRules';

const CUSTOMERS_SL_URL = 'billing/settings/customers/getSL';

// Opciones de un combo de clientes con búsqueda en el servidor (SPEC v2-98-sr): pide los primeros 50 al montar y, al escribir, vuelve a pedir con `search`
// (RTN o nombre, retrasado 300 ms). Una respuesta vieja nunca pisa a una más nueva. Antes el reporte cargaba todos los clientes.
export const toCustomerOptions = (rows) => (rows || []).map((item) => ({ value: item.id, label: `${item.rtn || ''} | ${item.nomcli || item.name || ''}` }));

export const useCustomerOptions = () => {
  const [options, setOptions] = useState([]);
  const latest = useRef(0);
  const timer = useRef(null);

  const load = useCallback((text) => {
    latest.current += 1;
    const requestId = latest.current;
    request.GET(buildUrl(CUSTOMERS_SL_URL, buildComboParams(text)), (res) => {
      if (isLatestRequest(requestId, latest.current)) setOptions(toCustomerOptions(res?.data));
    }, () => {
      if (isLatestRequest(requestId, latest.current)) setOptions([]);
    });
  }, []);

  const onInputChange = useCallback((text, meta) => {
    if (isUserSearch(meta)) {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => load(text), SEARCH_DEBOUNCE_MS);
    }
    return text;
  }, [load]);

  useEffect(() => {
    load('');
    return () => clearTimeout(timer.current);
  }, [load]);

  return { options, onInputChange };
};

export default useCustomerOptions;
