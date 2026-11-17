import { useEffect, useMemo, useState } from 'react';
import { request, notifyError } from '@Helpers/core';
import { useForm } from '@Hooks';
import { buildKardexRequest, defaultReportForm, needsStore, validateKardexReport } from './kardexReportRules';

// Reporte de Kardex (SPEC v2-60-sr): los 4 reportes de existencias con PDF y Excel. Un filtro incompleto se marca y NO llama al back.
export const useKardexReport = () => {
  const [listStores, setListStores] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { formState, onInputChange } = useForm(defaultReportForm());
  const errors = useMemo(() => validateKardexReport(formState), [formState]);

  useEffect(() => {
    request.GET('inventory/settings/stores?type=1', (resp) => setListStores(resp.data.map((item) => ({ label: item.name, value: item.id }))));
  }, []);

  const fnDownload = (format) => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;
    setDownloading(true);
    const { url, params, fileName } = buildKardexRequest(formState, format);
    request.GETPdf(url, params, fileName, (err) => { setDownloading(false); notifyError(err, 'page.stock.msg.reportsError'); }, 'GET', () => setDownloading(false));
  };

  return { formState, onInputChange, errors, sendForm, downloading, listStores, askStore: needsStore(formState.typeId), fnDownload };
};
