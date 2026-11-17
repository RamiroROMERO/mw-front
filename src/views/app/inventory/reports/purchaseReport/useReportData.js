import { useState } from 'react';
import { request, notifyError } from '@Helpers/core';
import { buildReportRequest, normalizeReport, reportFileName, validateReportRange } from './purchaseReportRules';

// Reportes de compras (SPEC v2-57-sr): una sola lectura `GET inventory/reports/purchases/:type` (el back valida, filtra por empresa y suma en
// centavos) y la descarga del mismo reporte en PDF o Excel. Un filtro inválido se marca en pantalla y NO llama al back. `GET` y `GETPdf` no
// notifican por sí mismos: el error se avisa aquí con `notifyError` (mensaje real del back en un 400).
export const useReportData = ({ setLoading }) => {
  const [report, setReport] = useState(() => normalizeReport());
  const [errors, setErrors] = useState({});
  const [sendForm, setSendForm] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const check = (filter) => {
    setSendForm(true);
    const found = validateReportRange(filter);
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const fnSearch = (type, filter, onDone) => {
    if (!check(filter)) return;
    const { url, params } = buildReportRequest(type, filter);
    setLoading(true);
    request.GET(`${url}?${new URLSearchParams(params).toString()}`, (resp) => {
      setReport(normalizeReport(resp.data));
      setLoading(false);
      if (typeof onDone === 'function') onDone();
    }, (err) => {
      setLoading(false);
      notifyError(err, 'page.purchaseReport.msg.reportError');
    });
  };

  const fnDownload = (type, filter, format, title, onDone) => {
    if (!check(filter)) return;
    const { url, params } = buildReportRequest(type, filter, format);
    setDownloading(true);
    request.GETPdf(url, params, reportFileName(title || 'Reporte de Compras', format), (err) => {
      setDownloading(false);
      notifyError(err, 'page.purchaseReport.msg.reportError');
    }, 'GET', () => {
      setDownloading(false);
      if (typeof onDone === 'function') onDone();
    });
  };

  return { report, setReport, errors, sendForm, downloading, fnSearch, fnDownload };
};
