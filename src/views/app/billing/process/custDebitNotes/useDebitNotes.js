import { useEffect, useState } from 'react';
import { request, buildUrl, notifyError } from '@Helpers/core';
import { useForm } from '@Hooks';
import DateHelper from '@Helpers/DateHelper';
import { validFloat, validInt } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';
import { printDocument } from '@Helpers/printDocument';
import { findHeaderProblem, findDetailProblem, buildNotePayload, isNoteLocked, PRINT_PATH, PRINT_FILE_NAME } from './debitNoteRules';

export const TYPE_LATE_FEE = 1;
export const TYPE_OTHER_CHARGE = 2;
export const TYPE_ADJUSTMENT = 3;
export const TYPE_OTHER = 4;

const debitNoteValid = {
  documentCode: [(val) => val !== '', 'msg.required.select.typeDocument'],
  customerId: [(val) => validInt(val) > 0, 'msg.required.select.customer']
}

// Toda nota de débito requiere CAI fiscal — a diferencia de Notas de Crédito,
// fac_ndebito.sc2 no tiene una variante `_mixed` (confirmado, sin toggle de moneda/CAI).
export const useDebitNotes = ({ setLoading, screenControl }) => {
  const [listTypeDocuments, setListTypeDocuments] = useState([]);
  const [listCustomers, setListCustomers] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);
  const [detail1, setDetail1] = useState([]); // facturas de referencia (tipos 1/2/4)
  const [detail2, setDetail2] = useState([]); // ajuste de productos (tipo 3)
  const [originInvoice, setOriginInvoice] = useState(null); // factura origen (tipo 3)
  const [sendForm, setSendForm] = useState(false);
  const [openModalAddInvoices, setOpenModalAddInvoices] = useState(false);
  const [openModalSeekOrigin, setOpenModalSeekOrigin] = useState(false);
  const [openModalSeekDebitNotes, setOpenModalSeekDebitNotes] = useState(false);
  const [openModalVoid, setOpenModalVoid] = useState(false);
  const [openMsgProcess, setOpenMsgProcess] = useState(false);
  const [openMsgDelete, setOpenMsgDelete] = useState(false);
  const [dataDebitNotes, setDataDebitNotes] = useState([]);

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    documentCode: '',
    documentId: 0,
    numberCAI: '',
    date: DateHelper.format(new Date()),
    customerId: 0,
    clientRtn: '',
    clientName: '',
    typeId: TYPE_LATE_FEE,
    typeOther: '',
    description: '',
    valueLps: 0,
    valueUsd: 0,
    exchangeRate: 1,
    discountPercent: 0,
    incomeCtaCode: '',
    currencyId: 1,
    pdaNumber: 0,
    status: 1
  }, debitNoteValid);

  const { id, customerId, typeId, pdaNumber, status, numberCAI } = formState;

  const isProcessed = validInt(pdaNumber) > 0;
  // Con número fiscal o partida la nota no se edita ni se elimina (se anula): el back responde debitNote.locked.fiscal.
  const isLocked = isNoteLocked({ pdaNumber, numberCAI });
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
        label: `${item.id} | ${item.dni} | ${item.name}`,
        value: item.id,
        rtn: item.dni,
        name: item.name
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
    setBulkForm({ customerId: idCust, clientRtn: found ? found.rtn : '', clientName: found ? found.name : '' });
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
    const sum = rows.reduce((acc, item) => acc + validFloat(item.appliedValue), 0);
    setBulkForm({ valueLps: sum });
  }
  const recalcTotalFromDetail2 = (rows) => {
    const sum = rows.reduce((acc, item) => acc + validFloat(item.total), 0);
    setBulkForm({ valueLps: sum });
  }

  const fnAddInvoices = () => {
    if (validInt(customerId) === 0) {
      notification('warning', 'msg.required.select.customer', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(buildUrl('accounting/process/cxc/pendingByCustomer', { customerId }), (resp) => {
      const existingCodes = detail1.map((item) => item.invoiceNumber);
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
      invoiceDate: item.date,
      customerId,
      invoiceNumber: item.documentCode,
      invoiceBalance: item.balance,
      percent: 100,
      appliedValue: item.balance,
      valueUsd: 0,
      appliedValueUsd: 0
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
        return { ...item, percent, appliedValue: validFloat((percent * item.invoiceBalance) / 100) };
      }
      if (field === 'appliedValue') {
        const appliedValue = validFloat(value);
        const percent = item.invoiceBalance > 0 ? validFloat((appliedValue * 100) / item.invoiceBalance) : 0;
        return { ...item, appliedValue, percent };
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
      appliedValue: validFloat((percent * item.invoiceBalance) / 100)
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
    if (validInt(customerId) === 0) {
      notification('warning', 'msg.required.select.customer', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(buildUrl('billing/process/invoices', { customerId, isPos: 0 }), (resp) => {
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
        total: 0
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
    const total = validFloat(subtotal + taxValue);
    return { ...item, quantity: qty, price: validFloat(price), subtotal, discountValue: 0, taxValue, total };
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

  // Buscar: el modal pide páginas de 50 con búsqueda en el servidor (SPEC v2-92-sr).
  const fnSearchDebitNotes = () => setOpenModalSeekDebitNotes(true);

  // La fila del buscador trae solo la cabecera: el detalle (facturas aplicadas o productos del ajuste) llega con GET /:id.
  const fnViewDebitNote = (row) => {
    setOpenModalSeekDebitNotes(false);
    setLoading(true);
    request.GET(`billing/process/debitNotes/${row.id}`, (resp) => {
      const item = resp.data;
      setBulkForm({
        id: item.id,
        documentCode: item.documentCode,
        documentId: item.documentId,
        numberCAI: item.numberCAI,
        date: item.date,
        customerId: item.customerId,
        clientRtn: item.clientData ? item.clientData.dni : '',
        clientName: item.clientData ? item.clientData.name : '',
        typeId: item.typeId,
        typeOther: item.typeOther,
        description: item.description,
        valueLps: item.valueLps,
        valueUsd: item.valueUsd,
        exchangeRate: item.exchangeRate,
        discountPercent: 0,
        incomeCtaCode: item.incomeCtaCode,
        currencyId: item.currencyId,
        pdaNumber: item.pdaNumber,
        status: item.status
      });

      if (validInt(item.typeId) === TYPE_ADJUSTMENT) {
        const lines = item.products.map((line) => ({
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
          total: validFloat(line.total)
        }));
        setDetail2(lines);
        setDetail1([]);
        if (lines.length === 0) {
          setLoading(false);
          return;
        }
        const invoiceId = lines[0].invoiceId;
        request.GET(`billing/process/invoices/${invoiceId}`, (respInv) => {
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
        setDetail1(item.invoices.map((line) => ({
          id: line.id,
          invoiceDate: line.invoiceDate,
          customerId: line.customerId,
          invoiceNumber: line.invoiceNumber,
          invoiceBalance: validFloat(line.invoiceBalance),
          percent: validFloat(line.percent),
          appliedValue: validFloat(line.appliedValue),
          valueUsd: validFloat(line.valueUsd),
          appliedValueUsd: validFloat(line.appliedValueUsd)
        })));
        setDetail2([]);
        setOriginInvoice(null);
        setLoading(false);
      }
    }, () => { setLoading(false); });
  }

  const fnSaveDebitNote = () => {
    setSendForm(true);
    if (!isFormValid) return;

    const headerProblem = findHeaderProblem(formState);
    if (headerProblem) {
      notification('warning', headerProblem.messageId, 'alert.warning.title');
      return;
    }
    const detailProblem = findDetailProblem({ typeId, detail1, detail2, originInvoice });
    if (detailProblem) {
      notification('warning', detailProblem.messageId, 'alert.warning.title');
      return;
    }

    // Un solo POST o PUT: el back guarda cabecera y detalle en una transacción y calcula valores, desglose, total y dólares. Se muestra lo que respondió.
    const body = buildNotePayload(formState, { originInvoice, detail1, detail2 });
    setLoading(true);
    const applyResult = (data) => {
      setBulkForm({ id: data.id, valueLps: data.valueLps, valueUsd: data.valueUsd });
      if (isAdjustment) {
        setDetail2((current) => current.map((line, index) => {
          const saved = data.products[index];
          return saved ? { ...line, subtotal: saved.subtotal, taxValue: saved.taxValue, total: saved.total, discountValue: saved.discountValue } : line;
        }));
      } else {
        setDetail1(data.invoices.map((line, index) => ({ ...detail1[index], ...line, id: detail1[index] ? detail1[index].id : index })));
      }
      setLoading(false); // el toast de éxito ya lo muestra request.POST/PUT
    };

    if (id > 0) {
      request.PUT(`billing/process/debitNotes/${id}`, body, (resp) => applyResult(resp.data), () => { setLoading(false); });
    } else {
      request.POST('billing/process/debitNotes', body, (resp) => applyResult(resp.data), () => { setLoading(false); });
    }
  }

  // Eliminar: solo una nota sin contabilizar (el back borra cabecera y detalle en una transacción); una contabilizada se anula.
  const fnAskDelete = () => {
    if (id === 0 || isLocked) return;
    setOpenMsgDelete(true);
  }

  const fnDeleteDebitNote = () => {
    setOpenMsgDelete(false);
    setLoading(true);
    request.DELETE(`billing/process/debitNotes/${id}`, () => {
      fnNewDebitNote();
      setLoading(false);
    }, () => { setLoading(false); });
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
      // SPEC v2-93: el rechazo del back (período, cuenta bloqueada, existencias, partida) se muestra con su mensaje real.
      notifyError(err, 'msg.error.processDocument');
      setLoading(false);
    }, false);
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
    }, (err) => {
      // El 403 del privilegio de anular, el período cerrado y el motivo vacío llegan con su mensaje real.
      notifyError(err, 'msg.delete.record.error');
      setLoading(false);
    }, false);
  }

  // SPEC v2-94-sr: el PDF sale de lo GUARDADO (GET /:id/print); una nota sin guardar avisa que hay que guardar primero.
  const fnPrintDebitNote = () => {
    printDocument({ path: PRINT_PATH, id, fileName: PRINT_FILE_NAME, setLoading });
  }

  const propsToControlPanel = {
    fnNew: fnNewDebitNote,
    fnSearch: fnSearchDebitNotes,
    fnSave: screenControl.fnCreate && !isLocked ? fnSaveDebitNote : null,
    fnDelete: screenControl.fnDelete && isSaved && !isLocked ? fnAskDelete : null,
    fnPrint: isSaved ? fnPrintDebitNote : null,
    fnCancel: screenControl.fnDelete && isProcessed && !isVoided ? fnAskVoid : null,
    buttonsHome: [
      {
        title: "button.count",
        icon: "bi bi-journal-check",
        onClick: screenControl.fnUpdate && isSaved && !isProcessed ? fnAskProcess : () => { },
        disabled: !isSaved || isProcessed || isVoided // una nota sin guardar, ya contabilizada o anulada no se contabiliza
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
    isProcessed, isVoided, isAdjustment, isLocked,
    openModalAddInvoices, setOpenModalAddInvoices, dataDebitNotes, fnConfirmAddInvoices,
    openModalSeekOrigin, setOpenModalSeekOrigin, fnSelectOriginInvoice,
    openModalSeekDebitNotes, setOpenModalSeekDebitNotes, fnViewDebitNote,
    openModalVoid, setOpenModalVoid, fnVoidDebitNote,
    openMsgProcess, setOpenMsgProcess, fnProcessDebitNote,
    openMsgDelete, setOpenMsgDelete, fnDeleteDebitNote,
    propsToControlPanel
  }
}
