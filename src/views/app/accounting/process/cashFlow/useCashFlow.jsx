import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useExportExcel } from '@Hooks';
import { request, notifyError } from '@Helpers/core';
import createNotification from '@Containers/ui/Notifications';
import ModalByType from './ModalByType';
import ModalDocuments from './ModalDocuments';
import {
  BASE_PATH, WEEK_FIELDS, todayLocal, validateQuery, buildQuery, buildExport, exportFileName, buildDocumentsQuery, normalizeSummary
} from './cashFlowRules';

const emptyByType = { open: false, title: '', rows: [], fields: WEEK_FIELDS };
const emptyDocuments = { open: false, kind: '', entityName: '', rows: [], total: 0 };

// Flujo de Efectivo (cont_flujoefect.sc2, SPEC v2-128-sr). Una sola consulta trae todo (bancos, cuentas por pagar y por cobrar, por semana y antigüedad, por tipo, diferencia y saldo proyectado) a la fecha
// de corte; la pantalla no calcula nada. El detalle de un proveedor o cliente se pide aparte. PDF y Excel los arma el back con la misma fecha.
export const useCashFlow = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const { formState, onInputChange } = useForm({ date: todayLocal() });
  const { date } = formState;
  const errors = useMemo(() => validateQuery({ date }), [date]);

  const [activeTab, setActiveTab] = useState('1');
  const [sendForm, setSendForm] = useState(false);
  const [summary, setSummary] = useState(null);
  const [byType, setByType] = useState(emptyByType);
  const [documents, setDocuments] = useState(emptyDocuments);
  // Una respuesta vieja nunca pisa a una más nueva.
  const requestId = useRef(0);

  const load = (queryDate) => {
    const id = requestId.current + 1;
    requestId.current = id;
    setLoading(true);
    request.POST(BASE_PATH, buildQuery({ date: queryDate }), (resp) => {
      if (id !== requestId.current) return;
      setSummary(normalizeSummary(resp.data));
      setLoading(false);
    }, (err) => {
      if (id !== requestId.current) return;
      setLoading(false);
      notifyError(err, 'page.cashFlow.msg.searchError');
    }, false);
  };

  const validate = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) {
      createNotification('warning', Object.values(errors)[0], 'alert.warning.title');
      return false;
    }
    return true;
  };

  const fnSearch = () => {
    if (!validate()) return;
    load(date);
  };

  useEffect(() => {
    load(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fnPrint = () => {
    if (!validate()) return;
    const body = { ...buildExport({ date }, activeTab), format: 'pdf' };
    setLoading(true);
    request.GETPdf(`${BASE_PATH}/export`, body, exportFileName(activeTab, 'pdf'), (err) => {
      setLoading(false);
      notifyError(err, 'page.cashFlow.msg.exportError');
    }, 'POST', () => setLoading(false));
  };

  const fnExportXlsx = () => {
    if (!validate()) return;
    fnExport(`${BASE_PATH}/export`, { ...buildExport({ date }, activeTab), format: 'xlsx' }, exportFileName(activeTab, 'xlsx'));
  };

  // "Por Tipo": los datos ya vienen agrupados del back.
  const fnOpenByType = (rows, fields, title) => setByType({ open: true, title, rows, fields });
  const setByTypeOpen = (open) => setByType((prev) => ({ ...prev, open }));

  // "Ver documentos" de un proveedor o cliente: sus documentos con la semana y el rango de antigüedad de cada uno.
  const fnOpenDocuments = (kind, row) => {
    setLoading(true);
    request.POST(`${BASE_PATH}/documents`, buildDocumentsQuery({ date: summary?.date || date }, kind, row.entityId), (resp) => {
      setLoading(false);
      setDocuments({ open: true, kind, entityName: resp.data?.entityName || row.entityName, rows: resp.data?.rows || [], total: Number(resp.data?.total || 0) });
    }, (err) => {
      setLoading(false);
      notifyError(err, 'page.cashFlow.msg.documentsError');
    }, false);
  };
  const setDocumentsOpen = (open) => setDocuments((prev) => ({ ...prev, open }));

  const propsToHeader = { date, errors, sendForm, onInputChange, fnSearch, fnPrint, fnExportXlsx };

  const propsToResumenTab = { summary };

  const propsToPayableTab = {
    data: summary?.payable,
    kind: 'payable',
    nameField: 'entityName',
    nameLabel: 'page.cashFlow.table.provider',
    fnOpenByType,
    fnOpenDocuments
  };

  const propsToReceivableTab = {
    data: summary?.receivable,
    kind: 'receivable',
    nameField: 'entityName',
    nameLabel: 'page.cashFlow.table.customer',
    fnOpenByType,
    fnOpenDocuments
  };

  const propsToModalByType = {
    ModalContent: ModalByType,
    title: byType.title,
    open: byType.open,
    setOpen: setByTypeOpen,
    maxWidth: 'lg',
    data: { rows: byType.rows, fields: byType.fields }
  };

  const propsToModalDocuments = {
    ModalContent: ModalDocuments,
    title: 'page.cashFlow.modal.documents.title',
    open: documents.open,
    setOpen: setDocumentsOpen,
    maxWidth: 'xl',
    data: { entityName: documents.entityName, rows: documents.rows, total: documents.total }
  };

  return {
    activeTab,
    setActiveTab,
    propsToHeader,
    propsToResumenTab,
    propsToPayableTab,
    propsToReceivableTab,
    propsToModalByType,
    propsToModalDocuments
  };
};
