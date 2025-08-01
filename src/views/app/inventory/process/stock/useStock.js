import { request } from '@/helpers/core';
import { useForm } from '@/hooks'
import { useEffect, useState } from 'react'

export const useStock = ({ setLoading }) => {
  const [listStores, setListStores] = useState([]);
  const [listProducts, setListProducts] = useState([]);
  const [dataProducts, setDataProducts] = useState([]);
  const [openModalStockReport, setOpenModalStockReport] = useState(false);
  const [openModalPrintMovement, setOpenModalPrintMovement] = useState(false);

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    storeId: 0,
    productId: 0,
    dateStart: '',
    dateEnd: '',
    inputUnit: '',
    outputUnit: ''
  });

  const fnViewDetail = () => { }

  const fnPrintDetail = () => { }

  const fnMovementByProduct = () => {
    setOpenModalPrintMovement(true);
  }

  const fnStockReport = () => {
    setOpenModalStockReport(true);
  }

  useEffect(() => {
    setLoading(true);
    request.GET(`inventory/process/stoks/getStoks`, (resp) => {
      const products = resp.data.map((item) => {
        item.label = item.name
        item.value = item.id
        return item;
      });
      setListProducts(products);
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
  }, []);

  const propsToControlPanel = {
    buttonsHome: [
      {
        title: "button.viewDetail",
        icon: "bi bi-search",
        onClick: fnViewDetail
      },
      {
        title: "button.printDetail",
        icon: "bi bi-printer",
        onClick: fnPrintDetail
      },
      {
        title: "button.movementByProduct",
        icon: "bi bi-card-checklist",
        onClick: fnMovementByProduct
      },
      {
        title: "button.stockReport",
        icon: "bi bi-file-earmark-bar-graph",
        onClick: fnStockReport
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  return (
    {
      propsToControlPanel,
      formState,
      onInputChange,
      onBulkForm,
      listStores,
      listProducts,
      openModalStockReport,
      setOpenModalStockReport,
      openModalPrintMovement,
      setOpenModalPrintMovement
    }
  )
}
