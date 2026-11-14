import { useState } from 'react'
import { sumTotals } from './ticketPurchaseRules';

export const useDetailTable = ({ ticketDetail, setTicketDetail, onBulkForm, onBulkFormDeta }) => {

  const [dataItem, setDataItem] = useState({});
  const [openMsgDelete, setOpenMsgDelete] = useState(false);

  // Carga la línea en el formulario de arriba para editarla (sin mutar la línea del grid).
  const fnEditProduct = (itemProd) => {
    onBulkFormDeta({ ...itemProd, idProd: itemProd.id });
  }

  const fnDeleteProduct = (itemProd) => {
    setDataItem(itemProd);
    setOpenMsgDelete(true);
  }

  const fnDeleteOkProduct = () => {
    const newArray = ticketDetail.filter((item) => item.id !== dataItem.id);
    setTicketDetail(newArray);
    onBulkForm({ valueTotal: sumTotals(newArray) });
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
