import { useMemo, useState } from 'react';
import { request, notifyError } from '@Helpers/core';
import { buildStockReportRequest, defaultReportForm, needsStore, validateStockReport } from './stockReportRules';

// Modal "Reportes de Existencias" (SPEC v2-44-sr): pide el tipo de reporte, el almacén (no en el general), la fecha y el filtro de valores y
// descarga el documento en PDF o Excel. Es un GET de solo lectura que el back arma desde lo guardado; GETPdf no notifica por sí mismo, así
// que el error se avisa aquí. Un filtro incompleto se marca en pantalla y NO llama al back. Si el back rechaza, el modal queda abierto
// con su mensaje real.
export const useModalStock = ({ setOpen }) => {
  const [form, setForm] = useState(() => defaultReportForm());
  const [sendForm, setSendForm] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const errors = useMemo(() => validateStockReport(form), [form]);

  const onInputChange = ({ target: { name, value } }) => setForm((prev) => ({ ...prev, [name]: value }));
  const onStoreChange = ({ target: { value } }) => setForm((prev) => ({ ...prev, storeId: Number(value) || 0 }));

  const fnDownload = (format) => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;

    setDownloading(true);
    const stop = () => setDownloading(false);
    const { url, params, fileName } = buildStockReportRequest(form, format);
    request.GETPdf(url, params, fileName, (err) => {
      stop();
      notifyError(err, 'page.stock.msg.reportsError');
    }, 'GET', () => {
      stop();
      setOpen(false);
    });
  };

  return { form, errors, sendForm, downloading, askStore: needsStore(form.typeId), onInputChange, onStoreChange, fnDownload };
};
