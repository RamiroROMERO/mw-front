import { useState } from 'react'
import { validFloat } from '@/helpers/Utils'

export const useDetailForm = ({ setBulkFormDetail, listTypesRetention, baseValue, setSendFormDeta, retentionDetail, isFormValidDeta, setRetentionDetail, setBulkFormIndex, description, documentCode, percentValue, totalValue }) => {

  const [openMsgDeleteItem, setOpenMsgDeleteItem] = useState(false);
  const [dataItem, setDataItem] = useState({});

  const onDescriptionChange = e => {
    const desc = e.target.value
    const filter = listTypesRetention.find(item => item.value == desc);
    const totalReceip = validFloat((filter.percentValue * baseValue) / 100);

    setBulkFormDetail({ description: desc, percentValue: filter.percentValue ? filter.percentValue : "", totalValue: totalReceip })
  }

  const fnAddReceipt = (e) => {
    setSendFormDeta(true);
    if (!isFormValidDeta) {
      return;
    }
    const detail = {
      id: new Date().getTime(),
      documentCode,
      description,
      baseValue,
      percentValue,
      totalValue: validFloat(totalValue)
    }
    const sumTotal = retentionDetail.map(item => validFloat(item.totalValue)).reduce((prev, curr) => prev + curr, 0);
    const totalReceipt = validFloat(totalValue) + sumTotal;

    const addReceipt = {
      total: totalReceipt
    }

    setBulkFormIndex(addReceipt);
    setRetentionDetail(current => [...current, detail]);
    const cleanReceipt = {
      id: 0,
      documentCode: "",
      description: "",
      baseValue: "",
      percentValue: "",
      totalValue: ""
    }
    setBulkFormDetail(cleanReceipt);
    setSendFormDeta(false);
  }

  const fnDeleteReceipt = (itemReceiptes) => {
    setDataItem(itemReceiptes);
    setOpenMsgDeleteItem(true);
  }

  const fnDeleteOkReceipt = () => {
    const newArray = retentionDetail.filter((item) => item.id !== dataItem.id);
    setRetentionDetail(newArray);

    const sumTotal = newArray.map(item => validFloat(item.totalValue)).reduce((prev, curr) => prev + curr, 0);

    const deleteReceipt = {
      total: sumTotal
    }

    setBulkFormIndex(deleteReceipt);
    setOpenMsgDeleteItem(false);
  }

  return (
    {
      onDescriptionChange, fnAddReceipt, openMsgDeleteItem, setOpenMsgDeleteItem, fnDeleteReceipt, fnDeleteOkReceipt
    }
  )
}
