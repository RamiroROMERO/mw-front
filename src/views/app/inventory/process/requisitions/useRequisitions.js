import DateHelper from '@Helpers/DateHelper';
import { request, buildUrl, notifyError } from '@Helpers/core';
import { useForm } from '@Hooks'
import { useEffect, useMemo, useState } from 'react';
import { validInt } from '@Helpers/Utils';
import createNotification from '@Containers/ui/Notifications';
import { printDocument } from '@Helpers/printDocument';
import { printOptions } from './requisitionPrintRules';
import useEmployeeOptions from './useEmployeeOptions';
import {
  REQUISITION_DOCUMENT, DEFAULT_APPLY_TO, buildRequisitionPayload, canOpenAddMany, detailsFromApi, lineFromSelection, mergeLine,
  requisitionState, validateRequisition, warningTexts
} from './requisitionRules';

const REQUISITIONS_URL = 'inventory/process/requisitions';
// { campo: id } -> { campoValid: id } (la forma que consumen los componentes).
const toFormValidation = (errors = {}) => Object.fromEntries(Object.entries(errors).map(([field, id]) => [`${field}Valid`, id]));
const toOption = (item) => ({
  label: item.name, value: item.id, invCtaCode: item.invCtaCode, costCtaCode: item.costCtaCode, expenseCtaCode: item.expenseCtaCode
});

