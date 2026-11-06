import { useState } from 'react';
import { useIntl } from 'react-intl';
import notification from '@Containers/ui/Notifications';
import { request, notifyError, buildUrl } from '@Helpers/core';
import { formatDate, formatNumber } from '@Helpers/Utils';
import { CODES, rowsFromPreview, validateRows, buildPayload } from './receiptRules';

// Legacy "Validación de Ingresos" (inv_compras_valid, SPEC v2-26-sr): registra la cantidad y el vencimiento realmente recibidos de cada
// movimiento de kardex de una compra ya aplicada a inventario. Las reglas (receiptRules.js) son las del back; el back sigue siendo quien
// decide y su mensaje real se muestra en un rechazo, conservando lo digitado.
export const usePurchaseReceipts = ({ setLoading }) => {
  const intl = useIntl();
  const [purchase, setPurchase] = useState(null);
  const [preview, setPreview] = useState(null);
  const [rows, setRows] = useState([]);
  const [problems, setProblems] = useState([]);
  const [dataPurchases, setDataPurchases] = useState([]);
  const [openModalPurchases, setOpenModalPurchases] = useState(false);
  const [openMsgSave, setOpenMsgSave] = useState(false);
  const [pendingLines, setPendingLines] = useState([]);

  const receiptsUrl = (purchaseId) => `inventory/process/purchases/${purchaseId}/receipts`;

  // GET de la vista previa: una fila por movimiento de kardex con lo recibido actual. Limpia lo digitado y los problemas.
  const loadPreview = (purchaseId, onLoaded) => {
    request.GET(receiptsUrl(purchaseId), (resp) => {
      setPreview(resp.data);
      setRows(rowsFromPreview(resp.data));
      setProblems([]);
      if (onLoaded) onLoaded(resp.data);
    }, (err) => {
      notifyError(err, 'msg.save.record.error');
      setLoading(false);
    });
  }

  const fnNew = () => {
    setPurchase(null);
    setPreview(null);
    setRows([]);
    setProblems([]);
    setPendingLines([]);
  }

  // Mismo buscador de Compras: lista las compras normales (el back rechaza las complementarias al cargar la vista previa).
  const fnSearch = () => {
    setLoading(true);
    request.GET(buildUrl('inventory/process/purchases', { isExpense: 0 }), (resp) => {
      setDataPurchases(resp.data.map((item) => ({
        ...item,
        provider: item.providerData?.name,
        dateIn: formatDate(item.date),
        valueTotal: formatNumber(item.total)
      })));
      setOpenModalPurchases(true);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  // Interfaz que espera ModalViewPurchases: setBulkForm(item) con la compra elegida y fnGetDataDetail(id) para cargar su detalle.
  const fnSelectPurchase = (item) => setPurchase(item);
  const fnLoadDetail = (purchaseId) => {
    setLoading(true);
    loadPreview(purchaseId, () => setLoading(false));
  }

  const fnChangeRow = (kardexId, field, value) => {
    setRows((current) => current.map((row) => (row.kardexId === kardexId ? { ...row, [field]: value } : row)));
    setProblems((current) => current.filter((problem) => !(problem.kardexId === kardexId && problem.field === field)));
  }

  const problemText = (problem) => {
    const row = rows.find((item) => item.kardexId === problem.kardexId);
    const keys = {
      [CODES.LINES]: 'page.purchaseReceipts.error.noChanges',
      [CODES.QTY]: 'page.purchaseReceipts.error.qtyInvalid',
      [CODES.DATE]: 'page.purchaseReceipts.error.dateInvalid'
    };
    return intl.formatMessage({ id: keys[problem.code] }, { product: row?.productCode ?? '' });
  }

  // Guardar: valida lo digitado sin llamar al back; si todo es válido pide confirmación.
  const fnSave = () => {
    if (!purchase || !preview) {
      notification('warning', 'page.purchaseReceipts.msg.selectPurchase', 'alert.warning.title');
      return;
    }
    const result = validateRows(rows);
    setProblems(result.problems);
    if (result.problems.length > 0) {
      notification('warning', { text: result.problems.map(problemText).join('\n') }, 'alert.warning.title');
      return;
    }
    setPendingLines(result.lines);
    setOpenMsgSave(true);
  }

  // PUT del back. Un rechazo (período cerrado, producto consumido, etc.) lo muestra `request` con su mensaje real y la tabla conserva
  // lo digitado; un éxito recarga la vista previa para ver el resultado.
  const fnOkSave = () => {
    setOpenMsgSave(false);
    setLoading(true);
    request.PUT(receiptsUrl(purchase.id), buildPayload(pendingLines), () => {
      loadPreview(purchase.id, () => setLoading(false));
    }, () => {
      setLoading(false);
    });
  }

  return {
    purchase, preview, rows, problems, dataPurchases, openModalPurchases, setOpenModalPurchases, openMsgSave, setOpenMsgSave,
    fnNew, fnSearch, fnSave, fnOkSave, fnSelectPurchase, fnLoadDetail, fnChangeRow
  };
}
