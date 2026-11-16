import { useEffect, useMemo, useState } from 'react';
import { request, buildUrl, notifyError } from '@Helpers/core';
import { useForm } from '@Hooks';
import DateHelper from '@Helpers/DateHelper';
import { validInt } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';
import { useProductOptions } from '@Views/app/inventory/settings/productsCatalog/useProductOptions';
import { withSelectedOption } from '@Views/app/inventory/settings/productsCatalog/pagingRules';
import { printDocument } from '@Helpers/printDocument';
import { printOptions } from './creditNotePrintRules';
import {
  TYPE_DISCOUNT, TYPE_CANCEL, TYPE_RETURN, TYPE_OTHER, validateNote, buildPayload, noteState, normalizeNote, buildInvoiceLine, buildReturnLinesFromPurchase,
  setReturnQty, sumApplied, sumReturn, appliedFromPercent, percentFromApplied, isReturnType, isMixedNote, emptyMixedDraft, validateMixedDraft, mixedLineFromDraft,
  setMixedField, sumMixed
} from './creditNoteRules';

export { TYPE_DISCOUNT, TYPE_CANCEL, TYPE_RETURN, TYPE_OTHER };

const DEFAULT_DOCUMENT = 'NCP';

const INITIAL_FORM = {
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
  description: '',
  valueLps: 0,
  docValueUSD: 0,
  exchangeRate: 1,
  discountPercent: 0,
  accCode: '',
  currenId: 1,
  originInvoiceNumber: '',
  pdaNumber: 0,
  status: 1,
  // Una nota nueva es una nota normal; la mixta es una casilla explícita.
  isMixed: false
};

