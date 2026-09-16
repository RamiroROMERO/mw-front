import { useState } from 'react'
import notification from '@Containers/ui/Notifications';
import { useForm } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { formatDate, formatNumber, validFloat, validInt } from '@Helpers/Utils';
import { usePurchaseFormLists } from './usePurchaseFormLists';
import { usePurchaseOrders } from './usePurchaseOrders';
import { usePurchaseApplyInventory } from './usePurchaseApplyInventory';
import { usePurchaseAccounting } from './usePurchaseAccounting';
import { usePurchaseComplementary } from './usePurchaseComplementary';

export const usePurchases = ({ setLoading, onResetFormDeta, purchaseDetail, setPurchaseDetail }) => {

  const { listDocuments, listStores, listProviders, listPaymentTypes } = usePurchaseFormLists({ setLoading });
  const [dataPurchases, setdataPurchases] = useState([]);
  const [openModalPurchases, setOpenModalPurchases] = useState(false);
  const [openMsgCancelPurchase, setOpenMsgCancelPurchase] = useState(false);
  const [openModalExonerated, setOpenModalExonerated] = useState(false);
  const [openModalImportation, setOpenModalImportation] = useState(false);
  const [sendFormDeta, setSendFormDeta] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const purchasesValid = {
    documentCode: [(val) => val !== "", "msg.required.select.typeDocument"],
    providerId: [(val) => validInt(val) > 0, "msg.required.select.provider"],
    cai: [(val) => val !== "", "msg.required.input.numInvoice"],
    numCai: [(val) => val !== "", "msg.required.input.numInvoice"],
    date: [(val) => val !== "", "msg.required.input.date"],
    dateOut: [(val) => val !== "", "msg.required.input.date"],
    typeDocto: [(val) => validInt(val) > 0, "msg.required.select.typePurchase"]
  };

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    documentCode: '',
    documentId: 0,
    date: '',
    providerId: 0,
    cai: '',
    numCai: '',
    storeId: 0,
    valueSubtotal: 0,
    valueDiscount: 0,
    exonera: 0,
    exent: 0,
    gravado: 0,
    valueTax: 0,
    freight: 0,
    otherCharges: 0,
    valueTotal: 0,
    typeDocto: 0,
    dateOut: '',
    paymentTypeId: 0,
    noCtaExpense: '',
    orderId: 0,
    nameRequire: '',
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
    importSelect: 0
  }, purchasesValid);

  const { id, documentCode, documentId, storeId, providerId, paymentTypeId, cai, numCai, date, dateOut, nameRequire, orderId, typeDocto, valueSubtotal, valueDiscount, exent, exonera, gravado, valueTax, freight, otherCharges, valueTotal, providerType, description, noCtaExpense, exemptedCertificate, exemptedNumber, exemptedRecord, importNumberDua, importTicket, importCif, importDai, importSelect } = formState;

  const { dataOrders, openModalViewOrders, setOpenModalViewOrders, fnViewPurchaseOrders, fnViewOrder } = usePurchaseOrders({
    setLoading,
    providerId,
    setPurchaseDetail,
    setBulkForm
  });

  const { openModalApplyInventory, setOpenModalApplyInventory, applyInventoryRows, fnApplyInventory,
    fnUpdateApplyInventoryRow, fnConfirmApplyInventory } = usePurchaseApplyInventory({ setLoading, id });

  const { openMsgAccountDocument, setOpenMsgAccountDocument, fnAccountDocument, fnOkAccountDocument } = usePurchaseAccounting({ setLoading, id });

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
    if (valueTotal === 0) {
      notification('warning', 'msg.required.input.totalOrderProcess', 'alert.warning.title');
      return;
    }

    const newPurchase = {
      documentCode,
      documentId,
      date,
      providerId,
      cai,
      numCai,
      storeId,
      subtotal: valueSubtotal,
      discount: valueDiscount,
      exonera,
      exent,
      gravado,
      tax: valueTax,
      freight,
      otherCharges,
      total: valueTotal,
      typeDocto,
      dateOut,
      paymentTypeId,
      noCtaExpense,
      orderId,
      nameRequire,
      description,
      providerType,
      exemptedCertificate,
      exemptedNumber,
      exemptedRecord,
      importNumberDua,
      importTicket,
      importCif,
      importDai,
      importSelect
    }

    purchaseDetail.map((item) => {
      delete item.productData;
      return item;
    });

    if (id === 0) {
      // Generar documento
      setLoading(true);
      request.POST('admin/documents/getCurrentNumber', { code: documentCode }, (resp4) => {
        newPurchase.documentId = resp4.data.codeInt;
        setSendForm(false);
        setLoading(true);
        request.POST('inventory/process/purchases', newPurchase, (resp) => {
          setBulkForm({ documentId: resp4.data.codeInt, id: resp.data.id });
          // guardar detalle de la compra
          purchaseDetail.forEach(item => {
            const detailPurchase = {
              purchaseId: resp.data.id,
              ...item,
              subtotal: item.subTotal
            }
            setLoading(true);
            request.POST('inventory/process/purchaseDetail', detailPurchase, () => {
              setLoading(false);
            }, (err) => {

              setLoading(false);
            }, false);
            setLoading(true);
          });
          setLoading(false);
        }, (err) => {

          setLoading(false);
        });
      }, (err) => {

        setLoading(false);
      });
    } else {
      setLoading(true);
      request.PUT(`inventory/process/purchases/${id}`, newPurchase, () => {
        setLoading(false);
        setSendForm(false);
        // Eliminar detalle de la compra
        request.DELETE(buildUrl('inventory/process/purchaseDetail', { purchaseId: id }), () => {
          // guardar detalle de la compra
          purchaseDetail.forEach(item => {
            const detailPurchase = {
              purchaseId: id,
              ...item,
              subtotal: item.subTotal
            }
            setLoading(true);
            request.POST('inventory/process/purchaseDetail', detailPurchase, () => {
              setLoading(false);
            }, (err) => {

              setLoading(false);
            }, false);
            setLoading(true);
          });
          setLoading(false);
        }, (err) => {

          setLoading(false);
        }, false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const fnPrintPurchase = () => {
    if (id > 0) {
      const dataPrint = {
        id,
        userName: userData.name
      }
      request.GETPdf('inventory/process/purchases/exportPDFPurchase', dataPrint, 'Compra de Inventario.pdf', (err) => {

        setLoading(false);
      });
    }
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
    propsToComplementary
  };
}