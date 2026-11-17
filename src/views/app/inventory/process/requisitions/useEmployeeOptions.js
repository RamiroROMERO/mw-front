import { useCallback, useEffect, useRef, useState } from 'react';
import { request, buildUrl } from '@Helpers/core';
import { isUserSearch, isLatestRequest, SEARCH_DEBOUNCE_MS } from '../../settings/productsCatalog/pagingRules';
import { employeeOptions } from './requisitionRules';

const EMPLOYEES_URL = 'inventory/process/requisitions/availableEmployees';

// Opciones del selector de empleado por línea (SPEC v2-52-sr) con búsqueda en el servidor: pide los primeros al activarse (RRHH activo)
// y, al escribir, vuelve a pedir con `search` (retrasado 300 ms). Una respuesta vieja nunca pisa a una más nueva. Con `enabled` en
// falso no hace ninguna llamada y devuelve `null` (la pantalla no muestra el selector).
export const useEmployeeOptions = (enabled) => {
  const [options, setOptions] = useState([]);
  const latest = useRef(0);
  const timer = useRef(null);

  const load = useCallback((text) => {
    latest.current += 1;
    const requestId = latest.current;
    request.GET(buildUrl(EMPLOYEES_URL, { search: text || undefined, limit: 50 }), (res) => {
      if (isLatestRequest(requestId, latest.current)) setOptions(employeeOptions(res?.data));
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
    if (enabled) load('');
    return () => clearTimeout(timer.current);
  }, [enabled, load]);

  return { employees: enabled ? options : null, onEmployeeSearch: onInputChange };
};

export default useEmployeeOptions;
