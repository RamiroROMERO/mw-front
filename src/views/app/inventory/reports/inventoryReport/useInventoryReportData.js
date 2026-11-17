import { useState } from 'react';
import { request, buildUrl, notifyError } from '@Helpers/core';
import { buildInventoryRequest, normalizeReport, validateInventoryReport } from './inventoryReportRules';

// Reportes de inventarios (SPEC v2-60-sr): una sola lectura `GET inventory/reports/inventoryReports/:type` (el back valida, filtra por empresa y suma) y la
// descarga del mismo reporte en PDF o Excel. Un filtro inválido se marca en pantalla y NO llama al back. `GET` y `GETPdf` no notifican por sí mismos: el
// error se avisa aquí con `notifyError` (mensaje real del back en un 400).
export const useInventoryReportData = ({ setLoading }) => {
  const [report, setReport] = useState(() => normalizeReport());
  const [errors, setErrors] = useState({});
  const [sendForm, setSendForm] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const check = (typeId, form) => {
    setSendForm(true);
    const found = validateInventoryReport(typeId, form);
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const fnSearch = (typeId, form) => {
    if (!check(typeId, form)) return;
    const { url, params } = buildInventoryRequest(typeId, form);
    setLoading(true);
    request.GET(buildUrl(url, params), (resp) => {
      setReport(normalizeReport(resp.data));
      setLoading(false);
    }, (err) => {
      setLoading(false);
      notifyError(err, 'page.inventoryReport.msg.reportError');
    });
  };

  const fnDownload = (typeId, form, format) => {
    if (!check(typeId, form)) return;
    const { url, params, fileName } = buildInventoryRequest(typeId, form, format);
    setDownloading(true);
    request.GETPdf(url, params, fileName, (err) => {
      setDownloading(false);
      notifyError(err, 'page.inventoryReport.msg.reportError');
    }, 'GET', () => setDownloading(false));
  };

  const reset = () => { setReport(normalizeReport()); setErrors({}); setSendForm(false); };

  return { report, errors, sendForm, downloading, fnSearch, fnDownload, reset };
};
