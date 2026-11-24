import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm } from '@Hooks';
import { request, notifyError } from '@Helpers/core';
import { buildReportRequest, matchesSearch, normalizeReport, reportFileName, validateReportRange } from './taxPurchaseReportRules';

// Reporte de Compras de Impuestos (SPEC v2-114-sr): todo sale de `GET tax/reports/purchaseReport/:type` (el back deriva lo fiscal, suma en centavos y
// arma el PDF y el Excel). Un rango inválido se marca y NO llama al back; `GET` y `GETPdf` no notifican por sí mismos: se avisa aquí con `notifyError`.
export const usePurchaseReport = ({ setLoading }) => {
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
    title: IntlMessages('page.taxPurchaseReport.table.title'),
    columns: [
      { text: IntlMessages('table.column.date'), dataField: 'date', type: 'date', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.taxPurchaseReport.table.rtnProvider'), dataField: 'providerRtn', headerStyle: { width: '10%' } },
      { text: IntlMessages('table.column.provider'), dataField: 'providerName', headerStyle: { width: '18%' } },
      { text: 'CAI', dataField: 'cai', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.taxPurchaseReport.table.documentNumber'), dataField: 'number', headerStyle: { width: '11%' } },
      { text: IntlMessages('table.column.subtotal'), dataField: 'subtotal', type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages('table.column.discount'), dataField: 'discount', type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages('page.taxPurchaseReport.table.exonerated'), dataField: 'exonerated', type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages('page.taxPurchaseReport.table.exemptValue'), dataField: 'exempt', type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages('page.taxPurchaseReport.table.taxedValue'), dataField: 'taxed', type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages('table.column.tax'), dataField: 'tax', type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages('table.column.total'), dataField: 'total', type: 'number', headerStyle: { width: '7%' } }
    ],
    data: []
  });

  const [allCreditNotesProvData, setAllCreditNotesProvData] = useState([]);
  const [creditNotesProvTotal, setCreditNotesProvTotal] = useState(0);
  const [tableCreditNotesProv, setTableCreditNotesProv] = useState({
    title: IntlMessages('page.taxPurchaseReport.creditNotesProv.table.title'),
    columns: [
      { text: IntlMessages('table.column.date'), dataField: 'date', type: 'date', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.taxPurchaseReport.table.rtnProvider'), dataField: 'providerRtn', headerStyle: { width: '12%' } },
      { text: IntlMessages('table.column.provider'), dataField: 'providerName', headerStyle: { width: '20%' } },
      { text: IntlMessages('page.taxPurchaseReport.creditNotesProv.table.creditNoteCai'), dataField: 'creditNoteCai', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.taxPurchaseReport.creditNotesProv.table.creditNoteNumber'), dataField: 'creditNoteNumber', headerStyle: { width: '12%' } },
      { text: IntlMessages('page.taxPurchaseReport.creditNotesProv.table.invoiceNumber'), dataField: 'invoiceNumber', headerStyle: { width: '13%' } },
      { text: IntlMessages('page.taxPurchaseReport.creditNotesProv.table.invoiceDate'), dataField: 'invoiceDate', headerStyle: { width: '10%' }, cell: ({ row }) => (row.original.invoiceDate ? formatDate(row.original.invoiceDate) : '') },
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

  const getReport = (type, onOk, onFail) => {
    const { url, params } = buildReportRequest(type, { dateStart, dateEnd });
    request.GET(`${url}?${new URLSearchParams(params).toString()}`, (resp) => onOk(normalizeReport(resp.data)), (err) => {
      onFail();
      notifyError(err, 'page.taxPurchaseReport.msg.reportError');
    });
  };

  const fnSearchReport = () => {
    if (!check()) return;
    setLoading(true);
    getReport('purchases', (report) => {
      setAllData(report.rows);
      setTable((prev) => ({ ...prev, data: report.rows.filter((row) => matchesSearch(row, search)) }));
      setDataTotals(report.totals);
      getReport('creditNotes', (notes) => {
        setAllCreditNotesProvData(notes.rows);
        setTableCreditNotesProv((prev) => ({ ...prev, data: notes.rows.filter((row) => matchesSearch(row, search)) }));
        setCreditNotesProvTotal(notes.totals.total);
        setLoading(false);
      }, () => setLoading(false));
    }, () => setLoading(false));
  };

  const onSearchChange = (e) => {
    onInputChange(e);
    const value = e.target.value;
    setTable((prev) => ({ ...prev, data: allData.filter((row) => matchesSearch(row, value)) }));
    setTableCreditNotesProv((prev) => ({ ...prev, data: allCreditNotesProvData.filter((row) => matchesSearch(row, value)) }));
  };

  const fnDownload = (type, format) => {
    if (!check()) return;
    const { url, params } = buildReportRequest(type, { dateStart, dateEnd }, format);
    setLoading(true);
    request.GETPdf(url, params, reportFileName(type, format), (err) => {
      setLoading(false);
      notifyError(err, 'page.taxPurchaseReport.msg.reportError');
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
    fnPrint: () => fnDownload('purchases', 'pdf'),
    fnExportDeclaration: () => fnDownload('declarationBook', 'xlsx'),
    fnExportPurchaseBook: () => fnDownload('purchaseBook', 'xlsx'),
    fnExportImportBook: () => fnDownload('importBook', 'xlsx')
  };

  const propsToTotals = {
    total: formatNumber(dataTotals.total),
    exemptValue: formatNumber(dataTotals.exempt),
    taxedValue: formatNumber(dataTotals.taxed),
    tax: formatNumber(dataTotals.tax)
  };

  const propsToCreditNotesProv = {
    table: tableCreditNotesProv,
    total: formatNumber(creditNotesProvTotal),
    fnPrint: () => fnDownload('creditNotes', 'pdf')
  };

  return { table, propsToHeaderReport, propsToTotals, propsToCreditNotesProv };
};
