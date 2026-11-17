import { useFilteredReport } from '../purchaseReport/useFilteredReport';

// SPEC v2-57-sr: Compras por Proveedor = `byProvider` y Gastos y Servicios = `services` del endpoint común (los dos con filtro de proveedor).
export const usePurchaseForProvider = ({ setLoading, type = 'byProvider' }) =>
  useFilteredReport({ setLoading, type, filterKey: 'providerId', listUrl: 'inventory/process/providers' });
