import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm } from '@Hooks';
import { request, notifyError } from '@Helpers/core';
import { buildReportRequest, matchesSearch, normalizeReport, reportFileName, validateReportRange } from './taxSalesReportRules';

// Reporte de Ventas de Impuestos (SPEC v2-115-sr): todo sale de `GET tax/reports/salesReport/:type` (el back deriva lo fiscal, suma en centavos y arma
// el PDF y el Excel). Un rango inválido se marca y NO llama al back; `GET` y `GETPdf` no notifican por sí mismos: se avisa aquí con `notifyError`.
export const useSalesReport = ({ setLoading }) => {
  const [allData, setAllData] = useState([]);
  const [listDocuments, setListDocuments] = useState([]);
  const [dataTotals, setDataTotals] = useState(normalizeReport().totals);
  const [errors, setErrors] = useState({});
  const [sendForm, setSendForm] = useState(false);

  const { formState, onInputChange } = useForm({
    dateStart: DateHelper.format(DateHelper.startOf(DateHelper.now(), 'month')),
    dateEnd: DateHelper.format(DateHelper.endOf(DateHelper.now(), 'month')),
    cai: '',
    search: ''
  });
  const { dateStart, dateEnd, cai, search } = formState;

  const [table, setTable] = useState({
    title: IntlMessages('page.taxSalesReport.table.title'),
    columns: [
      { text: IntlMessages('table.column.date'), dataField: 'date', type: 'date', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.taxSalesReport.table.rtnClient'), dataField: 'clientRtn', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.taxSalesReport.table.clientName'), dataField: 'clientName', headerStyle: { width: '17%' } },
      { text: 'CAI', dataField: 'cai', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.taxSalesReport.table.documentNumber'), dataField: 'number', headerStyle: { width: '10%' } },
      { text: IntlMessages('table.column.subtotal'), dataField: 'subtotal', type: 'number', headerStyle: { width: '6%' } },
      { text: IntlMessages('table.column.discount'), dataField: 'discount', type: 'number', headerStyle: { width: '6%' } },
      { text: IntlMessages('page.taxSalesReport.table.exoneratedValue'), dataField: 'exonerated', type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages('page.taxPurchaseReport.table.exemptValue'), dataField: 'exempt', type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages('page.taxPurchaseReport.table.taxedValue'), dataField: 'taxed', type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages('table.column.tax'), dataField: 'tax', type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages('table.column.total'), dataField: 'total', type: 'number', headerStyle: { width: '7%' } }
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
    const { url, params } = buildReportRequest('sales', { dateStart, dateEnd, cai });
    setLoading(true);
    request.GET(`${url}?${new URLSearchParams(params).toString()}`, (resp) => {
      const report = normalizeReport(resp.data);
      setAllData(report.rows);
      setTable((prev) => ({ ...prev, data: report.rows.filter((row) => matchesSearch(row, search)) }));
      setDataTotals(report.totals);
      setLoading(false);
    }, (err) => {
      setLoading(false);
      notifyError(err, 'page.taxSalesReport.msg.reportError');
    });
  };

  const onSearchChange = (e) => {
    onInputChange(e);
    const value = e.target.value;
    setTable((prev) => ({ ...prev, data: allData.filter((row) => matchesSearch(row, value)) }));
  };

  const fnDownload = (type, format) => {
    if (!check()) return;
    const { url, params } = buildReportRequest(type, { dateStart, dateEnd, cai }, format);
    setLoading(true);
    request.GETPdf(url, params, reportFileName(type, format), (err) => {
      setLoading(false);
      notifyError(err, 'page.taxSalesReport.msg.reportError');
    }, 'GET', () => setLoading(false));
  };

  useEffect(() => {
    request.GET('admin/taxDocuments', (resp) => {
      const documents = resp.data
        .filter((item) => item.status)
        .map((item) => {
          const documentCai = [item.cai1, item.cai2, item.cai3, item.cai4, item.cai5, item.cai6].join('-');
          return { label: `${item.name} -> ${documentCai}`, value: documentCai };
        });
      setListDocuments(documents);
    });
    fnSearchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const propsToHeaderReport = {
    dateStart,
    dateEnd,
    cai,
    search,
    errors,
    sendForm,
    listDocuments,
    onInputChange,
    onSearchChange,
    fnSearchReport,
    fnPrint: () => fnDownload('sales', 'pdf'),
    fnExportDeclaration: () => fnDownload('declarationBook', 'xlsx'),
    fnExportSalesBook: () => fnDownload('salesBook', 'xlsx')
  };

  const propsToTotals = {
    total: formatNumber(dataTotals.total),
    exemptValue: formatNumber(dataTotals.exempt),
    exoneratedValue: formatNumber(dataTotals.exonerated),
    taxedValue: formatNumber(dataTotals.taxed),
    tax: formatNumber(dataTotals.tax)
  };

  return { table, propsToHeaderReport, propsToTotals };
};
