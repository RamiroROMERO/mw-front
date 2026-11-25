import { useEffect, useState } from 'react';
import { request } from '@Helpers/core';
import { providerOptions } from './cxpReportsRules';

// Proveedores del combo de los reportes de CxP: el selector corto `getSL` (código y nombre), no el listado completo con todos sus campos.
export const useCxpProviders = () => {
  const [list, setList] = useState([]);
  useEffect(() => {
    request.GET('inventory/process/providers/getSL', (resp) => setList(providerOptions(resp.data)), () => { });
  }, []);
  return list;
};
