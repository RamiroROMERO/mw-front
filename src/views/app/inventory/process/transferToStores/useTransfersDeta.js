import TableButtons from '@/components/tableButtons';
import { validFloat } from '@/helpers/Utils';
import { request } from '@/helpers/core';
import { useForm } from '@/hooks'
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
    request.GET(`inventory/process/stoks/getStoks?storeId=${idStore}`, (resp) => {
      const data = resp.data.map((item) => {
        item.qty = 1
        item.code = item.productCode
        item.nameProduct = item.name
        item.total = validFloat(item.costValue)
        item.nameUM = item.inputUnit
        item.cost = item.costValue
        item.currentExistence = item.stockQty
        item.statusIcon = item.status === 1 ? <i className="medium-icon bi bi-check2-square" /> :
          <i className="medium-icon bi bi-square" />
        item.presentation = item.inputUnit
        item.options = <TableButtons color='primary' icon='eye' fnOnClick={() => fnSelectProduct(item)} />
        return item;
      });
      setDataProducts(data);
      setOpenModalProducts(true);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  return (
    {
      formStateDeta,
      onInputChangeDeta,
      fnViewProducts,
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
