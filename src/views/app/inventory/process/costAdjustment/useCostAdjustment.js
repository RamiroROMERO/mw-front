import { useEffect, useState } from 'react';
import { request, buildUrl } from '@Helpers/core';
import { validInt, validFloat } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import createNotification from '@Containers/ui/Notifications';

// Ajustes a Costos y Cantidades (inv_proc_change_cost_qty.sc2) — corrige costo/cantidades
// de líneas de inv_kardex ya contabilizadas para un Almacén+Producto+rango de fechas.
// Herramienta de corrección de datos, no genera un movimiento/documento nuevo.
export const useCostAdjustment = ({ setLoading }) => {
  const [listStores, setListStores] = useState([]);
  const [storeId, setStoreId] = useState(0);
  const [productCode, setProductCode] = useState('');
  const [productName, setProductName] = useState('');
  const [dateFrom, setDateFrom] = useState(DateHelper.format(new Date()));
  const [dateTo, setDateTo] = useState(DateHelper.format(new Date()));
  const [rows, setRows] = useState([]);
  const [searched, setSearched] = useState(false);

  const [openModalProducts, setOpenModalProducts] = useState(false);
  const [dataProducts, setDataProducts] = useState([]);

  const [openMsgDelete, setOpenMsgDelete] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  useEffect(() => {
    request.GET('inventory/settings/stores?type=1', (resp) => {
      setListStores(resp.data.map((item) => ({ label: item.name, value: item.id })));
    }, () => { });
  }, []);

  const fnStoreChange = (e) => {
    setStoreId(e.target.value);
    setProductCode('');
    setProductName('');
    setRows([]);
    setSearched(false);
  }

  const fnViewProducts = () => {
    if (validInt(storeId) === 0) {
      createNotification('warning', 'msg.required.select.warehouse', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(buildUrl('inventory/process/stocks/getStocks', { storeId }), (resp) => {
      const data = resp.data.map((item) => ({
        ...item,
        code: item.productCode,
        name: item.productName,
        presentation: item.undinName,
        inputUnit: item.undinName
      }));
      setDataProducts(data);
      setOpenModalProducts(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnSelectProduct = (item) => {
    setProductCode(item.productCode);
    setProductName(item.name);
    setOpenModalProducts(false);
    setRows([]);
    setSearched(false);
  }

  const fnSearch = () => {
    if (validInt(storeId) === 0) {
      createNotification('warning', 'msg.required.select.warehouse', 'alert.warning.title');
      return;
    }
    if (!productCode) {
      createNotification('warning', 'msg.required.input.codeProduct', 'alert.warning.title');
      return;
    }
    if (!dateFrom) {
      createNotification('warning', 'msg.costAdjustment.dateFromRequired', 'alert.warning.title');
      return;
    }
    if (!dateTo) {
      createNotification('warning', 'msg.costAdjustment.dateToRequired', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(buildUrl('inventory/process/costAdjustment/movements', { storeId, productCode, dateFrom, dateTo }), (resp) => {
      setRows(resp.data.map((item) => ({ ...item, edited: false })));
      setSearched(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnRowChange = (id, field, value) => {
    setRows((prev) => prev.map((row) => {
      if (row.id !== id) return row;
      const updated = { ...row, [field]: value, edited: true };
      updated.debitValue = validFloat(updated.costValue) * validFloat(updated.debitQty);
      updated.creditValue = validFloat(updated.costValue) * validFloat(updated.creditQty);
      return updated;
    }));
  }

  const fnSave = () => {
    const edited = rows.filter((row) => row.edited);
    if (edited.length === 0) {
      createNotification('warning', 'msg.costAdjustment.noChanges', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.PUT('inventory/process/costAdjustment', { rows: edited }, () => {
      setRows((prev) => prev.map((row) => ({ ...row, edited: false })));
      createNotification('success', 'msg.costAdjustment.saveSuccess', 'alert.success.title');
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnAskDelete = (row) => {
    setRowToDelete(row);
    setOpenMsgDelete(true);
  }

  const fnOkDelete = () => {
    setOpenMsgDelete(false);
    setLoading(true);
    request.DELETE(`inventory/process/costAdjustment/${rowToDelete.id}`, () => {
      setRows((prev) => prev.filter((row) => row.id !== rowToDelete.id));
      setLoading(false);
    }, () => setLoading(false));
  }

  return {
    listStores,
    storeId,
    fnStoreChange,
    productCode,
    productName,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    rows,
    searched,
    openModalProducts,
    setOpenModalProducts,
    dataProducts,
    fnViewProducts,
    fnSelectProduct,
    fnSearch,
    fnRowChange,
    fnSave,
    openMsgDelete,
    setOpenMsgDelete,
    fnAskDelete,
    fnOkDelete
  }
}
