import { useState, useEffect, useMemo, useRef } from 'react';
import { useIntl } from 'react-intl';
import { request, buildUrl, notifyError } from '@Helpers/core';
import { getPrivilegeData } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';
import {
  PRIVILEGE_REPAIR, PRIVILEGE_CLOSED_PERIOD, commonActions, isHomogeneous, buildParams, validateParams,
  chunkKeys, mergeResults, readyKeys, needsClosedConfirmation, isIgnoreReasonValid, buildQuery, canRepair,
  canConfirmClosed
} from './entryBalancingRules';

const BASE = 'accounting/process/entryBalancing';
const PAGE_SIZE = 25;

const getJson = (url) => new Promise((resolve, reject) => request.GET(url, resolve, reject));
const postJson = (url, body) => new Promise((resolve, reject) => request.POST(url, body, resolve, reject, false));

const readPrivilege = (code) => {
  try {
    return Boolean(getPrivilegeData(code).active);
  } catch {
    return false;
  }
};

export const useEntryBalancing = ({ setLoading }) => {
  const intl = useIntl();
  const t = (id, values) => intl.formatMessage({ id }, values);

  const privileges = useMemo(() => ({
    repair: readPrivilege(PRIVILEGE_REPAIR),
    closedPeriod: readPrivilege(PRIVILEGE_CLOSED_PERIOD)
  }), []);

  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', documentCode: '', category: '', status: 'pending' });
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGE_SIZE, total: 0, summary: [], logAvailable: true });
  const [selected, setSelected] = useState({}); // key -> item (se conserva entre páginas)
  const [listAccount, setListAccount] = useState([]);

  // Detalle
  const [openDetail, setOpenDetail] = useState(false);
  const [detail, setDetail] = useState({ item: null, data: null });

  // Vista previa / reparación
  const [openPreview, setOpenPreview] = useState(false);
  const [work, setWork] = useState({ action: '', items: [], lines: {}, form: { accountNumber: '', date: '', assignments: {} } });
  const [previewResults, setPreviewResults] = useState(null);
  const [repairResults, setRepairResults] = useState(null);
  const [confirmClosed, setConfirmClosed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  // Ignorar
  const [openIgnore, setOpenIgnore] = useState(false);
  const [ignoreReason, setIgnoreReason] = useState('');

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const selectedItems = Object.values(selected);
  const actions = commonActions(selectedItems);
  const mixed = selectedItems.length > 0 && !isHomogeneous(selectedItems);
  const allIgnored = selectedItems.length > 0 && selectedItems.every((it) => it.status === 'ignored');

  const load = (pageToLoad = 1, filtersToUse = filtersRef.current) => {
    setLoading(true);
    const url = buildUrl(BASE, buildQuery(filtersToUse, { page: pageToLoad, pageSize: PAGE_SIZE }));
    request.GET(url, (resp) => {
      setItems(resp.data || []);
      setPagination(resp.pagination || { page: pageToLoad, pageSize: PAGE_SIZE, total: 0, summary: [], logAvailable: true });
      setPage(pageToLoad);
      setLoading(false);
    }, (err) => {
      setLoading(false);
      notifyError(err, 'page.entryBalancing.msg.loadError');
    });
  };

  useEffect(() => {
    load(1);
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      setListAccount((resp.data || []).map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilterChange = ({ target: { name, value } }) => setFilters((prev) => ({ ...prev, [name]: value || '' }));

  const fnSearch = () => load(1);

  const fnPickCategory = (category) => {
    const next = { ...filtersRef.current, category };
    setFilters(next);
    load(1, next);
  };

  const fnExport = () => {
    setLoading(true);
    const stop = () => setLoading(false);
    const query = buildQuery(filtersRef.current);
    request.GETPdf(`${BASE}/export`, query, 'Cuadre de Asientos.xlsx', (err) => {
      stop();
      notifyError(err, 'page.entryBalancing.msg.exportError');
    }, 'GET', stop);
  };

  // Selección
  const fnToggle = (item) => setSelected((prev) => {
    const next = { ...prev };
    if (next[item.key]) delete next[item.key]; else next[item.key] = item;
    return next;
  });
  const pageAllSelected = items.length > 0 && items.every((it) => selected[it.key]);
  const fnTogglePage = () => setSelected((prev) => {
    const next = { ...prev };
    if (pageAllSelected) items.forEach((it) => { delete next[it.key]; });
    else items.forEach((it) => { next[it.key] = it; });
    return next;
  });
  const fnClearSelection = () => setSelected({});

  // Detalle
  const fnOpenDetail = (item) => {
    setDetail({ item, data: null });
    setOpenDetail(true);
    if (!item.nopda) return;
    setLoading(true);
    request.GET(`${BASE}/${item.nopda}`, (resp) => {
      setDetail({ item, data: resp.data });
      setLoading(false);
    }, (err) => {
      setLoading(false);
      notifyError(err, 'page.entryBalancing.msg.loadError');
    });
  };

  // Acción -> abre la vista previa (o el modal de ignorar)
  const fnStartAction = async (action) => {
    if (action === 'IGNORE') {
      setIgnoreReason('');
      setOpenIgnore(true);
      return;
    }
    const base = { action, items: selectedItems, lines: {}, form: { accountNumber: '', date: '', assignments: {} } };
    setPreviewResults(null);
    setRepairResults(null);
    setConfirmClosed(false);
    setWork(base);
    setOpenPreview(true);
    if (action === 'ASSIGN_ACCOUNTS') {
      // Las líneas sin cuenta salen del detalle de cada partida.
      setBusy(true);
      try {
        const lines = {};
        for (const it of selectedItems) {
          const resp = await getJson(`${BASE}/${it.nopda}`);
          lines[it.key] = ((resp.data && resp.data.lines) || []).filter((l) => l.isBlank);
        }
        setWork({ ...base, lines });
      } catch (err) {
        notifyError(err, 'page.entryBalancing.msg.loadError');
      }
      setBusy(false);
    }
  };

  const onFormChange = ({ target: { name, value } }) => {
    setWork((prev) => ({ ...prev, form: { ...prev.form, [name]: value || '' } }));
    setPreviewResults(null);
  };
  const onAssignmentChange = (lineId, value) => {
    setWork((prev) => ({ ...prev, form: { ...prev.form, assignments: { ...prev.form.assignments, [lineId]: value || '' } } }));
    setPreviewResults(null);
  };

  // Llama a /preview o /repair en lotes de máximo 200 llaves, en serie.
  const runBatches = async (path, keys, params) => {
    const chunks = chunkKeys(keys);
    const responses = [];
    for (let i = 0; i < chunks.length; i += 1) {
      setProgress(chunks.length > 1 ? t('page.entryBalancing.preview.batchProgress', { current: i + 1, total: chunks.length }) : '');
      responses.push(await postJson(`${BASE}/${path}`, { action: work.action, keys: chunks[i], params }));
    }
    setProgress('');
    return mergeResults(responses);
  };

  const fnPreview = async () => {
    const invalid = validateParams(work.action, work.form);
    if (invalid) {
      notification('warning', invalid, 'alert.warning.title');
      return;
    }
    setBusy(true);
    setRepairResults(null);
    setConfirmClosed(false);
    try {
      const results = await runBatches('preview', work.items.map((it) => it.key), buildParams(work.action, work.form));
      setPreviewResults(results);
    } catch (err) {
      setProgress('');
      notifyError(err, 'page.entryBalancing.msg.loadError');
    }
    setBusy(false);
  };

  const closedInPreview = previewResults ? needsClosedConfirmation(previewResults) : false;
  const closedAllowed = canConfirmClosed(privileges);
  const canConfirm = Boolean(previewResults) && readyKeys(previewResults).length > 0 && canRepair(privileges)
    && (!closedInPreview || (closedAllowed && confirmClosed)) && !busy && !repairResults;

  const fnConfirmRepair = async () => {
    if (!canConfirm) return;
    setBusy(true);
    try {
      const params = buildParams(work.action, work.form, { confirmClosedPeriod: closedInPreview && confirmClosed });
      const results = await runBatches('repair', readyKeys(previewResults), params);
      setRepairResults(results);
      notification('success', 'page.entryBalancing.msg.repairDone', 'alert.success.title');
      setSelected({});
      load(page);
    } catch (err) {
      setProgress('');
      notifyError(err, 'page.entryBalancing.msg.loadError');
    }
    setBusy(false);
  };

  // Ignorar / reabrir
  const fnIgnore = async () => {
    if (!isIgnoreReasonValid(ignoreReason)) {
      notification('warning', 'page.entryBalancing.msg.reasonRequired', 'alert.warning.title');
      return;
    }
    setBusy(true);
    try {
      for (const keys of chunkKeys(selectedItems.map((it) => it.key))) {
        await postJson(`${BASE}/ignore`, { keys, reason: ignoreReason.trim() });
      }
      notification('success', 'page.entryBalancing.msg.ignored', 'alert.success.title');
      setOpenIgnore(false);
      setSelected({});
      load(page);
    } catch (err) {
      notifyError(err, 'page.entryBalancing.msg.loadError');
    }
    setBusy(false);
  };

  const fnReopen = async () => {
    setBusy(true);
    try {
      for (const keys of chunkKeys(selectedItems.map((it) => it.key))) {
        await postJson(`${BASE}/reopen`, { keys });
      }
      notification('success', 'page.entryBalancing.msg.reopened', 'alert.success.title');
      setSelected({});
      load(page);
    } catch (err) {
      notifyError(err, 'page.entryBalancing.msg.loadError');
    }
    setBusy(false);
  };

  return {
    t, privileges, filters, onFilterChange, fnSearch, fnPickCategory, fnExport, page, items, pagination, load,
    selected, selectedItems, actions, mixed, allIgnored, fnToggle, fnTogglePage, pageAllSelected, fnClearSelection,
    openDetail, setOpenDetail, detail, fnOpenDetail,
    openPreview, setOpenPreview, work, previewResults, repairResults, confirmClosed, setConfirmClosed, busy, progress,
    listAccount, fnStartAction, onFormChange, onAssignmentChange, fnPreview, fnConfirmRepair, closedInPreview,
    closedAllowed, canConfirm,
    openIgnore, setOpenIgnore, ignoreReason, setIgnoreReason, fnIgnore, fnReopen
  };
};
