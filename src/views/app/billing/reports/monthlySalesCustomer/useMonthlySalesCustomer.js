import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { request, notifyError } from '@Helpers/core';
import { useForm } from '@Hooks';
import useCustomerOptions from '@Views/app/billing/reports/salesReport/useCustomerOptions';
import { buildSalesColumns } from '@Views/app/billing/reports/salesReport/reportTable';
import {
  COLUMNS, SETTINGS_URL, buildMonthlyRequest, defaultYear, effectiveForm, normalizeMonthly, normalizeSettings, reportFileName, validateYear, yearOptions
} from './monthlySalesCustomerRules';

// Ventas mensuales por cliente (SPEC v2-106-sr): una sola lectura `GET billing/reports/monthlySalesCustomer` (el back valida, aplica las reglas del legacy, convierte la moneda, suma
// en centavos y calcula el porcentaje) y la descarga del mismo reporte en PDF (Imprimir) o Excel (Exportar). Un año inválido se marca en pantalla y NO llama al back. `GET` y `GETPdf`
// no notifican por sí mismos: el error se avisa aquí con `notifyError`. La moneda solo se ofrece si la empresa factura en Lempiras y Dólares (`dual_curr`).
export const useMonthlySalesCustomer = ({ setLoading }) => {
  const intl = useIntl();
  const [report, setReport] = useState(() => normalizeMonthly());
  const [settings, setSettings] = useState(() => normalizeSettings());
  const [errors, setErrors] = useState({});
  const [sendForm, setSendForm] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { options: listCustomers, onInputChange: onCustomerSearch } = useCustomerOptions();
  const listYears = useMemo(() => yearOptions(), []);

  const { formState, onInputChange } = useForm({
    year: defaultYear(),
    customerId: 0,
    withoutTax: 0,
    currency: 1
  });

  const check = () => {
    setSendForm(true);
    const found = validateYear(formState.year);
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const fnSearchReport = () => {
    if (!check()) return;
    const { url, params } = buildMonthlyRequest(effectiveForm(formState, settings));
    setLoading(true);
    request.GET(`${url}?${new URLSearchParams(params).toString()}`, (resp) => {
      setReport(normalizeMonthly(resp.data));
      setLoading(false);
    }, (err) => {
      setLoading(false);
      notifyError(err, 'page.monthlySalesCustomer.msg.reportError');
    });
  };

  // PDF o Excel del reporte con los filtros de pantalla: el back lo arma (no se manda ninguna columna ni dato desde aquí).
  const fnDownload = (format) => {
    if (!check()) return;
    const { url, params } = buildMonthlyRequest(effectiveForm(formState, settings), format);
    setDownloading(true);
    request.GETPdf(url, params, reportFileName(format), (err) => {
      setDownloading(false);
      notifyError(err, 'page.monthlySalesCustomer.msg.reportError');
    }, 'GET', () => setDownloading(false));
  };

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
    formState, errors, sendForm, onInputChange, listCustomers, onCustomerSearch, listYears, downloading, hasDualCurrency: settings.hasDualCurrency,
    fnSearchReport, fnPrint: () => fnDownload('pdf'), fnExport: () => fnDownload('xlsx')
  };

  return { totals: report.totals, table, propsToHeaderReport };
};
