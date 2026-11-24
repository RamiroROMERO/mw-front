import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm } from '@Hooks';
import { request, notifyError } from '@Helpers/core';
import { buildReportRequest, matchesSearch, normalizeReport, reportFileName, validateReportRange } from './taxRetentionReportRules';

// Reporte de Retenciones de Impuestos (SPEC v2-116-sr): todo sale de `GET tax/reports/retentionReport/:type` (el back arma las filas, suma en centavos y
// genera el PDF y el Excel). Un rango inválido se marca y NO llama al back; `GET` y `GETPdf` no notifican por sí mismos: se avisa aquí con `notifyError`.
export const useRetentionReport = ({ setLoading }) => {
  const [allData, setAllData] = useState([]);
  const [dataTotals, setDataTotals] = useState(normalizeReport().totals);
  const [errors, setErrors] = useState({});
  const [sendForm, setSendForm] = useState(false);

  const { formState, onInputChange } = useForm({
    dateStart: DateHelper.format(DateHelper.startOf(DateHelper.now(), 'month')),
    dateEnd: DateHelper.format(DateHelper.endOf(DateHelper.now(), 'month')),
    search: ''
  });
  const { dateStart, dateEnd, search } = formState;

  const [table, setTable] = useState({
    title: IntlMessages('page.taxRetentionReport.table.title'),
    columns: [
      { text: IntlMessages('table.column.date'), dataField: 'date', type: 'date', headerStyle: { width: '7%' } },
      { text: IntlMessages('page.taxPurchaseReport.table.rtnProvider'), dataField: 'providerRtn', headerStyle: { width: '9%' } },
      { text: IntlMessages('table.column.provider'), dataField: 'providerName', headerStyle: { width: '15%' } },
      { text: 'CAI', dataField: 'caiRetention', headerStyle: { width: '13%' } },
      { text: IntlMessages('page.taxPurchaseReport.table.documentNumber'), dataField: 'numberRetention', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.taxRetentionReport.table.caiPurchase'), dataField: 'caiPurchase', headerStyle: { width: '13%' } },
      { text: IntlMessages('page.taxRetentionReport.table.numberPurchase'), dataField: 'numberPurchase', headerStyle: { width: '10%' } },
      // La fecha de la compra puede venir vacía (comprobante anulado o compra no encontrada): la tabla pintaría NaN/NaN/NaN.
      { text: IntlMessages('page.taxRetentionReport.table.datePurchase'), dataField: 'datePurchase', headerStyle: { width: '7%' }, cell: ({ row }) => (row.original.datePurchase ? formatDate(row.original.datePurchase) : '') },
      { text: IntlMessages('page.taxRetentionReport.table.taxBase'), dataField: 'taxBase', type: 'number', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.taxRetentionReport.table.taxName'), dataField: 'taxName', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.taxRetentionReport.table.rate'), dataField: 'rate', type: 'number', headerStyle: { width: '6%' } },
      { text: IntlMessages('table.column.total'), dataField: 'total', type: 'number', headerStyle: { width: '8%' } }
    ],
    data: []
  });

  const check = () => {
    setSendForm(true);
    const found = validateReportRange({ dateStart, dateEnd });
    setErrors(found);
    return Object.keys(found).length === 0;
  };

  const fnSearchReport = () => {
    if (!check()) return;
    const { url, params } = buildReportRequest('retentions', { dateStart, dateEnd });
    setLoading(true);
    request.GET(`${url}?${new URLSearchParams(params).toString()}`, (resp) => {
      const report = normalizeReport(resp.data);
      setAllData(report.rows);
      setTable((prev) => ({ ...prev, data: report.rows.filter((row) => matchesSearch(row, search)) }));
      setDataTotals(report.totals);
      setLoading(false);
    }, (err) => {
      setLoading(false);
      notifyError(err, 'page.taxRetentionReport.msg.reportError');
    });
  };

  const onSearchChange = (e) => {
    onInputChange(e);
    const value = e.target.value;
    setTable((prev) => ({ ...prev, data: allData.filter((row) => matchesSearch(row, value)) }));
  };

  const fnDownload = (type, format) => {
    if (!check()) return;
    const { url, params } = buildReportRequest(type, { dateStart, dateEnd }, format);
    setLoading(true);
    request.GETPdf(url, params, reportFileName(type, format), (err) => {
      setLoading(false);
      notifyError(err, 'page.taxRetentionReport.msg.reportError');
    }, 'GET', () => setLoading(false));
  };

  useEffect(() => {
    fnSearchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const propsToHeaderReport = {
    dateStart,
    dateEnd,
    search,
    errors,
    sendForm,
    onInputChange,
    onSearchChange,
    fnSearchReport,
    fnPrint: () => fnDownload('retentions', 'pdf'),
    fnExportDeclaration: () => fnDownload('declarationBook', 'xlsx')
  };

  const propsToTotals = { total: formatNumber(dataTotals.total) };

  return { table, propsToHeaderReport, propsToTotals };
};
