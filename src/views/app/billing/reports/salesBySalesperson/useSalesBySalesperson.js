import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { request, notifyError } from '@Helpers/core';
import { useForm } from '@Hooks';
import { buildSalesColumns } from '@Views/app/billing/reports/salesReport/reportTable';
import {
  COLUMNS, SETTINGS_URL, TYPE_DETAIL, TYPE_NEW_CUSTOMERS, TYPE_SUMMARY, buildSellerRequest, defaultRange, effectiveForm, normalizeSellerReport, normalizeSettings, reportFileName,
  validateReportRange
} from './salesBySellerRules';

// Ventas por vendedor (SPEC v2-104-sr): una lectura `GET billing/reports/salesBySeller/:type` por reporte (detalle en la pantalla; resumen por producto y clientes nuevos en sus
// modales) y la descarga del mismo reporte en PDF (Imprimir) o Excel (Exportar). El back valida, aplica las reglas del legacy y suma en centavos. Un filtro inválido se marca en
// pantalla y NO llama al back. `GET` y `GETPdf` no notifican por sí mismos: el error se avisa aquí con `notifyError`. La moneda solo se ofrece con facturación en Lempiras y Dólares.
export const useSalesBySalesperson = ({ setLoading }) => {
  const intl = useIntl();
  const [listSellers, setListSellers] = useState([]);
  const [settings, setSettings] = useState(() => normalizeSettings());
  const [detail, setDetail] = useState(() => normalizeSellerReport());
  const [summary, setSummary] = useState(() => normalizeSellerReport());
  const [newCustomers, setNewCustomers] = useState(() => normalizeSellerReport());
  const [openModalViewSummary, setOpenModalViewSummary] = useState(false);
  const [openModalNewCustomers, setOpenModalNewCustomers] = useState(false);
  const [errors, setErrors] = useState({});
  const [sendForm, setSendForm] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { formState, onInputChange } = useForm({
    sellerCode: '',
    currency: 1,
    partnersOnly: 0,
    ...defaultRange()
  });

  const check = () => {
    setSendForm(true);
    const found = validateReportRange({ dateStart: formState.startDate, dateEnd: formState.endDate });
    // El formulario usa startDate/endDate; el validador, dateStart/dateEnd.
    setErrors({ startDate: found.dateStart, endDate: found.dateEnd });
    return Object.keys(found).length === 0;
  };

  const fnRead = (type, setter, onDone) => {
    if (!check()) return;
    const { url, params } = buildSellerRequest(type, effectiveForm(formState, settings));
    setLoading(true);
    request.GET(`${url}?${new URLSearchParams(params).toString()}`, (resp) => {
      setter(normalizeSellerReport(resp.data));
      setLoading(false);
      if (typeof onDone === 'function') onDone();
    }, (err) => {
      setLoading(false);
      notifyError(err, 'page.salesBySeller.msg.reportError');
    });
  };

  const fnSearchReport = () => fnRead(TYPE_DETAIL, setDetail);
  const fnViewSummary = () => fnRead(TYPE_SUMMARY, setSummary, () => setOpenModalViewSummary(true));
  const fnViewNewCustomers = () => fnRead(TYPE_NEW_CUSTOMERS, setNewCustomers, () => setOpenModalNewCustomers(true));

  // PDF o Excel del reporte con los filtros de pantalla: el back lo arma (no se manda ninguna columna ni dato desde aquí).
  const fnDownload = (type, format) => {
    if (!check()) return;
    const { url, params } = buildSellerRequest(type, effectiveForm(formState, settings), format);
    setDownloading(true);
    request.GETPdf(url, params, reportFileName(type, format), () => {
      setDownloading(false);
    }, 'GET', () => setDownloading(false));
  };

  useEffect(() => {
    request.GET('admin/users/getSellers', (resp) => {
      setListSellers(resp.data.map((item) => ({ label: `${item.sellerCode} | ${item.name}`, value: item.sellerCode })));
    }, () => setListSellers([]));
    request.GET(SETTINGS_URL, (resp) => setSettings(normalizeSettings(resp.data)), () => setSettings(normalizeSettings()));
  }, []);

  const table = useMemo(() => ({
    title: '',
    columns: buildSalesColumns(COLUMNS[TYPE_DETAIL], intl.formatMessage),
    data: detail.rows,
    actions: []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [detail.rows, intl.locale]);

  const propsToHeaderReport = {
    formState, errors, sendForm, onInputChange, listSellers, downloading, hasDualCurrency: settings.hasDualCurrency,
    fnSearchReport, fnViewSummary, fnViewNewCustomers,
    fnPrint: () => fnDownload(TYPE_DETAIL, 'pdf'), fnExport: () => fnDownload(TYPE_DETAIL, 'xlsx')
  };

  return {
    table,
    totals: detail.totals,
    dataSummary: summary.rows,
    dataNewCustomers: newCustomers.rows,
    downloading,
    fnDownload,
    openModalViewSummary,
    openModalNewCustomers,
    setOpenModalViewSummary,
    setOpenModalNewCustomers,
    propsToHeaderReport
  };
};
