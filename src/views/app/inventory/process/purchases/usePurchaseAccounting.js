import { useState } from 'react';
import notification from '@Containers/ui/Notifications';
import { request } from '@Helpers/core';

// Legacy Controlpanel21.OptPages.Page1.btnContabDocument.Click ("Contab Document" / genpartida):
// genera la partida contable (Cont_PDA/Cont_PDA1) de la compra usando las cuentas configuradas
// en el proveedor y el almacén. Extraído de usePurchases.js siguiendo el mismo patrón que
// usePurchaseApplyInventory.js.
export const usePurchaseAccounting = ({ setLoading, id }) => {
  const [openMsgAccountDocument, setOpenMsgAccountDocument] = useState(false);

  const fnAccountDocument = () => {
    if (id === 0) {
      notification('warning', 'msg.required.saveDocument', 'alert.warning.title');
      return;
    }
    setOpenMsgAccountDocument(true);
  }

  const fnOkAccountDocument = () => {
    setLoading(true);
    request.POST(`inventory/process/purchases/${id}/accountDocument`, {}, () => {
      notification('success', 'msg.success.accountDocument', 'alert.success.title');
      setOpenMsgAccountDocument(false);
      setLoading(false);
    }, (resp) => {
      const messageKey = resp?.messages?.[0]?.message || 'msg.save.record.error';
      notification('error', messageKey, 'alert.error.title');
      setOpenMsgAccountDocument(false);
      setLoading(false);
    }, false);
  }

  return { openMsgAccountDocument, setOpenMsgAccountDocument, fnAccountDocument, fnOkAccountDocument };
}
