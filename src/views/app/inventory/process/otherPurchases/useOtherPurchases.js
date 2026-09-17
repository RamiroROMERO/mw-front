import { useState, useEffect } from 'react'
import { useForm } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';
import { formatDate, formatNumber, validInt, validFloat } from '@Helpers/Utils';
import { useOtherPurchaseAccounting } from './useOtherPurchaseAccounting';

// Legacy inv_compras_others.sc2 ("Facturas de Costos y Gastos"): documento de gasto (isExpense=1)
// independiente, sin líneas de producto — reutiliza el mismo backend de Compras
// (modules/inventory/purchases/) que ya soporta la rama isExpense en Contabilizar/Anular.
export const useOtherPurchases = ({ setLoading }) => {

  const [listDocuments, setListDocuments] = useState([]);
  const [listTaxStatNames, setListTaxStatNames] = useState([]);
  const [listProviders, setListProviders] = useState([]);
  const [listPaymentTypes, setListPaymentTypes] = useState([]);
  const [listLedgerAccounts, setListLedgerAccounts] = useState([]);
  const [listWorkOrders, setListWorkOrders] = useState([]);
  const [caiRequired, setCaiRequired] = useState(false);
  const [sendForm, setSendForm] = useState(false)
  const [openSearch, setOpenSearch] = useState(false);
  const [dataPurchases, setDataPurchases] = useState([])
  const [openMsgCancelDocument, setOpenMsgCancelDocument] = useState(false);

  const purchasesValid = {
    documentCode: [(val) => val !== "", "msg.required.select.typeDocument"],
    typeTax: [(val) => validInt(val) > 0, "msg.required.select.typeTax"],
    providerId: [(val) => validInt(val) > 0, "msg.required.select.provider"],
    numCai: [(val) => val !== "", "msg.required.input.numInvoice"],
    date: [(val) => val !== "", "msg.required.input.date"],
    dateOut: [(val) => val !== "", "msg.required.input.date"],
    paymentTypeId: [(val) => validInt(val) > 0, "msg.required.select.paymentType"],
    typeFp: [(val) => validInt(val) > 0, "msg.required.select.typePurchase"],
    noCtaExpense: [(val) => val !== "", "msg.required.select.noCtaExpense"],
    description: [(val) => val !== "", "msg.required.input.description"],
    nameRequire: [(val) => val !== "", "msg.required.input.name"],
    total: [(val) => validInt(val) > 0, "msg.required.input.total"],
  };

  const { formState, formValidation, isFormValid, onInputChange, onBulkForm, onResetForm } = useForm({
    id: 0,
    documentCode: "",
    documentId: 0,
    typeTax: 0,
    providerId: 0,
    paymentTypeId: 0,
    orderId: 0,
    workedId: 0,
    cai: "",
    numCai: "",
    date: "",
    dateOut: "",
    typeFp: 0,
    description: "",
    exemptedCertificate: "",
    exemptedNumber: "",
    exemptedRecord: "",
    nameRequire: "",
    noCtaExpense: "",
    pdaNumber: 0,
    status: 0,
    subtotal: 0,
    discount: 0,
    exonera: 0,
    exent: 0,
    gravado: 0,
    tax: 0,
    freight: 0,
    otherCharges: 0,
    total: 0
  }, purchasesValid);

  const { id, typeTax, cai, numCai, providerId, pdaNumber, exonera, gravado, exent, discount, tax, freight, otherCharges } = formState;

  const { openMsgAccountDocument, setOpenMsgAccountDocument, fnAccountDocument, fnOkAccountDocument } = useOtherPurchaseAccounting({ setLoading, id, setBulkForm: onBulkForm });

  // Legacy fncalculatetotal (líneas 1046-1059): Subtotal = Exonerado + Gravado + Exento (ambos
  // Numbox_hw2/hw7 son ReadOnly en el .sc2, calculados aquí, no editables por el usuario).
  useEffect(() => {
    const subtotal = validFloat(exonera) + validFloat(gravado) + validFloat(exent);
    const total = subtotal - validFloat(discount) + validFloat(tax) + validFloat(freight) + validFloat(otherCharges);
    onBulkForm({ subtotal: Number(subtotal.toFixed(2)), total: Number(total.toFixed(2)) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exonera, gravado, exent, discount, tax, freight, otherCharges]);

  // Legacy Combobox_hw1.InteractiveChange (líneas 1595-1618): el CAI del proveedor solo es
  // obligatorio/editable cuando el tipo de documento fiscal seleccionado usa CAI.
  useEffect(() => {
    const selected = listTaxStatNames.find((item) => Number(item.value) === Number(typeTax));
    setCaiRequired(!!selected?.useCai);
  }, [typeTax, listTaxStatNames]);

  const fnNewDocument = () => {
    setSendForm(false);
    onResetForm();
  }

  const fnSearchDocument = () => {
    setLoading(true);
    request.GET("inventory/process/purchases?isExpense=1",
      (resp) => {
        const purchases = resp.data.map((item) => {
          item.provider = item.providerData?.name || '';
          item.dateIn = formatDate(item.date)
          item.valueTotal = formatNumber(item.total)
          item.valueSubtotal = formatNumber(item.subtotal)
          item.valueDiscount = formatNumber(item.discount)
          item.valueTax = formatNumber(item.tax)
          return item;
        });
        setDataPurchases(purchases);
        setOpenSearch(true);
        setLoading(false);
      }, () => {
        setLoading(false);
      })
  }

  const fnSaveDocument = () => {
    setSendForm(true);
    if (validInt(pdaNumber) > 0) {
      notification('error', 'msg.error.purchase.alreadyAccounted', 'alert.error.title');
      return;
    }
    if (!isFormValid) {
      return;
    }
    if (caiRequired && cai === "") {
      notification('error', 'msg.required.input.numInvoice', 'alert.error.title');
      return;
    }

    const payload = { ...formState, isExpense: 1, providerType: 1 };
    delete payload.id;

    setLoading(true)
    // Legacy btnSaveDocument.Click (líneas 2139-2150): WHERE coddoc = numero AND codprov =
    // provider sobre cont_cxp, antes de crear/actualizar — evita registrar dos veces la misma
    // factura de un proveedor.
    request.GET(buildUrl('accounting/process/accountsPayable', { documentCode: numCai, providerId }), (resp) => {
      if (Array.isArray(resp.data) && resp.data.length > 0) {
        notification('error', 'msg.error.purchase.documentAlreadyRegistered', 'alert.error.title');
        setLoading(false);
        return;
      }

      const fnPersist = (finalPayload) => {
        if (validInt(id) === 0) {
          request.POST("inventory/process/purchases", finalPayload,
            (resp2) => {
              onBulkForm({ id: resp2.data.id, documentId: finalPayload.documentId });
              notification('success', 'msg.success.save', 'alert.success.title');
              setLoading(false);
            },
            () => {
              setLoading(false);
            },
            true);
        } else {
          request.PUT(`inventory/process/purchases/${validInt(id)}`, finalPayload,
            () => {
              notification('success', 'msg.success.save', 'alert.success.title');
              setLoading(false);
            },
            () => {
              setLoading(false);
            },
            true);
        }
      }

      // Legacy oDocto = Thisform.Crudvfp1.fnGendoctofiscal(cDocument), línea 2216: genera el
      // número de documento fiscal interno al crear.
      if (validInt(id) === 0) {
        request.POST('admin/documents/getCurrentNumber', { code: payload.documentCode }, (resp3) => {
          fnPersist({ ...payload, documentId: resp3.data.codeInt });
        }, () => { setLoading(false); });
      } else {
        fnPersist(payload);
      }
    }, () => { setLoading(false); });
  }

  const fnCancelDocument = () => {
    if (validInt(id) === 0) return;
    setOpenMsgCancelDocument(true);
  }

  const fnOkCancelDocument = () => {
    setLoading(true);
    request.POST(`inventory/process/purchases/${id}/cancel`, {}, () => {
      notification('success', 'msg.success.cancelPurchase', 'alert.success.title');
      setOpenMsgCancelDocument(false);
      setLoading(false);
      fnNewDocument();
    }, (resp) => {
      const messageKey = resp?.messages?.[0]?.message || 'msg.save.record.error';
      notification('error', messageKey, 'alert.error.title');
      setOpenMsgCancelDocument(false);
      setLoading(false);
    }, false);
  }

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: fnSaveDocument,
    fnCancel: fnCancelDocument,
    buttonsHome: [
      {
        title: "button.count",
        icon: "bi bi-journal-check",
        onClick: fnAccountDocument
      },
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  useEffect(() => {

    setLoading(true);
    // Legacy getDocumentList("cur_doctos","AND use_inv = 1 AND usacai = 0"), línea 1520: solo
    // documentos que NO usan CAI nativo (el CAI de esta pantalla lo decide typeTax, no el documento).
    request.GET('admin/documents?status=1&useInv=1&useTaxDocument=0', (resp) => {
      const documents = resp.data.map((item) => {
        return {
          value: item.code,
          code: item.code,
          label: `${item.code} | ${item.name}`
        }
      });
      documents.unshift({ value: '0', label: 'Seleccione' });
      setListDocuments(documents);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    request.GET('admin/taxStatNames/getSL?shopping=1', (resp) => {
      const taxNames = resp.data.map((item) => ({ label: item.name, value: item.id, useCai: item.useCai }));
      setListTaxStatNames(taxNames);
    }, () => { });

    request.GET(`inventory/process/providers`, (resp) => {
      const providers = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          address: item.address,
          creditDays: item.creditDays,
          cai: item.cai,
          providerType: item.providerType
        }
      });
      providers.unshift({ value: '0', label: 'Seleccione' });
      setListProviders(providers);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    request.GET(`admin/paymentTypes`, (resp) => {
      const paymentMethods = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          usageType: item.usageType
        }
      })
      const filterPayments = paymentMethods.filter((item) => {
        return item.usageType === 2 || item.usageType === 3
      });
      filterPayments.unshift({ value: '0', label: 'Seleccione' });
      setListPaymentTypes(filterPayments);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const listAccounts = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      listAccounts.unshift({ value: '0', label: 'Seleccione' });
      setListLedgerAccounts(listAccounts);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    request.GET('accounting/process/workOrders', (resp) => {
      const workOrders = resp.data.map((item) => ({ label: item.description, value: item.id }));
      workOrders.unshift({ value: '0', label: 'Seleccione' });
      setListWorkOrders(workOrders);
    }, () => { });

  }, [])

  return {
    listDocuments,
    listTaxStatNames,
    listProviders,
    listPaymentTypes,
    listLedgerAccounts,
    listWorkOrders,
    caiRequired,
    formState,
    formValidation,
    isFormValid,
    onInputChange,
    setBulkForm: onBulkForm,
    sendForm,
    propsToControlPanel,
    openSearch,
    setOpenSearch,
    dataPurchases,
    openMsgCancelDocument,
    setOpenMsgCancelDocument,
    fnOkCancelDocument,
    openMsgAccountDocument,
    setOpenMsgAccountDocument,
    fnOkAccountDocument
  }
}
