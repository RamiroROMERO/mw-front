import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { request, notifyError } from '@Helpers/core';
import {
  BASE_PATH, STATUS_CLOSED, STATUS_OPEN, validateYear, yearPath, generateBody, statusBody, bulkBody, nextStatus, normalizeYear, normalizeSettings
} from './moduleOpeningClosingRules';

// Apertura y Cierre de Módulos (SPEC v2-130-sr): matriz del año (12 meses x módulos) con el estado de cada uno. El back valida y calcula; aquí solo se pide y se confirma.
export const useModuleOpeningClosing = ({ setLoading }) => {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const [yearText, setYearText] = useState(String(new Date().getFullYear()));
  const [data, setData] = useState(normalizeYear(null));
  const [settings, setSettings] = useState(normalizeSettings(null));
  const [pending, setPending] = useState(null); // { kind: 'cell' | 'bulk', month, cell?, status }
  const [yearError, setYearError] = useState('');

  const fail = (err) => { setLoading(false); notifyError(err); };

  const load = useCallback((value = yearText) => {
    const error = validateYear(value);
    setYearError(error);
    if (error) return;
    setLoading(true);
    request.GET(`${yearPath(value)}`, (resp) => { setData(normalizeYear(resp.data)); setLoading(false); }, () => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearText]);

  useEffect(() => {
    request.GET(`${BASE_PATH}/settings`, (resp) => setSettings(normalizeSettings(resp.data)), () => {});
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fnGenerate = (monthIndex) => {
    setLoading(true);
    request.POST(BASE_PATH, generateBody(monthIndex, yearText), () => load(), fail, false);
  };

  const askCell = (month, cell) => setPending({ kind: 'cell', month, cell, status: nextStatus(cell) });
  const askBulk = (month, status) => setPending({ kind: 'bulk', month, status });

  const confirm = () => {
    const action = pending;
    setPending(null);
    if (!action) return;
    setLoading(true);
    if (action.kind === 'cell') request.PUT(`${BASE_PATH}/toggle/${action.cell.detailId}`, statusBody(action.status), () => load(), fail, false);
    else request.PUT(`${BASE_PATH}/bulk`, bulkBody(action.month.periodId, action.status), () => load(), fail, false);
  };

  let confirmTitle = 'page.moduleOpeningClosing.msg.openAll.title';
  if (pending && pending.status === STATUS_CLOSED) confirmTitle = 'page.moduleOpeningClosing.msg.closeAll.title';
  if (pending && pending.kind === 'cell') confirmTitle = pending.status === STATUS_OPEN ? 'page.moduleOpeningClosing.msg.openOne.title' : 'page.moduleOpeningClosing.msg.closeOne.title';

  return {
    t, data, settings, yearText, setYearText, yearError, load, fnGenerate, askCell, askBulk,
    propsToConfirm: {
      open: Boolean(pending), setOpen: (v) => { if (!v) setPending(null); }, fnOnOk: confirm, title: confirmTitle,
      textLegend: pending ? `${pending.month.monthName} ${data.year}` : ''
    }
  };
};
