import { useMemo } from 'react';
import { IntlMessages, formatDate, formatNumber } from '@Helpers/Utils';
import { ModalSearchContent } from '@Components/modalSearch';

// Buscar orden de compra de esta pantalla: páginas de 50 con búsqueda en el servidor (proveedor, solicitante o número de orden).
// La tabla, la búsqueda incremental y la paginación son el modal compartido `@Components/modalSearch`; aquí solo se configura.
// (`ModalViewOrders` sigue siendo el de Compras y Boleto, que traen las órdenes de un proveedor ya cargadas.)
const ORDERS_URL = 'inventory/process/purchaseOrders';

const mapOrder = (item) => ({
  ...item,
  dateText: formatDate(item.date),
  provider: item.providerData?.name ?? '',
  address: item.providerData?.address ?? '',
  total: formatNumber(item.valueTotal, '', 2)
});

const ModalSearchOrders = ({ data, setOpen }) => {
  const { fnViewOrder } = data;

  // IntlMessages es un hook: se llama aquí arriba, no dentro de useMemo.
  const textDate = IntlMessages('page.purchaseOrders.modal.viewOrder.table.date');
  const textProvider = IntlMessages('page.purchaseOrders.modal.viewOrder.table.provider');
  const textValue = IntlMessages('page.purchaseOrders.modal.viewOrder.table.valuetotal');

  const columns = useMemo(() => [
    { text: textDate, dataField: 'dateText', headerStyle: { width: '15%' } },
    { text: textProvider, dataField: 'provider', headerStyle: { width: '70%' } },
    { text: textValue, dataField: 'total', headerStyle: { width: '15%' }, style: { textAlign: 'right' } }
  ], [textDate, textProvider, textValue]);

  const config = useMemo(() => ({
    url: ORDERS_URL, columns, onSelect: fnViewOrder, mapRow: mapOrder
  }), [columns, fnViewOrder]);

  return <ModalSearchContent data={config} setOpen={setOpen} />;
};

export default ModalSearchOrders;
