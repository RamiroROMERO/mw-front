import { useState } from 'react';
import { useIntl } from 'react-intl';
import notification from '@Containers/ui/Notifications';
import { request, notifyError } from '@Helpers/core';
import { formatNumber } from '@Helpers/Utils';
import { CODES, buildPayload, distributionStatus, rowsFromPreview, shouldOffer, validateDistribution } from './purchaseAdvanceRules';

// Legacy "Dist Anticipo" (inv_compras_dist_advance, SPEC v2-24-sr): distribuye anticipos del proveedor a una compra contabilizada.
// El modal se abre con el botón de la barra o se ofrece tras "Contabilizar" si el proveedor tiene anticipos con saldo. Las reglas
// (purchaseAdvanceRules.js) son las del back; el back sigue siendo quien decide y su mensaje real se muestra en un rechazo.
export const usePurchaseAdvances = ({ setLoading, purchase }) => {
  const intl = useIntl();
  const [openModal, setOpenModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [rows, setRows] = useState([]);
  const [openMsgUndo, setOpenMsgUndo] = useState(false);
  const [undoApplyId, setUndoApplyId] = useState(0);

  const baseUrl = (purchaseId) => `inventory/process/purchases/${purchaseId}/advances`;

  // GET del modal: anticipos con saldo, lo ya distribuido y el saldo de la CxP. Limpia lo digitado.
  const loadPreview = (purchaseId, onLoaded) => {
    request.GET(baseUrl(purchaseId), (resp) => {
      setPreview(resp.data);
      setRows(rowsFromPreview(resp.data));
      if (onLoaded) onLoaded(resp.data);
    }, (err) => {
      notifyError(err, 'msg.save.record.error');
      setLoading(false);
    });
  }

  const fnOpen = () => {
    const status = distributionStatus(purchase);
    if (status === 'notSaved') {
      notification('warning', 'msg.required.saveDocument', 'alert.warning.title');
      return;
    }
    if (status === 'notPosted') {
      notification('warning', 'page.purchases.advance.msg.notPosted', 'alert.warning.title');
      return;
    }
    setLoading(true);
    loadPreview(purchase.id, () => {
      setOpenModal(true);
      setLoading(false);
    });
  }

  // Tras "Contabilizar": solo se abre el modal si el proveedor tiene anticipos con saldo. Un fallo aquí no molesta al usuario.
  const fnOffer = (purchaseId) => {
    request.GET(baseUrl(purchaseId), (resp) => {
      if (!shouldOffer(resp.data)) return;
      setPreview(resp.data);
      setRows(rowsFromPreview(resp.data));
      setOpenModal(true);
    }, () => { });
  }

  const fnChangeAmount = (advanceId, value) => {
    setRows((current) => current.map((row) => (row.advanceId === advanceId ? { ...row, assigned: value } : row)));
  }

  // Texto de un problema de validación local (mismos códigos que los errores del back).
  const problemText = (problem) => {
    const values = { no: problem.advanceId, amount: formatNumber(problem.amount ?? 0), limit: formatNumber(problem.limit ?? 0) };
    const keys = {
      [CODES.ITEMS]: 'page.purchases.advance.error.itemsRequired',
      [CODES.AMOUNT]: 'page.purchases.advance.error.amountInvalid',
      [CODES.BALANCE]: 'page.purchases.advance.error.balanceExceeded',
      [CODES.CXP]: 'page.purchases.advance.error.cxpExceeded'
    };
    return intl.formatMessage({ id: keys[problem.code] }, values);
  }

  const fnDistribute = () => {
    const { problems, items } = validateDistribution({ rows, cxpBalance: preview?.purchase?.cxpBalance ?? 0 });
    if (problems.length > 0) {
      notification('warning', { text: problems.map(problemText).join('\n') }, 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.POST(baseUrl(purchase.id), buildPayload(items), () => {
      loadPreview(purchase.id, () => setLoading(false));
    }, () => {
      setLoading(false);
    });
  }

  const fnAskUndo = (applyId) => {
    setUndoApplyId(applyId);
    setOpenMsgUndo(true);
  }

  const fnOkUndo = () => {
    setOpenMsgUndo(false);
    setLoading(true);
    request.DELETE(`${baseUrl(purchase.id)}/${undoApplyId}`, () => {
      loadPreview(purchase.id, () => setLoading(false));
    }, () => {
      setLoading(false);
    });
  }

  return {
    openModal, setOpenModal, preview, rows, openMsgUndo, setOpenMsgUndo,
    fnOpen, fnOffer, fnChangeAmount, fnDistribute, fnAskUndo, fnOkUndo
  };
}
