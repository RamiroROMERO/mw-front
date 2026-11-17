import { useEffect, useMemo, useRef, useState } from 'react';
import { request, buildUrl, notifyError } from '@Helpers/core';
import { getPrivilegeData } from '@Helpers/Utils';
import createNotification from '@Containers/ui/Notifications';
import {
  MEMO_KINDS, INITIAL_FORM, buildCreateBody, buildItems, buildPendingParams, memoFileName, selectionProblem, setPageSelected, toggleRow, validateFilter, validateMemoForm
} from './memoRules';

const canDeleteMemos = (privilege) => {
  try { return Boolean(getPrivilegeData(privilege).fnDelete); } catch { return false; }
};

// Pantalla de memorándum (compras o inventario, SPEC v2-59-sr). Los documentos pendientes se piden por páginas al back (fechas y búsqueda en el
// servidor); la selección se conserva entre páginas. Crear, agregar y eliminar piden confirmación; el back valida todo y un rechazo muestra su
// mensaje real. `POST`/`DELETE` van con `showMessage = false` y el aviso de éxito es propio (con el número del memorándum).
export const useMemoScreen = ({ setLoading, kind }) => {
  const config = MEMO_KINDS[kind];
  const canDelete = useMemo(() => canDeleteMemos(config.privilege), [config.privilege]);

  const [form, setForm] = useState(INITIAL_FORM);
  const [sendForm, setSendForm] = useState(false);
  const [filter, setFilter] = useState({ dateStart: '', dateEnd: '', search: '' });
  const [applied, setApplied] = useState({ dateStart: '', dateEnd: '', search: '' });
  const [filterErrors, setFilterErrors] = useState({});
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [pending, setPending] = useState({ rows: [], pagination: { totalRecords: 0, limit: 50, offset: 0 } });
  const [selection, setSelection] = useState({});
  const [confirm, setConfirm] = useState({ open: false, type: null, memo: null });
  const [modalMode, setModalMode] = useState(null); // 'add' | 'print' | 'delete' | null
  const latest = useRef(0);

  // Documentos pendientes de la página actual con el filtro aplicado.
  useEffect(() => {
    latest.current += 1;
    const requestId = latest.current;
    setLoading(true);
    request.GET(buildUrl(`${config.basePath}/pending`, buildPendingParams(applied, page)), (resp) => {
      if (requestId !== latest.current) return;
      setPending({ rows: Array.isArray(resp?.data) ? resp.data : [], pagination: resp?.pagination || { totalRecords: 0, limit: 50, offset: 0 } });
      setLoading(false);
    }, (err) => {
      if (requestId !== latest.current) return;
      setLoading(false);
      notifyError(err, 'page.memos.msg.loadError');
    });
  }, [config.basePath, applied, page, reloadKey]);

  const onFormChange = ({ target: { name, value } }) => setForm((prev) => ({ ...prev, [name]: value }));
  const onFilterChange = ({ target: { name, value } }) => setFilter((prev) => ({ ...prev, [name]: value }));

  const fnSearch = () => {
    const errors = validateFilter(filter);
    setFilterErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setApplied({ ...filter });
    setPage(1);
  };

  // La búsqueda de texto de la tabla (con retraso) se aplica sola, con las fechas ya aplicadas.
  const onSearchText = (text) => {
    setFilter((prev) => ({ ...prev, search: text }));
    setApplied((prev) => ({ ...prev, search: text }));
    setPage(1);
  };

  const fnToggleRow = (row) => setSelection((prev) => toggleRow(prev, row));
  const fnTogglePage = (checked) => setSelection((prev) => setPageSelected(prev, pending.rows, checked));

  const afterChange = () => {
    setSelection({});
    setReloadKey((k) => k + 1);
  };

  const downloadMemo = (memo, format) => {
    request.GETPdf(`${config.basePath}/${memo.id}/print`, { format }, memoFileName(kind, memo, format), (err) => notifyError(err, 'page.memos.msg.printError'), 'GET');
  };

  // ---- Acciones con confirmación
  const fnMarkReported = () => {
    setSendForm(true);
    const problem = selectionProblem(selection);
    if (problem) createNotification('warning', problem, 'alert.warning.title');
    if (Object.keys(validateMemoForm(form)).length > 0 || problem) return;
    setConfirm({ open: true, type: 'create', memo: null });
  };

  const fnAddToReport = () => {
    const problem = selectionProblem(selection);
    if (problem) { createNotification('warning', problem, 'alert.warning.title'); return; }
    setModalMode('add');
  };

  const fnPrintPrevious = () => setModalMode('print');
  const fnDeleteReport = () => setModalMode('delete');

  const fnChooseMemo = (memo) => { setModalMode(null); setConfirm({ open: true, type: 'add', memo }); };
  const fnAskDelete = (memo) => { setModalMode(null); setConfirm({ open: true, type: 'delete', memo }); };

  const setConfirmOpen = (open) => setConfirm((prev) => ({ ...prev, open }));

  const run = (call, onOk) => {
    setConfirmOpen(false);
    setLoading(true);
    call((resp) => { setLoading(false); onOk(resp?.data || {}); }, (err) => { setLoading(false); notifyError(err, 'page.memos.msg.saveError'); });
  };

  const fnConfirmOk = () => {
    const { type, memo } = confirm;
    if (type === 'create') {
      run((ok, ko) => request.POST(config.basePath, buildCreateBody(form, selection), ok, ko, false), (created) => {
        createNotification('success', 'page.memos.msg.created', { text: `No. ${created.number}` });
        setForm(INITIAL_FORM);
        setSendForm(false);
        afterChange();
        downloadMemo(created, 'pdf');
      });
    } else if (type === 'add') {
      run((ok, ko) => request.POST(`${config.basePath}/${memo.id}/items`, { items: buildItems(selection) }, ok, ko, false), () => {
        createNotification('success', 'page.memos.msg.added', { text: `No. ${memo.number}` });
        afterChange();
      });
    } else if (type === 'delete') {
      run((ok, ko) => request.DELETE(`${config.basePath}/${memo.id}`, ok, ko, false), () => {
        createNotification('success', 'page.memos.msg.deleted', { text: `No. ${memo.number}` });
        afterChange();
      });
    }
  };

  const errors = useMemo(() => validateMemoForm(form), [form]);

  return {
    config, canDelete, form, errors, sendForm, onFormChange, filter, filterErrors, onFilterChange, fnSearch, onSearchText,
    page, setPage, pending, selection, fnToggleRow, fnTogglePage,
    fnMarkReported, fnAddToReport, fnPrintPrevious, fnDeleteReport,
    confirm, setConfirmOpen, fnConfirmOk, modalMode, setModalMode, fnChooseMemo, fnAskDelete, downloadMemo
  };
};
