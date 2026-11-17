import { useCallback, useEffect, useRef, useState } from 'react';
import { request, buildUrl } from '@Helpers/core';
import { isUserSearch, isLatestRequest, SEARCH_DEBOUNCE_MS } from '../../settings/productsCatalog/pagingRules';
import { providerOptions } from './refundRules';

const PROVIDERS_URL = 'inventory/process/refunds/availableProviders';

// Opciones del selector de proveedor (SPEC v2-53-sr) con búsqueda en el servidor por nombre o RTN: pide los primeros al montar y, al
// escribir, vuelve a pedir con `search` (retrasado 300 ms). Una respuesta vieja nunca pisa a una más nueva.
export const useProviderOptions = () => {
  const [options, setOptions] = useState([]);
  const latest = useRef(0);
  const timer = useRef(null);

  const load = useCallback((text) => {
    latest.current += 1;
    const requestId = latest.current;
    request.GET(buildUrl(PROVIDERS_URL, { search: text || undefined, limit: 50 }), (res) => {
      if (isLatestRequest(requestId, latest.current)) setOptions(providerOptions(res?.data));
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

  return { providers: options, onProviderSearch: onInputChange };
};

export default useProviderOptions;
