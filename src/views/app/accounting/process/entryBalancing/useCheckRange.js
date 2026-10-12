import { useState } from 'react';
import { useIntl } from 'react-intl';
import { request, notifyError } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';
import {
  validateRange, buildPreviewBody, selectableIds, chunkIds, mergeRepairResults, countRepairResults, canRegenerate
} from './checkRangeRules';

const BASE = 'accounting/process/entryBalancing/checkRange';
const postJson = (url, body) => new Promise((resolve, reject) => request.POST(url, body, resolve, reject, false));

// Regenerar partidas de cheques por rango (SPEC v2-28): vista previa y ejecución de los cheques elegidos.
export const useCheckRange = ({ privileges, onDone }) => {
  const intl = useIntl();
  const t = (id, values) => intl.formatMessage({ id }, values);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ dateStart: '', dateEnd: '', bankCode: '' });
  const [preview, setPreview] = useState(null); // respuesta de /preview
  const [selected, setSelected] = useState({}); // checkId -> true
  const [results, setResults] = useState(null); // results de /repair
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');

  const items = preview ? preview.items : [];
  const selectedIds = Object.keys(selected).filter((id) => selected[id]).map(Number);
  const readyIds = selectableIds(items);

  const fnOpen = () => {
    setPreview(null);
    setSelected({});
    setResults(null);
    setProgress('');
    setOpen(true);
  };

  const onFormChange = ({ target: { name, value } }) => {
    setForm((prev) => ({ ...prev, [name]: value || '' }));
    setPreview(null);
    setSelected({});
    setResults(null);
  };

  const fnPreview = async () => {
    const invalid = validateRange(form);
    if (invalid) {
      notification('warning', invalid, 'alert.warning.title');
      return;
    }
    setBusy(true);
    setResults(null);
    try {
      const resp = await postJson(`${BASE}/preview`, buildPreviewBody(form));
      setPreview(resp.data);
      // Quedan marcados los listos; el usuario puede desmarcar los que no quiera regenerar.
      setSelected(Object.fromEntries(selectableIds(resp.data.items).map((id) => [id, true])));
    } catch (err) {
      notifyError(err, 'page.entryBalancing.checkRange.msg.previewError');
    }
    setBusy(false);
  };

  const fnToggle = (checkId) => setSelected((prev) => ({ ...prev, [checkId]: !prev[checkId] }));
  const allReadySelected = readyIds.length > 0 && readyIds.every((id) => selected[id]);
  const fnToggleAll = () => setSelected(allReadySelected ? {} : Object.fromEntries(readyIds.map((id) => [id, true])));

  const canConfirm = canRegenerate(privileges, selectedIds.length) && !busy && !results;

  const fnConfirm = async () => {
    if (!canConfirm) return;
    setBusy(true);
    try {
      const batches = chunkIds(selectedIds);
      const responses = [];
      for (let i = 0; i < batches.length; i += 1) {
        setProgress(batches.length > 1 ? t('page.entryBalancing.preview.batchProgress', { current: i + 1, total: batches.length }) : '');
        responses.push(await postJson(`${BASE}/repair`, { checkIds: batches[i] }));
      }
      setProgress('');
      setResults(mergeRepairResults(responses));
      notification('success', 'page.entryBalancing.checkRange.msg.done', 'alert.success.title');
      if (typeof onDone === 'function') onDone();
    } catch (err) {
      setProgress('');
      notifyError(err, 'page.entryBalancing.checkRange.msg.repairError');
    }
    setBusy(false);
  };

  return {
    t, open, setOpen, fnOpen, form, onFormChange, preview, items, selected, selectedIds, readyIds, results,
    resultCounts: results ? countRepairResults(results) : null, busy, progress, fnPreview, fnToggle, allReadySelected,
    fnToggleAll, canConfirm, fnConfirm, privileges
  };
};
