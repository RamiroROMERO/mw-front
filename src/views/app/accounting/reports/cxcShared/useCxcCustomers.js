import { useEffect, useState } from 'react';
import { request } from '@Helpers/core';
import { customerOptions } from './cxcReportsRules';

// Clientes del combo de los reportes de CxC: el selector corto `getSL` (código y nombre), no el listado completo con todos sus campos.
export const useCxcCustomers = () => {
  const [list, setList] = useState([]);
  useEffect(() => {
    request.GET('billing/settings/customers/getSL', (resp) => setList(customerOptions(resp.data)), () => { });
  }, []);
  return list;
};

// Configuración de los reportes (la moneda Dólares solo existe si la empresa factura en ambas).
export const useCxcSettings = (normalize) => {
  const [settings, setSettings] = useState(normalize(undefined));
  useEffect(() => {
    request.GET('accounting/reports/cxcReports/settings', (resp) => setSettings(normalize(resp.data)), () => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return settings;
};
