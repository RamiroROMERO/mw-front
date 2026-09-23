import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request } from '@Helpers/core';

export const useRetentionReport = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const [allData, setAllData] = useState([]);
  const [dataTotals, setDataTotals] = useState({ total: 0 });

  const { formState, onInputChange } = useForm({
    dateStart: DateHelper.format(DateHelper.startOf(DateHelper.now(), 'month')),
    dateEnd: DateHelper.format(DateHelper.endOf(DateHelper.now(), 'month')),
    search: ''
  });

  const { dateStart, dateEnd, search } = formState;

  const [table, setTable] = useState({
    title: IntlMessages("page.taxRetentionReport.table.title"),
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", type: 'date', headerStyle: { width: '7%' } },
      { text: IntlMessages("page.taxPurchaseReport.table.rtnProvider"), dataField: "rtnProvider", headerStyle: { width: '9%' } },
      { text: IntlMessages("table.column.provider"), dataField: "providerName", headerStyle: { width: '15%' } },
      { text: "CAI", dataField: "caiRetention", headerStyle: { width: '13%' } },
      { text: IntlMessages("page.taxPurchaseReport.table.documentNumber"), dataField: "numberRetention", headerStyle: { width: '10%' } },
      { text: IntlMessages("page.taxRetentionReport.table.caiPurchase"), dataField: "caiPurchase", headerStyle: { width: '13%' } },
      { text: IntlMessages("page.taxRetentionReport.table.numberPurchase"), dataField: "numberPurchase", headerStyle: { width: '10%' } },
      { text: IntlMessages("page.taxRetentionReport.table.datePurchase"), dataField: "datePurchase", type: 'date', headerStyle: { width: '7%' } },
      { text: IntlMessages("page.taxRetentionReport.table.taxBase"), dataField: "taxBase", type: 'number', headerStyle: { width: '8%' } },
      { text: IntlMessages("page.taxRetentionReport.table.taxName"), dataField: "taxName", headerStyle: { width: '15%' } },
      { text: IntlMessages("page.taxRetentionReport.table.rate"), dataField: "rate", type: 'number', headerStyle: { width: '6%' } },
      { text: IntlMessages("table.column.total"), dataField: "total", type: 'number', headerStyle: { width: '8%' } }
    ],
    data: []
  });

  const fnCalcTotals = (data) => {
    const total = data.reduce((acc, item) => acc + Number(item.total || 0), 0);
    setDataTotals({ total });
  }

  const fnSearchReport = () => {
    setLoading(true);
    request.POST('tax/reports/retentionReport', { startDate: dateStart, endDate: dateEnd }, (resp) => {
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
      return `${item.date || ''}${item.providerName || ''}${item.rtnProvider || ''}${item.numberRetention || ''}`
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
    request.GETPdf('tax/reports/retentionReport/exportPDF', { startDate: dateStart, endDate: dateEnd }, 'ReporteRetencionesDeclaracion.pdf', () => {
      setLoading(false);
    });
    setLoading(false);
  }

  const fnExportDeclaration = () => {
    fnExport('tax/reports/retentionReport/exportDeclarationXLSX', { startDate: dateStart, endDate: dateEnd }, 'ReporteRetencionesDeclaracion.xlsx');
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
    fnExportDeclaration
  }

  const propsToTotals = {
    total: formatNumber(dataTotals.total)
  }

  return {
    table,
    propsToHeaderReport,
    propsToTotals
  }
}
