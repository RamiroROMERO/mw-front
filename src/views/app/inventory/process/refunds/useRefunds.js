import DateHelper from '@Helpers/DateHelper';
import { request, buildUrl, notifyError } from '@Helpers/core';
import { useForm } from '@Hooks'
import { useEffect, useMemo, useState } from 'react';
import { validInt } from '@Helpers/Utils';
import createNotification from '@Containers/ui/Notifications';
import { printDocument } from '@Helpers/printDocument';
import { ACCOUNT_BY_APPLY_TO } from '../transactions/shared/accountByApplyTo';
import { printOptions } from './refundPrintRules';
import useProviderOptions from './useProviderOptions';
import {
  REFUND_DOCUMENT, DEFAULT_REINT_TYPE, REINT_PROVIDER, REINT_STORE, buildRefundPayload, canOpenAddMany, detailsFromApi, ensureSelectedProvider,
  linesFromSelection, mergeLine, refundState, resetForType, validateRefund, warningTexts
} from './refundRules';

const REFUNDS_URL = 'inventory/process/refunds';
// { campo: id } -> { campoValid: id } (la forma que consumen los componentes).
const toFormValidation = (errors = {}) => Object.fromEntries(Object.entries(errors).map(([field, id]) => [`${field}Valid`, id]));
const toOption = (item) => ({
  label: item.name, value: item.id, invCtaCode: item.invCtaCode, costCtaCode: item.costCtaCode, expenseCtaCode: item.expenseCtaCode
});

