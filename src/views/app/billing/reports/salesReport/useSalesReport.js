import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { request, notifyError } from '@Helpers/core';
import { useForm } from '@Hooks';
import useProductOptions from '@Views/app/inventory/settings/productsCatalog/useProductOptions';
import useCustomerOptions from './useCustomerOptions';
import { buildSalesColumns } from './reportTable';
import {
  TYPE_DETAIL, TYPE_SUMMARY, buildSalesRequest, columnsFor, defaultRange, hasCosts, normalizeSalesReport, reportFileName, validateReportRange
} from './salesReportRules';

// Reporte de ventas (SPEC v2-98-sr): una sola lectura `GET billing/reports/sales/:type` (el back valida, aplica las reglas del legacy y suma en centavos) y
// la descarga del mismo reporte en Excel (`format=xlsx`). Costos y utilidad solo llegan con el privilegio `99.01.006`: el front muestra lo que llega. Un filtro
// inválido se marca en pantalla y NO llama al back. `GET` y `GETPdf` no notifican por sí mismos: el error se avisa aquí con `notifyError`.
export const useSalesReport = ({ setLoading }) => {
  const intl = useIntl();
  const [listSellers, setListSellers] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [valChangeUsd, setValChangeUsd] = useState(0);
  const [detail, setDetail] = useState(() => normalizeSalesReport());
  const [summary, setSummary] = useState(() => normalizeSalesReport());
  const [errors, setErrors] = useState({});
  const [sendForm, setSendForm] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [openModalSummary, setOpenModalSummary] = useState(false);
  const { options: listCustomers, onInputChange: onCustomerSearch } = useCustomerOptions();
  const { options: listProducts, onInputChange: onProductSearch } = useProductOptions();

  const { formState, onInputChange } = useForm({
    customerId: 0, storeId: 0, productCode: '', sellerCode: '', documentType: 3, ...defaultRange()
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
    const { url, params } = buildSalesRequest(type, formState);
    setLoading(true);
    request.GET(`${url}?${new URLSearchParams(params).toString()}`, (resp) => {
      setter(normalizeSalesReport(resp.data));
      setLoading(false);
      if (typeof onDone === 'function') onDone();
    }, (err) => {
      setLoading(false);
      notifyError(err, 'page.salesReport.msg.reportError');
    });
  };

  const fnSearchReport = () => fnRead(TYPE_DETAIL, setDetail);
  const fnOpenModalSummary = () => fnRead(TYPE_SUMMARY, setSummary, () => setOpenModalSummary(true));

  // Excel del reporte con los filtros de pantalla: el back lo arma (no se manda ninguna columna ni dato desde aquí).
  const fnExportToExcel = (type = TYPE_DETAIL) => {
    if (!check()) return;
    const { url, params } = buildSalesRequest(type, formState, 'xlsx');
    setDownloading(true);
    request.GETPdf(url, params, reportFileName(type), (err) => {
      setDownloading(false);
      notifyError(err, 'page.salesReport.msg.reportError');
    }, 'GET', () => setDownloading(false));
  };

  const withCosts = hasCosts(detail.totals);
  const table = useMemo(() => ({
    title: '',
    columns: buildSalesColumns(columnsFor(TYPE_DETAIL, withCosts), intl.formatMessage),
    data: detail.rows,
    actions: [] // Resumido y Exportar son botones del encabezado (SPEC v2-98-sr: reemplazan al botón Imprimir)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [detail.rows, withCosts, intl.locale]);

  const tableSummary = useMemo(() => ({
    title: '',
    columns: buildSalesColumns(columnsFor(TYPE_SUMMARY, hasCosts(summary.totals)), intl.formatMessage),
    data: summary.rows,
    actions: [
      { color: 'secondary', icon: 'file-earmark-excel', onClick: () => fnExportToExcel(TYPE_SUMMARY), title: 'Exportar', isFreeAction: true }
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [summary, formState, downloading, intl.locale]);

  useEffect(() => {
    request.GET('admin/users/getSellers', (resp) => {
      setListSellers(resp.data.map((item) => ({ label: `${item.sellerCode} | ${item.name}`, value: item.sellerCode })));
    }, () => setListSellers([]));
    request.GET('inventory/settings/stores?type=1', (resp) => {
      setListStores(resp.data.map((item) => ({ label: item.name, value: item.id })));
    }, () => setListStores([]));
    request.GET('admin/utils/getUsdChange/', (resp) => {
      setValChangeUsd(Number(resp?.data?.value) || 0);
    }, () => setValChangeUsd(0));
  }, []);

  const propsToHeaderReport = {
    formState, errors, sendForm, onInputChange, listCustomers, listSellers, listStores, listProducts, onCustomerSearch, onProductSearch,
    downloading, fnSearchReport, fnExport: () => fnExportToExcel(TYPE_DETAIL), fnSummary: fnOpenModalSummary
  };

  // `TotalsReport` y `ModalSummary` muestran "Ingreso Bruto" con `saleDiff`: la utilidad que manda el back.
  const withSaleDiff = (totals) => (hasCosts(totals) ? { ...totals, saleDiff: totals.profit } : totals);
  return {
    totals: withSaleDiff(detail.totals),
    table,
    propsToHeaderReport,
    tableSummary,
    valChangeUsd,
    totalsSummary: withSaleDiff(summary.totals),
    openModalSummary,
    setOpenModalSummary
  };
};
