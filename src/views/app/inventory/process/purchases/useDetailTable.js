import { useState } from 'react'

const useDetailTable = ({ purchaseDetail, setPurchaseDetail, setBulkFormDeta }) => {

  const [dataItem, setDataItem] = useState({});
  const [openMsgDelete, setOpenMsgDelete] = useState(false);

  const fnEditProduct = (itemProd) => {
    setBulkFormDeta({ ...itemProd, idProd: itemProd.id ? itemProd.id : itemProd.idTemp });
  }

  const fnDeleteProduct = (itemProd) => {
    setDataItem({ ...itemProd, idProd: itemProd.id ? itemProd.id : itemProd.idTemp });
    setOpenMsgDelete(true);
  }

  // Los totales del encabezado se recalculan solos al cambiar `purchaseDetail` (ver usePurchases).
  const fnDeleteOkProduct = () => {
    setPurchaseDetail(purchaseDetail.filter((item) => (item.id ? item.id : item.idTemp) !== dataItem.idProd));
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
