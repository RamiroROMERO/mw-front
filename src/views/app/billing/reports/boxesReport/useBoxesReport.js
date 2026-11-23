import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { request, notifyError } from '@Helpers/core';
import { useForm } from '@Hooks';
import { buildSalesColumns } from '@Views/app/billing/reports/salesReport/reportTable';
import {
  FILTERS_URL, PAYMENT_COLUMNS, ROUTE_CLOSES, ROUTE_PAYMENTS, ROUTE_SUMMARY, ROUTE_TIPS, GROUP_NONE, buildCashRequest, defaultRange, normalizeCashReport, normalizeFilters,
  reportFileName, validateReportRange, validateSummaryFlags
} from './cashReportRules';

// Reporte de cajas (SPEC v2-108-sr): una lectura `GET billing/reports/cashReport/:route` por reporte (cobros en la pantalla; resumen, cierres y propinas en sus modales) y la
// descarga del mismo reporte en PDF (Imprimir) o Excel (Exportar). El back valida, aplica las reglas del legacy y suma en centavos. Un filtro inválido se marca en pantalla y NO
// llama al back. Todas las lecturas usan las fechas y los filtros del encabezado (antes el resumen no mandaba fechas y resumía todo el historial). `GET` y `GETPdf` no notifican
// por sí mismos: el error se avisa aquí con `notifyError`. Los combos (cajas, cajeros reales y formas de pago) salen de `GET .../filters`.
export const useBoxesReport = ({ setLoading }) => {
  const intl = useIntl();
  const [filters, setFilters] = useState(() => normalizeFilters());
  const [payments, setPayments] = useState(() => normalizeCashReport());
  const [summary, setSummary] = useState(() => normalizeCashReport());
  const [closes, setCloses] = useState(() => normalizeCashReport());
  const [tips, setTips] = useState(() => normalizeCashReport());
  const [openModalSummary, setOpenModalSummary] = useState(false);
  const [openModalCashClose, setOpenModalCashClose] = useState(false);
  const [openModalTips, setOpenModalTips] = useState(false);
  const [errors, setErrors] = useState({});
  const [sendForm, setSendForm] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { formState, onInputChange } = useForm({
    cashId: 0,
    cashierId: 0,
    paymentTypeId: 0,
    groupBy: GROUP_NONE,
    byCash: 1,
    byCashier: 0,
    byPaymentType: 0,
    ...defaultRange()
  });

  const check = (route) => {
    setSendForm(true);
    const found = validateReportRange({ dateStart: formState.startDate, dateEnd: formState.endDate });
    // El formulario usa startDate/endDate; el validador, dateStart/dateEnd.
    const summaryFound = route === ROUTE_SUMMARY ? validateSummaryFlags(formState) : {};
    setErrors({ startDate: found.dateStart, endDate: found.dateEnd, ...summaryFound });
    return Object.keys(found).length === 0 && Object.keys(summaryFound).length === 0;
  };

  const fnRead = (route, setter, onDone) => {
    if (!check(route)) return;
    const { url, params } = buildCashRequest(route, formState);
    setLoading(true);
    request.GET(`${url}?${new URLSearchParams(params).toString()}`, (resp) => {
      setter(normalizeCashReport(resp.data));
      setLoading(false);
      if (typeof onDone === 'function') onDone();
    }, (err) => {
      setLoading(false);
      notifyError(err, 'page.boxesReport.msg.reportError');
    });
  };

  const fnSearchReport = () => fnRead(ROUTE_PAYMENTS, setPayments);
  const fnViewSummary = () => setOpenModalSummary(true);
  const fnReadSummary = () => fnRead(ROUTE_SUMMARY, setSummary);
  const fnViewCashClose = () => fnRead(ROUTE_CLOSES, setCloses, () => setOpenModalCashClose(true));
  const fnViewTips = () => fnRead(ROUTE_TIPS, setTips, () => setOpenModalTips(true));

  // PDF o Excel del reporte con los filtros de pantalla: el back lo arma (no se manda ninguna columna ni dato desde aquí).
  const fnDownload = (route, format) => {
    if (!check(route)) return;
    const { url, params } = buildCashRequest(route, formState, format);
    setDownloading(true);
    request.GETPdf(url, params, reportFileName(route, formState, format), () => {
      setDownloading(false);
    }, 'GET', () => setDownloading(false));
  };

  useEffect(() => {
    request.GET(FILTERS_URL, (resp) => setFilters(normalizeFilters(resp.data)), () => setFilters(normalizeFilters()));
  }, []);

  const table = useMemo(() => ({
    title: '',
    columns: buildSalesColumns(PAYMENT_COLUMNS, intl.formatMessage),
    data: payments.rows,
    actions: []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [payments.rows, intl.locale]);

  const propsToHeaderReport = {
    formState, errors, sendForm, onInputChange, downloading, filters,
    fnSearchReport, fnViewSummary, fnViewCashClose, fnViewTips,
    fnPrint: () => fnDownload(ROUTE_PAYMENTS, 'pdf'), fnExport: () => fnDownload(ROUTE_PAYMENTS, 'xlsx')
  };

  return {
    table,
    totals: payments.totals,
    formState,
    errors,
    sendForm,
    onInputChange,
    downloading,
    summary,
    closes,
    tips,
    fnReadSummary,
    fnDownload,
    openModalSummary,
    setOpenModalSummary,
    openModalCashClose,
    setOpenModalCashClose,
    openModalTips,
    setOpenModalTips,
    propsToHeaderReport
  };
};
