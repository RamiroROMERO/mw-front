import { useState } from 'react'
import { validFloat } from '@/helpers/Utils';

const useDetailTable = ({ purchaseDetail, setPurchaseDetail, setBulkForm, setBulkFormDeta }) => {

  const [dataItem, setDataItem] = useState({});
  const [openMsgDelete, setOpenMsgDelete] = useState(false);

  const fnEditProduct = (itemProd) => {
    itemProd.idProd = itemProd.id ? itemProd.id : itemProd.idTemp
    setBulkFormDeta(itemProd);
  }

  const fnDeleteProduct = (itemProd) => {
    itemProd.idProd = itemProd.id ? itemProd.id : itemProd.idTemp
    setDataItem(itemProd);
    setOpenMsgDelete(true);
  }

  const fnDeleteOkProduct = () => {
    const newArray = purchaseDetail.filter((item) => item.idProd !== dataItem.idProd);
    setPurchaseDetail(newArray);

    const sumSubtotal = newArray.map(item => {
      const subtotal = (item.isBonus === 1 || item.isBonus === true) ? 0 : validFloat(item.subTotal);
      return subtotal;
    }).reduce((prev, curr) => prev + curr, 0);

    const sumDiscount = newArray.map(item => {
      const discountVal = (item.isBonus === 1 || item.isBonus === true) ? 0 : validFloat(item.discount);
      return discountVal;
    }).reduce((prev, curr) => prev + curr, 0);

    const sumExempt = newArray.map(item => {
      const exempt = (item.isBonus === 1 || item.isBonus === true) ? 0 : validFloat(item.subTotExeValue);
      return exempt;
    }).reduce((prev, curr) => prev + curr, 0);

    const sumExonerated = newArray.map(item => {
      const exonerated = (item.isBonus === 1 || item.isBonus === true) ? 0 : validFloat(item.subTotExoValue);
      return exonerated;
    }).reduce((prev, curr) => prev + curr, 0);

    const sumTaxes = newArray.map(item => {
      const taxes = (item.isBonus === 1 || item.isBonus === true) ? 0 : validFloat(item.tax);
      return taxes;
    }).reduce((prev, curr) => prev + curr, 0);

    const sumTaxed = newArray.map(item => {
      const taxed = (item.isBonus === 1 || item.isBonus === true) ? 0 : validFloat(item.subtotTaxValue);
      return taxed;
    }).reduce((prev, curr) => prev + curr, 0);

    const sumTotal = newArray.map(item => {
      const totalVal = (item.isBonus === 1 || item.isBonus === true) ? 0 : validFloat(item.total);
      return totalVal;
    }).reduce((prev, curr) => prev + curr, 0);

    const sumBonification = newArray.map(item => validFloat(item.bonification)).reduce((prev, curr) => prev + curr, 0);

    const deleteProduct = {
      valueSubtotal: sumSubtotal,
      exent: sumExempt,
      exonera: sumExonerated,
      gravado: sumTaxed,
      valueTax: sumTaxes,
      valueDiscount: sumDiscount,
      valueTotal: sumTotal,
      bonification: sumBonification
    }
    setBulkForm(deleteProduct);
    setOpenMsgDelete(false);
  }

  return (
    {
      openMsgDelete,
      setOpenMsgDelete,
      fnEditProduct,
      fnDeleteProduct,
      fnDeleteOkProduct
    }
  )
}

export default useDetailTable;