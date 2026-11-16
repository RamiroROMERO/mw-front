import { validFloat } from '@Helpers/Utils';

export const useDetailProduct = ({ idProd, productCode, nameProduct, qty, cost, total, lotCode, expirationDate, sourceStoreId, assignStoreId, setBulkFormDeta, transferDetail, setTransferDetail, setSendFormDeta, isFormValidDeta, setSendForm, isFormValid, originCtaCode, assignCtaCode }) => {

  const onQtyChange = e => {
    const totalValue = validFloat(cost) * e.target.value;

    const newQty = {
      qty: e.target.value,
      total: totalValue
    }
    setBulkFormDeta(newQty);
  }

  const fnAddProduct = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    setSendFormDeta(true);
    if (!isFormValidDeta) {
      return;
    }

    const detail = {
      idTemp: new Date().getTime(),
      originStoreId: sourceStoreId,
      assignStoreId,
      originCtaCode,
      assignCtaCode,
      productCode,
      nameProduct,
      qty: validFloat(qty),
      cost,
      total: validFloat(total),
      lotCode,
      expirationDate: expirationDate !== "" ? expirationDate : "1900-01-01"
    }

    if (idProd > 0) {
      transferDetail.map((item) => {
        if (item.idProd === idProd) {
          item.qty = validFloat(qty)
          item.cost = validFloat(cost)
          item.total = validFloat(total)
          item.lotCode = lotCode
          item.expirationDate = expirationDate !== "" ? expirationDate : "1900-01-01"
          item.assignStoreId = assignStoreId
          item.originStoreId = sourceStoreId
          item.originCtaCode = originCtaCode
          item.assignCtaCode = assignCtaCode
        }
        return item;
      });
    } else {
      setTransferDetail(current => [...current, detail]);
    }

    // limpiar inputs para agregar otro producto
    const cleanProd = {
      idProd: 0,
      productCode: '',
      nameProduct: '',
      currentExistence: 0,
      cost: 0,
      qty: 1,
      lotCode: '',
      expirationDate: '',
      total: 0
    }

    setBulkFormDeta(cleanProd);
    setSendFormDeta(false);
  }

  return (
    {
      onQtyChange,
      fnAddProduct
    }
  )
}
