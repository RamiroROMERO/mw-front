import { useState } from 'react'
import { useForm } from '@Hooks';
import { IntlMessages, validFloat } from '@Helpers/Utils';
import { request, buildUrl } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';
import { detailPath, buildCreatePayload, validateCreate, warningTexts } from './eventDetailRules';

// SPEC v2-152-sr: un solo POST por lote. El cliente manda solo producto y cantidad por línea (más área y almacén); precio, impuesto, unidad, costo y totales los calcula el back.
export const useModalAddProduct = ({ setLoading, currentItem, fnGetDataDetail, setOpen, type = 1 }) => {
  const [sendForm, setSendForm] = useState(false);
  const [dataProducts, setDataProducts] = useState([]);

  const { formState, onInputChange } = useForm({ areaId: 0, storeId: 0 });
  const { storeId, areaId } = formState;

  // Mismas reglas del back: se muestran por campo (clave de traducción: el campo la traduce) y no se llama al back si fallan.
  const problems = validateCreate({ kind: type, areaId, storeId, rows: dataProducts });
  const formValidation = {
    areaIdValid: problems.areaId || null,
    storeIdValid: problems.storeId || null
  };

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
    if (problems.areaId || problems.storeId) {
      return;
    }

    setLoading(true);
    // Los servicios (type 2) no tienen bodega/existencia real: se buscan con getServices (siempre todos), los productos con getStocks filtrado por bodega.
    // El precio y el impuesto de la tabla son solo informativos: el back los vuelve a calcular al guardar.
    const url = type === 2
      ? 'inventory/process/stocks/getServices'
      : buildUrl('inventory/process/stocks/getStocks', { storeId, typeId: type });

    request.GET(url, (resp) => {
      const data = resp.data.map((item) => {
        item.price = validFloat(item.localMedPrice)
        item.tax = (validFloat(item.percentTax) * validFloat(item.localMedPrice)) / 100
        item.qty = 0
        return item;
      });
      setDataProducts(data);
      setTable((prev) => ({ ...prev, data }));
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnSaveProducts = () => {
    setSendForm(true);
    if (Object.keys(problems).length) {
      if (problems.lines) notification('warning', problems.lines, 'alert.warning.title');
      return;
    }

    setLoading(true);
    request.POST(detailPath(currentItem), buildCreatePayload({ event: currentItem, kind: type, areaId, storeId, rows: dataProducts }), (resp) => {
      setLoading(false);
      // La existencia insuficiente solo avisa: el kardex lo mueve la factura.
      warningTexts(resp.data?.warnings).forEach((w) => notification('warning', 'alert.warning.title', { text: `${IntlMessages(w.id)}: ${w.productCode} (${w.available})` }));
      fnGetDataDetail();
      setOpen(false);
    }, (err) => {
      setLoading(false);
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
