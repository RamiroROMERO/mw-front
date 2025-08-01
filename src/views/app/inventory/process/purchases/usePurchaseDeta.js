import { useState } from 'react'
import { request } from '@/helpers/core';
import { validFloat, validInt } from '@/helpers/Utils';
import { useForm } from '@/hooks';
import TableButtons from '@/components/tableButtons';

export const usePurchaseDeta = ({ setLoading, setPurchaseDetail }) => {

  const [openModalProducts, setOpenModalProducts] = useState(false);
  const [dataProducts, setDataProducts] = useState([]);

  const purchaseDetaValid = {
    productCode: [(val) => val !== "", "msg.required.input.codeProduct"],
    qty: [(val) => validInt(val) > 0, "msg.required.input.qty"],
    price: [(val) => validInt(val) > 0, "msg.required.input.price"]
  }

  const { formState: formStateDeta, formValidation: formValidationDeta, isFormValid: isFormValidDeta, onInputChange:
    onInputChangeDeta, onResetForm: onResetFormDeta, setBulkForm: setBulkFormDeta } = useForm({
      idProd: 0,
      productCode: '',
      nameProduct: '',
      qty: 1,
      price: 0,
      subTotal: 0,
      discountPercent: 0,
      discount: 0,
      taxPercent: 0,
      tax: 0,
      total: 0,
      isBonus: 0,
      isTaxFree: 0,
      lotCode: '',
      dateOut: '',
      nameUM: '',
      previousCost: 0,
      currentExistence: 0
    }, purchaseDetaValid);

  const fnGetDataDetail = (purchaseId) => {
    setLoading(true);
    request.GET(`inventory/process/purchaseDetail?purchaseId=${purchaseId}`, (resp) => {
      const purchaseDeta = resp.data.map((item) => {
        item.nameProduct = item.invProduct.name
        return item;
      });
      setPurchaseDetail(purchaseDeta);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSelectProduct = (item) => {
    setBulkFormDeta(item);
    setOpenModalProducts(false);
  }

  const fnViewProducts = (idStore) => {
    setLoading(true);
    request.GET(`inventory/process/stoks/getStoks?storeId=${idStore}`, (resp) => {
      const data = resp.data.map((item) => {
        item.code = item.productCode
        item.nameProduct = item.name
        item.price = validFloat(item.priceLocalMid)
        item.subTotal = validFloat(item.priceLocalMid)
        item.taxPercent = item.percentTax
        item.tax = (validFloat(item.percentTax) * validFloat(item.priceLocalMid)) / 100
        item.total = ((validFloat(item.percentTax) * validFloat(item.priceLocalMid)) / 100) + validFloat(item.priceLocalMid)
        item.nameUM = item.inputUnit
        item.previousCost = item.costValue
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

  return {
    formStateDeta, formValidationDeta, isFormValidDeta, onInputChangeDeta, onResetFormDeta, setBulkFormDeta, fnSelectProduct, openModalProducts, setOpenModalProducts, fnViewProducts, dataProducts, fnGetDataDetail
  }
}
