import { validFloat, validInt } from '@/helpers/Utils';
import { useState } from 'react'

export const useDetailProduct = ({ onBulkFormDeta, idProd, productCode, nameProduct, price, qty, total, accountId, toInventory, storeId, ticketDetail, setTicketDetail, onBulkForm, setSendFormDeta, isFormValidDeta }) => {

  const [showStores, setShowStores] = useState('none');

  const onQtyChange = e => {
    const totalValue = validFloat(price) * e.target.value;

    const newQty = {
      qty: e.target.value,
      total: totalValue
    }
    onBulkFormDeta(newQty);
  }

  const onPriceChange = e => {
    const totalValue = e.target.value * validFloat(qty);

    const newPrice = {
      price: e.target.value,
      total: totalValue
    }
    onBulkFormDeta(newPrice);
  }

  const onToInventoryChange = e => {
    const inventory = e.target.checked;

    if (validInt(inventory) === 1 || inventory === true) {
      setShowStores("block");
    } else {
      setShowStores("none");
    }

    onBulkFormDeta({ toInventory: inventory });
  }

  const fnApplyAccount = () => { }

  const fnAddProduct = () => {
    setSendFormDeta(true);
    if (!isFormValidDeta) {
      return;
    }

    const detail = {
      id: new Date().getTime(),
      productCode,
      nameProduct,
      qty: validFloat(qty),
      price: validFloat(price),
      total: validFloat(total),
      accountId,
      toInventory,
      storeId
    }

    if (idProd > 0) {
      ticketDetail.map((item) => {
        if (item.id === idProd) {
          item.qty = validFloat(qty)
          item.price = validFloat(price)
          item.total = validFloat(total)
          item.accountId = accountId
          item.toInventory = toInventory
          item.storeId = storeId
        }
        return item;
      });
    } else {
      setTicketDetail(current => [...current, detail]);
    }

    const sumTotal = ticketDetail.map(item => {
      const totalVal = validFloat(item.total);
      return totalVal;
    }).reduce((prev, curr) => prev + curr, 0);

    let valueTotal = 0;

    if (idProd > 0) {
      valueTotal = sumTotal;
    } else {
      valueTotal = validFloat(total) + sumTotal;
    }

    onBulkForm({ valueTotal });

    // limpiar inputs para agregar otro producto
    const cleanProd = {
      idProd: 0,
      productCode: '',
      nameProduct: '',
      qty: 1,
      price: 0,
      total: 0,
      accountId: 0,
      toInventory: 0,
      storeId: 0
    }

    onBulkFormDeta(cleanProd);
    setSendFormDeta(false);
  }

  return (
    {
      showStores,
      onQtyChange,
      onPriceChange,
      onToInventoryChange,
      fnApplyAccount,
      fnAddProduct
    }
  )
}