// Notas de crédito de proveedores. El back calcula los importes y guarda la nota y su detalle en una sola transacción (un POST o
// un PUT); el front arma las líneas, valida los campos sin llamar al back y muestra el mensaje real de cualquier rechazo.
export const useCreditNotes = ({ setLoading }) => {
  const [listDocuments, setListDocuments] = useState([]);
  const [listProviders, setListProviders] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);
  const [listStores, setListStores] = useState([]);
  // Nota mixta (SPEC v2-47-sr): la línea que se está digitando y el combo de productos con búsqueda en el servidor.
  const [draft, setDraft] = useState(() => emptyMixedDraft());
  const [draftLabel, setDraftLabel] = useState(null);
  const { options: productOptions, onInputChange: onProductSearch } = useProductOptions();
  const [detail1, setDetail1] = useState([]); // compras aplicadas (descuento, anulación y otros)
  const [detail2, setDetail2] = useState([]); // productos devueltos (devolución)
  const [originPurchase, setOriginPurchase] = useState(null); // compra origen (devolución)
  const [sendForm, setSendForm] = useState(false);
  const [openModalAddInvoices, setOpenModalAddInvoices] = useState(false);
  const [openModalSeekOrigin, setOpenModalSeekOrigin] = useState(false);
  const [openModalSeekCreditNotes, setOpenModalSeekCreditNotes] = useState(false);
  const [openModalVoid, setOpenModalVoid] = useState(false);
  const [openMsgProcess, setOpenMsgProcess] = useState(false);
  const [openMsgRepost, setOpenMsgRepost] = useState(false);
  const [dataCreditNotes, setDataCreditNotes] = useState([]);
  // NCP (Notas de Crédito de Proveedores) es el documento de esta pantalla: una nota nueva arranca con él si existe.
  const [defaultDocument, setDefaultDocument] = useState('');

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm(INITIAL_FORM, {});

  const { id, providerId, typeId, pdaNumber, status } = formState;
  const state = noteState({ id, pdaNumber, status });
  const isReturn = isReturnType(typeId);
  const isMixed = isMixedNote(formState);
  const disabled = state.locked;
  const errors = useMemo(() => validateNote(formState, { invoices: detail1, products: detail2 }), [formState, detail1, detail2]);

  useEffect(() => {
    setLoading(true);
    request.GET('admin/documents?status=1&useInv=1', (resp) => {
      const documents = resp.data.map((item) => ({ id: item.code, code: item.code, name: `${item.code} | ${item.name}` }));
      setListDocuments(documents);
      if (documents.some((item) => item.code === DEFAULT_DOCUMENT)) {
        setDefaultDocument(DEFAULT_DOCUMENT);
        setBulkForm({ documentCode: DEFAULT_DOCUMENT });
      }
      setLoading(false);
    }, () => { setLoading(false); });

    request.GET('inventory/process/providers', (resp) => {
      setListProviders(resp.data.map((item) => ({ id: item.id, label: item.name, value: item.id, rtn: item.dni, name: item.name })));
    }, () => { });

    request.GET('inventory/settings/stores?type=1', (resp) => {
      setListStores((resp.data || []).map((item) => ({ label: item.name, value: item.id })));
    }, () => { });

    request.GET('accounting/settings/accountants/getSL', (resp) => {
      setListAccounts(resp.data.map((item) => ({ id: item.cta, code: item.cta, name: `${item.cta} - ${item.nombre}` })));
    }, () => { });
  }, []);

  const setTotal = (value) => setBulkForm({ valueLps: value });

  const onProviderChange = (e) => {
    const idProv = e.target.value;
    const found = listProviders.find((item) => item.id === idProv);
    setDetail1([]);
    setDetail2([]);
    setOriginPurchase(null);
    setBulkForm({ providerId: idProv, providerRtn: found ? found.rtn : '', providerName: found ? found.name : '', originInvoiceNumber: '', valueLps: 0 });
  }

  // Igual que el legacy: cambiar el tipo descarta el detalle del tipo que deja de aplicar.
  const onTypeChange = (e) => {
    const newType = validInt(e.target.value);
    if (formState.isMixed && newType !== TYPE_RETURN) return; // una nota mixta siempre es una devolución
    if (newType === TYPE_RETURN) {
      setDetail1([]);
    } else {
      setDetail2([]);
      setOriginPurchase(null);
      setBulkForm({ originInvoiceNumber: '', isMixed: false });
    }
    setBulkForm({ typeId: newType, valueLps: 0 });
  }

  // ---- Nota mixta (SPEC v2-47-sr): marcar la casilla fija el tipo en Devolución y descarta el detalle del otro modo ----
  const onMixedToggle = (e) => {
    const checked = Boolean(e.target.checked);
    setDetail1([]);
    setDetail2([]);
    setOriginPurchase(null);
    setDraft(emptyMixedDraft());
    setDraftLabel(null);
    setBulkForm({ isMixed: checked, ...(checked ? { typeId: TYPE_RETURN } : {}), originInvoiceNumber: '', valueLps: 0 });
  }

  const onDraftChange = ({ target: { name, value } }) => setDraft((prev) => ({ ...prev, [name]: value }));

  // Al elegir el producto se pide su ficha: el impuesto (que el back usa igual), si exige lote o vencimiento y su costo como sugerencia.
  const onDraftProductChange = (e) => {
    const code = e.target.value;
    const option = productOptions.find((item) => item.value === code);
    setDraftLabel(option || null);
    if (!code || code === '0') {
      setDraft((prev) => ({ ...prev, productCode: '', description: '', taxPercent: 0, requireExpLot: false }));
      return;
    }
    setDraft((prev) => ({ ...prev, productCode: code, description: option ? option.label : code }));
    request.GET(`inventory/settings/products/byCode/${encodeURIComponent(code)}`, (resp) => {
      const product = resp.data || {};
      setDraft((prev) => (prev.productCode !== code ? prev : {
        ...prev,
        taxPercent: product.chargesTax ? Number(product.percentTax) || 0 : 0,
        requireExpLot: Boolean(product.requireExpLot),
        cost: prev.cost === '' && Number(product.costValue) > 0 ? Number(product.costValue) : prev.cost
      }));
    }, () => { });
  }

  const fnAddMixedLine = () => {
    const error = validateMixedDraft(draft, detail2);
    if (error) {
      notification('warning', error, 'alert.warning.title');
      return;
    }
    const updated = [...detail2, mixedLineFromDraft(draft)];
    setDetail2(updated);
    setTotal(sumMixed(updated));
    setDraft(emptyMixedDraft(draft.storeId));
    setDraftLabel(null);
  }

  const onChangeMixedField = (rowId, field, value) => {
    const updated = detail2.map((item) => (item.id === rowId ? setMixedField(item, field, value) : item));
    setDetail2(updated);
    setTotal(sumMixed(updated));
  }

  const fnDeleteMixedRow = (rowId) => {
    const updated = detail2.filter((item) => item.id !== rowId);
    setDetail2(updated);
    setTotal(sumMixed(updated));
  }

  // La compra origen de la mixta es opcional: solo elige la CxP a rebajar y no trae productos.
  const fnClearOrigin = () => {
    setOriginPurchase(null);
    setBulkForm({ originInvoiceNumber: '' });
  }

  // ---- Descuento, anulación y otros: compras aplicadas ----
  const fnAddInvoices = () => {
    if (validInt(providerId) === 0) {
      notification('warning', 'msg.required.select.provider', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(buildUrl('accounting/process/accountsPayable/findPendingByProvider', { providerId }), (resp) => {
      const existing = detail1.map((item) => item.invoiceNumber);
      setDataCreditNotes(resp.data
        .filter((item) => !existing.includes(item.documentCode))
        .map((item) => ({ cxpId: item.id, date: item.date, documentCode: item.documentCode, balance: Number(item.balance) || 0 })));
      setOpenModalAddInvoices(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnConfirmAddInvoices = (selectedRows) => {
    const merged = [...detail1, ...selectedRows.map(buildInvoiceLine)];
    setDetail1(merged);
    setTotal(sumApplied(merged));
    setOpenModalAddInvoices(false);
  }

  const onChangeDetail1Row = (rowId, field, value) => {
    const updated = detail1.map((item) => {
      if (item.id !== rowId) return item;
      if (field === 'percent') return { ...item, percent: value, appliedValue: appliedFromPercent(value, item.balance) };
      return { ...item, appliedValue: value, percent: percentFromApplied(value, item.balance) };
    });
    setDetail1(updated);
    setTotal(sumApplied(updated));
  }

  const fnApplyPercentToAll = () => {
    const updated = detail1.map((item) => ({ ...item, percent: formState.discountPercent, appliedValue: appliedFromPercent(formState.discountPercent, item.balance) }));
    setDetail1(updated);
    setTotal(sumApplied(updated));
  }

  const fnDeleteDetail1Row = (rowId) => {
    const updated = detail1.filter((item) => item.id !== rowId);
    setDetail1(updated);
    setTotal(sumApplied(updated));
  }

  // ---- Devolución: compra origen y productos ----
  const fnSeekOriginPurchase = () => {
    if (validInt(providerId) === 0) {
      notification('warning', 'msg.required.select.provider', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(buildUrl('inventory/process/purchases', { providerId }), (resp) => {
      setDataCreditNotes(resp.data.filter((item) => validInt(item.pdaNumber) > 0 && validInt(item.status) !== 0));
      setOpenModalSeekOrigin(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  // Líneas de la compra origen; `saved` (opcional) son las cantidades ya guardadas de una nota que se vuelve a abrir.
  const loadPurchaseLines = (purchase, saved, done) => {
    request.GET(buildUrl('inventory/process/purchaseDetail', { purchaseId: purchase.id }), (resp) => {
      let lines = buildReturnLinesFromPurchase(resp.data);
      if (saved) {
        lines = lines.map((line) => {
          const found = saved.find((item) => item.productCode === line.productCode);
          return setReturnQty(line, found ? found.qtyReturn : 0);
        });
      }
      done(lines);
    }, () => { setLoading(false); });
  }

  const fnSelectOriginPurchase = (purchase) => {
    if (isMixed) {
      setOriginPurchase({ id: purchase.id, invoiceNumber: purchase.invoiceNumber, date: purchase.date });
      setBulkForm({ originInvoiceNumber: purchase.invoiceNumber });
      setOpenModalSeekOrigin(false);
      return;
    }
    setLoading(true);
    loadPurchaseLines(purchase, null, (lines) => {
      setDetail2(lines);
      setTotal(sumReturn(lines));
      setOriginPurchase({ id: purchase.id, invoiceNumber: purchase.invoiceNumber, date: purchase.date });
      setBulkForm({ originInvoiceNumber: purchase.invoiceNumber });
      setOpenModalSeekOrigin(false);
      setLoading(false);
    });
  }

  const onChangeDetail2Qty = (rowId, value) => {
    const updated = detail2.map((item) => (item.id === rowId ? setReturnQty(item, value) : item));
    setDetail2(updated);
    setTotal(sumReturn(updated));
  }

  const fnDeleteDetail2Row = (rowId) => {
    const updated = detail2.filter((item) => item.id !== rowId);
    setDetail2(updated);
    setTotal(sumReturn(updated));
    if (updated.length === 0) {
      setOriginPurchase(null);
      setBulkForm({ originInvoiceNumber: '' });
    }
  }

  // ---- Nota: nueva, buscar, ver ----
  const fnNewCreditNote = () => {
    onResetForm();
    if (defaultDocument) setBulkForm({ documentCode: defaultDocument });
    setDetail1([]);
    setDetail2([]);
    setOriginPurchase(null);
    setDraft(emptyMixedDraft());
    setDraftLabel(null);
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

  // La nota con su detalle (un solo GET). Una devolución sin contabilizar vuelve a leer las líneas de su compra origen para poder
  // seguir editando las cantidades (hasta lo comprado); una contabilizada o anulada muestra lo guardado.
  const loadNote = (noteId) => {
    setLoading(true);
    request.GET(`inventory/process/creditNotes/${noteId}`, (resp) => {
      const note = resp.data;
      const { invoices, products } = normalizeNote(note);
      setBulkForm({
        id: note.id,
        documentCode: note.documentCode,
        documentId: note.documentId,
        cai: note.cai,
        numberCAI: note.numberCAI,
        date: note.date,
        providerId: note.providerId,
        providerRtn: note.providerData ? note.providerData.dni : '',
        providerName: note.providerData ? note.providerData.name : '',
        typeId: note.typeId,
        typeOther: note.typeOther,
        description: note.description || '',
        valueLps: note.valueLps,
        docValueUSD: note.docValueUSD,
        exchangeRate: note.exchangeRate,
        discountPercent: 0,
        accCode: note.accCode,
        currenId: note.currenId,
        originInvoiceNumber: note.originInvoiceNumber,
        pdaNumber: note.pdaNumber,
        status: note.status,
        isMixed: Boolean(note.isMixed)
      });

      if (isReturnType(note.typeId) && note.isMixed) {
        // Nota mixta: se muestra lo guardado (las líneas se digitan, no salen de una compra).
        setDetail1([]);
        setDetail2(products);
        setOriginPurchase(note.originInvoiceNumber ? { invoiceNumber: note.originInvoiceNumber } : null);
        setLoading(false);
        return;
      }

      if (isReturnType(note.typeId)) {
        setDetail1([]);
        setOriginPurchase(note.originInvoiceNumber ? { invoiceNumber: note.originInvoiceNumber } : null);
        const locked = validInt(note.pdaNumber) > 0 || validInt(note.status) === 0;
        if (locked || !note.originInvoiceNumber) {
          setDetail2(products);
          setLoading(false);
          return;
        }
        request.GET(buildUrl('inventory/process/purchases', { providerId: note.providerId, invoiceNumber: note.originInvoiceNumber }), (purchases) => {
          const purchase = (purchases.data || [])[0];
          if (!purchase) {
            setDetail2(products);
            setLoading(false);
            return;
          }
          loadPurchaseLines(purchase, products, (lines) => {
            setDetail2(lines);
            setOriginPurchase({ id: purchase.id, invoiceNumber: purchase.invoiceNumber, date: purchase.date });
            setLoading(false);
          });
        }, () => { setDetail2(products); setLoading(false); });
      } else {
        setDetail1(invoices);
        setDetail2([]);
        setOriginPurchase(null);
        setLoading(false);
      }
    }, () => { setLoading(false); });
  }

  const fnViewCreditNote = (item) => {
    setOpenModalSeekCreditNotes(false);
    loadNote(item.id);
  }

  // ---- Guardar: un solo POST o PUT con la cabecera y el detalle ----
  const fnSaveCreditNote = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) {
      if (errors.detail) notification('warning', errors.detail, 'alert.warning.title');
      else if (errors.accCode) notification('warning', errors.accCode, 'alert.warning.title');
      return;
    }

    const body = buildPayload(formState, { invoices: detail1, products: detail2 });
    const onSaved = (resp) => {
      notification('success', 'msg.success.save', 'alert.success.title');
      loadNote(resp.data.id); // muestra lo que calculó y guardó el back
    };
    const onFailed = (err) => {
      notifyError(err, 'msg.save.record.error');
      setLoading(false);
    };

    setLoading(true);
    if (id > 0) request.PUT(`inventory/process/creditNotes/${id}`, body, onSaved, onFailed, false);
    else request.POST('inventory/process/creditNotes', body, onSaved, onFailed, false);
  }

  // ---- Contabilizar, re-contabilizar y anular ----
  const fnAskProcess = () => {
    if (state.canProcess) setOpenMsgProcess(true);
  }
  const fnAskRepost = () => {
    if (state.canRepost) setOpenMsgRepost(true);
  }

  const processNote = (successKey) => {
    setOpenMsgProcess(false);
    setOpenMsgRepost(false);
    setLoading(true);
    request.POST(`inventory/process/creditNotes/process/${id}`, {}, () => {
      notification('success', successKey, 'alert.success.title');
      loadNote(id);
    }, (err) => {
      notifyError(err, 'msg.error.processDocument');
      setLoading(false);
    }, false);
  }
  const fnProcessCreditNote = () => processNote('msg.success.processDocument');
  const fnRepostCreditNote = () => processNote('page.creditNotesProv.msg.success.repost');

  const fnAskVoid = () => {
    if (state.canVoid) setOpenModalVoid(true);
  }

  const fnVoidCreditNote = (reason) => {
    setLoading(true);
    request.DELETE(buildUrl(`inventory/process/creditNotes/void/${id}`, { reason }), () => {
      setOpenModalVoid(false);
      notification('success', 'msg.success.voidCreditNote', 'alert.success.title');
      loadNote(id);
    }, (err) => {
      notifyError(err, 'msg.delete.record.error');
      setLoading(false);
    }, false);
  }

  const propsToControlPanel = {
    fnNew: fnNewCreditNote,
    fnSearch: fnSearchCreditNotes,
    fnSave: !disabled ? fnSaveCreditNote : null,
    fnPrint: () => { printDocument({ ...printOptions(id), setLoading }); },
    fnCancel: state.canVoid ? fnAskVoid : null,
    buttonsHome: [
      ...(state.canProcess ? [{
        title: 'button.count',
        icon: 'bi bi-journal-check',
        onClick: fnAskProcess
      }] : []),
      ...(state.canRepost ? [{
        title: 'page.creditNotesProv.button.repost',
        icon: 'bi bi-arrow-repeat',
        onClick: fnAskRepost
      }] : [])
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  return {
    formState, formValidation, isFormValid, onInputChange, setBulkForm, sendForm, errors,
    listDocuments, listProviders, listAccounts, listStores,
    detail1, detail2, originPurchase,
    onProviderChange, onTypeChange, onMixedToggle,
    isMixed, draft, productOptions: withSelectedOption(productOptions, draft.productCode, draftLabel ? [draftLabel] : []), onProductSearch,
    onDraftChange, onDraftProductChange, fnAddMixedLine, onChangeMixedField, fnDeleteMixedRow, fnClearOrigin,
    fnAddInvoices, onChangeDetail1Row, fnApplyPercentToAll, fnDeleteDetail1Row,
    fnSeekOriginPurchase, onChangeDetail2Qty, fnDeleteDetail2Row,
    isProcessed: state.processed, isVoided: state.voided, isSaved: state.saved, isReturn, disabled,
    openModalAddInvoices, setOpenModalAddInvoices, dataCreditNotes, fnConfirmAddInvoices,
    openModalSeekOrigin, setOpenModalSeekOrigin, fnSelectOriginPurchase,
    openModalSeekCreditNotes, setOpenModalSeekCreditNotes, fnViewCreditNote,
    openModalVoid, setOpenModalVoid, fnVoidCreditNote,
    openMsgProcess, setOpenMsgProcess, fnProcessCreditNote,
    openMsgRepost, setOpenMsgRepost, fnRepostCreditNote,
    propsToControlPanel
  }
}
