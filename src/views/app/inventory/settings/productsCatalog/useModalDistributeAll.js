import { useEffect, useMemo, useState } from 'react';
import { request, notifyError, buildUrl } from '@Helpers/core';
import { useForm } from '@Hooks/useForms';
import { buildBulkRows } from './priceRules';
import { loadAllPending, PENDING_PAGE_SIZE } from './pagingRules';
import { emptyBulkPercents, suggestedPercents, validateBulkPercents, runBulkDistribution, summarizeSkipped } from './distributeAllRules';

const URL = 'inventory/settings/productsDistributions';

// "Distribuir Todos" (SPEC v2-09-sr): crea la distribución por defecto de todo producto sin ninguna. Los precios se calculan aquí
// (priceRules.js) y se envían en lotes de 200 a `bulkDefault`.
export const useModalDistributeAll = ({ setLoading }) => {
  const [pending, setPending] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);

  const { formState, onInputChange, setBulkForm } = useForm(emptyBulkPercents());

  const errors = useMemo(() => validateBulkPercents(formState), [formState]);
  const preview = useMemo(() => (Object.keys(errors).length ? { rows: [], skipped: [] } : buildBulkRows(pending, formState)), [pending, formState, errors]);
  const skippedSummary = useMemo(() => summarizeSkipped(preview.skipped), [preview.skipped]);

  // SPEC v2-18-sr: los pendientes llegan por páginas (por llave, de 500 en 500); se juntan todas antes de calcular la vista previa.
  const fetchPendingPage = (afterId) => new Promise((resolve, reject) => {
    request.GET(buildUrl(`${URL}/pendingProducts`, { limit: PENDING_PAGE_SIZE, afterId }), (res) => resolve(res?.data || {}), reject);
  });

  const fnLoadPending = async () => {
    setLoading(true);
    try {
      const { rows } = await loadAllPending(fetchPendingPage);
      setPending(rows);
    } catch (error) {
      setPending([]);
    }
    setLoaded(true);
    setLoading(false);
  };

  useEffect(() => {
    fnLoadPending();
    // Porcentajes sugeridos: los de inv_porp. Sin fila o con una falla quedan vacíos (se usan los precios actuales).
    request.GET('inventory/settings/productsPercentages/default', (res) => {
      setBulkForm(suggestedPercents(res?.data));
    }, () => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const post = (batch) => new Promise((resolve, reject) => {
    request.POST(`${URL}/bulkDefault`, { rows: batch }, resolve, reject, false);
  });

  const fnDistribute = async () => {
    if (Object.keys(errors).length > 0 || preview.rows.length === 0 || running) return;

    setRunning(true);
    setResult(null);
    setProgress({ done: 0, total: Math.ceil(preview.rows.length / 200) });
    const outcome = await runBulkDistribution({ rows: preview.rows, post, onProgress: setProgress });
    setRunning(false);
    setProgress(null);
    setResult({ ...outcome, skipped: preview.skipped.length });
    if (outcome.failed) notifyError(outcome.error, 'page.productsCatalog.msg.distAllError');
    // Se recarga la lista: lo ya creado deja de ser pendiente, así que repetir solo procesa lo que falta.
    fnLoadPending();
  };

  return {
    formState,
    onInputChange,
    errors,
    pendingCount: pending.length,
    loaded,
    running,
    progress,
    result,
    rowsCount: preview.rows.length,
    skippedCount: preview.skipped.length,
    skippedSummary,
    fnDistribute
  };
};
