import { useEffect, useMemo, useState } from 'react'
import notification from '@Containers/ui/Notifications';
import { useForm } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { printDocument } from '@Helpers/printDocument';
import { formatDate, formatNumber, validFloat } from '@Helpers/Utils';
import { usePurchaseFormLists } from './usePurchaseFormLists';
import { usePurchaseOrders } from './usePurchaseOrders';
import { usePurchaseApplyInventory } from './usePurchaseApplyInventory';
import { usePurchaseAccounting } from './usePurchaseAccounting';
import { usePurchaseAdvances } from './usePurchaseAdvances';
import { usePurchaseComplementary } from './usePurchaseComplementary';
import { buildPurchasePayload, calculateTotals, CASH, formFromSaved, invoiceNumberChanged, validateHeader } from './purchaseRules';
import { distributionStatus } from './purchaseAdvanceRules';

export const usePurchases = ({ setLoading, onResetFormDeta, purchaseDetail, setPurchaseDetail }) => {

  const { listDocuments, listStores, listProviders, listPaymentTypes } = usePurchaseFormLists({ setLoading });
  const [dataPurchases, setdataPurchases] = useState([]);
  const [openModalPurchases, setOpenModalPurchases] = useState(false);
  const [openMsgCancelPurchase, setOpenMsgCancelPurchase] = useState(false);
  const [openModalExonerated, setOpenModalExonerated] = useState(false);
  const [openModalImportation, setOpenModalImportation] = useState(false);
  const [sendFormDeta, setSendFormDeta] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  // Las reglas del encabezado viven en purchaseRules.js (mismas del PurchaseDTO del back); useForm solo guarda el estado.
  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    pdaNumber: 0,
    documentCode: '',
    documentId: 0,
    date: '',
    providerId: 0,
    cai: '',
    invoiceNumber: '',
    storeId: 0,
    valueSubtotal: 0,
    valueDiscount: 0,
    valueExonerated: 0,
    valueExempt: 0,
    valueTaxable: 0,
    valueTax: 0,
    freight: 0,
    otherCharges: 0,
    valueTotal: 0,
    typeFp: 0,
    dateOut: '',
    paymentTypeId: 0,
    expenseCtaCode: '',
    purchaseOrderId: 0,
    requestedBy: '',
    description: '',
    providerType: 0,
    bonification: 0,
    exemptedCertificate: '',
    exemptedNumber: '',
    exemptedRecord: '',
    importNumberDua: '',
    importTicket: '',
    importCif: 0,
    importDai: 0,
    importSelectiveTax: 0
  }, {});

  const { id, pdaNumber, providerId, date, dateOut, typeFp, freight, otherCharges, valueTotal } = formState;

  const headerErrors = useMemo(() => validateHeader(formState), [formState]);
  const formValidation = useMemo(() => Object.fromEntries(Object.entries(headerErrors).map(([field, message]) => [`${field}Valid`, message])), [headerErrors]);
  const isFormValid = Object.keys(headerErrors).length === 0;

  // Los totales salen siempre del detalle completo (altas, ediciones, bajas, compras cargadas y órdenes importadas).
  useEffect(() => {
    setBulkForm(calculateTotals(purchaseDetail, { freight, otherCharges }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseDetail, freight, otherCharges]);

  // En Contado el vencimiento es la fecha de la factura y el campo queda deshabilitado.
  useEffect(() => {
    if (Number(typeFp) === CASH && dateOut !== date) setBulkForm({ dateOut: date });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFp, date]);

  const { dataOrders, openModalViewOrders, setOpenModalViewOrders, fnViewPurchaseOrders, fnViewOrder, openMsgReplaceDetail, setOpenMsgReplaceDetail, fnOkReplaceDetail } = usePurchaseOrders({
    setLoading,
    providerId,
    purchaseId: id,
    purchaseDetail,
    setPurchaseDetail,
    setBulkForm
  });

  const { openModalApplyInventory, setOpenModalApplyInventory, applyInventoryRows, fnApplyInventory,
    fnUpdateApplyInventoryRow, fnConfirmApplyInventory } = usePurchaseApplyInventory({ setLoading, id });

  // Distribuir anticipos (SPEC v2-24-sr): botón de la barra y oferta tras contabilizar.
  const propsToAdvances = usePurchaseAdvances({ setLoading, purchase: { id, pdaNumber } });

  const { openMsgAccountDocument, setOpenMsgAccountDocument, fnAccountDocument, fnOkAccountDocument } = usePurchaseAccounting({
    setLoading,
    id,
    onAccounted: (data) => {
      setBulkForm({ pdaNumber: data?.numberPDA || 0 });
      propsToAdvances.fnOffer(id);
    }
  });

  const propsToComplementary = usePurchaseComplementary({ setLoading, fatherId: id, listProviders, listPaymentTypes });
  const { fnComplementaryInvoices } = propsToComplementary;

  const fnNewPurchase = () => {
    onResetForm();
    onResetFormDeta();
    setPurchaseDetail([]);
    setSendForm(false);
    setSendFormDeta(false);
  }

  const fnSearchPurchases = () => {
    setLoading(true);
    request.GET(buildUrl('inventory/process/purchases', { isExpense: 0 }), (resp) => {
      const purchases = resp.data.map((item) => {
        item.provider = item.providerData.name
        item.dateIn = formatDate(item.date)
        item.valueTotal = formatNumber(item.total)
        item.valueSubtotal = formatNumber(item.subtotal)
        item.valueDiscount = formatNumber(item.discount)
        item.valueTax = formatNumber(item.tax)
        return item;
      });
      setdataPurchases(purchases);
      setOpenModalPurchases(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnSavePurchase = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }
    if (purchaseDetail.length === 0 || validFloat(valueTotal) === 0) {
      notification('warning', 'msg.required.input.totalOrderProcess', 'alert.warning.title');
      return;
    }

    // Un solo POST o PUT con la cabecera y las líneas: el back calcula los importes, asigna el correlativo y el N° de factura final
    // (puede llevar el sufijo -1, -2 si el proveedor ya lo usó) y devuelve los totales. Una compra con error no queda a medias.
    const isNew = id === 0;
    const payload = buildPurchasePayload(formState, purchaseDetail, { isNew });
    const onSaved = (resp) => {
      const saved = resp.data;
      setBulkForm(formFromSaved(saved));
      if (invoiceNumberChanged(formState.invoiceNumber, saved.invoiceNumber)) {
        notification('warning', 'msg.purchase.invoiceNumber.suffixed', 'alert.warning.title');
      }
      setSendForm(false);
      setLoading(false);
    };
    setLoading(true);
    if (isNew) {
      request.POST('inventory/process/purchases', payload, onSaved, () => { setLoading(false); });
    } else {
      request.PUT(`inventory/process/purchases/${id}`, payload, onSaved, () => { setLoading(false); });
    }
  }

  // SPEC v2-28-sr: se imprime lo GUARDADO en DB por GET; sin compra guardada avisa "guarde primero" sin llamar al back.
  const fnPrintPurchase = () => {
    printDocument({
      path: 'inventory/process/purchases',
      id,
      fileName: 'Compra de Inventario.pdf',
      setLoading
    });
  }

  const fnCancelPurchase = () => {
    if (id > 0) {
      setOpenMsgCancelPurchase(true);
    }
  }

  const fnOkCancelPurchase = () => {
    setLoading(true);
    request.POST(`inventory/process/purchases/${id}/cancel`, {}, () => {
      notification('success', 'msg.success.cancelPurchase', 'alert.success.title');
      setOpenMsgCancelPurchase(false);
      setLoading(false);
      fnNewPurchase();
    }, (resp) => {
      const messageKey = resp?.messages?.[0]?.message || 'msg.save.record.error';
      notification('error', messageKey, 'alert.error.title');
      setOpenMsgCancelPurchase(false);
      setLoading(false);
    }, false);
  }

  const fnPaymentTerms = () => { }

  const fnExonerated = () => { setOpenModalExonerated(true); }

  const fnImportation = () => { setOpenModalImportation(true); }

  const fnReportPurchases = () => { }

  const propsToControlPanel = {
    fnNew: fnNewPurchase,
    fnSearch: fnSearchPurchases,
    fnSave: fnSavePurchase,
    fnPrint: fnPrintPurchase,
    fnCancel: fnCancelPurchase,
    buttonsHome: [
      {
        title: "button.paymentTerms",
        icon: "bi bi-cash-coin",
        onClick: fnPaymentTerms
      },
      {
        title: "button.applyInventory",
        icon: "bi bi-check2",
        onClick: fnApplyInventory
      },
      {
        title: "button.count",
        icon: "bi bi-journal-check",
        onClick: fnAccountDocument
      },
      {
        title: "button.distAdvance",
        icon: "bi bi-cash-stack",
        onClick: propsToAdvances.fnOpen,
        disabled: distributionStatus({ id, pdaNumber }) !== 'ok'
      },
      {
        title: "button.exonerated",
        icon: "bi bi-list-check",
        onClick: fnExonerated
      },
      {
        title: "button.importation",
        icon: "bi bi-book-half",
        onClick: fnImportation
      },
      {
        title: "button.complementaryInvoices",
        icon: "bi bi-receipt-cutoff",
        onClick: fnComplementaryInvoices
      },
      {
        title: "button.viewPurchaseOrders",
        icon: "bi bi-file-earmark-text",
        onClick: fnViewPurchaseOrders
      },
      {
        title: "button.reportPurchases",
        icon: "bi bi-card-checklist",
        onClick: fnReportPurchases
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  return {
    listDocuments,
    listPaymentTypes,
    listProviders,
    listStores,
    propsToControlPanel,
    openModalPurchases,
    setOpenModalPurchases,
    openMsgCancelPurchase,
    setOpenMsgCancelPurchase,
    fnOkCancelPurchase,
    sendForm,
    formState,
    formValidation,
    onInputChange,
    setBulkForm,
    sendFormDeta,
    setSendFormDeta,
    dataPurchases,
    dataOrders,
    openModalViewOrders,
    setOpenModalViewOrders,
    fnViewOrder,
    openMsgReplaceDetail,
    setOpenMsgReplaceDetail,
    fnOkReplaceDetail,
    openModalApplyInventory,
    setOpenModalApplyInventory,
    applyInventoryRows,
    fnUpdateApplyInventoryRow,
    fnConfirmApplyInventory,
    openMsgAccountDocument,
    setOpenMsgAccountDocument,
    fnOkAccountDocument,
    openModalExonerated,
    setOpenModalExonerated,
    openModalImportation,
    setOpenModalImportation,
    propsToComplementary,
    propsToAdvances
  };
}