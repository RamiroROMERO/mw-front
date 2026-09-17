import { useEffect, useState } from 'react';
import { request, buildUrl } from '@Helpers/core';
import { useForm } from '@Hooks';
import DateHelper from '@Helpers/DateHelper';
import { validFloat, validInt } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';

export const TYPE_DISCOUNT = 1;
export const TYPE_CANCEL = 2;
export const TYPE_RETURN = 3;
export const TYPE_OTHER = 4;

const creditNoteValid = {
  documentCode: [(val) => val !== '', 'msg.required.select.typeDocument'],
  clientId: [(val) => validInt(val) > 0, 'msg.required.select.customer']
}

export const useCreditNotes = ({ setLoading, screenControl }) => {
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));
  const [listTypeDocuments, setListTypeDocuments] = useState([]);
  const [listCustomers, setListCustomers] = useState([]);
  const [openModalPrint, setOpenModalPrint] = useState(false);
  const [documentPathPrint, setDocumentPathPrint] = useState('');
  const [listAccounts, setListAccounts] = useState([]);
  const [detail1, setDetail1] = useState([]); // facturas aplicadas (tipos 1/2/4)
  const [detail2, setDetail2] = useState([]); // productos devueltos (tipo 3)
  const [originInvoice, setOriginInvoice] = useState(null); // factura origen (tipo 3)
  const [sendForm, setSendForm] = useState(false);
  const [openModalAddInvoices, setOpenModalAddInvoices] = useState(false);
  const [openModalSeekOrigin, setOpenModalSeekOrigin] = useState(false);
  const [openModalSeekCreditNotes, setOpenModalSeekCreditNotes] = useState(false);
  const [openModalVoid, setOpenModalVoid] = useState(false);
  const [openMsgProcess, setOpenMsgProcess] = useState(false);
  const [dataCreditNotes, setDataCreditNotes] = useState([]);

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    documentCode: '',
    documentId: 0,
    numberCAI: '',
    date: DateHelper.format(new Date()),
    clientId: 0,
    clientRtn: '',
    clientName: '',
    typeId: TYPE_DISCOUNT,
    typeOther: '',
    name: '',
    valueLps: 0,
    docValueUSD: 0,
    exchangeRate: 1,
    discountPercent: 0,
    accCode: '',
    currenId: 1,
    isMixed: 0,
    pdaNumber: 0,
    status: 1
  }, creditNoteValid);

  const { id, documentCode, clientId, typeId, pdaNumber, status } = formState;

  const isProcessed = validInt(pdaNumber) > 0;
  const isVoided = validInt(status) === 0;
  const isSaved = validInt(id) > 0;
  const isReturn = validInt(typeId) === TYPE_RETURN;

  const fnLoadDocuments = (mixedValue) => {
    const url = mixedValue ? 'admin/documents?status=1&useBill=1' : 'admin/documents?status=1&useBill=1&useTaxDocument=1';
    request.GET(url, (resp) => {
      const documents = resp.data.map((item) => ({
        id: item.code,
        code: item.code,
        name: `${item.code} | ${item.name}`
      }));
      setListTypeDocuments(documents);
    }, () => { });
  }

  useEffect(() => {
    setLoading(true);
    fnLoadDocuments(false);
    request.GET('billing/settings/customers/?status=1', (resp) => {
      const customers = resp.data.map((item) => ({
        id: item.id,
        label: `${item.id} | ${item.rtn} | ${item.nomcli}`,
        value: item.id,
        rtn: item.rtn,
        name: item.nomcli
      }));
      setListCustomers(customers);
      setLoading(false);
    }, () => { setLoading(false); });

    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const accounts = resp.data.map((item) => ({
        id: item.cta || item.id,
        code: item.cta || item.id,
        name: `${item.cta} - ${item.nombre}`
      }));
      setListAccounts(accounts);
    }, () => { });
  }, []);

  // Reobtiene el combo de documentos al alternar el toggle de CAI (`isMixed`): con CAI
  // solo entran documentos con `usacai=1` (igual que la forma principal del legacy);
  // sin CAI, cualquier documento con `use_bill=1` (igual que fac_ncredito_mixed.sc2).
  const onMixedChange = (e) => {
    const checked = e.target.checked;
    setBulkForm({ isMixed: checked ? 1 : 0, documentCode: '' });
    fnLoadDocuments(checked);
  }

  const onCustomerChange = (e) => {
    const idCust = e.target.value;
    const found = listCustomers.find((item) => item.id === idCust);
    setBulkForm({ clientId: idCust, clientRtn: found ? found.rtn : '', clientName: found ? found.name : '' });
  }

  // Igual que el legacy (Optiongroup_hw1.InteractiveChange): cambiar el tipo alterna la
  // pestaña activa y descarta el detalle de la pestaña que deja de aplicar, para no
  // guardar líneas huérfanas de un tipo que ya no corresponde.
  const onTypeChange = (e) => {
    const newType = validInt(e.target.value);
    if (newType === TYPE_RETURN) {
      setDetail1([]);
    } else {
      setDetail2([]);
      setOriginInvoice(null);
    }
    setBulkForm({ typeId: newType, valueLps: 0 });
  }

  // Recalcula el total de encabezado (`valueLps`) como suma del detalle activo — igual
  // que `nTotal` en el legacy, recalculado en cada LostFocus de las columnas editables.
  const recalcTotalFromDetail1 = (rows) => {
    const sum = rows.reduce((acc, item) => acc + validFloat(item.valuePayment), 0);
    setBulkForm({ valueLps: sum });
  }
  const recalcTotalFromDetail2 = (rows) => {
    const sum = rows.reduce((acc, item) => acc + validFloat(item.valueTotal1), 0);
    setBulkForm({ valueLps: sum });
  }

  const fnAddInvoices = () => {
    if (validInt(clientId) === 0) {
      notification('warning', 'msg.required.select.customer', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(buildUrl('accounting/process/cxc/pendingByCustomer', { customerId: clientId }), (resp) => {
      const existingCodes = detail1.map((item) => item.invoiceCode);
      const pending = resp.data
        .filter((item) => !existingCodes.includes(item.documentCode))
        .map((item) => ({
          cxcId: item.id,
          date: item.date,
          documentCode: item.documentCode,
          balance: validFloat(item.balance)
        }));
      setDataCreditNotes(pending);
      setOpenModalAddInvoices(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnConfirmAddInvoices = (selectedRows) => {
    const newRows = selectedRows.map((item) => ({
      id: new Date().getTime() + Math.random(),
      cxcId: item.cxcId,
      dateDocument: item.date,
      customerId: clientId,
      invoiceCode: item.documentCode,
      invoiceVal: item.balance,
      percent: 100,
      valuePayment: item.balance,
      docValueUSD: 0,
      docValuePaymentUSD: 0
    }));
    const merged = [...detail1, ...newRows];
    setDetail1(merged);
    recalcTotalFromDetail1(merged);
    setOpenModalAddInvoices(false);
  }

  const onChangeDetail1Row = (rowId, field, value) => {
    const updated = detail1.map((item) => {
      if (item.id !== rowId) return item;
      if (field === 'percent') {
        const percent = validFloat(value);
        return { ...item, percent, valuePayment: validFloat((percent * item.invoiceVal) / 100) };
      }
      if (field === 'valuePayment') {
        const valuePayment = validFloat(value);
        const percent = item.invoiceVal > 0 ? validFloat((valuePayment * 100) / item.invoiceVal) : 0;
        return { ...item, valuePayment, percent };
      }
      return item;
    });
    setDetail1(updated);
    recalcTotalFromDetail1(updated);
  }

  const fnApplyPercentToAll = () => {
    const { discountPercent } = formState;
    const percent = validFloat(discountPercent);
    const updated = detail1.map((item) => ({
      ...item,
      percent,
      valuePayment: validFloat((percent * item.invoiceVal) / 100)
    }));
    setDetail1(updated);
    recalcTotalFromDetail1(updated);
  }

  const fnDeleteDetail1Row = (rowId) => {
    const updated = detail1.filter((item) => item.id !== rowId);
    setDetail1(updated);
    recalcTotalFromDetail1(updated);
  }

  const fnSeekOriginInvoice = () => {
    if (validInt(clientId) === 0) {
      notification('warning', 'msg.required.select.customer', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(buildUrl('billing/process/invoices', { customerId: clientId, isPos: 0 }), (resp) => {
      const invoices = resp.data.filter((item) => validInt(item.documentId) > 0);
      setDataCreditNotes(invoices);
      setOpenModalSeekOrigin(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnSelectOriginInvoice = (invoice) => {
    setLoading(true);
    request.GET(buildUrl('billing/process/invoiceDetail', { idFather: invoice.id }), (resp) => {
      const lines = resp.data.map((item) => {
        const qty = validFloat(item.qty);
        return {
          id: new Date().getTime() + Math.random(),
          invoiceId: invoice.id,
          productCode: item.productCode,
          description: item.invProduct ? item.invProduct.name : item.productCode,
          quantityInvoiced: qty,
          quantity: qty,
          price: validFloat(item.price),
          discountPercent: validFloat(item.discountPercent),
          taxPercent: validFloat(item.taxPercent),
          cost: validFloat(item.unitedCoste),
          subtotal: validFloat(item.subtotal),
          discountValue: validFloat(item.discountValue),
          taxValue: validFloat(item.taxValue),
          valueTotal1: validFloat(item.total)
        }
      });
      setDetail2(lines);
      recalcTotalFromDetail2(lines);
      setOriginInvoice({
        id: invoice.id,
        invoiceNumber: `${invoice.documentCode}-${invoice.documentId}`,
        numcai: invoice.numcai,
        date: invoice.date
      });
      setOpenModalSeekOrigin(false);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const onChangeDetail2Qty = (rowId, value) => {
    const updated = detail2.map((item) => {
      if (item.id !== rowId) return item;
      let qty = validFloat(value);
      if (qty > item.quantityInvoiced) qty = item.quantityInvoiced;
      if (qty < 0) qty = 0;
      const subtotal = validFloat(qty * item.price);
      const discountValue = validFloat((item.discountPercent * subtotal) / 100);
      const taxValue = validFloat((item.taxPercent * (subtotal - discountValue)) / 100);
      const valueTotal1 = validFloat((subtotal - discountValue) + taxValue);
      return { ...item, quantity: qty, subtotal, discountValue, taxValue, valueTotal1 };
    });
    setDetail2(updated);
    recalcTotalFromDetail2(updated);
  }

  const fnDeleteDetail2Row = (rowId) => {
    const updated = detail2.filter((item) => item.id !== rowId);
    setDetail2(updated);
    recalcTotalFromDetail2(updated);
    if (updated.length === 0) setOriginInvoice(null);
  }

  const fnNewCreditNote = () => {
    onResetForm();
    setDetail1([]);
    setDetail2([]);
    setOriginInvoice(null);
    setSendForm(false);
    fnLoadDocuments(false);
  }

  const fnSearchCreditNotes = () => {
    setLoading(true);
    request.GET('billing/process/creditNotes', (resp) => {
      setDataCreditNotes(resp.data);
      setOpenModalSeekCreditNotes(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnViewCreditNote = (item) => {
    setOpenModalSeekCreditNotes(false);
    setLoading(true);
    fnLoadDocuments(!!item.isMixed);
    setBulkForm({
      id: item.id,
      documentCode: item.documentCode,
      documentId: item.documentId,
      numberCAI: item.numberCAI,
      date: item.date,
      clientId: item.clientId,
      clientRtn: item.clientData ? item.clientData.rtn : '',
      clientName: item.clientData ? item.clientData.nomcli : '',
      typeId: item.typeId,
      typeOther: item.typeOther,
      name: item.name,
      valueLps: item.valueLps,
      docValueUSD: item.docValueUSD,
      exchangeRate: item.exchangeRate,
      discountPercent: 0,
      accCode: item.accCode,
      currenId: item.currenId,
      isMixed: item.isMixed,
      pdaNumber: item.pdaNumber,
      status: item.status
    });

    if (validInt(item.typeId) === TYPE_RETURN) {
      request.GET(buildUrl('billing/process/creditNoteProducts', { fatherId: item.id }), (resp) => {
        const lines = resp.data.map((line) => {
          const qty = validFloat(line.quantity);
          const subtotal = validFloat(line.subtotal);
          const discountValue = validFloat(line.discountValue);
          const taxValue = validFloat(line.taxValue);
          // El detalle guardado no persiste price/discountPercent/taxPercent (solo los
          // valores ya calculados) — se re-derivan para poder seguir editando la
          // cantidad a devolver sin perder la proporción de descuento/impuesto original.
          return {
            id: line.id,
            invoiceId: line.invoiceId,
            productCode: line.productCode,
            description: line.invProduct ? line.invProduct.name : line.productCode,
            quantityInvoiced: qty,
            quantity: qty,
            price: qty > 0 ? subtotal / qty : 0,
            discountPercent: subtotal > 0 ? (discountValue * 100) / subtotal : 0,
            taxPercent: (subtotal - discountValue) > 0 ? (taxValue * 100) / (subtotal - discountValue) : 0,
            cost: validFloat(line.cost),
            subtotal,
            discountValue,
            taxValue,
            valueTotal1: validFloat(line.valueTotal1)
          };
        });
        setDetail2(lines);
        setDetail1([]);
        if (lines.length > 0) {
          request.GET(`billing/process/invoices/${lines[0].invoiceId}`, (respInv) => {
            setOriginInvoice({
              id: respInv.data.id,
              invoiceNumber: `${respInv.data.documentCode}-${respInv.data.documentId}`,
              numcai: respInv.data.numcai,
              date: respInv.data.date
            });
            setLoading(false);
          }, () => { setLoading(false); });
        } else {
          setLoading(false);
        }
      }, () => { setLoading(false); });
    } else {
      request.GET(buildUrl('billing/process/creditNoteInvoices', { fatherId: item.id }), (resp) => {
        const lines = resp.data.map((line) => ({
          id: line.id,
          cxcId: line.cxcId,
          dateDocument: line.dateDocument,
          customerId: line.customerId,
          invoiceCode: line.invoiceCode,
          invoiceVal: validFloat(line.invoiceVal),
          percent: validFloat(line.percent),
          valuePayment: validFloat(line.valuePayment),
          docValueUSD: validFloat(line.docValueUSD),
          docValuePaymentUSD: validFloat(line.docValuePaymentUSD)
        }));
        setDetail1(lines);
        setDetail2([]);
        setOriginInvoice(null);
        setLoading(false);
      }, () => { setLoading(false); });
    }
  }

  const fnSaveCreditNote = () => {
    setSendForm(true);
    if (!isFormValid) return;

    const { date, name, typeOther, docValueUSD, exchangeRate, accCode, currenId, isMixed: isMixedVal, valueLps } = formState;

    if (validFloat(valueLps) <= 0) {
      notification('warning', 'msg.error.invalidValue', 'alert.warning.title');
      return;
    }
    if (isReturn) {
      if (detail2.filter((item) => validFloat(item.quantity) > 0).length === 0) {
        notification('warning', 'msg.required.select.originInvoice', 'alert.warning.title');
        return;
      }
    } else {
      if (detail1.length === 0) {
        notification('warning', 'msg.required.select.invoiceToApply', 'alert.warning.title');
        return;
      }
      if (typeId === TYPE_OTHER && !accCode) {
        notification('warning', 'msg.required.select.account', 'alert.warning.title');
        return;
      }
    }

    const newData = {
      documentCode,
      date,
      clientId,
      typeId,
      typeOther,
      name,
      valueLps,
      docValueUSD,
      exchangeRate,
      accCode: typeId === TYPE_OTHER ? accCode : '',
      currenId,
      isMixed: isMixedVal ? 1 : 0
    }

    setLoading(true);
    const afterSaveHeader = (noteId) => {
      // El DELETE previo (limpiar detalle viejo antes de reinsertar) devuelve 404
      // "delete.not.found" cuando no había filas que borrar — el caso normal en el primer
      // Guardar de una nota nueva. No es un error real: se continúa igual hacia el insert
      // tanto si el DELETE tuvo éxito como si no encontró nada que borrar.
      const insertDetail = () => {
        if (isReturn) {
          const rows = detail2.filter((item) => validFloat(item.quantity) > 0).map((item) => ({
            fatherId: noteId,
            invoiceId: item.invoiceId,
            productCode: item.productCode,
            quantity: item.quantity,
            subtotal: item.subtotal,
            discountValue: item.discountValue,
            taxValue: item.taxValue,
            valueTotal1: item.valueTotal1,
            cost: item.cost
          }));
          request.POST('billing/process/creditNoteProducts/createMany', rows, () => {
            notification('success', 'msg.success.save', 'alert.success.title');
            setLoading(false);
          }, () => { setLoading(false); });
        } else {
          const rows = detail1.map((item) => ({
            fatherId: noteId,
            date: item.dateDocument,
            dateDocument: item.dateDocument,
            customerId: clientId,
            invoiceCode: item.invoiceCode,
            invoiceVal: item.invoiceVal,
            percent: item.percent,
            valuePayment: item.valuePayment,
            docValueUSD: item.docValueUSD,
            docValuePaymentUSD: item.docValuePaymentUSD
          }));
          request.POST('billing/process/creditNoteInvoices/createMany', rows, () => {
            notification('success', 'msg.success.save', 'alert.success.title');
            setLoading(false);
          }, () => { setLoading(false); });
        }
      }
      request.DELETE(buildUrl('billing/process/creditNoteInvoices', { fatherId: noteId }), () => {
        request.DELETE(buildUrl('billing/process/creditNoteProducts', { fatherId: noteId }), insertDetail, insertDetail, false);
      }, () => {
        request.DELETE(buildUrl('billing/process/creditNoteProducts', { fatherId: noteId }), insertDetail, insertDetail, false);
      }, false);
    }

    if (id > 0) {
      request.PUT(`billing/process/creditNotes/${id}`, newData, () => {
        afterSaveHeader(id);
      }, () => { setLoading(false); });
    } else {
      request.POST('billing/process/creditNotes', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        afterSaveHeader(resp.data.id);
      }, () => { setLoading(false); });
    }
  }

  const fnAskProcess = () => {
    if (id === 0) return;
    setOpenMsgProcess(true);
  }

  const fnProcessCreditNote = () => {
    setOpenMsgProcess(false);
    setLoading(true);
    request.POST(`billing/process/creditNotes/process/${id}`, {}, (resp) => {
      setBulkForm({
        pdaNumber: resp.data.numberPDA,
        documentId: resp.data.documentId || formState.documentId,
        numberCAI: resp.data.numberCAI || formState.numberCAI
      });
      notification('success', 'msg.success.processDocument', 'alert.success.title');
      setLoading(false);
    }, (err) => {
      const errorCode = err?.messages?.[0]?.description?.name;
      if (errorCode) {
        notification('error', `msg.error.creditNote.${errorCode}`, 'alert.error.title');
      } else {
        notification('error', 'msg.error.processDocument', 'alert.error.title');
      }
      setLoading(false);
    });
  }

  const fnAskVoid = () => {
    if (id === 0 || !isProcessed) return;
    setOpenModalVoid(true);
  }

  const fnVoidCreditNote = (reason) => {
    setLoading(true);
    request.DELETE(buildUrl(`billing/process/creditNotes/void/${id}`, { reason }), () => {
      setOpenModalVoid(false);
      fnNewCreditNote();
      notification('success', 'msg.success.voidCreditNote', 'alert.success.title');
      setLoading(false);
    }, () => {
      notification('error', 'msg.delete.record.error', 'alert.error.title');
      setLoading(false);
    }, false);
  }

  // Equivalente a btnPrintDocument.Click: el backend elige internamente entre
  // fac_credit_notes1 (tipos 1/2/4) y fac_credit_notes2 (tipo 3), según el tipo de la
  // nota ya guardada — no requiere que esté Contabilizada (igual que el legacy).
  const fnPrintCreditNote = () => {
    if (id === 0) return;
    setLoading(true);
    request.GETPdfUrl('billing/process/creditNotes/exportPDF', { id, userName: userData.name }, (resp) => {
      setDocumentPathPrint(resp);
      setOpenModalPrint(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const propsToControlPanel = {
    fnNew: fnNewCreditNote,
    fnSearch: fnSearchCreditNotes,
    fnSave: screenControl.fnCreate && !isProcessed ? fnSaveCreditNote : null,
    fnPrint: isSaved ? fnPrintCreditNote : null,
    fnCancel: screenControl.fnDelete && isProcessed && !isVoided ? fnAskVoid : null,
    buttonsHome: [
      {
        title: "button.count",
        icon: "bi bi-journal-check",
        onClick: screenControl.fnUpdate && isSaved && !isProcessed ? fnAskProcess : () => { }
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  return {
    formState, formValidation, onInputChange, setBulkForm, sendForm,
    listTypeDocuments, listCustomers, listAccounts,
    detail1, detail2, originInvoice,
    onMixedChange, onCustomerChange, onTypeChange,
    fnAddInvoices, onChangeDetail1Row, fnApplyPercentToAll, fnDeleteDetail1Row,
    fnSeekOriginInvoice, onChangeDetail2Qty, fnDeleteDetail2Row,
    isProcessed, isVoided, isSaved, isReturn,
    openModalAddInvoices, setOpenModalAddInvoices, dataCreditNotes, fnConfirmAddInvoices,
    openModalSeekOrigin, setOpenModalSeekOrigin, fnSelectOriginInvoice,
    openModalSeekCreditNotes, setOpenModalSeekCreditNotes, fnViewCreditNote,
    openModalVoid, setOpenModalVoid, fnVoidCreditNote,
    openMsgProcess, setOpenMsgProcess, fnProcessCreditNote,
    openModalPrint, setOpenModalPrint, documentPathPrint,
    propsToControlPanel
  }
}
