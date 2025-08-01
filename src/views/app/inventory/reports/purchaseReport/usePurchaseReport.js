import { request } from '@/helpers/core';
import { useForm } from '@/hooks'
import { useEffect, useState } from 'react';

export const usePurchaseReport = ({ setLoading }) => {
  const [listProviders, setListProviders] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [listProducts, setListProducts] = useState([]);
  const [dataPurchases, setDataPurchases] = useState([]);
  const [openModalOtherReport, setOpenModalOtherReport] = useState(false);

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    providerId: 0,
    storeId: 0,
    productId: 0,
    dateStart: '',
    dateEnd: ''
  });

  const fnSearchReport = () => { }

  const fnExportToExcel = () => { }

  const fnPrintReport = () => { }

  const fnOtherReport = () => {
    setOpenModalOtherReport(true);
  }

  useEffect(() => {
    setLoading(true);
    request.GET(`inventory/process/providers`, (resp) => {
      const providers = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListProviders(providers);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('inventory/settings/stores?type=1', (resp) => {
      const stores = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListStores(stores);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    request.GET(`inventory/process/stoks/getStoks`, (resp) => {
      const data = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListProducts(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    {
      formState,
      onInputChange,
      listProviders,
      listStores,
      listProducts,
      dataPurchases,
      openModalOtherReport,
      setOpenModalOtherReport,
      fnSearchReport,
      fnExportToExcel,
      fnPrintReport,
      fnOtherReport
    }
  )
}
