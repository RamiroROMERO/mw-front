import { useMemo, useState } from 'react';
import { request, notifyError } from '@Helpers/core';
import { buildReportRequest, defaultRange, validateReportRange } from './ticketPurchaseReportRules';

// Modal "Reporte de Boletas de Compra" (SPEC v2-41-sr): pide el rango y descarga el listado en PDF o Excel. Es un GET de solo
// lectura que el back arma desde lo guardado; GETPdf no notifica por sí mismo, así que el error se avisa aquí. Un rango
// inválido se marca en pantalla y NO llama al back. Si el back rechaza, el modal queda abierto con su mensaje real.
export const useModalTicketPurchaseReport = ({ setOpen }) => {
  const [range, setRange] = useState(() => defaultRange());
  const [sendForm, setSendForm] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const errors = useMemo(() => validateReportRange(range), [range]);

  const onInputChange = ({ target: { name, value } }) => setRange((prev) => ({ ...prev, [name]: value }));

  const fnDownload = (format) => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;

    setDownloading(true);
    const stop = () => setDownloading(false);
    const { url, params, fileName } = buildReportRequest(range, format);
    request.GETPdf(url, params, fileName, (err) => {
      stop();
      notifyError(err, 'page.ticketPurchase.msg.reportError');
    }, 'GET', () => {
      stop();
      setOpen(false);
    });
  };

  const fnCancel = () => setOpen(false);

  return { range, errors, sendForm, downloading, onInputChange, fnDownload, fnCancel };
};
