import { useEffect, useState } from 'react';
import { IntlMessagesFn } from '@Helpers/Utils';
import { request, notifyError } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import { toggleStore, buildStoreIds, shouldAssignStores } from './storeSelectionRules';

// Modal "Agregar producto a los siguientes almacenes" (SPEC v2-08-sr): se abre solo tras el alta desde el formulario. Pide los
// almacenes elegibles (tipo 1, activos) y, al aceptar, asigna el producto recién creado a los marcados.
export const useModalAddToStores = ({ productCode, setOpen }) => {
  const [stores, setStores] = useState([]);
  const [selected, setSelected] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const msgAdded = IntlMessagesFn('page.productsCatalog.msg.productAdded');

  useEffect(() => {
    request.GET('inventory/settings/productsStore/availableStores', (res) => {
      setStores(res?.data || []);
      setLoaded(true);
    }, (err) => {
      setLoaded(true);
      notifyError(err, 'page.productsCatalog.msg.storesLoadError');
    });
  }, []);

  const onToggle = (storeId, checked) => setSelected((prev) => toggleStore(prev, storeId, checked));

  const fnAccept = () => {
    const storeIds = buildStoreIds(selected);
    if (!shouldAssignStores(productCode, storeIds)) {
      setOpen(false);
      return;
    }
    setSaving(true);
    request.POST('inventory/settings/productsStore/assignStores', { productCode, storeIds }, () => {
      setSaving(false);
      NotificationManager.success(msgAdded, '', 4000, null, null, '');
      setOpen(false);
    }, (err) => {
      setSaving(false);
      notifyError(err, 'msg.save.record.error');
    }, false);
  };

  const fnCancel = () => setOpen(false);

  return { stores, selected, loaded, saving, onToggle, fnAccept, fnCancel };
};

export default useModalAddToStores;
