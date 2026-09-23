import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request } from '@Helpers/core';

export const useSalesReport = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const [allData, setAllData] = useState([]);
  const [listDocuments, setListDocuments] = useState([]);
  const [dataTotals, setDataTotals] = useState({ total: 0, exemptValue: 0, exoneratedValue: 0, taxedValue: 0, tax: 0 });

  const { formState, onInputChange } = useForm({
    dateStart: DateHelper.format(DateHelper.startOf(DateHelper.now(), 'month')),
    dateEnd: DateHelper.format(DateHelper.endOf(DateHelper.now(), 'month')),
    cai: '',
    search: ''
  });

  const { dateStart, dateEnd, cai, search } = formState;

  const [table, setTable] = useState({
    title: IntlMessages("page.taxSalesReport.table.title"),
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", type: 'date', headerStyle: { width: '8%' } },
      { text: IntlMessages("page.taxSalesReport.table.rtnClient"), dataField: "rtnClient", headerStyle: { width: '10%' } },
      { text: IntlMessages("page.taxSalesReport.table.clientName"), dataField: "clientName", headerStyle: { width: '17%' } },
      { text: "CAI", dataField: "cai", headerStyle: { width: '15%' } },
      { text: IntlMessages("page.taxSalesReport.table.documentNumber"), dataField: "documentNumber", headerStyle: { width: '10%' } },
      { text: IntlMessages("table.column.subtotal"), dataField: "subtotal", type: 'number', headerStyle: { width: '6%' } },
      { text: IntlMessages("table.column.discount"), dataField: "discount", type: 'number', headerStyle: { width: '6%' } },
      { text: IntlMessages("page.taxSalesReport.table.exoneratedValue"), dataField: "exoneratedValue", type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages("page.taxPurchaseReport.table.exemptValue"), dataField: "exemptValue", type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages("page.taxPurchaseReport.table.taxedValue"), dataField: "taxedValue", type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages("table.column.tax"), dataField: "tax", type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages("table.column.total"), dataField: "total", type: 'number', headerStyle: { width: '7%' } }
    ],
    data: []
  });

  const fnCalcTotals = (data) => {
    const totals = data.reduce((acc, item) => {
      acc.total += Number(item.total || 0);
      acc.exemptValue += Number(item.exemptValue || 0);
      acc.exoneratedValue += Number(item.exoneratedValue || 0);
      acc.taxedValue += Number(item.taxedValue || 0);
      acc.tax += Number(item.tax || 0);
      return acc;
    }, { total: 0, exemptValue: 0, exoneratedValue: 0, taxedValue: 0, tax: 0 });
    setDataTotals(totals);
  }

  const fnSearchReport = () => {
    setLoading(true);
    request.POST('tax/reports/salesReport', { startDate: dateStart, endDate: dateEnd, cai }, (resp) => {
      const data = resp.data;
      setAllData(data);
      setTable((prev) => ({ ...prev, data }));
      fnCalcTotals(data);
      setLoading(false);
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
      return `${item.date || ''}${item.clientName || ''}${item.rtnClient || ''}${item.documentNumber || ''}`
        .toUpperCase()
        .includes(upperValue);
    });
    setTable((prev) => ({ ...prev, data: filtered }));
  }

  const onSearchChange = (e) => {
    onInputChange(e);
    fnFilterData(e.target.value);
  }

  const fnPrint = () => {
    setLoading(true);
    request.GETPdf('tax/reports/salesReport/exportPDF', { startDate: dateStart, endDate: dateEnd, cai }, 'ReporteVentasDeclaracion.pdf', () => {
      setLoading(false);
    });
    setLoading(false);
  }

  const fnExportDeclaration = () => {
    fnExport('tax/reports/salesReport/exportDeclarationXLSX', { startDate: dateStart, endDate: dateEnd, cai }, 'ReporteVentasDeclaracion.xlsx');
  }

  const fnExportSalesBook = () => {
    fnExport('tax/reports/salesReport/exportSalesBookXLSX', { startDate: dateStart, endDate: dateEnd, cai }, 'LibroDeVentas.xlsx');
  }

  useEffect(() => {
    request.GET('admin/taxDocuments', (resp) => {
      const documents = resp.data
        .filter((item) => item.status)
        .map((item) => {
          const cai = [item.cai1, item.cai2, item.cai3, item.cai4, item.cai5, item.cai6].join('-');
          return { label: `${item.name} -> ${cai}`, value: cai };
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
    listDocuments,
    onInputChange,
    onSearchChange,
    fnSearchReport,
    fnPrint,
    fnExportDeclaration,
    fnExportSalesBook
  }

  const propsToTotals = {
    total: formatNumber(dataTotals.total),
    exemptValue: formatNumber(dataTotals.exemptValue),
    exoneratedValue: formatNumber(dataTotals.exoneratedValue),
    taxedValue: formatNumber(dataTotals.taxedValue),
    tax: formatNumber(dataTotals.tax)
  }

  return {
    table,
    propsToHeaderReport,
    propsToTotals
  }
}
