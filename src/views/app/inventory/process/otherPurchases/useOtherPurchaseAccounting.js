import { useState } from 'react';
import notification from '@Containers/ui/Notifications';
import { request, notifyError } from '@Helpers/core';
import { accountingAction } from './otherPurchaseRules';

// Legacy Controlpanel21.OptPages.Page1.btnContabDocument.Click (inv_compras_others.sc2). SPEC v2-31-sr: ruta propia del módulo
// (POST inventory/process/otherPurchases/:id/accountDocument). Sin partida la genera; con partida la regenera con el mismo número
// ("Re-contabilizar", que pide 11.01.015 además de 11.01.026). Un rechazo del back (período cerrado, cuenta bloqueada, partida que no
// cuadra, privilegio) muestra su mensaje real.
export const useOtherPurchaseAccounting = ({ setLoading, id, pdaNumber, setBulkForm }) => {
  const [openMsgAccountDocument, setOpenMsgAccountDocument] = useState(false);
  const action = accountingAction({ id, pdaNumber });

  const fnAccountDocument = () => {
    if (action.mode === 'none') {
      notification('warning', 'msg.required.saveDocument', 'alert.warning.title');
      return;
    }
    setOpenMsgAccountDocument(true);
  }

  const fnOkAccountDocument = () => {
    setLoading(true);
    request.POST(`inventory/process/otherPurchases/${id}/accountDocument`, {}, (resp) => {
      setBulkForm({ pdaNumber: resp?.data?.numberPDA || 0 });
      notification('success', 'msg.success.accountDocument', 'alert.success.title');
      setOpenMsgAccountDocument(false);
      setLoading(false);
    }, (resp) => {
      notifyError(resp, 'msg.save.record.error');
      setOpenMsgAccountDocument(false);
      setLoading(false);
    }, false);
  }

  return { openMsgAccountDocument, setOpenMsgAccountDocument, fnAccountDocument, fnOkAccountDocument, accountButtonId: action.buttonId, accountConfirmId: action.confirmId };
}
