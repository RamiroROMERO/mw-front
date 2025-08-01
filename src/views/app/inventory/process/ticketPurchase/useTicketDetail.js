import TableButtons from '@/components/tableButtons';
import { request } from '@/helpers/core';
import { validFloat, validInt } from '@/helpers/Utils';
import { useForm } from '@/hooks'
import { useState } from 'react';

export const useTicketDetail = ({ setLoading }) => {
  const [dataProducts, setDataProducts] = useState([]);
  const [openModalProducts, setOpenModalProducts] = useState(false);
  const [sendFormDeta, setSendFormDeta] = useState(false);

  const validDetail = {
    productCode: [(val) => val !== "", "msg.required.input.codeProduct"],
    qty: [(val) => validInt(val) > 0, "msg.required.input.qty"],
    price: [(val) => validInt(val) > 0, "msg.required.input.price"],
    accountId: [(val) => validInt(val) > 0, "msg.required.input.account"]
  }

  const { formState: formStateDeta, formValidation: formValidationDeta, isFormValid: isFormValidDeta, onInputChange: onInputChangeDeta, onResetForm: onResetFormDeta, onBulkForm: onBulkFormDeta } = useForm({
    idProd: 0,
    productCode: '',
    nameProduct: '',
    qty: 1,
    price: 0,
    total: 0,
    accountId: 0,
    toInventory: 0,
    storeId: 0
  }, validDetail);

  const fnSelectProduct = (item) => {
    onBulkFormDeta(item);
    setOpenModalProducts(false);
  }

  const fnViewProducts = () => {
    setLoading(true);
    request.GET(`inventory/process/stoks/getStoks`, (resp) => {
      const data = resp.data.map((item) => {
        item.code = item.productCode
        item.nameProduct = item.name
        item.price = validFloat(item.priceLocalMid)
        item.total = ((validFloat(item.percentTax) * validFloat(item.priceLocalMid)) / 100) + validFloat(item.priceLocalMid)
        item.nameUM = item.inputUnit
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
      onBulkFormDeta,
      sendFormDeta,
      setSendFormDeta,
      formValidationDeta,
      isFormValidDeta,
      onResetFormDeta
    }
  )
}
