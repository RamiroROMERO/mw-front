import { useEffect, useState } from 'react';
import { request } from '@Helpers/core';

// Extraído de usePurchases.js: carga las listas de referencia (documentos,
// tiendas, proveedores, formas de pago) que alimentan los selects del
// formulario de compra. Mismo fetch/mapeo de siempre, solo separado del
// resto de la lógica de guardado/búsqueda de esa pantalla.
export const usePurchaseFormLists = ({ setLoading }) => {
  const [listDocuments, setListDocuments] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [listProviders, setListProviders] = useState([]);
  const [listPaymentTypes, setListPaymentTypes] = useState([]);

  useEffect(() => {
    setLoading(true);
    request.GET('admin/documents?status=1&useInv=1', (resp) => {
      const documents = resp.data.map((item) => {
        return {
          value: item.code,
          code: item.code,
          label: `${item.code} | ${item.name}`
        }
      });
      setListDocuments(documents);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET('inventory/settings/stores?type=1', (resp) => {
      const stores = resp.data;
      setListStores(stores);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET(`inventory/process/providers`, (resp) => {
      const providers = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          address: item.address,
          creditDays: item.creditDays,
          cai: item.cai,
          providerType: item.providerType
        }
      });
      setListProviders(providers);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET(`admin/paymentTypes`, (resp) => {
      const paymentMethods = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          usageType: item.usageType
        }
      })
      const filterPayments = paymentMethods.filter((item) => {
        return item.usageType === 2 || item.usageType === 3
      });
      setListPaymentTypes(filterPayments);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }, []);

  return { listDocuments, listStores, listProviders, listPaymentTypes };
};
