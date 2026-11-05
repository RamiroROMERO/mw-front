import { useState } from 'react';
import createNotification from '@Containers/ui/Notifications';
import { request, buildUrl } from '@Helpers/core';
import { formatNumber } from '@Helpers/Utils';
import { headerFromOrder, lineFromOrder } from './purchaseRules';

// Extraído de usePurchases.js: el sub-flujo de "importar desde una orden de
// compra existente" (buscar órdenes del proveedor, ver su detalle, volcarlo
// al formulario de compra actual). Lógica sin cambios respecto al original.
export const usePurchaseOrders = ({ setLoading, providerId, purchaseId, purchaseDetail, setPurchaseDetail, setBulkForm }) => {
  const [dataOrders, setDataOrders] = useState([]);
  const [openModalViewOrders, setOpenModalViewOrders] = useState(false);
  // Orden elegida mientras se espera la confirmación de reemplazar las líneas que ya hay (SPEC v2-22-sr).
  const [pendingOrder, setPendingOrder] = useState(null);
  const [openMsgReplaceDetail, setOpenMsgReplaceDetail] = useState(false);

  const fnViewPurchaseOrders = () => {
    if (providerId === 0) {
      createNotification('warning', 'msg.required.select.provider', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(buildUrl('inventory/process/purchaseOrders', { providerId }), (resp) => {
      const orders = resp.data.map((item) => {
        item.provider = item.providerData.name
        item.address = item.providerData.address
        item.total = formatNumber(item.valueTotal, '', 2)
        return item;
      });
      setDataOrders(orders);
      setOpenModalViewOrders(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const loadOrder = (item) => {
    setLoading(true);
    request.GET(buildUrl('inventory/process/purchaseOrderDetail', { purchaseOrderId: item.id }), (resp) => {
      setPurchaseDetail(resp.data.map(lineFromOrder));
      setBulkForm(headerFromOrder(item));
      setOpenModalViewOrders(false);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  // "Cargar O.C." solo en una compra nueva: la orden reemplaza las líneas (y trae su conversión de empaque), así que en una compra
  // guardada no se ofrece; si ya hay productos se pide confirmación antes de reemplazarlos.
  const fnViewOrder = (item) => {
    if (purchaseId > 0) {
      createNotification('warning', 'msg.purchase.order.onlyNew', 'alert.warning.title');
      return;
    }
    if (purchaseDetail.length > 0) {
      setPendingOrder(item);
      setOpenMsgReplaceDetail(true);
      return;
    }
    loadOrder(item);
  };

  const fnOkReplaceDetail = () => {
    setOpenMsgReplaceDetail(false);
    if (pendingOrder) loadOrder(pendingOrder);
    setPendingOrder(null);
  };

  return { dataOrders, openModalViewOrders, setOpenModalViewOrders, fnViewPurchaseOrders, fnViewOrder, openMsgReplaceDetail, setOpenMsgReplaceDetail, fnOkReplaceDetail };
};
