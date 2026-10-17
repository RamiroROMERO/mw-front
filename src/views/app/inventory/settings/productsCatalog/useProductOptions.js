import { useCallback, useEffect, useRef, useState } from 'react';
import { request, buildUrl } from '@Helpers/core';
import { buildComboParams, toProductOptions, isUserSearch, isLatestRequest, SEARCH_DEBOUNCE_MS } from './pagingRules';

const PRODUCTS_SL_URL = 'inventory/settings/products/getSL';

// Opciones de un combo de productos con búsqueda en el servidor (SPEC v2-18-sr): pide las primeras 50 al montar y, al escribir,
// vuelve a pedir con `search` (retrasado 300 ms). Una respuesta vieja nunca pisa a una más nueva. Se usa en el combo de producto
// padre y en el de componentes, que antes cargaban el catálogo completo.
export const useProductOptions = () => {
  const [options, setOptions] = useState([]);
  const latest = useRef(0);
  const timer = useRef(null);

  const load = useCallback((text) => {
    latest.current += 1;
    const requestId = latest.current;
    request.GET(buildUrl(PRODUCTS_SL_URL, buildComboParams(text)), (res) => {
      if (isLatestRequest(requestId, latest.current)) setOptions(toProductOptions(res?.data));
    }, () => {
      if (isLatestRequest(requestId, latest.current)) setOptions([]);
    });
  }, []);

  // Se conecta a `onInputChange` de react-select: solo reacciona al texto que escribe el usuario.
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

  return { options, onInputChange, reload: () => load('') };
};

export default useProductOptions;
