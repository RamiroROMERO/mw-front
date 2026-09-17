import { validFloat } from '@Helpers/Utils';
import { request, buildUrl } from '@Helpers/core';
import { useForm } from '@Hooks'
import { useState } from 'react';

export const useTransfersDeta = ({ setLoading }) => {
  const [openModalProducts, setOpenModalProducts] = useState(false);
  const [dataProducts, setDataProducts] = useState([]);

  const transfersDetaValid = {
    productCode: [(val) => val !== "", "msg.required.input.codeProduct"],
    qty: [(val) => validFloat(val) > 0, "msg.required.input.qty"],
    cost: [(val) => validFloat(val) > 0, "msg.required.input.cost"]
  }

  const { formState: formStateDeta, formValidation: formValidationDeta, isFormValid: isFormValidDeta, onInputChange:
    onInputChangeDeta, onResetForm: onResetFormDeta, setBulkForm: setBulkFormDeta } = useForm({
      idProd: 0,
      productCode: '',
      nameProduct: '',
      currentExistence: 0,
      cost: 0,
      qty: 1,
      lotCode: '',
      dateOut: '',
      total: 0
    }, transfersDetaValid);

  const fnSelectProduct = (item) => {
    setBulkFormDeta(item);
    setOpenModalProducts(false);
  }

  const fnViewProducts = (idStore) => {
    setLoading(true);
    request.GET(buildUrl('inventory/process/stocks/getStocks', { storeId: idStore }), (resp) => {
      const data = resp.data.map((item) => {
        item.qty = 1
        item.code = item.productCode
        // Campos reales de invProcessViewStock (findStocks): productName/qtyStock/undinName,
        // no name/stockQty/inputUnit — antes quedaban en blanco en silencio. `name`/
        // `inputUnit` son los dataField que espera la tabla de ModalViewProd; `nameProduct`
        // es el que se usa al poblar el detalle tras seleccionar.
        item.name = item.productName
        item.nameProduct = item.productName
        item.total = validFloat(item.costValue)
        item.inputUnit = item.undinName
        item.cost = item.costValue
        item.currentExistence = item.qtyStock
        item.presentation = item.undinName
        return item;
      });
      setDataProducts(data);
      setOpenModalProducts(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  return (
    {
      formStateDeta,
      onInputChangeDeta,
      fnViewProducts,
      fnSelectProduct,
      openModalProducts,
      setOpenModalProducts,
      dataProducts,
      setBulkFormDeta,
      formValidationDeta,
      isFormValidDeta,
      onResetFormDeta
    }
  )
}
