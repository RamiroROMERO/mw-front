import { useState } from 'react';
import notification from '@Containers/ui/Notifications';
import { request } from '@Helpers/core';
import { validFloat } from '@Helpers/Utils';
import { buildApplyPayload } from './applyPricesRules';

// Legacy Controlpanel21.OptPages.Page1.btnGenAuxiliar.Click ("Aplic. Inv."): recalcula el
// costo prorrateado por línea, abre la modal de Actualizar Precios de Venta (siempre la
// variante multi-unidad, ver inv_prod_dist/sgh_empresas.vprod_many), y al aceptar regenera
// kardex + CxP. SPEC v2-27-sr: el back recalcula el costo y valida las distribuciones; del modal solo viajan los precios nuevos.
// Extraído de usePurchases.js para que ese hook no crezca más.
// `onApplied` (SPEC v2-29-sr): avisa que la compra quedó aplicada a inventario, para que la pantalla vuelva a pedir su estado.
export const usePurchaseApplyInventory = ({ setLoading, id, onApplied }) => {
  const [openModalApplyInventory, setOpenModalApplyInventory] = useState(false);
  const [applyInventoryRows, setApplyInventoryRows] = useState([]);

  const fnApplyInventory = () => {
    if (id === 0) {
      notification('warning', 'msg.required.saveDocument', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(`inventory/process/purchases/${id}/applyInventoryPreview`, (resp) => {
      setApplyInventoryRows(resp.data);
      setOpenModalApplyInventory(true);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  const fnUpdateApplyInventoryRow = (distId, field, value) => {
    setApplyInventoryRows((rows) => rows.map((row) => row.distId === distId ? { ...row, [field]: validFloat(value, 4) } : row));
  }

  const fnConfirmApplyInventory = () => {
    setLoading(true);
    request.POST(`inventory/process/purchases/${id}/applyInventory`, buildApplyPayload(applyInventoryRows), () => {
      notification('success', 'msg.success.applyInventory', 'alert.success.title');
      setOpenModalApplyInventory(false);
      setLoading(false);
      if (onApplied) onApplied();
    }, () => {
      setLoading(false);
    });
  }

  return {
    openModalApplyInventory, setOpenModalApplyInventory, applyInventoryRows,
    fnApplyInventory, fnUpdateApplyInventoryRow, fnConfirmApplyInventory
  };
}
