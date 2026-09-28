import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request } from '@Helpers/core';

export const usePurchaseReport = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const [allData, setAllData] = useState([]);
  const [dataTotals, setDataTotals] = useState({ total: 0, exemptValue: 0, taxedValue: 0, tax: 0 });

  const { formState, onInputChange } = useForm({
    dateStart: DateHelper.format(DateHelper.startOf(DateHelper.now(), 'month')),
    dateEnd: DateHelper.format(DateHelper.endOf(DateHelper.now(), 'month')),
    search: ''
  });

  const { dateStart, dateEnd, search } = formState;

  const [table, setTable] = useState({
    title: IntlMessages("page.taxPurchaseReport.table.title"),
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", type: 'date', headerStyle: { width: '8%' } },
      { text: IntlMessages("page.taxPurchaseReport.table.rtnProvider"), dataField: "rtnProvider", headerStyle: { width: '10%' } },
      { text: IntlMessages("table.column.provider"), dataField: "providerName", headerStyle: { width: '18%' } },
      { text: "CAI", dataField: "cai", headerStyle: { width: '15%' } },
      { text: IntlMessages("page.taxPurchaseReport.table.documentNumber"), dataField: "documentNumber", headerStyle: { width: '11%' } },
      { text: IntlMessages("table.column.subtotal"), dataField: "subtotal", type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages("table.column.discount"), dataField: "discount", type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages("page.taxPurchaseReport.table.exonerated"), dataField: "exonerated", type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages("page.taxPurchaseReport.table.exemptValue"), dataField: "exemptValue", type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages("page.taxPurchaseReport.table.taxedValue"), dataField: "taxedValue", type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages("table.column.tax"), dataField: "tax", type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages("table.column.total"), dataField: "total", type: 'number', headerStyle: { width: '7%' } }
    ],
    data: []
  });

  const [allCreditNotesProvData, setAllCreditNotesProvData] = useState([]);
  const [creditNotesProvTotal, setCreditNotesProvTotal] = useState(0);
  const [tableCreditNotesProv, setTableCreditNotesProv] = useState({
    title: IntlMessages("page.taxPurchaseReport.creditNotesProv.table.title"),
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", type: 'date', headerStyle: { width: '10%' } },
      { text: IntlMessages("page.taxPurchaseReport.table.rtnProvider"), dataField: "rtnProvider", headerStyle: { width: '12%' } },
      { text: IntlMessages("table.column.provider"), dataField: "providerName", headerStyle: { width: '20%' } },
      { text: IntlMessages("page.taxPurchaseReport.creditNotesProv.table.creditNoteCai"), dataField: "creditNoteCai", headerStyle: { width: '15%' } },
      { text: IntlMessages("page.taxPurchaseReport.creditNotesProv.table.creditNoteNumber"), dataField: "creditNoteNumber", headerStyle: { width: '12%' } },
      { text: IntlMessages("page.taxPurchaseReport.creditNotesProv.table.invoiceNumber"), dataField: "invoiceNumber", headerStyle: { width: '13%' } },
      { text: IntlMessages("page.taxPurchaseReport.creditNotesProv.table.invoiceDate"), dataField: "invoiceDate", type: 'date', headerStyle: { width: '10%' } },
      { text: IntlMessages("table.column.total"), dataField: "total", type: 'number', headerStyle: { width: '8%' } }
    ],
    data: []
  });

  const fnCalcTotals = (data) => {
    const totals = data.reduce((acc, item) => {
      acc.total += Number(item.total || 0);
      acc.exemptValue += Number(item.exemptValue || 0);
      acc.taxedValue += Number(item.taxedValue || 0);
      acc.tax += Number(item.tax || 0);
      return acc;
    }, { total: 0, exemptValue: 0, taxedValue: 0, tax: 0 });
    setDataTotals(totals);
  }

  const fnCalcCreditNotesProvTotal = (data) => {
    const total = data.reduce((acc, item) => acc + Number(item.total || 0), 0);
    setCreditNotesProvTotal(total);
  }

  const fnSearchCreditNotesProv = (onFinish) => {
    request.POST('tax/reports/purchaseReport/creditNotesProv', { startDate: dateStart, endDate: dateEnd }, (resp) => {
      const data = resp.data;
      setAllCreditNotesProvData(data);
      setTableCreditNotesProv((prev) => ({ ...prev, data }));
      fnCalcCreditNotesProvTotal(data);
      onFinish();
    }, onFinish);
  }

  const fnSearchReport = () => {
    setLoading(true);
    request.POST('tax/reports/purchaseReport', { startDate: dateStart, endDate: dateEnd }, (resp) => {
      const data = resp.data;
      setAllData(data);
      setTable((prev) => ({ ...prev, data }));
      fnCalcTotals(data);
      fnSearchCreditNotesProv(() => setLoading(false));
    }, () => {
      setLoading(false);
    });
  }

  const fnFilterData = (value) => {
    if (!value) {
      setTable((prev) => ({ ...prev, data: allData }));
      return;
    }
    const upperValue = value.toUpperCase();
    const filtered = allData.filter((item) => {
      return `${item.date || ''}${item.providerName || ''}${item.rtnProvider || ''}${item.documentNumber || ''}`
        .toUpperCase()
        .includes(upperValue);
    });
    setTable((prev) => ({ ...prev, data: filtered }));
  }

  const fnFilterCreditNotesProvData = (value) => {
    if (!value) {
      setTableCreditNotesProv((prev) => ({ ...prev, data: allCreditNotesProvData }));
      return;
    }
    const upperValue = value.toUpperCase();
    const filtered = allCreditNotesProvData.filter((item) => {
      return `${item.date || ''}${item.providerName || ''}${item.rtnProvider || ''}${item.creditNoteNumber || ''}`
        .toUpperCase()
        .includes(upperValue);
    });
    setTableCreditNotesProv((prev) => ({ ...prev, data: filtered }));
  }

  const onSearchChange = (e) => {
    onInputChange(e);
    fnFilterData(e.target.value);
    fnFilterCreditNotesProvData(e.target.value);
  }

  const fnPrint = () => {
    setLoading(true);
    request.GETPdf('tax/reports/purchaseReport/exportPDF', { startDate: dateStart, endDate: dateEnd }, 'ReporteComprasDeclaracion.pdf', () => {
      setLoading(false);
    });
    setLoading(false);
  }

  const fnExportDeclaration = () => {
    fnExport('tax/reports/purchaseReport/exportDeclarationXLSX', { startDate: dateStart, endDate: dateEnd }, 'ReporteComprasDeclaracion.xlsx');
  }

  const fnExportPurchaseBook = () => {
    fnExport('tax/reports/purchaseReport/exportPurchaseBookXLSX', { startDate: dateStart, endDate: dateEnd }, 'LibroDeCompras.xlsx');
  }

  const fnExportImportBook = () => {
    fnExport('tax/reports/purchaseReport/exportImportBookXLSX', { startDate: dateStart, endDate: dateEnd }, 'RegistroDeImportaciones.xlsx');
  }

  const fnPrintCreditNotesProv = () => {
    setLoading(true);
    request.GETPdf('tax/reports/purchaseReport/creditNotesProv/exportPDF', { startDate: dateStart, endDate: dateEnd }, 'ReporteNCProveedores.pdf', () => {
      setLoading(false);
    });
    setLoading(false);
  }

  useEffect(() => {
    fnSearchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const propsToHeaderReport = {
    dateStart,
    dateEnd,
    search,
    onInputChange,
    onSearchChange,
    fnSearchReport,
    fnPrint,
    fnExportDeclaration,
    fnExportPurchaseBook,
    fnExportImportBook
  }

  const propsToTotals = {
    total: formatNumber(dataTotals.total),
    exemptValue: formatNumber(dataTotals.exemptValue),
    taxedValue: formatNumber(dataTotals.taxedValue),
    tax: formatNumber(dataTotals.tax)
  }

  const propsToCreditNotesProv = {
    table: tableCreditNotesProv,
    total: formatNumber(creditNotesProvTotal),
    fnPrint: fnPrintCreditNotesProv
  }

  return {
    table,
    propsToHeaderReport,
    propsToTotals,
    propsToCreditNotesProv
  }
}
