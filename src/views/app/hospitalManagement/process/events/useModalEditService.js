import { useState } from 'react'
import { IntlMessages } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';
import { detailPath, validateProviders, buildProvidersPayload, splitProvider } from './eventDetailRules';

// SPEC v2-152-sr: los honorarios del servicio se editan en pantalla y se guardan JUNTOS con un solo PUT (el back reemplaza todos, como el legacy). La suma de los totales de los
// proveedores debe ser el valor del servicio (cantidad x precio).
export const useModalEditService = ({ setLoading, currentItem, event, fnGetDataDetail }) => {
  const [providers, setProviders] = useState(() => (currentItem?.providers || []).map((p) => ({ ...p })));
  const [openModalProvider, setOpenModalProvider] = useState(false);
  const [currentProviderItem, setCurrentProviderItem] = useState({});
  const [editIndex, setEditIndex] = useState(-1);

  const rows = providers.map((p) => ({ ...p, ...splitProvider(p), providerName: p.providerName || '' }));

  const fnOpenProvider = (index) => {
    setEditIndex(index);
    setCurrentProviderItem(index >= 0 ? providers[index] : { providerId: 0, quantity: currentItem.quantity, price: currentItem.price, hospValue: 0 });
    setOpenModalProvider(true);
  };

  const fnSaveProvider = (row) => {
    setProviders((prev) => (editIndex >= 0 ? prev.map((p, i) => (i === editIndex ? row : p)) : [...prev, row]));
    setOpenModalProvider(false);
  };

  const fnRemoveProvider = (index) => setProviders((prev) => prev.filter((_, i) => i !== index));

  const fnSave = () => {
    const problem = validateProviders(providers, currentItem);
    if (problem) {
      notification('warning', problem, 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.PUT(`${detailPath(event)}/${currentItem.id}/providers`, buildProvidersPayload(providers), () => {
      setLoading(false);
      fnGetDataDetail();
    }, () => {
      setLoading(false);
    });
  };

  const table = {
    title: '',
    columns: [
      { text: IntlMessages("table.column.provider"), dataField: "providerName", headerStyle: { 'width': '30%' } },
      { text: IntlMessages("table.column.qty"), dataField: "quantity", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("table.column.price"), dataField: "price", headerStyle: { 'width': '10%' } },
      { text: IntlMessages("input.hospValue"), dataField: "hospValue", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("input.provValue"), dataField: "provValue", headerStyle: { 'width': '15%' } },
      { text: IntlMessages("table.column.total"), dataField: "total", headerStyle: { 'width': '10%' } }
    ],
    data: rows,
    options: { columnActions: 'options' },
    actions: [
      { color: 'warning', icon: 'pencil', onClick: (item) => fnOpenProvider(rows.indexOf(item)), toolTip: IntlMessages("button.edit") },
      { color: 'danger', icon: 'trash', onClick: (item) => fnRemoveProvider(rows.indexOf(item)), toolTip: IntlMessages("button.delete") },
      { color: 'primary', icon: 'plus', onClick: () => fnOpenProvider(-1), title: IntlMessages("button.add"), isFreeAction: true }
    ]
  };

  return { table, openModalProvider, setOpenModalProvider, currentProviderItem, fnSaveProvider, fnSave };
}