export const useRequisitions = ({ setLoading, requisitionDetail, setRequisitionDetail, onResetFormDeta }) => {
  const [listDocuments, setListDocuments] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [listDestinations, setListDestinations] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);
  const [dataRequisitions, setDataRequisitions] = useState([]);
  const [rrhhActive, setRrhhActive] = useState(false);
  const [sendFormDeta, setSendFormDeta] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [openModalViewRequisitions, setOpenModalViewRequisitions] = useState(false);
  const [openMsgDeleteDocument, setOpenMsgDeleteDocument] = useState(false);
  const [openModalVoid, setOpenModalVoid] = useState(false);
  const [openMsgProcess, setOpenMsgProcess] = useState(false);
  const [openModalAddMany, setOpenModalAddMany] = useState(false);
  const userData = JSON.parse(localStorage.getItem('mw_current_user'));
  const { employees, onEmployeeSearch } = useEmployeeOptions(rrhhActive);

  const validRequisitions = {
    documentCode: [(val) => val !== "", "msg.required.select.typeDocument"],
    sourceStoreId: [(val) => validInt(val) > 0, "msg.required.select.warehouse"],
    assignStoreId: [(val) => validInt(val) > 0, "msg.required.select.destinationId"]
  }

  const { formState, formValidation: baseValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    documentId: 0,
    documentCode: REQUISITION_DOCUMENT,
    date: DateHelper.format(new Date()),
    physicalNumber: 0,
    sourceStoreId: 0,
    assignStoreId: 0,
    notes: '',
    senderName: '',
    receiverName: '',
    userId: userData ? userData.id : 0,
    applyTo: DEFAULT_APPLY_TO,
    pdaNumber: 0,
    isApplied: false,
    originCtaCode: '',
    assignCtaCode: '',
    status: true
  }, validRequisitions);

  const { id, applyTo, pdaNumber, isApplied, sourceStoreId, assignStoreId, status } = formState;

  // Mismas reglas del DTO del back ("Aplicar a" obligatorio, fecha no futura, máximos): los errores de campo se muestran junto al
  // campo y, si hay alguno, no se llama al back.
  const fieldErrors = useMemo(() => validateRequisition(formState, requisitionDetail), [formState, requisitionDetail]);
  const formValidation = useMemo(() => ({ ...baseValidation, ...toFormValidation(fieldErrors) }), [baseValidation, fieldErrors]);

  const state = requisitionState({ id, isApplied, pdaNumber, status });
  const isProcessed = state.applied;
  const isVoided = state.voided;
  const isSaved = state.saved;
  const disabled = state.locked;

  const fnNewDocument = () => {
    onResetForm();
    onResetFormDeta();
    setSendForm(false);
    setSendFormDeta(false);
    setRequisitionDetail([]);
  }

  const fnSearchDocument = () => {
    setLoading(true);
    request.GET(REQUISITIONS_URL, (resp) => {
      const documents = resp.data.map((item) => {
        item.store = item.invStore ? item.invStore.name : ''
        item.destination = item.invAssign ? item.invAssign.name : ''
        item.noPhysical = item.physicalNumber
        return item;
      });
      setDataRequisitions(documents);
      setOpenModalViewRequisitions(true);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  // Cabecera y detalle (con el empleado de cada línea) en una sola lectura.
  const fnGetDataDetail = (idReq) => {
    setLoading(true);
    request.GET(`${REQUISITIONS_URL}/${idReq}`, (resp) => {
      setRequisitionDetail(detailsFromApi(resp.data.details));
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

    const payload = buildRequisitionPayload(formState, requisitionDetail, { withEmployees: rrhhActive });
    const names = new Map(requisitionDetail.map((item) => [item.productCode, item.nameProduct]));

    const onSaved = (resp) => {
      const saved = resp.data;
      onBulkForm({ id: saved.id, documentId: saved.documentId });
      // El back guarda el detalle en el mismo orden: el nombre del empleado de cada línea se conserva por posición.
      const employeeNames = requisitionDetail.map((item) => item.employeeName || '');
      setRequisitionDetail(detailsFromApi(saved.details).map((item, index) => ({
        ...item, nameProduct: names.get(item.productCode) || '', employeeName: item.employeeId > 0 ? employeeNames[index] : ''
      })));
      setSendForm(false);
      warningTexts(saved.warnings).forEach((text) => createNotification('warning', 'alert.warning.title', { text }));
      setLoading(false);
    };
    const onError = () => setLoading(false);

    setLoading(true);
    if (id === 0) request.POST(REQUISITIONS_URL, payload, onSaved, onError);
    else request.PUT(`${REQUISITIONS_URL}/${id}`, payload, onSaved, onError);
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
    request.DELETE(`${REQUISITIONS_URL}/${id}`, () => {
      onResetForm();
      onResetFormDeta();
      setRequisitionDetail([]);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  // "Agregar varios" (modal compartido): suma la cantidad si el producto (con el mismo empleado) ya está en el detalle.
  const fnOpenAddMany = () => {
    if (!canOpenAddMany({ sourceStoreId, assignStoreId, disabled })) {
      createNotification('warning', 'page.transfersToStores.msg.addManyRequires', 'alert.warning.title');
      return;
    }
    setOpenModalAddMany(true);
  }

  const fnAddManyLine = (product, qty, employee) => {
    if (!(Number(qty) > 0)) {
      createNotification('warning', 'msg.required.input.qty', 'alert.warning.title');
      return false;
    }
    setRequisitionDetail((current) => mergeLine(current, lineFromSelection(product, qty, employee)));
    return true;
  }

  // Recarga el documento guardado (cabecera y detalle) para reflejar su estado real tras contabilizar o anular.
  const fnReloadDocument = (idDoc) => {
    request.GET(`${REQUISITIONS_URL}/${idDoc}`, (resp) => {
      const header = { ...resp.data };
      ['details', 'invStore', 'invAssign', 'documentData'].forEach((key) => { delete header[key]; });
      onBulkForm(header);
      setRequisitionDetail(detailsFromApi(resp.data.details));
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
  const fnProcessRequisition = () => {
    setOpenMsgProcess(false);
    setLoading(true);
    request.POST(`${REQUISITIONS_URL}/${id}/process`, {}, () => {
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
  const fnVoidRequisition = (reason) => {
    setLoading(true);
    request.DELETE(buildUrl(`${REQUISITIONS_URL}/${id}/void`, { reason }), () => {
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
      const documents = resp.data.filter((item) => item.code === REQUISITION_DOCUMENT).map((item) => ({
        value: item.code, code: item.code, label: `${item.code} | ${item.name}`
      }));
      setListDocuments(documents);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    // Origen: almacenes tipo 1. Destino: centros de costo (tipo 2).
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

    // El selector de empleado por línea solo existe con RRHH activo (mw_setting.rrhh_menu).
    const companyData = JSON.parse(localStorage.getItem('mw_current_company'));
    if (companyData?.id) {
      request.GET(`admin/companyInternalSettings?companyId=${companyData.id}`, (resp) => {
        const [settings] = resp.data;
        setRrhhActive(!!settings?.rrhhMenu);
      }, () => { });
    }
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: !disabled ? fnSaveDocument : null,
    fnPrint: fnPrintDocument,
    fnDelete: !disabled ? fnDeleteDocument : null,
    fnCancel: state.canVoid ? fnAskVoid : null,
    // Contabilizar solo se ofrece en una requisición guardada y sin aplicar ni anular.
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
      dataRequisitions,
      openModalViewRequisitions,
      setOpenModalViewRequisitions,
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
      fnProcessRequisition,
      openModalVoid,
      setOpenModalVoid,
      fnVoidRequisition,
      openModalAddMany,
      setOpenModalAddMany,
      fnAddManyLine,
      employees,
      onEmployeeSearch,
      rrhhActive,
      applyTo
    }
  )
}
