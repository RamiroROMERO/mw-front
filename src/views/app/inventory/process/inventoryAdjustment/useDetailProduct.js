import { validFloat } from '@Helpers/Utils';

// A diferencia de Traslados/Requisiciones, acá `qty` es el CONTEO FÍSICO objetivo (no un
// movimiento) — 0 es un valor válido (el producto realmente no existe), así que no se
// exige > 0 como en las otras pantallas de la familia.
export const useDetailProduct = ({ idProd, productCode, nameProduct, qty, cost, total, lotCode, dateOut, sourceStoreId, setBulkFormDeta, transferDetail, setTransferDetail, setSendFormDeta, isFormValidDeta, setSendForm, isFormValid }) => {

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
      productCode,
      nameProduct,
      qty: validFloat(qty),
      cost,
      total: validFloat(total),
      lotCode,
      dateOut: dateOut !== "" ? dateOut : "1900-01-01"
    }

    if (idProd > 0) {
      const updated = transferDetail.map((item) => item.idProd === idProd ? {
        ...item,
        qty: validFloat(qty),
        cost,
        total: validFloat(total),
        lotCode,
        dateOut: dateOut !== "" ? dateOut : "1900-01-01",
        originStoreId: sourceStoreId
      } : item);
      setTransferDetail(updated);
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
      qty: 0,
      lotCode: '',
      dateOut: '',
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
