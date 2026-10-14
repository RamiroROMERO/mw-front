import { useState, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { request, buildUrl, notifyError } from '@Helpers/core';
import { getPrivilegeData, formatNumber } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';
import {
  PRIVILEGE_UNAPPLY, currentMonth, monthOptions, formatMonth, buildPreviewQuery, buildApplyBody, buildUnapplyBody,
  canApply, previewSummary, groupByAsset, warningTexts, resolveUnapplyAction, batchRow
} from './depreciationApplyRules';

const BASE = 'fixedAssets/process/depreciationApply';

const readPrivilege = (code) => {
  try {
    return Boolean(getPrivilegeData(code).active);
  } catch {
    return false;
  }
};

// Nombres de mes del idioma activo (enero primero), sin agregar claves de traducción.
const buildMonthNames = (locale) => {
  const formatter = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' });
  return Array.from({ length: 12 }, (_, i) => {
    const name = formatter.format(new Date(Date.UTC(2026, i, 1)));
    return name.charAt(0).toUpperCase() + name.slice(1);
  });
};

export const useDepreciationApply = ({ setLoading }) => {
  const intl = useIntl();
  const t = (id, values) => intl.formatMessage({ id }, values);

  const canEditPosted = useMemo(() => readPrivilege(PRIVILEGE_UNAPPLY), []);
  const monthNames = useMemo(() => buildMonthNames(intl.locale), [intl.locale]);
  const monthList = useMemo(
    () => monthOptions().map((o) => ({ value: o.value, label: formatMonth(o.value, monthNames) })),
    [monthNames]
  );

  const [month, setMonth] = useState(currentMonth());
  const [preview, setPreview] = useState(null);
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [openApply, setOpenApply] = useState(false);
  const [openUnapply, setOpenUnapply] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(null);

  const loadHistory = () => {
    request.GET(BASE, (resp) => {
      setHistory((resp.data || []).map(batchRow));
    }, (err) => notifyError(err, 'page.depreciationApply.msg.historyError'));
  };

  const loadPreview = (monthToLoad = month) => {
    setLoading(true);
    request.GET(buildUrl(`${BASE}/preview`, buildPreviewQuery(monthToLoad)), (resp) => {
      setPreview(resp.data);
      setLoading(false);
    }, (err) => {
      setPreview(null);
      setLoading(false);
      notifyError(err, 'page.depreciationApply.msg.previewError');
    });
  };

  const onChangeMonth = (e) => {
    const value = (e && e.target && e.target.value) || '';
    if (value === '' || value === '0') return;
    setMonth(value);
    loadPreview(value);
  };

  const summary = previewSummary(preview);
  const assetRows = useMemo(() => groupByAsset(preview ? preview.lines : []), [preview]);
  const warnings = warningTexts(preview ? preview.warnings : []);
  const canPressApply = canApply(preview, busy);

  // Aplicar: confirmación con el mes y el total; el back decide (período, cuentas bloqueadas, activos sin cuenta).
  const fnAskApply = () => {
    if (!canPressApply) return;
    setOpenApply(true);
  };

  const applyLegend = preview
    ? t('page.depreciationApply.msg.applyLegend', {
      month: formatMonth(month, monthNames), total: formatNumber(summary.total, '', 2), lines: summary.linesCount
    })
    : '';

  const fnApplyOk = () => {
    setOpenApply(false);
    setBusy(true);
    setLoading(true);
    request.POST(`${BASE}/apply`, buildApplyBody(month), (resp) => {
      setBusy(false);
      setLoading(false);
      const pda = resp.data && resp.data.pdaNumber;
      notification(
        'success',
        { text: t('page.depreciationApply.msg.applied', { pda: pda > 0 ? pda : '-' }) },
        'alert.success.title'
      );
      loadPreview(month);
      loadHistory();
    }, (err) => {
      setBusy(false);
      setLoading(false);
      notifyError(err, 'page.depreciationApply.msg.applyError');
    }, false);
  };

  // Desaplicar: sin 11.01.015 se avisa sin llamar al back (que respondería 403 user.forbidden.editPosted).
  const fnAskUnapply = (batch) => {
    const action = resolveUnapplyAction(batch, canEditPosted);
    if (action === 'none') return;
    if (action === 'forbidden') {
      notification('warning', 'error.user.forbidden.editPosted', 'alert.warning.title');
      return;
    }
    setCurrentBatch(batch);
    setOpenUnapply(true);
  };

  const unapplyLegend = currentBatch
    ? t('page.depreciationApply.msg.unapplyLegend', {
      month: formatMonth(currentBatch.periodMonth, monthNames), pda: currentBatch.hasEntry ? currentBatch.pdaNumber : '-'
    })
    : '';

  const fnUnapplyOk = () => {
    setOpenUnapply(false);
    if (!currentBatch) return;
    setBusy(true);
    setLoading(true);
    request.POST(`${BASE}/unapply`, buildUnapplyBody(currentBatch), () => {
      setBusy(false);
      setLoading(false);
      setCurrentBatch(null);
      notification('success', 'page.depreciationApply.msg.unapplied', 'alert.success.title');
      loadPreview(month);
      loadHistory();
    }, (err) => {
      setBusy(false);
      setLoading(false);
      notifyError(err, 'page.depreciationApply.msg.unapplyError');
    }, false);
  };

  useEffect(() => {
    loadPreview(month);
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    month,
    monthList,
    onChangeMonth,
    preview,
    summary,
    assetRows,
    warnings,
    history,
    monthNames,
    canPressApply,
    canEditPosted,
    fnAskApply,
    fnAskUnapply,
    fnRefresh: () => { loadPreview(month); loadHistory(); },
    propsToMsgApply: {
      open: openApply, setOpen: setOpenApply, fnOnOk: fnApplyOk,
      title: 'page.depreciationApply.msg.applyConfirm', textLegend: applyLegend
    },
    propsToMsgUnapply: {
      open: openUnapply, setOpen: setOpenUnapply, fnOnOk: fnUnapplyOk, setCurrentItem: setCurrentBatch,
      title: 'page.depreciationApply.msg.unapplyConfirm', textLegend: unapplyLegend
    }
  };
};
