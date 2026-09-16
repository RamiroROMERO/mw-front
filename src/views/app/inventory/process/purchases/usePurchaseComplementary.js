import { useEffect, useState } from 'react';
import notification from '@Containers/ui/Notifications';
import { useForm } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { formatDate, formatNumber, validFloat, validInt } from '@Helpers/Utils';

// Legacy inv_compras_import_comp.sc2 ("Facturas Complementarias"): compras de gasto
// (isExpense=1) enlazadas a la compra padre por fatherId — PurchaseApplyInventoryService ya
// las prorratea sobre el costo de las líneas del padre (ver _getExternalCost, WHERE id_father).
// Cada una es un documento independiente con su propia CxP y su propia partida contable,
// generadas juntas al "Contabilizar" (PurchaseAccountingService, rama isExpense).
export const usePurchaseComplementary = ({ setLoading, fatherId, listProviders, listPaymentTypes }) => {
  const [openModalComplementary, setOpenModalComplementary] = useState(false);
  const [complementaryList, setComplementaryList] = useState([]);
  const [listDocumentsComplementary, setListDocumentsComplementary] = useState([]);
  const [listLedgerAccounts, setListLedgerAccounts] = useState([]);
  const [listTaxStatNames, setListTaxStatNames] = useState([]);
  const [sendFormComplementary, setSendFormComplementary] = useState(false);
  const [openMsgCancelComplementary, setOpenMsgCancelComplementary] = useState(false);

  // Legacy Commandbutton btnSaveDocument.Click: la validación de CAI está comentada
  // (IF EMPTY(cCAI)... deshabilitado) — a diferencia de la compra padre, aquí es opcional.
  const complementaryValid = {
    documentCode: [(val) => val !== "", "msg.required.select.typeDocument"],
    typeTax: [(val) => validInt(val) > 0, "msg.required.select.typeTax"],
    providerId: [(val) => validInt(val) > 0, "msg.required.select.provider"],
    numCai: [(val) => val !== "", "msg.required.input.numInvoice"],
    date: [(val) => val !== "", "msg.required.input.date"],
    dateOut: [(val) => val !== "", "msg.required.input.date"],
    paymentTypeId: [(val) => validInt(val) > 0, "msg.required.select.paymentType"],
    typeFp: [(val) => validInt(val) > 0, "msg.required.select.typePurchase"],
    description: [(val) => val !== "", "msg.required.input.description"],
    noCtaExpense: [(val) => val !== "", "msg.required.select.noCtaExpense"]
  };

  const initialComplementary = {
    id: 0,
    fatherId: 0,
    pdaNumber: 0,
    documentCode: '',
    documentId: 0,
    typeTax: 0,
    providerId: 0,
    cai: '',
    numCai: '',
    date: '',
    dateOut: '',
    paymentTypeId: 0,
    typeFp: 0,
    description: '',
    noCtaExpense: '',
    subtotal: 0,
    discount: 0,
    exonera: 0,
    exent: 0,
    gravado: 0,
    tax: 0,
    freight: 0,
    otherCharges: 0,
    total: 0,
    exemptedCertificate: '',
    exemptedNumber: '',
    exemptedRecord: ''
  };

  const { formState: formStateComplementary, formValidation: formValidationComplementary, isFormValid: isFormValidComplementary,
    onInputChange: onInputChangeComplementary, onResetForm: onResetFormComplementary, setBulkForm: setBulkFormComplementary
  } = useForm(initialComplementary, complementaryValid);

  const { id: idComplementary, total: totalComplementary, exonera, exent, gravado, tax, freight, otherCharges, numCai: numCaiComplementary, providerId: providerIdComplementary, pdaNumber: pdaNumberComplementary } = formStateComplementary;

  // Legacy fnCalculateTotal: Total = Exonerado + Exento + Gravado + Impuesto + Flete + Otros Recargos
  // (no incluye Subtotal ni Descuento — ese monto ya queda repartido entre Exento/Gravado).
  useEffect(() => {
    const total = validFloat(exonera) + validFloat(exent) + validFloat(gravado) + validFloat(tax) + validFloat(freight) + validFloat(otherCharges);
    setBulkFormComplementary({ total: Number(total.toFixed(2)) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exonera, exent, gravado, tax, freight, otherCharges]);

  const fnLoadComplementaryLists = () => {
    request.GET('admin/documents?status=1&useInv=1&useTaxDocument=0', (resp) => {
      const documents = resp.data.map((item) => ({ value: item.code, code: item.code, label: `${item.code} | ${item.name}` }));
      setListDocumentsComplementary(documents);
    }, () => { });

    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const listAccounts = resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta }));
      setListLedgerAccounts(listAccounts);
    }, () => { });

    request.GET('admin/taxStatNames/getSL?shopping=1', (resp) => {
      const taxNames = resp.data.map((item) => ({ label: item.name, value: item.id, useCai: item.useCai }));
      setListTaxStatNames(taxNames);
    }, () => { });
  }

  const fnRefreshComplementaryList = () => {
    request.GET(`inventory/process/purchases?fatherId=${fatherId}&isExpense=1`, (resp) => {
      const list = resp.data.map((item) => ({
        ...item,
        provider: item.providerData?.name || '',
        dateIn: formatDate(item.date),
        valueTotal: formatNumber(item.total),
        accounted: validInt(item.pdaNumber) > 0 ? 'Sí' : 'No'
      }));
      setComplementaryList(list);
    }, () => { });
  }

  const fnComplementaryInvoices = () => {
    if (validInt(fatherId) === 0) {
      notification('warning', 'msg.required.saveDocument', 'alert.warning.title');
      return;
    }
    if (listDocumentsComplementary.length === 0) fnLoadComplementaryLists();
    onResetFormComplementary();
    setBulkFormComplementary({ fatherId });
    setSendFormComplementary(false);
    fnRefreshComplementaryList();
    setOpenModalComplementary(true);
  }

  const fnNewComplementary = () => {
    onResetFormComplementary();
    setBulkFormComplementary({ fatherId });
    setSendFormComplementary(false);
  }

  const fnSelectComplementary = (item) => {
    setBulkFormComplementary(item);
    setSendFormComplementary(false);
  }

  // Legacy: Thisform.Controlpanel21.fnGetNoPda() != 0 se revisa ANTES que cualquier otra cosa en
  // btnSaveDocument.Click — un documento ya contabilizado no se puede volver a guardar.
  const fnSaveComplementary = () => {
    setSendFormComplementary(true);
    if (validInt(pdaNumberComplementary) > 0) {
      notification('error', 'msg.error.purchase.alreadyAccounted', 'alert.error.title');
      return;
    }
    if (!isFormValidComplementary) return;
    if (validInt(totalComplementary) === 0) {
      notification('warning', 'msg.required.input.totalOrderProcess', 'alert.warning.title');
      return;
    }

    const payload = { ...formStateComplementary, fatherId, isExpense: 1, providerType: 1 };
    delete payload.id;

    setLoading(true);
    // Legacy: WHERE coddoc = numero AND codprov = provider sobre cont_cxp, antes de crear/actualizar
    // el registro — evita registrar dos veces la misma factura de un proveedor.
    request.GET(buildUrl('accounting/process/accountsPayable', { documentCode: numCaiComplementary, providerId: providerIdComplementary }), (resp) => {
      if (Array.isArray(resp.data) && resp.data.length > 0) {
        notification('error', 'msg.error.purchase.documentAlreadyRegistered', 'alert.error.title');
        setLoading(false);
        return;
      }

      const fnPersist = (finalPayload) => {
        if (validInt(idComplementary) === 0) {
          request.POST('inventory/process/purchases', finalPayload, (resp2) => {
            setBulkFormComplementary({ id: resp2.data.id, documentId: finalPayload.documentId });
            notification('success', 'msg.success.save', 'alert.success.title');
            fnRefreshComplementaryList();
            setLoading(false);
          }, () => { setLoading(false); });
        } else {
          request.PUT(`inventory/process/purchases/${idComplementary}`, finalPayload, () => {
            notification('success', 'msg.success.save', 'alert.success.title');
            fnRefreshComplementaryList();
            setLoading(false);
          }, () => { setLoading(false); });
        }
      }

      // Legacy oDocto = Thisform.Crudvfp1.fnGendoctofiscal(cDocument): genera el número de
      // documento fiscal interno al crear (igual que fnSavePurchase de la compra padre).
      if (validInt(idComplementary) === 0) {
        request.POST('admin/documents/getCurrentNumber', { code: payload.documentCode }, (resp3) => {
          fnPersist({ ...payload, documentId: resp3.data.codeInt });
        }, () => { setLoading(false); });
      } else {
        fnPersist(payload);
      }
    }, () => { setLoading(false); });
  }

  const fnAccountComplementary = () => {
    if (validInt(idComplementary) === 0) return;
    setLoading(true);
    request.POST(`inventory/process/purchases/${idComplementary}/accountDocument`, {}, () => {
      notification('success', 'msg.success.accountDocument', 'alert.success.title');
      fnRefreshComplementaryList();
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnCancelComplementary = () => {
    if (validInt(idComplementary) === 0) return;
    setOpenMsgCancelComplementary(true);
  }

  const fnOkCancelComplementary = () => {
    setLoading(true);
    request.POST(`inventory/process/purchases/${idComplementary}/cancel`, {}, () => {
      notification('success', 'msg.success.cancelPurchase', 'alert.success.title');
      setOpenMsgCancelComplementary(false);
      fnNewComplementary();
      fnRefreshComplementaryList();
      setLoading(false);
    }, (resp) => {
      const messageKey = resp?.messages?.[0]?.message || 'msg.save.record.error';
      notification('error', messageKey, 'alert.error.title');
      setOpenMsgCancelComplementary(false);
      setLoading(false);
    }, false);
  }

  return {
    openModalComplementary, setOpenModalComplementary, complementaryList,
    listDocumentsComplementary, listLedgerAccounts, listTaxStatNames, listProviders, listPaymentTypes,
    formStateComplementary, formValidationComplementary, onInputChangeComplementary, setBulkFormComplementary,
    sendFormComplementary, openMsgCancelComplementary, setOpenMsgCancelComplementary,
    fnComplementaryInvoices, fnNewComplementary, fnSelectComplementary, fnSaveComplementary,
    fnAccountComplementary, fnCancelComplementary, fnOkCancelComplementary
  };
}
