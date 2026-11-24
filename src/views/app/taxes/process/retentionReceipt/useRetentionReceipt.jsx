import { useEffect, useMemo, useState } from 'react';
import { useForm } from '@Hooks';
import { request, notifyError, buildUrl } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';
import { printDocument } from '@Helpers/printDocument';
import {
  INITIAL_LINE, INITIAL_RECEIPT, RECEIPT_URL, accountAction, buildPayload, caiAction, invoiceToLine, mapDetailToLines, mapReceiptToForm,
  providerOptions, printOptions, receiptState, receiptTotal, typeOptions, validateLine, validateReceipt
} from './retentionReceiptRules';

// Comprobante de retención (imp_retenciones.sc2, SPEC v2-113-sr). Un solo POST o PUT guarda cabecera y líneas en una transacción del back (que calcula las retenciones, el
// total y todo lo fiscal). Número fiscal, Contabilizar y Anular son pasos propios con confirmación. Se edita hasta contabilizar; contabilizado o anulado queda de solo lectura.
export const useRetentionReceipt = ({ setLoading }) => {
  const [listDocuments, setListDocuments] = useState([]);
  const [listProviders, setListProviders] = useState([]);
  const [listTypes, setListTypes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [details, setDetails] = useState([]);
  const [line, setLine] = useState({ ...INITIAL_LINE });
  const [sendForm, setSendForm] = useState(false);
  const [sendLine, setSendLine] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [openInvoices, setOpenInvoices] = useState(false);
  const [openMsgCai, setOpenMsgCai] = useState(false);
  const [openMsgAccount, setOpenMsgAccount] = useState(false);
  const [openMsgCancel, setOpenMsgCancel] = useState(false);

  const { formState, onInputChange, setBulkForm, onResetForm } = useForm({ ...INITIAL_RECEIPT }, {});
  const state = receiptState(formState);
  const errors = useMemo(() => validateReceipt(formState, details), [formState, details]);
  const lineErrors = useMemo(() => validateLine(line, details), [line, details]);
  const total = useMemo(() => receiptTotal(details), [details]);
  const typeById = useMemo(() => Object.fromEntries(listTypes.map((type) => [type.value, type])), [listTypes]);

  const fnNewDocument = () => {
    onResetForm();
    setDetails([]);
    setLine({ ...INITIAL_LINE });
    setSendForm(false);
    setSendLine(false);
  };

  // Carga el comprobante guardado (el listado solo trae un resumen).
  const fnLoadDocument = (row) => {
    setLoading(true);
    request.GET(`${RECEIPT_URL}/${row.id}`, (resp) => {
      setBulkForm(mapReceiptToForm(resp.data));
      setDetails(mapDetailToLines(resp.data?.details));
      setLine({ ...INITIAL_LINE });
      setSendForm(false);
      setSendLine(false);
      setOpenSearch(false);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  };

  const fnSearchDocument = () => setOpenSearch(true);

  // Cambiar el proveedor invalida las líneas (sus facturas son de otro proveedor).
  const onProviderChange = (event) => {
    onInputChange(event);
    if (details.length > 0) setDetails([]);
    setLine({ ...INITIAL_LINE });
  };

  const onLineChange = ({ target }) => setLine((prev) => ({ ...prev, [target.name]: target.value }));

  // El tipo trae su porcentaje y su nombre (el back vuelve a leerlos del catálogo).
  const onTypeChange = ({ target }) => {
    const type = typeById[target.value];
    setLine((prev) => ({ ...prev, withholdingTypeId: target.value, description: type?.name ?? '', percentValue: type ? String(type.percentValue) : prev.percentValue }));
  };

  // Facturas que se pueden retener (el back excluye las ya retenidas y las sin saldo a crédito).
  const fnViewInvoices = () => {
    if (!(Number(formState.providerId) > 0)) {
      notification('warning', 'msg.required.select.provider', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(buildUrl(`${RECEIPT_URL}/availableInvoices`, { providerId: formState.providerId, receiptId: formState.id > 0 ? formState.id : undefined, limit: 200 }), (resp) => {
      setInvoices(resp.data || []);
      setOpenInvoices(true);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  };

  const fnSelectInvoice = (invoice) => {
    setLine({ ...invoiceToLine(invoice) });
    setSendLine(false);
    setOpenInvoices(false);
  };

  const fnAddLine = () => {
    setSendLine(true);
    if (Object.keys(lineErrors).length > 0) return;
    setDetails((prev) => [...prev, { ...line }]);
    setLine({ ...INITIAL_LINE });
    setSendLine(false);
  };

  const fnRemoveLine = (index) => setDetails((prev) => prev.filter((_, i) => i !== index));

  const fnSaveDocument = () => {
    if (state.locked) {
      notification('warning', state.isVoided ? 'page.retentionReceipt.msg.voided' : 'page.retentionReceipt.msg.alreadyPosted', 'alert.warning.title');
      return;
    }
    setSendForm(true);
    if (errors.details && !errors.date && !errors.documentCode && !errors.providerId) {
      notification('warning', errors.details, 'alert.warning.title');
    }
    if (Object.keys(errors).length > 0) return;

    const payload = buildPayload(formState, details);
    const done = (resp) => {
      notification('success', 'msg.success.save', 'alert.success.title');
      fnLoadDocument({ id: resp?.data?.id || formState.id });
    };
    const fail = (resp) => {
      notifyError(resp, 'msg.save.record.error');
      setLoading(false);
    };
    setLoading(true);
    if (Number(formState.id) > 0) request.PUT(`${RECEIPT_URL}/${formState.id}`, payload, done, fail, false);
    else request.POST(RECEIPT_URL, payload, done, fail, false);
  };

  const askConfirm = (action, openFn) => {
    const result = action(formState);
    if (result !== 'ok') {
      notification('warning', result, 'alert.warning.title');
      return;
    }
    openFn(true);
  };
  const fnGenerateCai = () => askConfirm(caiAction, setOpenMsgCai);
  const fnAccountDocument = () => askConfirm(accountAction, setOpenMsgAccount);
  const fnCancelDocument = () => {
    if (!state.canCancel) {
      notification('warning', state.saved ? 'page.retentionReceipt.msg.voided' : 'page.retentionReceipt.msg.saveFirst', 'alert.warning.title');
      return;
    }
    setOpenMsgCancel(true);
  };

  // Un paso del back: éxito -> aviso y se recarga lo guardado; rechazo -> mensaje real del back y el documento no cambia.
  const stepHandlers = (successId, closeFn) => [
    () => {
      notification('success', successId, 'alert.success.title');
      closeFn(false);
      fnLoadDocument({ id: formState.id });
    },
    (resp) => {
      notifyError(resp, 'msg.save.record.error');
      closeFn(false);
      setLoading(false);
    }
  ];
  const fnOkGenerateCai = () => {
    const [done, fail] = stepHandlers('page.retentionReceipt.msg.caiGenerated', setOpenMsgCai);
    setLoading(true);
    request.POST(`${RECEIPT_URL}/${formState.id}/generateCai`, {}, done, fail, false);
  };
  const fnOkAccountDocument = () => {
    const [done, fail] = stepHandlers('msg.success.accountDocument', setOpenMsgAccount);
    setLoading(true);
    request.POST(`${RECEIPT_URL}/${formState.id}/accountDocument`, {}, done, fail, false);
  };
  const fnOkCancelDocument = () => {
    const [done, fail] = stepHandlers('page.retentionReceipt.msg.cancelled', setOpenMsgCancel);
    setLoading(true);
    request.DELETE(`${RECEIPT_URL}/${formState.id}`, done, fail, false);
  };

  // Se imprime lo GUARDADO en DB (por GET); sin comprobante guardado avisa "guarde primero".
  const fnPrintDocument = () => printDocument({ ...printOptions(formState.id), setLoading });
  const fnPrintCopy = () => printDocument({ ...printOptions(formState.id, true), setLoading });

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: fnSaveDocument,
    fnPrint: fnPrintDocument,
    fnCancel: fnCancelDocument,
    buttonsHome: [
      { title: 'page.retentionReceipt.button.generateCai', icon: 'bi bi-upc-scan', onClick: fnGenerateCai },
      { title: 'page.retentionReceipt.button.account', icon: 'bi bi-journal-check', onClick: fnAccountDocument }
    ],
    buttonsOptions: [
      { title: 'page.retentionReceipt.button.printCopy', icon: 'bi bi-files', onClick: fnPrintCopy }
    ],
    buttonsAdmin: []
  };

  useEffect(() => {
    request.GET('admin/documents?status=1&useTax=1', (resp) => {
      setListDocuments(resp.data.map((item) => ({ value: item.code, label: `${item.code} | ${item.name}` })));
    }, () => { });
    request.GET('inventory/process/providers/getSL', (resp) => {
      setListProviders(providerOptions(resp.data));
    }, () => { });
    request.GET('tax/settings/withholdingTypes/getSL', (resp) => {
      setListTypes(typeOptions(resp.data));
    }, () => { });
  }, []);

  return {
    formState, onInputChange, onProviderChange, errors, sendForm, state, total, details, line, lineErrors, sendLine, onLineChange, onTypeChange,
    listDocuments, listProviders, listTypes, invoices, fnViewInvoices, fnSelectInvoice, fnAddLine, fnRemoveLine,
    propsToControlPanel, openSearch, setOpenSearch, fnLoadDocument, openInvoices, setOpenInvoices,
    openMsgCai, setOpenMsgCai, fnOkGenerateCai, openMsgAccount, setOpenMsgAccount, fnOkAccountDocument, openMsgCancel, setOpenMsgCancel, fnOkCancelDocument
  };
};
