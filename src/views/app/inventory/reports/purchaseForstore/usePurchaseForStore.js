import { useFilteredReport } from '../purchaseReport/useFilteredReport';

// SPEC v2-57-sr: Compras por Almacén = tipo `byStore` del endpoint común.
export const usePurchaseForStore = ({ setLoading }) =>
  useFilteredReport({ setLoading, type: 'byStore', filterKey: 'storeId', listUrl: 'inventory/settings/stores?type=1' });
