import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { request, notifyError } from '@Helpers/core';
import { useForm } from '@Hooks';
import useCustomerOptions from '@Views/app/billing/reports/salesReport/useCustomerOptions';
import { buildSalesColumns } from '@Views/app/billing/reports/salesReport/reportTable';
import {
  COLUMNS, SETTINGS_URL, buildGeneralInvoiceRequest, defaultRange, effectiveForm, normalizeGeneralInvoice, normalizeSettings, reportFileName, validateReportRange
} from './generalInvoiceRules';

// Factura general (SPEC v2-100-sr): una sola lectura `GET billing/reports/generalInvoice` (el back valida, aplica las reglas del legacy y suma en centavos) y la
// descarga del mismo reporte en PDF (Imprimir) o Excel (Exportar). Un filtro inválido se marca en pantalla y NO llama al back. `GET` y `GETPdf` no notifican
// por sí mismos: el error se avisa aquí con `notifyError`.
export const useGeneralInvoice = ({ setLoading }) => {
  const intl = useIntl();
  const [report, setReport] = useState(() => normalizeGeneralInvoice());
  const [settings, setSettings] = useState(() => normalizeSettings());
  const [errors, setErrors] = useState({});
  const [sendForm, setSendForm] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { options: listCustomers, onInputChange: onCustomerSearch } = useCustomerOptions();

  const { formState, onInputChange } = useForm({
    customerId: 0,
    typeDocto: 3,
    currency: 1,
    ...defaultRange()
  });

  const check = () => {
    setSendForm(true);
    const found = validateReportRange({ dateStart: formState.startDate, dateEnd: formState.endDate });
    // El formulario usa startDate/endDate; el validador, dateStart/dateEnd.
    setErrors({ startDate: found.dateStart, endDate: found.dateEnd });
    return Object.keys(found).length === 0;
  };

  const fnSearchReport = () => {
    if (!check()) return;
    const { url, params } = buildGeneralInvoiceRequest(effectiveForm(formState, settings));
    setLoading(true);
    request.GET(`${url}?${new URLSearchParams(params).toString()}`, (resp) => {
      setReport(normalizeGeneralInvoice(resp.data));
      setLoading(false);
    }, (err) => {
      setLoading(false);
      notifyError(err, 'page.generalInvoice.msg.reportError');
    });
  };

  // PDF o Excel del reporte con los filtros de pantalla: el back lo arma (no se manda ninguna columna ni dato desde aquí).
  const fnDownload = (format) => {
    if (!check()) return;
    const { url, params } = buildGeneralInvoiceRequest(effectiveForm(formState, settings), format);
    setDownloading(true);
    request.GETPdf(url, params, reportFileName(format), (err) => {
      setDownloading(false);
      notifyError(err, 'page.generalInvoice.msg.reportError');
    }, 'GET', () => setDownloading(false));
  };

  // La moneda solo se ofrece si la empresa factura en Lempiras y Dólares (`dual_curr`).
  useEffect(() => {
    request.GET(SETTINGS_URL, (resp) => setSettings(normalizeSettings(resp.data)), () => setSettings(normalizeSettings()));
  }, []);

  const table = useMemo(() => ({
    title: '',
    columns: buildSalesColumns(COLUMNS, intl.formatMessage),
    data: report.rows,
    actions: []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [report.rows, intl.locale]);

  const propsToHeaderReport = {
    formState, errors, sendForm, onInputChange, listCustomers, onCustomerSearch, downloading, hasDualCurrency: settings.hasDualCurrency,
    fnSearchReport, fnPrint: () => fnDownload('pdf'), fnExport: () => fnDownload('xlsx')
  };

  return { totals: report.totals, table, propsToHeaderReport };
};
