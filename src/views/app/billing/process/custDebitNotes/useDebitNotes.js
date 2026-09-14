import { useEffect, useState } from 'react';
import { request, buildUrl } from '@Helpers/core';
import { useForm } from '@Hooks';
import DateHelper from '@Helpers/DateHelper';
import { validFloat, validInt } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';

export const TYPE_LATE_FEE = 1;
export const TYPE_OTHER_CHARGE = 2;
export const TYPE_ADJUSTMENT = 3;
export const TYPE_OTHER = 4;

const debitNoteValid = {
  documentCode: [(val) => val !== '', 'msg.required.select.typeDocument'],
  clientId: [(val) => validInt(val) > 0, 'msg.required.select.customer']
}

// Toda nota de débito requiere CAI fiscal — a diferencia de Notas de Crédito,
// fac_ndebito.sc2 no tiene una variante `_mixed` (confirmado, sin toggle de moneda/CAI).
export const useDebitNotes = ({ setLoading, screenControl }) => {
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));
  const [listTypeDocuments, setListTypeDocuments] = useState([]);
  const [listCustomers, setListCustomers] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);
  const [openModalPrint, setOpenModalPrint] = useState(false);
  const [documentPathPrint, setDocumentPathPrint] = useState('');
  const [detail1, setDetail1] = useState([]); // facturas de referencia (tipos 1/2/4)
  const [detail2, setDetail2] = useState([]); // ajuste de productos (tipo 3)
  const [originInvoice, setOriginInvoice] = useState(null); // factura origen (tipo 3)
  const [sendForm, setSendForm] = useState(false);
  const [openModalAddInvoices, setOpenModalAddInvoices] = useState(false);
  const [openModalSeekOrigin, setOpenModalSeekOrigin] = useState(false);
  const [openModalSeekDebitNotes, setOpenModalSeekDebitNotes] = useState(false);
  const [openModalVoid, setOpenModalVoid] = useState(false);
  const [openMsgProcess, setOpenMsgProcess] = useState(false);
  const [dataDebitNotes, setDataDebitNotes] = useState([]);

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    documentCode: '',
    documentId: 0,
    numberCAI: '',
    date: DateHelper.format(new Date()),
    clientId: 0,
    clientRtn: '',
    clientName: '',
    typeId: TYPE_LATE_FEE,
    typeOther: '',
    name: '',
    valueLps: 0,
    docValueUSD: 0,
    exchangeRate: 1,
    discountPercent: 0,
    accCode: '',
    currenId: 1,
    pdaNumber: 0,
    status: 1
  }, debitNoteValid);

  const { id, documentCode, clientId, typeId, pdaNumber, status } = formState;

  const isProcessed = validInt(pdaNumber) > 0;
  const isVoided = validInt(status) === 0;
  const isSaved = validInt(id) > 0;
  const isAdjustment = validInt(typeId) === TYPE_ADJUSTMENT;

  useEffect(() => {
    setLoading(true);
    request.GET('admin/documents?status=1&useBill=1&useTaxDocument=1', (resp) => {
      const documents = resp.data.map((item) => ({
        id: item.code,
        code: item.code,
        name: `${item.code} | ${item.name}`
      }));
      setListTypeDocuments(documents);
      setLoading(false);
    }, () => { setLoading(false); });

    request.GET('billing/settings/customers/?status=1', (resp) => {
      const customers = resp.data.map((item) => ({
        id: item.id,
        label: `${item.id} | ${item.rtn} | ${item.nomcli}`,
        value: item.id,
        rtn: item.rtn,
        name: item.nomcli
      }));
      setListCustomers(customers);
    }, () => { });

    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const accounts = resp.data.map((item) => ({
        id: item.cta || item.id,
        code: item.cta || item.id,
        name: `${item.cta} - ${item.nombre}`
      }));
      setListAccounts(accounts);
    }, () => { });
  }, []);

  const onCustomerChange = (e) => {
    const idCust = e.target.value;
    const found = listCustomers.find((item) => item.id === idCust);
    setBulkForm({ clientId: idCust, clientRtn: found ? found.rtn : '', clientName: found ? found.name : '' });
  }

  // Igual que el legacy (Optiongroup_hw1.InteractiveChange): cambiar el tipo alterna la
  // pestaña activa y descarta el detalle de la pestaña que deja de aplicar.
  const onTypeChange = (e) => {
    const newType = validInt(e.target.value);
    if (newType === TYPE_ADJUSTMENT) {
      setDetail1([]);
    } else {
      setDetail2([]);
      setOriginInvoice(null);
    }
    setBulkForm({ typeId: newType, valueLps: 0 });
  }

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
      setDataDebitNotes(pending);
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
    const percent = validFloat(formState.discountPercent);
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
      setDataDebitNotes(invoices);
      setOpenModalSeekOrigin(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  // Igual que el legacy: cada línea carga con `qty=0` (sin unidad adicional) y
  // `price=priceInvoiced` (sin corrección de precio) — subtotal arranca en 0, el usuario
  // decide si ajusta cantidad, precio, o ambos.
  const fnSelectOriginInvoice = (invoice) => {
    setLoading(true);
    request.GET(buildUrl('billing/process/invoiceDetail', { idFather: invoice.id }), (resp) => {
      const lines = resp.data.map((item) => ({
        id: new Date().getTime() + Math.random(),
        invoiceId: invoice.id,
        productCode: item.productCode,
        description: item.invProduct ? item.invProduct.name : item.productCode,
        quantityInvoiced: validFloat(item.qty),
        priceInvoiced: validFloat(item.price),
        quantity: 0,
        price: validFloat(item.price),
        taxPercent: validFloat(item.taxPercent),
        subtotal: 0,
        discountValue: 0,
        taxValue: 0,
        valueTotal1: 0
      }));
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

  // Misma fórmula que el LostFocus de cantidad/precio del legacy: si `qty` (cantidad
  // adicional) es distinto de 0, el subtotal es `qty*price` (unidades adicionales al
  // nuevo precio); si `qty` sigue en 0, es una corrección de precio pura sobre lo ya
  // facturado: `qtyInvoiced * (price - priceInvoiced)`. El descuento SIEMPRE es 0.
  const recalcDetail2Line = (item, quantity, price) => {
    const qty = validFloat(quantity);
    const subtotal = qty !== 0
      ? validFloat(qty * price)
      : validFloat(item.quantityInvoiced * (price - item.priceInvoiced));
    const taxValue = validFloat((item.taxPercent * subtotal) / 100);
    const valueTotal1 = validFloat(subtotal + taxValue);
    return { ...item, quantity: qty, price: validFloat(price), subtotal, discountValue: 0, taxValue, valueTotal1 };
  }

  const onChangeDetail2Qty = (rowId, value) => {
    const updated = detail2.map((item) => (item.id === rowId ? recalcDetail2Line(item, value, item.price) : item));
    setDetail2(updated);
    recalcTotalFromDetail2(updated);
  }

  const onChangeDetail2Price = (rowId, value) => {
    const updated = detail2.map((item) => (item.id === rowId ? recalcDetail2Line(item, item.quantity, validFloat(value)) : item));
    setDetail2(updated);
    recalcTotalFromDetail2(updated);
  }

  const fnDeleteDetail2Row = (rowId) => {
    const updated = detail2.filter((item) => item.id !== rowId);
    setDetail2(updated);
    recalcTotalFromDetail2(updated);
    if (updated.length === 0) setOriginInvoice(null);
  }

  const fnNewDebitNote = () => {
    onResetForm();
    setDetail1([]);
    setDetail2([]);
    setOriginInvoice(null);
    setSendForm(false);
  }

  const fnSearchDebitNotes = () => {
    setLoading(true);
    request.GET('billing/process/debitNotes', (resp) => {
      setDataDebitNotes(resp.data);
      setOpenModalSeekDebitNotes(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnViewDebitNote = (item) => {
    setOpenModalSeekDebitNotes(false);
    setLoading(true);
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
      pdaNumber: item.pdaNumber,
      status: item.status
    });

    if (validInt(item.typeId) === TYPE_ADJUSTMENT) {
      request.GET(buildUrl('billing/process/debitNoteProducts', { fatherId: item.id }), (resp) => {
        const lines = resp.data.map((line) => ({
          id: line.id,
          invoiceId: line.invoiceId,
          productCode: line.productCode,
          description: line.invProduct ? line.invProduct.name : line.productCode,
          quantityInvoiced: 0,
          priceInvoiced: 0,
          quantity: validFloat(line.quantity),
          price: validFloat(line.price),
          taxPercent: 0,
          subtotal: validFloat(line.subtotal),
          discountValue: validFloat(line.discountValue),
          taxValue: validFloat(line.taxValue),
          valueTotal1: validFloat(line.valueTotal1)
        }));
        setDetail2(lines);
        setDetail1([]);
        if (lines.length > 0) {
          request.GET(`billing/process/invoices/${lines[0].invoiceId}`, (respInv) => {
            const invoiceId = lines[0].invoiceId;
            request.GET(buildUrl('billing/process/invoiceDetail', { idFather: invoiceId }), (respDet) => {
              const byProduct = new Map(respDet.data.map((d) => [d.productCode, d]));
              setDetail2((current) => current.map((line) => {
                const origin = byProduct.get(line.productCode);
                return origin ? { ...line, quantityInvoiced: validFloat(origin.qty), priceInvoiced: validFloat(origin.price), taxPercent: validFloat(origin.taxPercent) } : line;
              }));
              setOriginInvoice({
                id: respInv.data.id,
                invoiceNumber: `${respInv.data.documentCode}-${respInv.data.documentId}`,
                numcai: respInv.data.numcai,
                date: respInv.data.date
              });
              setLoading(false);
            }, () => { setLoading(false); });
          }, () => { setLoading(false); });
        } else {
          setLoading(false);
        }
      }, () => { setLoading(false); });
    } else {
      request.GET(buildUrl('billing/process/debitNoteInvoices', { fatherId: item.id }), (resp) => {
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

  const fnSaveDebitNote = () => {
    setSendForm(true);
    if (!isFormValid) return;

    const { date, name, typeOther, docValueUSD, exchangeRate, accCode, currenId, valueLps } = formState;

    if (validFloat(valueLps) <= 0) {
      notification('warning', 'msg.error.invalidValue', 'alert.warning.title');
      return;
    }
    if (isAdjustment) {
      if (!originInvoice) {
        notification('warning', 'msg.required.select.originInvoice', 'alert.warning.title');
        return;
      }
    } else {
      if (detail1.length === 0) {
        notification('warning', 'msg.required.select.invoiceToApply', 'alert.warning.title');
        return;
      }
      if (!accCode) {
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
      accCode: !isAdjustment ? accCode : '',
      currenId,
      invoCode: isAdjustment && originInvoice ? originInvoice.numcai : ''
    }

    setLoading(true);
    const afterSaveHeader = (noteId) => {
      request.DELETE(buildUrl('billing/process/debitNoteInvoices', { fatherId: noteId }), () => {
        request.DELETE(buildUrl('billing/process/debitNoteProducts', { fatherId: noteId }), () => {
          if (isAdjustment) {
            const rows = detail2.map((item) => ({
              fatherId: noteId,
              invoiceId: item.invoiceId,
              productCode: item.productCode,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal,
              discountValue: item.discountValue,
              taxValue: item.taxValue,
              valueTotal1: item.valueTotal1
            }));
            request.POST('billing/process/debitNoteProducts/createMany', rows, () => {
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
            request.POST('billing/process/debitNoteInvoices/createMany', rows, () => {
              notification('success', 'msg.success.save', 'alert.success.title');
              setLoading(false);
            }, () => { setLoading(false); });
          }
        }, () => { setLoading(false); });
      }, () => { setLoading(false); });
    }

    if (id > 0) {
      request.PUT(`billing/process/debitNotes/${id}`, newData, () => {
        afterSaveHeader(id);
      }, () => { setLoading(false); });
    } else {
      request.POST('billing/process/debitNotes', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        afterSaveHeader(resp.data.id);
      }, () => { setLoading(false); });
    }
  }

  const fnAskProcess = () => {
    if (id === 0) return;
    setOpenMsgProcess(true);
  }

  const fnProcessDebitNote = () => {
    setOpenMsgProcess(false);
    setLoading(true);
    request.POST(`billing/process/debitNotes/process/${id}`, {}, (resp) => {
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
        notification('error', `msg.error.debitNote.${errorCode}`, 'alert.error.title');
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

  const fnVoidDebitNote = (reason) => {
    setLoading(true);
    request.DELETE(buildUrl(`billing/process/debitNotes/void/${id}`, { reason }), () => {
      setOpenModalVoid(false);
      fnNewDebitNote();
      notification('success', 'msg.success.voidDebitNote', 'alert.success.title');
      setLoading(false);
    }, () => {
      notification('error', 'msg.delete.record.error', 'alert.error.title');
      setLoading(false);
    }, false);
  }

  const fnPrintDebitNote = () => {
    if (id === 0) return;
    setLoading(true);
    request.GETPdfUrl('billing/process/debitNotes/exportPDF', { id, userName: userData.name }, (resp) => {
      setDocumentPathPrint(resp);
      setOpenModalPrint(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const propsToControlPanel = {
    fnNew: fnNewDebitNote,
    fnSearch: fnSearchDebitNotes,
    fnSave: screenControl.fnCreate && !isProcessed ? fnSaveDebitNote : null,
    fnPrint: isSaved ? fnPrintDebitNote : null,
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
    onCustomerChange, onTypeChange,
    fnAddInvoices, onChangeDetail1Row, fnApplyPercentToAll, fnDeleteDetail1Row,
    fnSeekOriginInvoice, onChangeDetail2Qty, onChangeDetail2Price, fnDeleteDetail2Row,
    isProcessed, isVoided, isAdjustment,
    openModalAddInvoices, setOpenModalAddInvoices, dataDebitNotes, fnConfirmAddInvoices,
    openModalSeekOrigin, setOpenModalSeekOrigin, fnSelectOriginInvoice,
    openModalSeekDebitNotes, setOpenModalSeekDebitNotes, fnViewDebitNote,
    openModalVoid, setOpenModalVoid, fnVoidDebitNote,
    openMsgProcess, setOpenMsgProcess, fnProcessDebitNote,
    openModalPrint, setOpenModalPrint, documentPathPrint,
    propsToControlPanel
  }
}
