import { useState } from 'react';
import createNotification from '@/containers/ui/Notifications';
import { request, buildUrl } from '@/helpers/core';
import { formatNumber } from '@/helpers/Utils';

// Extraído de usePurchases.js: el sub-flujo de "importar desde una orden de
// compra existente" (buscar órdenes del proveedor, ver su detalle, volcarlo
// al formulario de compra actual). Lógica sin cambios respecto al original.
export const usePurchaseOrders = ({ setLoading, providerId, setPurchaseDetail, setBulkForm }) => {
  const [dataOrders, setDataOrders] = useState([]);
  const [openModalViewOrders, setOpenModalViewOrders] = useState(false);

  const fnViewPurchaseOrders = () => {
    if (providerId === 0) {
      createNotification('warning', 'msg.required.select.provider', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(buildUrl('inventory/process/purchaseOrders', { providerId }), (resp) => {
      const orders = resp.data.map((item) => {
        item.provider = item.invProvider.name
        item.address = item.invProvider.address
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

  const fnViewOrder = (item) => {
    item.orderId = item.id
    setLoading(true);
    request.GET(buildUrl('inventory/process/purchaseOrderDetail', { purchaseOrderId: item.id }), (resp) => {
      const ordersDeta = resp.data.map((item) => {
        item.nameProduct = item.invProduct.name
        return item;
      });
      setPurchaseDetail(ordersDeta);
      setBulkForm(item);
      setOpenModalViewOrders(false);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  return { dataOrders, openModalViewOrders, setOpenModalViewOrders, fnViewPurchaseOrders, fnViewOrder };
};
