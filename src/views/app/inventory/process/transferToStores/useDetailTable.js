import { useState } from 'react'

export const useDetailTable = ({setBulkFormDeta, transferDetail, setTransferDetail}) => {
  const [dataItem, setDataItem] = useState({});
  const [openMsgDelete, setOpenMsgDelete] = useState(false);

  const fnEditProduct = (itemProd)=>{
    itemProd.idProd = itemProd.id?itemProd.id:itemProd.idTemp
    itemProd.dateOut = itemProd.dateOut==="1900-01-01"?"":itemProd.dateOut
    setBulkFormDeta(itemProd);
  }

  const fnDeleteProduct = (itemProd)=>{
    itemProd.idProd = itemProd.id?itemProd.id:itemProd.idTemp
    setDataItem(itemProd);
    setOpenMsgDelete(true);
  }

  const fnDeleteOkProduct = () =>{
    const newArray = transferDetail.filter((item) => item.idProd !== dataItem.idProd);
    setTransferDetail(newArray);

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
