import { request } from '@/helpers/core';
import { useForm } from '@/hooks'
import { useEffect, useState } from 'react';

export const useInventoryReport = ({ setLoading }) => {
  const [listStores, setListStores] = useState([]);
  const [listProducts, setListProducts] = useState([]);
  const [dataInventory, setDataInventory] = useState([]);
  const [openModalOtherReport, setOpenModalOtherReport] = useState(false);

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    storeId: 0,
    destinyId: 0,
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

    request.GET(`inventory/process/stocks/getStocks`, (resp) => {
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
      listStores,
      listProducts,
      dataInventory,
      fnSearchReport,
      fnExportToExcel,
      fnPrintReport,
      fnOtherReport,
      openModalOtherReport,
      setOpenModalOtherReport
    }
  )
}
