import DateHelper from '@Helpers/DateHelper';
import { request, buildUrl, notifyError } from '@Helpers/core';
import { useForm } from '@Hooks'
import { useEffect, useMemo, useState } from 'react';
import { validInt } from '@Helpers/Utils';
import createNotification from '@Containers/ui/Notifications';
import { printDocument } from '@Helpers/printDocument';
import { printOptions } from './transferPrintRules';
import {
  TRANSFER_DOCUMENT, buildTransferPayload, canOpenAddMany, detailsFromApi, mergeLine, linesFromSelection, transferState, validateTransfer, warningTexts
} from './transferRules';

const TRANSFERS_URL = 'inventory/process/transfers';
// { campo: id } -> { campoValid: id } (la forma que consumen los componentes).
const toFormValidation = (errors = {}) => Object.fromEntries(Object.entries(errors).map(([field, id]) => [`${field}Valid`, id]));

export const useTranfers = ({ setLoading, transferDetail, setTransferDetail, onResetFormDeta }) => {
  const [listDocuments, setListDocuments] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);
  const [dataTransfers, setDataTransfers] = useState([]);
  const [sendFormDeta, setSendFormDeta] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [openModalViewTransfers, setOpenModalViewTransfers] = useState(false);
  const [openMsgDeleteDocument, setOpenMsgDeleteDocument] = useState(false);
  const [openModalVoid, setOpenModalVoid] = useState(false);
  const [openMsgProcess, setOpenMsgProcess] = useState(false);
  const [openModalAddMany, setOpenModalAddMany] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));

  const validTransfers = {
    documentCode: [(val) => val !== "", "msg.required.select.typeDocument"],
    sourceStoreId: [(val) => validInt(val) > 0, "msg.required.select.warehouse"],
    assignStoreId: [(val) => validInt(val) > 0, "msg.required.select.destinationId"]
  }

  const { formState, formValidation: baseValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    documentId: 0,
    documentCode: TRANSFER_DOCUMENT,
    date: DateHelper.format(new Date()),
    physicalNumber: 0,
    sourceStoreId: 0,
    assignStoreId: 0,
    notes: '',
    senderName: '',
    receiverName: '',
    userId: userData ? userData.id : 0,
    applyTo: 'Inventario',
    pdaNumber: 0,
    isApplied: false,
    originCtaCode: '',
    assignCtaCode: '',
    status: true
  }, validTransfers);

  const { id, documentId, documentCode, date, physicalNumber, sourceStoreId, assignStoreId, notes, userId, applyTo, pdaNumber, isApplied, assignCtaCode, originCtaCode, status } = formState;

  // Mismas reglas del DTO del back (fecha no futura, destino distinto del origen, máximos): los errores de campo se muestran
  // junto al campo y, si hay alguno, no se llama al back.
  const fieldErrors = useMemo(() => validateTransfer(formState, transferDetail), [formState, transferDetail]);
  const formValidation = useMemo(() => ({ ...baseValidation, ...toFormValidation(fieldErrors) }), [baseValidation, fieldErrors]);

  const state = transferState({ id, isApplied, pdaNumber, status });
  const isProcessed = state.applied;
  const isVoided = state.voided;
  const isSaved = state.saved;
  const disabled = state.locked;

  const fnNewDocument = () => {
    onResetForm();
    onResetFormDeta();
    setSendForm(false);
    setSendFormDeta(false);
    setTransferDetail([]);
  }

  const fnSearchDocument = () => {
    setLoading(true);
    request.GET(TRANSFERS_URL, (resp) => {
      const transactions = resp.data.map((item) => {
        item.store = item.invStore ? item.invStore.name : ''
        item.destination = item.invAssign ? item.invAssign.name : ''
        item.noPhysical = item.physicalNumber
        return item;
      });
      setDataTransfers(transactions);
      setOpenModalViewTransfers(true);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  // Cabecera y detalle en una sola lectura (SPEC v2-49-sr).
  const fnGetDataDetail = (idReq) => {
    setLoading(true);
    request.GET(`${TRANSFERS_URL}/${idReq}`, (resp) => {
      setTransferDetail(detailsFromApi(resp.data.details));
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  // Un solo POST o PUT con la cabecera y el detalle: el back calcula costo, total y cuentas, asigna el correlativo y guarda todo
  // en una transacción. Tras guardar se muestran los avisos de existencia (el documento queda guardado igual).
  const fnSaveDocument = () => {
    setSendForm(true);
    if (Object.keys(fieldErrors).length > 0) {
      if (fieldErrors.details) createNotification('warning', fieldErrors.details, 'alert.warning.title');
      return;
    }

    const payload = buildTransferPayload(formState, transferDetail);
    const names = new Map(transferDetail.map((item) => [item.productCode, item.nameProduct]));

    const onSaved = (resp) => {
      const saved = resp.data;
      onBulkForm({ id: saved.id, documentId: saved.documentId });
      setTransferDetail(detailsFromApi(saved.details).map((item) => ({ ...item, nameProduct: names.get(item.productCode) || '' })));
      setSendForm(false);
      warningTexts(saved.warnings).forEach((text) => createNotification('warning', 'alert.warning.title', { text }));
      setLoading(false);
    };
    const onError = () => setLoading(false);

    setLoading(true);
    if (id === 0) request.POST(TRANSFERS_URL, payload, onSaved, onError);
    else request.PUT(`${TRANSFERS_URL}/${id}`, payload, onSaved, onError);
  }

  // Imprime lo guardado por GET (SPEC v2-51-sr); sin traslado guardado avisa "guarde primero" y no llama al back.
  const fnPrintDocument = () => { printDocument({ ...printOptions(id), setLoading }); };

  // Eliminación física — solo antes de Contabilizar (fiel al legacy, que no permite tocar
  // el documento una vez aplicado). Una vez aplicado, usar Anular (fnAskVoid) en su lugar.
  const fnDeleteDocument = () => {
    if (id > 0 && !disabled) {
      setOpenMsgDeleteDocument(true);
    }
  }

  const fnOkDeleteDocument = () => {
    setOpenMsgDeleteDocument(false);
    setLoading(true);
    request.DELETE(`${TRANSFERS_URL}/${id}`, () => {
      onResetForm();
      onResetFormDeta();
      setTransferDetail([]);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  // "Agregar varios" (modal compartido): suma la cantidad si el producto ya está en el detalle.
  const fnOpenAddMany = () => {
    if (!canOpenAddMany({ sourceStoreId, assignStoreId, disabled })) {
      createNotification('warning', 'page.transfersToStores.msg.addManyRequires', 'alert.warning.title');
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
    setTransferDetail((current) => mergeLine(current, line));
    return true;
  }

  // Recarga el documento guardado (cabecera y detalle) para reflejar su estado real tras contabilizar o anular.
  const fnReloadDocument = (idDoc) => {
    request.GET(`${TRANSFERS_URL}/${idDoc}`, (resp) => {
      const header = { ...resp.data };
      ['details', 'invStore', 'invAssign', 'documentData'].forEach((key) => { delete header[key]; });
      onBulkForm(header);
      setTransferDetail(detailsFromApi(resp.data.details));
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  const fnAskProcess = () => {
    if (!state.canProcess) return;
    setOpenMsgProcess(true);
  }

  // Contabilizar: un solo POST; el back valida existencias, período y cuentas y responde el motivo real de cada rechazo.
  const fnProcessTransfer = () => {
    setOpenMsgProcess(false);
    setLoading(true);
    request.POST(`${TRANSFERS_URL}/${id}/process`, {}, () => {
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

  // Anular: DELETE con el motivo; el documento queda anulado y se muestra como tal (no se limpia el formulario).
  const fnVoidTransfer = (reason) => {
    setLoading(true);
    request.DELETE(buildUrl(`${TRANSFERS_URL}/${id}/void`, { reason }), () => {
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
      const documents = resp.data.filter((item) => item.code === TRANSFER_DOCUMENT).map((item) => {
        return {
          value: item.code,
          code: item.code,
          label: `${item.code} | ${item.name}`
        }
      });
      setListDocuments(documents);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('inventory/settings/stores?type=1', (resp) => {
      const stores = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          invCtaCode: item.invCtaCode,
          costCtaCode: item.costCtaCode,
          expenseCtaCode: item.expenseCtaCode
        }
      });
      setListStores(stores);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const listAccounts = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      setListAccounts(listAccounts);
      setLoading(false);
    }, (err) => {

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
    // Contabilizar solo se ofrece en un traslado guardado y sin aplicar ni anular.
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
      sendFormDeta,
      setSendFormDeta,
      formValidation,
      sendForm,
      setSendForm,
      isFormValid,
      dataTransfers,
      openModalViewTransfers,
      setOpenModalViewTransfers,
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
      openMsgProcess,
      setOpenMsgProcess,
      fnProcessTransfer,
      openModalVoid,
      setOpenModalVoid,
      fnVoidTransfer,
      openModalAddMany,
      setOpenModalAddMany,
      fnAddManyLine
    }
  )
}
