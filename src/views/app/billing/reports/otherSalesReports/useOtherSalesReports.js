import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { request, notifyError } from '@Helpers/core';
import { useForm } from '@Hooks';
import { formatNumber } from '@Helpers/Utils';
import { buildSalesColumns } from '@Views/app/billing/reports/salesReport/reportTable';
import { useCustomerOptions } from '@Views/app/billing/reports/salesReport/useCustomerOptions';
import {
  FILTERS_URL, REPORT_TYPES, SETTINGS_URL, buildOtherRequest, defaultRange, effectiveForm, findType, normalizeFilters, normalizeReport, normalizeSettings, pivotTableColumns,
  reportFileName, selectedTypeIds, validateOtherForm
} from './otherSalesRules';

// Otros reportes de ventas (SPEC v2-110-sr): una lectura `GET billing/reports/otherSales/:type` por reporte y la descarga del mismo reporte en PDF (Imprimir) o Excel
// (Exportar). El back valida, aplica el criterio único de facturas, arma las tablas dinámicas (meses o vendedores) y suma en centavos. Un filtro inválido se marca en pantalla y
// NO llama al back. `GET` y `GETPdf` no notifican por sí mismos: el error se avisa aquí con `notifyError`. La moneda solo se ofrece con facturación en Lempiras y Dólares; los
// cajeros son los reales y las clasificaciones salen de `GET .../filters`; el cliente se busca en el servidor.
export const useOtherSalesReports = ({ setLoading }) => {
  const intl = useIntl();
  const customers = useCustomerOptions();
  const [settings, setSettings] = useState(() => normalizeSettings());
  const [filters, setFilters] = useState(() => normalizeFilters());
  const [report, setReport] = useState(() => normalizeReport());
  const [errors, setErrors] = useState({});
  const [sendForm, setSendForm] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { formState, onInputChange, setBulkForm } = useForm({
    reportType: REPORT_TYPES[0].key,
    currency: 1,
    customerId: 0,
    cashierId: 0,
    isPartner: 0,
    minDays: '',
    avgOp: '',
    avgValue: '',
    avgValue2: '',
    ...defaultRange()
  });

  const currentConfig = findType(formState.reportType);
  const form = effectiveForm(formState, settings);
  const typeIds = selectedTypeIds(formState, filters.productTypes);

  const check = () => {
    setSendForm(true);
    const found = validateOtherForm(currentConfig.key, formState);
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const fnSearchReport = () => {
    if (!check()) return;
    const { url, params } = buildOtherRequest(currentConfig.key, form, 'json', typeIds);
    setLoading(true);
    request.GET(`${url}?${new URLSearchParams(params).toString()}`, (resp) => {
      setReport(normalizeReport(resp.data));
      setLoading(false);
    }, (err) => {
      setLoading(false);
      notifyError(err, 'page.otherSalesReports.msg.reportError');
    });
  };

  // PDF o Excel del reporte con los filtros de pantalla: el back lo arma (no se manda ninguna columna ni dato desde aquí).
  const fnDownload = (format) => {
    if (!check()) return;
    const { url, params } = buildOtherRequest(currentConfig.key, form, format, typeIds);
    setDownloading(true);
    request.GETPdf(url, params, reportFileName(currentConfig.key, format), () => {
      setDownloading(false);
    }, 'GET', () => setDownloading(false));
  };

  // Cambiar de reporte limpia los filtros propios del anterior, los errores y el resultado.
  const onReportTypeChange = (e) => {
    const cleared = { reportType: e.target.value, customerId: 0, cashierId: 0, isPartner: 0, minDays: '', avgOp: '', avgValue: '', avgValue2: '' };
    filters.productTypes.forEach((item) => { cleared[`type_${item.id}`] = 0; });
    setBulkForm({ ...formState, ...cleared });
    setReport(normalizeReport());
    setErrors({});
    setSendForm(false);
  };

  useEffect(() => {
    request.GET(SETTINGS_URL, (resp) => setSettings(normalizeSettings(resp.data)), () => setSettings(normalizeSettings()));
    request.GET(FILTERS_URL, (resp) => setFilters(normalizeFilters(resp.data)), () => setFilters(normalizeFilters()));
  }, []);

  // Las columnas de una tabla dinámica (meses o vendedores) las manda el back; las demás son fijas.
  const columns = useMemo(() => {
    if (!currentConfig.isPivot) return buildSalesColumns(currentConfig.columns, intl.formatMessage);
    return pivotTableColumns(report.columns).map((c) => {
      const column = { text: c.header, dataField: c.field };
      if (c.isNumber) {
        column.style = { textAlign: 'right' };
        column.cell = ({ row }) => formatNumber(row.original[c.field], '', 2);
      } else if (c.isInteger) {
        column.style = { textAlign: 'right' };
      }
      return column;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConfig.key, report.columns, intl.locale]);

  const table = { title: '', columns, data: report.rows, actions: [] };
  const reportOptions = REPORT_TYPES.map((item) => ({ id: item.key, code: item.key, name: intl.formatMessage({ id: `page.otherSalesReports.type.${item.key}` }) }));
  const avgOptions = [
    { label: intl.formatMessage({ id: 'page.otherSalesReports.avg.none' }), value: '' },
    { label: intl.formatMessage({ id: 'page.otherSalesReports.avg.lt' }), value: 'lt' },
    { label: intl.formatMessage({ id: 'page.otherSalesReports.avg.gt' }), value: 'gt' },
    { label: intl.formatMessage({ id: 'page.otherSalesReports.avg.between' }), value: 'between' }
  ];

  const propsToHeaderReport = {
    formState, errors, sendForm, onInputChange, onReportTypeChange, currentConfig, reportOptions, avgOptions, downloading,
    hasDualCurrency: settings.hasDualCurrency, listCustomers: customers.options, onCustomerSearch: customers.onInputChange,
    listCashiers: filters.cashiers, productTypes: filters.productTypes,
    fnSearchReport, fnPrint: () => fnDownload('pdf'), fnExport: () => fnDownload('xlsx')
  };

  return { table, totals: report.totals, propsToHeaderReport };
};