export const useRefunds = ({ setLoading, refundDetail, setRefundDetail, onResetFormDeta }) => {
  const [listDocuments, setListDocuments] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [listDestinations, setListDestinations] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);
  const [dataRefunds, setDataRefunds] = useState([]);
  const [sendFormDeta, setSendFormDeta] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [openModalViewRefunds, setOpenModalViewRefunds] = useState(false);
  const [openMsgDeleteDocument, setOpenMsgDeleteDocument] = useState(false);
  const [openModalVoid, setOpenModalVoid] = useState(false);
  const [openMsgProcess, setOpenMsgProcess] = useState(false);
  const [openModalAddMany, setOpenModalAddMany] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));
  const { providers, onProviderSearch } = useProviderOptions();

  const validRefunds = {
    documentCode: [(val) => val !== "", "msg.required.select.typeDocument"],
    sourceStoreId: [(val) => validInt(val) > 0, "msg.required.select.warehouse"]
  }

  const { formState, formValidation: baseValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    documentId: 0,
    documentCode: REFUND_DOCUMENT,
    date: DateHelper.format(new Date()),
    physicalNumber: 0,
    sourceStoreId: 0,
    assignStoreId: 0,
    providerId: 0,
    expirationDate: '',
    reintType: DEFAULT_REINT_TYPE,
    notes: '',
    senderName: '',
    receiverName: '',
    userId: userData ? userData.id : 0,
    applyTo: '',
    pdaNumber: 0,
    isApplied: false,
    originCtaCode: '',
    assignCtaCode: '',
    status: true
  }, validRefunds);

  const { id, sourceStoreId, pdaNumber, isApplied, status, reintType, providerId } = formState;

  // Mismas reglas del DTO del back (por modo, fecha no futura, vencimiento no menor, máximos): los errores de campo se muestran junto
  // al campo y, si hay alguno, no se llama al back.
  const fieldErrors = useMemo(() => validateRefund(formState, refundDetail), [formState, refundDetail]);
  const formValidation = useMemo(() => ({ ...baseValidation, ...toFormValidation(fieldErrors) }), [baseValidation, fieldErrors]);

  const state = refundState({ id, isApplied, pdaNumber, status });
  const isProcessed = state.applied;
  const isVoided = state.voided;
  const isSaved = state.saved;
  const disabled = state.locked;
  const isProviderMode = Number(reintType) === REINT_PROVIDER;

  // El proveedor elegido sigue en las opciones aunque la búsqueda del servidor ya no lo traiga (al cargar uno guardado trae `providerData`).
  const providerSelectOptions = useMemo(
    () => ensureSelectedProvider(providers, providerId, formState.providerData ? formState.providerData.name : ''),
    [providers, providerId, formState.providerData]
  );

  // Cuentas del formulario (solo informativas: el back calcula las de cada línea).
  const onStoreChange = (e) => {
    const store = e.target.value;
    const found = listStores.find((item) => item.value === validInt(store));
    onBulkForm({ sourceStoreId: store, originCtaCode: found ? found.invCtaCode : '' });
  }

  const onDestinationChange = (e, applyTo) => {
    const destination = e.target.value;
    const found = listDestinations.find((item) => item.value === validInt(destination));
    const accountField = ACCOUNT_BY_APPLY_TO[applyTo] || 'invCtaCode';
    onBulkForm({ assignStoreId: destination, assignCtaCode: found ? found[accountField] : '' });
  }

  const onApplyToChange = (e, assignStoreId) => {
    const applyTo = e.target.value;
    const found = listDestinations.find((item) => item.value === validInt(assignStoreId));
    const accountField = ACCOUNT_BY_APPLY_TO[applyTo] || 'invCtaCode';
    onBulkForm({ applyTo, assignCtaCode: found ? found[accountField] : '' });
  }

  const onProviderChange = (e) => {
    onBulkForm({ providerId: e.target.value, providerData: null });
  }

  // Cambiar el tipo muestra los campos del otro modo y descarta lo que ya no aplica.
  const onTypeChange = (e) => {
    onBulkForm(resetForType(e.target.value));
  }

  const fnNewDocument = () => {
    onResetForm();
    onResetFormDeta();
    setSendForm(false);
    setSendFormDeta(false);
    setRefundDetail([]);
  }

  const fnSearchDocument = () => {
    setLoading(true);
    request.GET(REFUNDS_URL, (resp) => {
      const documents = resp.data.map((item) => {
        item.store = item.invStore ? item.invStore.name : ''
        item.destination = item.providerData && Number(item.reintType) === REINT_PROVIDER
          ? item.providerData.name
          : (item.invAssign ? item.invAssign.name : '')
        item.noPhysical = item.physicalNumber
        return item;
      });
      setDataRefunds(documents);
      setOpenModalViewRefunds(true);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  // Cabecera y detalle en una sola lectura.
  const fnGetDataDetail = (idRefund) => {
    setLoading(true);
    request.GET(`${REFUNDS_URL}/${idRefund}`, (resp) => {
      setRefundDetail(detailsFromApi(resp.data.details));
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  // Un solo POST o PUT con la cabecera y el detalle: el back calcula costo, total y cuentas, asigna el correlativo y guarda todo en una
  // transacción. Es una entrada: no hay avisos de existencia.
  const fnSaveDocument = () => {
    setSendForm(true);
    if (Object.keys(fieldErrors).length > 0) {
      if (fieldErrors.details) createNotification('warning', fieldErrors.details, 'alert.warning.title');
      return;
    }

    const payload = buildRefundPayload(formState, refundDetail);
    const names = new Map(refundDetail.map((item) => [item.productCode, item.nameProduct]));

    const onSaved = (resp) => {
      const saved = resp.data;
      onBulkForm({ id: saved.id, documentId: saved.documentId });
      setRefundDetail(detailsFromApi(saved.details).map((item) => ({ ...item, nameProduct: names.get(item.productCode) || '' })));
      setSendForm(false);
      warningTexts(saved.warnings).forEach((text) => createNotification('warning', 'alert.warning.title', { text }));
      setLoading(false);
    };
    const onError = () => setLoading(false);

    setLoading(true);
    if (id === 0) request.POST(REFUNDS_URL, payload, onSaved, onError);
    else request.PUT(`${REFUNDS_URL}/${id}`, payload, onSaved, onError);
  }

  // Imprime lo guardado por GET; sin documento guardado avisa "guarde primero" y no llama al back.
  const fnPrintDocument = () => { printDocument({ ...printOptions(id), setLoading }); };

  // Eliminación física: solo antes de Contabilizar. Una vez aplicado se usa Anular.
  const fnDeleteDocument = () => {
    if (id > 0 && !disabled) {
      setOpenMsgDeleteDocument(true);
    }
  }

  const fnOkDeleteDocument = () => {
    setOpenMsgDeleteDocument(false);
    setLoading(true);
    request.DELETE(`${REFUNDS_URL}/${id}`, () => {
      onResetForm();
      onResetFormDeta();
      setRefundDetail([]);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  // "Agregar varios" (modal compartido): suma la cantidad si el producto ya está en el detalle.
  const fnOpenAddMany = () => {
    if (!canOpenAddMany({ sourceStoreId, disabled })) {
      createNotification('warning', 'page.refunds.msg.addManyRequires', 'alert.warning.title');
      return;
    }
    setOpenModalAddMany(true);
  }

  const fnAddManyLine = (product, qty) => {
    if (!(Number(qty) > 0)) {
      createNotification('warning', 'msg.required.input.qty', 'alert.warning.title');
      return false;
    }
    const [line] = linesFromSelection({ [product.productCode]: { product, qty } });
    setRefundDetail((current) => mergeLine(current, line));
    return true;
  }

  // Recarga el documento guardado (cabecera y detalle) para reflejar su estado real tras contabilizar o anular.
  const fnReloadDocument = (idDoc) => {
    request.GET(`${REFUNDS_URL}/${idDoc}`, (resp) => {
      const header = { ...resp.data };
      ['details', 'invStore', 'invAssign', 'documentData'].forEach((key) => { delete header[key]; });
      onBulkForm(header);
      setRefundDetail(detailsFromApi(resp.data.details));
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  const fnAskProcess = () => {
    if (!state.canProcess) return;
    setOpenMsgProcess(true);
  }

  // Contabilizar: un solo POST; el back valida período y cuentas y responde el motivo real de cada rechazo.
  const fnProcessRefund = () => {
    setOpenMsgProcess(false);
    setLoading(true);
    request.POST(`${REFUNDS_URL}/${id}/process`, {}, () => {
      createNotification('success', 'msg.success.processDocument', 'alert.success.title');
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

  // Anular: DELETE con el motivo; el back comprueba existencias y pagos y responde el motivo real del rechazo. El documento queda
  // anulado y se muestra como tal (no se limpia el formulario).
  const fnVoidRefund = (reason) => {
    setLoading(true);
    request.DELETE(buildUrl(`${REFUNDS_URL}/${id}/void`, { reason }), () => {
      setOpenModalVoid(false);
      createNotification('success', 'msg.success.voidDocument', 'alert.success.title');
      fnReloadDocument(id);
    }, (err) => {
      notifyError(err, 'msg.delete.record.error');
      setLoading(false);
    }, false);
  }

  useEffect(() => {
    setLoading(true);
    request.GET('admin/documents?status=1&useInv=1', (resp) => {
      const documents = resp.data.filter((item) => item.code === REFUND_DOCUMENT).map((item) => ({
        value: item.code, code: item.code, label: `${item.code} | ${item.name}`
      }));
      setListDocuments(documents);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    // Almacén del documento: tipo 1. Destino (modo almacén): tipo 2.
    setLoading(true);
    request.GET('inventory/settings/stores?type=1', (resp) => {
      setListStores(resp.data.map(toOption));
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    setLoading(true);
    request.GET('inventory/settings/stores?type=2', (resp) => {
      setListDestinations(resp.data.map(toOption));
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    setLoading(true);
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      setListAccounts(resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta })));
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: !disabled ? fnSaveDocument : null,
    fnPrint: fnPrintDocument,
    fnDelete: !disabled ? fnDeleteDocument : null,
    fnCancel: state.canVoid ? fnAskVoid : null,
    // Contabilizar solo se ofrece en un reintegro guardado y sin aplicar ni anular.
    buttonsHome: state.canProcess ? [
      {
        title: "button.count",
        icon: "bi bi-journal-check",
        onClick: fnAskProcess
      }
    ] : [],
    buttonsOptions: [
      {
        title: 'page.transfersToStores.button.addMany',
        icon: 'bi bi-plus-square-dotted',
        onClick: fnOpenAddMany
      }
    ],
    buttonsAdmin: []
  }

  return (
    {
      propsToControlPanel,
      formState,
      onInputChange,
      listDocuments,
      listStores,
      listDestinations,
      sendFormDeta,
      setSendFormDeta,
      formValidation,
      sendForm,
      setSendForm,
      isFormValid,
      dataRefunds,
      openModalViewRefunds,
      setOpenModalViewRefunds,
      onBulkForm,
      listAccounts,
      fnGetDataDetail,
      openMsgDeleteDocument,
      setOpenMsgDeleteDocument,
      fnOkDeleteDocument,
      disabled,
      isProcessed,
      isVoided,
      isSaved,
      isProviderMode,
      isStoreMode: Number(reintType) === REINT_STORE,
      openMsgProcess,
      setOpenMsgProcess,
      fnProcessRefund,
      openModalVoid,
      setOpenModalVoid,
      fnVoidRefund,
      openModalAddMany,
      setOpenModalAddMany,
      fnAddManyLine,
      providerSelectOptions,
      onProviderSearch,
      onStoreChange,
      onDestinationChange,
      onApplyToChange,
      onProviderChange,
      onTypeChange
    }
  )
}
