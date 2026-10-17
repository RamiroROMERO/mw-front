import { useState } from 'react';
import { request, notifyError } from '@Helpers/core';
import { buildExportRequest, EXPORT_FILE_NAME } from './exportRules';

// Modal "Exportar" (SPEC v2-12-sr): confirma y descarga el Excel. Es un GET de solo lectura; GETPdf no notifica por sí mismo,
// así que el error se avisa aquí. Cancelar cierra sin llamar al back.
export const useModalExport = ({ setOpen }) => {
  const [includeDisabled, setIncludeDisabled] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fnAccept = () => {
    setExporting(true);
    const stop = () => setExporting(false);
    const { url, params } = buildExportRequest(includeDisabled);
    request.GETPdf(url, params, EXPORT_FILE_NAME, (err) => {
      stop();
      notifyError(err, 'page.productsCatalog.msg.exportError');
    }, 'GET', () => {
      stop();
      setOpen(false);
    });
  };

  const fnCancel = () => setOpen(false);

  return { includeDisabled, setIncludeDisabled, exporting, fnAccept, fnCancel };
};
