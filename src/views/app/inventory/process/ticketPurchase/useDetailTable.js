import { validFloat } from '@/helpers/Utils';
import { useState } from 'react'

export const useDetailTable = ({ ticketDetail, setTicketDetail, onBulkForm, onBulkFormDeta }) => {

  const [dataItem, setDataItem] = useState({});
  const [openMsgDelete, setOpenMsgDelete] = useState(false);

  const fnEditProduct = (itemProd) => {
    itemProd.idProd = itemProd.id
    onBulkFormDeta(itemProd);
  }

  const fnDeleteProduct = (itemProd) => {
    setDataItem(itemProd);
    setOpenMsgDelete(true);
  }

  const fnDeleteOkProduct = () => {
    const newArray = ticketDetail.filter((item) => item.id !== dataItem.id);
    setTicketDetail(newArray);

    const sumTotal = newArray.map(item => {
      const totalVal = validFloat(item.total);
      return totalVal;
    }).reduce((prev, curr) => prev + curr, 0);

    onBulkForm({ valueTotal: sumTotal });
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
