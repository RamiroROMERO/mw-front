import { useState } from 'react'
import { useForm } from '@/hooks';
import { IntlMessages, validFloat, validInt } from '@/helpers/Utils';
import { request } from '@/helpers/core';

export const useModalAddProduct = ({ setLoading, currentItem, fnGetDataDetail, setOpen }) => {
  const [sendForm, setSendForm] = useState(false);
  const [dataProducts, setDataProducts] = useState([]);

  const validation = {
    areaId: [(val) => validInt(val) !== 0, IntlMessages("msg.required.select.areaId")],
    storeId: [(val) => validInt(val) !== 0, IntlMessages("msg.required.select.storeId")]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    areaId: 0,
    storeId: 0
  }, validation);

  const { storeId, areaId } = formState;

  const [table, setTable] = useState({
    title: IntlMessages("page.events.modalAddProduct.table.title"),
    columns: [
      { label: "table.column.code", field: "productCode", headerStyle: { 'width': '15%' }, bodyStyle: { 'width': '15%' } },
      { label: "table.column.name", field: "productName", headerStyle: { 'width': '25%' }, bodyStyle: { 'width': '25%' } },
      { label: "table.column.brand", field: "tradeMark", headerStyle: { 'width': '15%' }, bodyStyle: { 'width': '15%' } },
      { label: "table.column.unit", field: "inputUnit", headerStyle: { 'width': '10%' }, bodyStyle: { 'width': '10%' } },
      { label: "table.column.stock", field: "stockQty", headerStyle: { 'width': '10%' }, bodyStyle: { 'width': '10%' } },
      { label: "table.column.iva", field: "tax", headerStyle: { 'width': '5%' }, bodyStyle: { 'width': '5%' } },
      { label: "table.column.averagePrice", field: "priceLocalMid", headerStyle: { 'width': '10%' }, bodyStyle: { 'width': '10%' } },
      { label: "table.column.qty", field: "qty", headerStyle: { 'width': '10%' }, bodyStyle: { 'width': '10%' }, isEditable: true }
    ],
    data: dataProducts,
    onChangeData: setDataProducts,
    options: {
      columnActions: "options",
      tableHeight: '280px'
    },
  });

  const fnSearchProduct = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    setLoading(true);
    request.GET(`inventory/process/stocks/getStocks?storeId=${storeId}&type=1`, (resp) => {
      const data = resp.data.map((item) => {
        item.productName = item.name
        item.price = validFloat(item.priceLocalMid)
        item.subTotal = validFloat(item.priceLocalMid)
        item.taxPercent = item.percentTax
        item.tax = (validFloat(item.percentTax) * validFloat(item.priceLocalMid)) / 100
        item.total = ((validFloat(item.percentTax) * validFloat(item.priceLocalMid)) / 100) + validFloat(item.priceLocalMid)
        item.qty = 0
        return item;
      });
      setTable({ ...table, data });
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSaveProducts = async () => {
    const filterProducts = dataProducts.filter(item => validFloat(item.qty) > 0);

    if (filterProducts.length === 0) { return; }

    const newData = filterProducts.map(item => {
      return {
        fatherId: currentItem.id,
        date: currentItem.date,
        areaId: areaId,
        storeId: storeId,
        productCode: item.productCode,
        quantity: validFloat(item.qty),
        price: item.price,
        taxPercent: validFloat(item.taxPercent),
        taxValue: (validFloat(item.taxPercent) * validFloat(item.price * item.qty)) / 100,
        total: ((validFloat(item.taxPercent) * validFloat(item.price * item.qty)) / 100) + validFloat(item.price * item.qty),
        outputUnit: item.outputUnit,
        outputQty: validFloat(item.qtyDist),
        productCost: validFloat(item.costValue),
        status: 1
      }
    });

    newData.forEach((detailEvent, idx) => {
      request.POST('hospital/process/eventDetails', detailEvent, (resp) => {
        setLoading(false);
        if (newData.length === (idx + 1)) {
          fnGetDataDetail();
          setOpen(false);
        }
      }, (err) => {
        console.log(err);
        setLoading(false);
      });
    });
  }

  return (
    {
      table,
      formState,
      formValidation,
      sendForm,
      onInputChange,
      fnSearchProduct,
      fnSaveProducts
    }
  )
}
