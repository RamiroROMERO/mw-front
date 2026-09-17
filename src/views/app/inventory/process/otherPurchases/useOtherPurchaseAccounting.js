import { useState } from 'react';
import notification from '@Containers/ui/Notifications';
import { request } from '@Helpers/core';

// Legacy Controlpanel21.OptPages.Page1.btnContabDocument.Click (inv_compras_others.sc2): genera
// la partida contable y la cuenta por pagar del documento de gasto. Mismo endpoint compartido con
// Compras (modules/inventory/purchases/PurchaseAccountingService, rama isExpense) — ver
// usePurchaseAccounting.js (pantalla purchases) como patrón hermano.
export const useOtherPurchaseAccounting = ({ setLoading, id, setBulkForm }) => {
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
    request.POST(`inventory/process/purchases/${id}/accountDocument`, {}, (resp) => {
      setBulkForm({ pdaNumber: resp?.data?.numberPDA || 0 });
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
