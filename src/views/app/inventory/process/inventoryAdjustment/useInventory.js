import { useEffect, useMemo, useState } from 'react'
import { useForm } from '@Hooks'
import { request, buildUrl, notifyError } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import createNotification from '@Containers/ui/Notifications';
import { printDocument } from '@Helpers/printDocument';
import { printOptions } from './adjustmentPrintRules';
import {
  ADJUSTMENT_DOCUMENT, DEFAULT_APPLY_TO, adjustmentState, buildAdjustmentPayload, detailsFromApi, isNotToday, isValidCount, lineFromProduct,
  restLines, summarizeAdjustments, upsertLine, validateAdjustment, warningTexts
} from './adjustmentRules';

const ADJUSTMENTS_URL = 'inventory/process/adjustments';
const toFormValidation = (errors = {}) => Object.fromEntries(Object.entries(errors).map(([field, id]) => [`${field}Valid`, id]));
const REST_PAGE = 500;

export const useInventory = ({ inventoryDetail, setInventoryDetail, setLoading }) => {
  const [listDocuments, setListDocuments] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [dataInventory, setDataInventory] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openModalViewInventoryAd, setOpenModalViewInventoryAd] = useState(false);
  const [openMsgDeleteDocument, setOpenMsgDeleteDocument] = useState(false);
  const [openModalVoid, setOpenModalVoid] = useState(false);
  const [openMsgProcess, setOpenMsgProcess] = useState(false);
  const [openMsgAddRemaining, setOpenMsgAddRemaining] = useState(false);
  const [openModalAddMany, setOpenModalAddMany] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const validInventory = {
    documentCode: [(val) => val !== "", "msg.required.select.typeDocument"],
    sourceStoreId: [(val) => validInt(val) > 0, "msg.required.select.warehouse"]
  }

  const { formState, formValidation: baseValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    documentCode: ADJUSTMENT_DOCUMENT,
    documentId: 0,
    date: DateHelper.format(new Date()),
    sourceStoreId: 0,
    applyTo: DEFAULT_APPLY_TO,
    notes: '',
    userId: userData ? userData.id : 0,
    pdaNumber: 0,
    isApplied: false,
    status: true
  }, validInventory);

  const { id, pdaNumber, isApplied, sourceStoreId, status, date } = formState;

  // Mismas reglas del DTO del back: los errores de campo se muestran junto al campo y, si hay alguno, no se llama al back.
  const fieldErrors = useMemo(() => validateAdjustment(formState, inventoryDetail), [formState, inventoryDetail]);
  const formValidation = useMemo(() => ({ ...baseValidation, ...toFormValidation(fieldErrors) }), [baseValidation, fieldErrors]);

  const state = adjustmentState({ id, isApplied, pdaNumber, status });
  const isProcessed = state.applied;
  const isVoided = state.voided;
  const isSaved = state.saved;
  const disabled = state.locked;
  // El saldo se calcula a la fecha del documento: una fecha distinta de hoy puede dar diferencias que no son las de hoy.
  const dateWarning = !disabled && isNotToday(date);

  const fnNewDocument = () => {
    onResetForm();
    setSendForm(false);
    setInventoryDetail([]);
  }

  const fnSearchDocument = () => {
    setLoading(true);
    request.GET(ADJUSTMENTS_URL, (resp) => {
      setDataInventory(resp.data.map((item) => ({
        ...item, store: item.invStore ? item.invStore.name : '', destination: '', noPhysical: item.physicalNumber
      })));
      setOpenModalViewInventoryAd(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnGetDataDetail = (idDoc) => {
    setLoading(true);
    request.GET(`${ADJUSTMENTS_URL}/${idDoc}`, (resp) => {
      setInventoryDetail(detailsFromApi(resp.data.details));
      setLoading(false);
    }, () => { setLoading(false); });
  }

  // Un solo POST o PUT: el back calcula costo y cuentas, asigna el correlativo y guarda en una transacción.
  const fnSaveDocument = () => {
    setSendForm(true);
    if (Object.keys(fieldErrors).length > 0) {
      if (fieldErrors.details) createNotification('warning', fieldErrors.details, 'alert.warning.title');
      return;
    }
    const payload = buildAdjustmentPayload(formState, inventoryDetail);
    const names = new Map(inventoryDetail.map((item) => [item.productCode, item.nameProduct]));
    const onSaved = (resp) => {
      const saved = resp.data;
      onBulkForm({ id: saved.id, documentId: saved.documentId });
      setInventoryDetail(detailsFromApi(saved.details).map((item) => ({ ...item, nameProduct: names.get(item.productCode) || item.nameProduct || '' })));
      setSendForm(false);
      warningTexts(saved.warnings).forEach((text) => createNotification('warning', 'alert.warning.title', { text }));
      setLoading(false);
    };
    setLoading(true);
    if (id === 0) request.POST(ADJUSTMENTS_URL, payload, onSaved, () => setLoading(false));
    else request.PUT(`${ADJUSTMENTS_URL}/${id}`, payload, onSaved, () => setLoading(false));
  }

  // Imprime lo guardado por GET; sin documento guardado avisa "guarde primero" y no llama al back.
  const fnPrintDocument = () => { printDocument({ ...printOptions(id), setLoading }); };

  const fnDeleteDocument = () => {
    if (id > 0 && !disabled) setOpenMsgDeleteDocument(true);
  }

  const fnOkDeleteDocument = () => {
    setOpenMsgDeleteDocument(false);
    setLoading(true);
    request.DELETE(`${ADJUSTMENTS_URL}/${id}`, () => {
      onResetForm();
      setInventoryDetail([]);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  // Recarga el documento (cabecera y detalle) para reflejar su estado real tras contabilizar o anular.
  const fnReloadDocument = (idDoc) => {
    request.GET(`${ADJUSTMENTS_URL}/${idDoc}`, (resp) => {
      const header = { ...resp.data };
      ['details', 'invStore', 'invAssign', 'documentData'].forEach((key) => { delete header[key]; });
      onBulkForm(header);
      setInventoryDetail(detailsFromApi(resp.data.details));
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnAskProcess = () => {
    if (!state.canProcess) return;
    setOpenMsgProcess(true);
  }

  // Contabilizar: el back calcula las diferencias contra el kardex a la fecha del conteo y responde el resumen.
  const fnProcessAdjustment = () => {
    setOpenMsgProcess(false);
    setLoading(true);
    request.POST(`${ADJUSTMENTS_URL}/${id}/process`, {}, (resp) => {
      const { entries, exits, total } = summarizeAdjustments(resp.data?.adjustments);
      createNotification('success', 'msg.success.processDocument', { text: `+${entries} / -${exits} | ${total.toFixed(2)}` });
      fnReloadDocument(id);
    }, (err) => {
      notifyError(err, 'msg.error.processDocument');
      setLoading(false);
    }, false);
  }

  const fnAskVoid = () => {
    if (!state.canVoid) return;
    setOpenModalVoid(true);
  }

  const fnVoidAdjustment = (reason) => {
    setLoading(true);
    request.DELETE(buildUrl(`${ADJUSTMENTS_URL}/${id}/void`, { reason }), () => {
      setOpenModalVoid(false);
      createNotification('success', 'msg.success.voidDocument', 'alert.success.title');
      fnReloadDocument(id);
    }, (err) => {
      notifyError(err, 'msg.delete.record.error');
      setLoading(false);
    }, false);
  }

  const fnOpenAddMany = () => {
    if (disabled || validInt(sourceStoreId) === 0) {
      createNotification('warning', 'page.inventoryAdjustment.msg.addManyRequires', 'alert.warning.title');
      return;
    }
    setOpenModalAddMany(true);
  }

  // Contar dos veces el mismo producto reemplaza el conteo anterior (no suma). `extra` trae el lote y el vencimiento digitados.
  const fnAddManyLine = (product, qty, _employee, extra = {}) => {
    if (!isValidCount(qty)) {
      createNotification('warning', 'msg.required.input.qty', 'alert.warning.title');
      return false;
    }
    const line = { ...lineFromProduct(product, qty), lotCode: extra.lotCode || '', expirationDate: extra.expirationDate || '' };
    setInventoryDetail((current) => upsertLine(current, line));
    return true;
  }

  const fnAskAddRemaining = () => {
    if (disabled) return;
    if (validInt(sourceStoreId) === 0) {
      createNotification('warning', 'msg.required.select.warehouse', 'alert.warning.title');
      return;
    }
    setOpenMsgAddRemaining(true);
  }

  // "Agregar Rest.": lee TODOS los productos del almacén (páginas de 500) y agrega con cantidad 0 los que faltan.
  const fnAddRemaining = () => {
    setOpenMsgAddRemaining(false);
    setLoading(true);
    const products = [];
    const readPage = (offset) => {
      request.GET(buildUrl(`${ADJUSTMENTS_URL}/availableProducts`, { storeId: sourceStoreId, limit: REST_PAGE, offset }), (resp) => {
        const rows = resp.data || [];
        products.push(...rows);
        const total = resp.pagination?.totalRecords ?? products.length;
        if (rows.length === REST_PAGE && products.length < total) {
          readPage(offset + REST_PAGE);
          return;
        }
        const result = restLines({ products, details: inventoryDetail });
        setInventoryDetail((current) => {
          const present = new Set(current.map((item) => item.productCode));
          return [...current, ...result.lines.filter((line) => !present.has(line.productCode))];
        });
        if (result.omittedCost > 0) createNotification('warning', 'alert.warning.title', { text: `${result.omittedCost} - costo 0` });
        if (result.omittedLot > 0) createNotification('warning', 'alert.warning.title', { text: `${result.omittedLot} - lote / vencimiento` });
        setLoading(false);
      }, () => { setLoading(false); });
    };
    readPage(0);
  }

  useEffect(() => {
    setLoading(true);
    request.GET('admin/documents?status=1&useInv=1', (resp) => {
      setListDocuments(resp.data.filter((item) => item.code === ADJUSTMENT_DOCUMENT).map((item) => ({
        value: item.code, code: item.code, label: `${item.code} | ${item.name}`
      })));
      setLoading(false);
    }, () => { setLoading(false); });

    setLoading(true);
    request.GET('inventory/settings/stores?type=1', (resp) => {
      setListStores(resp.data.map((item) => ({ label: item.name, value: item.id })));
      setLoading(false);
    }, () => { setLoading(false); });
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: !disabled ? fnSaveDocument : null,
    fnPrint: fnPrintDocument,
    fnDelete: !disabled ? fnDeleteDocument : null,
    fnCancel: state.canVoid ? fnAskVoid : null,
    buttonsHome: state.canProcess ? [
      { title: "button.applyAdjustment", icon: "bi bi-check-lg", onClick: fnAskProcess }
    ] : [],
    buttonsOptions: [
      { title: 'page.transfersToStores.button.addMany', icon: 'bi bi-plus-square-dotted', onClick: fnOpenAddMany },
      { title: 'button.addRemaining', icon: 'bi bi-plus-circle', onClick: !disabled ? fnAskAddRemaining : () => { } }
    ],
    buttonsAdmin: []
  }

  return (
    {
      propsToControlPanel, formState, onInputChange, listDocuments, listStores, sendForm, setSendForm, isFormValid, formValidation,
      dataInventory, openModalViewInventoryAd, setOpenModalViewInventoryAd, onBulkForm, fnGetDataDetail, openMsgDeleteDocument,
      setOpenMsgDeleteDocument, fnOkDeleteDocument, disabled, isProcessed, isVoided, isSaved, openMsgProcess, setOpenMsgProcess,
      fnProcessAdjustment, openModalVoid, setOpenModalVoid, fnVoidAdjustment, openMsgAddRemaining, setOpenMsgAddRemaining, fnAddRemaining,
      openModalAddMany, setOpenModalAddMany, fnAddManyLine, dateWarning
    }
  )
}
