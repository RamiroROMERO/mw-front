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
  providerId: [(val) => validInt(val) > 0, 'msg.required.select.provider'],
  cai: [(val) => val !== '', 'msg.required.input.code'],
  numberCAI: [(val) => val !== '', 'msg.required.input.code']
}

export const useCreditNotes = ({ setLoading }) => {
  const [listDocuments, setListDocuments] = useState([]);
  const [listProviders, setListProviders] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);
  const [detail1, setDetail1] = useState([]); // compras aplicadas (tipos 1/2/4)
  const [detail2, setDetail2] = useState([]); // productos devueltos (tipo 3)
  const [originPurchase, setOriginPurchase] = useState(null); // compra origen (tipo 3)
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
    cai: '',
    numberCAI: '',
    date: DateHelper.format(new Date()),
    providerId: 0,
    providerRtn: '',
    providerName: '',
    typeId: TYPE_DISCOUNT,
    typeOther: '',
    name: '',
    valueLps: 0,
    docValueUSD: 0,
    exchangeRate: 1,
    discountPercent: 0,
    accCode: '',
    currenId: 1,
    invoCode: '',
    pdaNumber: 0,
    status: 1,
    // La mayoría de notas reales de esta pantalla son "Mixtas" (is_mixed=1 en BD:
    // 306 de 310 registros existentes) — se deja marcada por defecto.
    isMixed: true
  }, creditNoteValid);

  const { id, documentCode, providerId, typeId, pdaNumber, status } = formState;

  const isProcessed = validInt(pdaNumber) > 0;
  const isVoided = validInt(status) === 0;
  const isSaved = validInt(id) > 0;
  const isReturn = validInt(typeId) === TYPE_RETURN;
  const disabled = isProcessed || isVoided;

  useEffect(() => {
    setLoading(true);
    request.GET('admin/documents?status=1&useInv=1&useTaxDocument=1', (resp) => {
      const documents = resp.data.map((item) => ({
        id: item.code,
        code: item.code,
        name: `${item.code} | ${item.name}`
      }));
      setListDocuments(documents);
      setLoading(false);
    }, () => { setLoading(false); });

    request.GET('inventory/process/providers', (resp) => {
      const providers = resp.data.map((item) => ({
        id: item.id,
        label: item.name,
        value: item.id,
        rtn: item.dni,
        name: item.name
      }));
      setListProviders(providers);
    }, () => { });

    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const accounts = resp.data.map((item) => ({
        id: item.cta,
        code: item.cta,
        name: `${item.cta} - ${item.nombre}`
      }));
      setListAccounts(accounts);
    }, () => { });
  }, []);

  const onProviderChange = (e) => {
    const idProv = e.target.value;
    const found = listProviders.find((item) => item.id === idProv);
    setBulkForm({ providerId: idProv, providerRtn: found ? found.rtn : '', providerName: found ? found.name : '' });
  }

  // Igual que el legacy: cambiar el tipo alterna la pestaña activa y descarta el detalle
  // de la pestaña que deja de aplicar, para no guardar líneas huérfanas de un tipo que ya
  // no corresponde.
  const onTypeChange = (e) => {
    const newType = validInt(e.target.value);
    if (newType === TYPE_RETURN) {
      setDetail1([]);
    } else {
      setDetail2([]);
      setOriginPurchase(null);
      setBulkForm({ invoCode: '' });
    }
    setBulkForm({ typeId: newType, valueLps: 0 });
  }

  const recalcTotalFromDetail1 = (rows) => {
    const sum = rows.reduce((acc, item) => acc + validFloat(item.valuePayment), 0);
    setBulkForm({ valueLps: sum });
  }
  const recalcTotalFromDetail2 = (rows) => {
    const sum = rows.reduce((acc, item) => acc + validFloat(item.totalReturn), 0);
    setBulkForm({ valueLps: sum });
  }

  const fnAddInvoices = () => {
    if (validInt(providerId) === 0) {
      notification('warning', 'msg.required.select.provider', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(buildUrl('accounting/process/accountsPayable/findPendingByProvider', { providerId }), (resp) => {
      const existingCodes = detail1.map((item) => item.cpaCode);
      const pending = resp.data
        .filter((item) => !existingCodes.includes(item.documentCode))
        .map((item) => ({
          cxpId: item.id,
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
      cxpId: item.cxpId,
      dateDocument: item.date,
      cpaCode: item.documentCode,
      cpaCai: '',
      cpaOc: '',
      balance: item.balance,
      percent: 100,
      valuePayment: item.balance
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
        return { ...item, percent, valuePayment: validFloat((percent * item.balance) / 100) };
      }
      if (field === 'valuePayment') {
        const valuePayment = validFloat(value);
        const percent = item.balance > 0 ? validFloat((valuePayment * 100) / item.balance) : 0;
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
      valuePayment: validFloat((percent * item.balance) / 100)
    }));
    setDetail1(updated);
    recalcTotalFromDetail1(updated);
  }

  const fnDeleteDetail1Row = (rowId) => {
    const updated = detail1.filter((item) => item.id !== rowId);
    setDetail1(updated);
    recalcTotalFromDetail1(updated);
  }

  const fnSeekOriginPurchase = () => {
    if (validInt(providerId) === 0) {
      notification('warning', 'msg.required.select.provider', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(buildUrl('inventory/process/purchases', { providerId }), (resp) => {
      const purchases = resp.data.filter((item) => validInt(item.pdaNumber) > 0 && validInt(item.status) !== 0);
      setDataCreditNotes(purchases);
      setOpenModalSeekOrigin(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnSelectOriginPurchase = (purchase) => {
    setLoading(true);
    request.GET(buildUrl('inventory/process/purchaseDetail', { purchaseId: purchase.id }), (resp) => {
      const lines = resp.data.map((item) => {
        const qty = validFloat(item.qty);
        const price = validFloat(item.price);
        const discountPercent = validFloat(item.discountPercent);
        const taxPercent = validFloat(item.taxPercent);
        const subtotal = validFloat(item.subtotal);
        const discountValue = validFloat(item.discount);
        const taxValue = validFloat(item.tax);
        return {
          id: item.id,
          cpaId: item.id,
          productCode: item.productCode,
          description: item.productData ? item.productData.name : item.productCode,
          qty,
          qtyReturn: qty,
          price,
          discountPercent,
          taxPercent,
          cost: price,
          storeId: item.storeId,
          productLot: item.lotCode,
          dateOut: item.dateOut,
          subtotal,
          discountValue,
          taxValue,
          totalReturn: validFloat(item.total)
        }
      });
      setDetail2(lines);
      recalcTotalFromDetail2(lines);
      setOriginPurchase({ id: purchase.id, numCai: purchase.numCai, date: purchase.date });
      setBulkForm({ invoCode: purchase.numCai });
      setOpenModalSeekOrigin(false);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const onChangeDetail2Qty = (rowId, value) => {
    const updated = detail2.map((item) => {
      if (item.id !== rowId) return item;
      let qtyReturn = validFloat(value);
      if (qtyReturn > item.qty) qtyReturn = item.qty;
      if (qtyReturn < 0) qtyReturn = 0;
      const subtotal = validFloat(qtyReturn * item.price);
      const discountValue = validFloat((item.discountPercent * subtotal) / 100);
      const taxValue = validFloat((item.taxPercent * (subtotal - discountValue)) / 100);
      const totalReturn = validFloat((subtotal - discountValue) + taxValue);
      return { ...item, qtyReturn, subtotal, discountValue, taxValue, totalReturn };
    });
    setDetail2(updated);
    recalcTotalFromDetail2(updated);
  }

  const fnDeleteDetail2Row = (rowId) => {
    const updated = detail2.filter((item) => item.id !== rowId);
    setDetail2(updated);
    recalcTotalFromDetail2(updated);
    if (updated.length === 0) {
      setOriginPurchase(null);
      setBulkForm({ invoCode: '' });
    }
  }

  const fnNewCreditNote = () => {
    onResetForm();
    setDetail1([]);
    setDetail2([]);
    setOriginPurchase(null);
    setSendForm(false);
  }

  const fnSearchCreditNotes = () => {
    setLoading(true);
    request.GET('inventory/process/creditNotes', (resp) => {
      setDataCreditNotes(resp.data);
      setOpenModalSeekCreditNotes(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnViewCreditNote = (item) => {
    setOpenModalSeekCreditNotes(false);
    setLoading(true);
    setBulkForm({
      id: item.id,
      documentCode: item.documentCode,
      documentId: item.documentId,
      cai: item.cai,
      numberCAI: item.numberCAI,
      date: item.date,
      providerId: item.providerId,
      providerRtn: item.providerData ? item.providerData.dni : '',
      providerName: item.providerData ? item.providerData.name : '',
      typeId: item.typeId,
      typeOther: item.typeOther,
      name: item.name,
      valueLps: item.valueLps,
      docValueUSD: item.docValueUSD,
      exchangeRate: item.exchangeRate,
      discountPercent: 0,
      accCode: item.accCode,
      currenId: item.currenId,
      invoCode: item.invoCode,
      pdaNumber: item.pdaNumber,
      status: item.status,
      isMixed: validInt(item.isMixed) === 1
    });

    if (validInt(item.typeId) === TYPE_RETURN) {
      request.GET(buildUrl('inventory/process/creditNoteProducts', { fatherId: item.id }), (resp) => {
        const lines = resp.data.map((line) => {
          const qty = validFloat(line.quantity);
          const subtotal = validFloat(line.subtotal);
          const discountValue = validFloat(line.discountValue);
          const taxValue = validFloat(line.taxValue);
          // El detalle guardado no persiste price/discountPercent/taxPercent (solo los
          // valores ya calculados) — se re-derivan para poder seguir editando la cantidad
          // a devolver sin perder la proporción de descuento/impuesto original.
          return {
            id: line.id,
            cpaId: line.cpaId,
            productCode: line.productCode,
            description: line.productData ? line.productData.name : line.productCode,
            qty,
            qtyReturn: qty,
            price: qty > 0 ? subtotal / qty : 0,
            discountPercent: subtotal > 0 ? (discountValue * 100) / subtotal : 0,
            taxPercent: (subtotal - discountValue) > 0 ? (taxValue * 100) / (subtotal - discountValue) : 0,
            cost: validFloat(line.cost),
            storeId: line.storeId,
            productLot: line.productLot,
            dateOut: line.dateOut,
            subtotal,
            discountValue,
            taxValue,
            totalReturn: validFloat(line.valueTotal1)
          };
        });
        setDetail2(lines);
        setDetail1([]);
        setOriginPurchase(item.invoCode ? { numCai: item.invoCode } : null);
        setLoading(false);
      }, () => { setLoading(false); });
    } else {
      request.GET(buildUrl('inventory/process/creditNoteInvoices', { fatherId: item.id }), (resp) => {
        const lines = resp.data.map((line) => ({
          id: line.id,
          cxpId: line.cxpId,
          dateDocument: line.dateDocument,
          cpaCode: line.cpaCode,
          cpaCai: line.cpaCai,
          cpaOc: line.cpaOc,
          balance: validFloat(line.cpaVal),
          percent: validFloat(line.percent),
          valuePayment: validFloat(line.valuePayment)
        }));
        setDetail1(lines);
        setDetail2([]);
        setOriginPurchase(null);
        setLoading(false);
      }, () => { setLoading(false); });
    }
  }

  const fnSaveCreditNote = () => {
    setSendForm(true);
    if (!isFormValid) return;

    const { date, typeOther, name, valueLps, docValueUSD, exchangeRate, accCode, currenId, cai, numberCAI, isMixed } = formState;

    if (validFloat(valueLps) <= 0) {
      notification('warning', 'msg.error.invalidValue', 'alert.warning.title');
      return;
    }
    if (isReturn) {
      if (detail2.filter((item) => validFloat(item.qtyReturn) > 0).length === 0) {
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
      providerId,
      typeId,
      typeOther,
      name,
      valueLps,
      docValueUSD,
      exchangeRate,
      accCode: !isReturn ? accCode : '',
      currenId,
      cai,
      numberCAI,
      invoCode: isReturn ? (originPurchase ? originPurchase.numCai : '') : '',
      isMixed: isMixed ? 1 : 0
    }

    setLoading(true);
    const afterSaveHeader = (noteId) => {
      // El DELETE previo (limpiar detalle viejo antes de reinsertar) devuelve 404
      // "delete.not.found" cuando no había filas que borrar — el caso normal en el primer
      // Guardar de una nota nueva. No es un error real: se continúa igual hacia el insert
      // tanto si el DELETE tuvo éxito como si no encontró nada que borrar.
      const insertDetail = () => {
        if (isReturn) {
          const rows = detail2.filter((item) => validFloat(item.qtyReturn) > 0).map((item) => ({
            fatherId: noteId,
            cpaId: item.cpaId,
            productCode: item.productCode,
            quantity: item.qtyReturn,
            subtotal: item.subtotal,
            discountValue: item.discountValue,
            taxValue: item.taxValue,
            valueTotal1: item.totalReturn,
            storeId: item.storeId,
            cost: item.cost,
            productLot: item.productLot,
            dateOut: item.dateOut
          }));
          request.POST('inventory/process/creditNoteProducts/createMany', rows, () => {
            notification('success', 'msg.success.save', 'alert.success.title');
            setLoading(false);
          }, () => { setLoading(false); });
        } else {
          const rows = detail1.map((item) => ({
            fatherId: noteId,
            dateDocument: item.dateDocument,
            providerId,
            cpaCode: item.cpaCode,
            cpaCai: item.cpaCai,
            cpaOc: item.cpaOc,
            cpaVal: item.balance,
            percent: item.percent,
            valuePayment: item.valuePayment
          }));
          request.POST('inventory/process/creditNoteInvoices/createMany', rows, () => {
            notification('success', 'msg.success.save', 'alert.success.title');
            setLoading(false);
          }, () => { setLoading(false); });
        }
      }
      request.DELETE(buildUrl('inventory/process/creditNoteInvoices', { fatherId: noteId }), () => {
        request.DELETE(buildUrl('inventory/process/creditNoteProducts', { fatherId: noteId }), insertDetail, insertDetail, false);
      }, () => {
        request.DELETE(buildUrl('inventory/process/creditNoteProducts', { fatherId: noteId }), insertDetail, insertDetail, false);
      }, false);
    }

    if (id > 0) {
      request.PUT(`inventory/process/creditNotes/${id}`, newData, () => {
        afterSaveHeader(id);
      }, () => { setLoading(false); });
    } else {
      request.POST('inventory/process/creditNotes', newData, (resp) => {
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
    request.POST(`inventory/process/creditNotes/process/${id}`, {}, (resp) => {
      setBulkForm({ pdaNumber: resp.data.numberPDA, documentId: resp.data.documentId || formState.documentId });
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
    request.DELETE(buildUrl(`inventory/process/creditNotes/void/${id}`, { reason }), () => {
      setOpenModalVoid(false);
      fnNewCreditNote();
      notification('success', 'msg.success.voidCreditNote', 'alert.success.title');
      setLoading(false);
    }, () => {
      notification('error', 'msg.delete.record.error', 'alert.error.title');
      setLoading(false);
    }, false);
  }

  const propsToControlPanel = {
    fnNew: fnNewCreditNote,
    fnSearch: fnSearchCreditNotes,
    fnSave: !disabled ? fnSaveCreditNote : null,
    fnPrint: null,
    fnCancel: isProcessed && !isVoided ? fnAskVoid : null,
    buttonsHome: [
      {
        title: 'button.count',
        icon: 'bi bi-journal-check',
        onClick: isSaved && !isProcessed ? fnAskProcess : () => { }
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  return {
    formState, formValidation, onInputChange, setBulkForm, sendForm,
    listDocuments, listProviders, listAccounts,
    detail1, detail2, originPurchase,
    onProviderChange, onTypeChange,
    fnAddInvoices, onChangeDetail1Row, fnApplyPercentToAll, fnDeleteDetail1Row,
    fnSeekOriginPurchase, onChangeDetail2Qty, fnDeleteDetail2Row,
    isProcessed, isVoided, isSaved, isReturn, disabled,
    openModalAddInvoices, setOpenModalAddInvoices, dataCreditNotes, fnConfirmAddInvoices,
    openModalSeekOrigin, setOpenModalSeekOrigin, fnSelectOriginPurchase,
    openModalSeekCreditNotes, setOpenModalSeekCreditNotes, fnViewCreditNote,
    openModalVoid, setOpenModalVoid, fnVoidCreditNote,
    openMsgProcess, setOpenMsgProcess, fnProcessCreditNote,
    propsToControlPanel
  }
}
