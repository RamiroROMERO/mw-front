import { useState } from 'react'
import { useForm } from '@Hooks';
import { IntlMessages, validFloat, validInt } from '@Helpers/Utils';
import { request, buildUrl } from '@Helpers/core';

export const useModalAddProduct = ({ setLoading, currentItem, fnGetDataDetail, setOpen, type = 1 }) => {
  const [sendForm, setSendForm] = useState(false);
  const [dataProducts, setDataProducts] = useState([]);

  const validation = {
    areaId: [(val) => validInt(val) !== 0, IntlMessages("msg.required.select.areaId")],
    ...(type === 1 ? { storeId: [(val) => validInt(val) !== 0, IntlMessages("msg.required.select.storeId")] } : {})
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    areaId: 0,
    storeId: 0
  }, validation);

  const { storeId, areaId } = formState;

  const [table, setTable] = useState({
    title: IntlMessages(type === 2 ? "page.events.modalAddService.table.title" : "page.events.modalAddProduct.table.title"),
    columns: [
      { label: "table.column.code", field: "productCode", headerStyle: { 'width': '15%' }, bodyStyle: { 'width': '15%' } },
      { label: "table.column.name", field: "productName", headerStyle: { 'width': '25%' }, bodyStyle: { 'width': '25%' } },
      { label: "table.column.brand", field: "tradeName", headerStyle: { 'width': '15%' }, bodyStyle: { 'width': '15%' } },
      { label: "table.column.unit", field: "undoutName", headerStyle: { 'width': '10%' }, bodyStyle: { 'width': '10%' } },
      // Los servicios no controlan existencia, esta columna no aplica para ellos.
      ...(type === 2 ? [] : [{ label: "table.column.stock", field: "qtyStock", headerStyle: { 'width': '10%' }, bodyStyle: { 'width': '10%' } }]),
      { label: "table.column.iva", field: "tax", headerStyle: { 'width': '5%' }, bodyStyle: { 'width': '5%' } },
      { label: "table.column.averagePrice", field: "price", headerStyle: { 'width': '10%' }, bodyStyle: { 'width': '10%' } },
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
    // Los servicios (type 2) no tienen bodega/existencia real: se buscan con
    // getServices (siempre todos), los productos con getStocks filtrado por bodega.
    const url = type === 2
      ? 'inventory/process/stocks/getServices'
      : buildUrl('inventory/process/stocks/getStocks', { storeId, typeId: type });

    request.GET(url, (resp) => {
      const data = resp.data.map((item) => {
        item.price = validFloat(item.localMedPrice)
        item.subTotal = validFloat(item.localMedPrice)
        item.taxPercent = item.percentTax
        item.tax = (validFloat(item.percentTax) * validFloat(item.localMedPrice)) / 100
        item.total = ((validFloat(item.percentTax) * validFloat(item.localMedPrice)) / 100) + validFloat(item.localMedPrice)
        item.qty = 0
        return item;
      });
      setTable({ ...table, data });
      setLoading(false);
    }, (err) => {

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
        outputUnit: item.undoutName,
        outputQty: validFloat(item.valChange),
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
