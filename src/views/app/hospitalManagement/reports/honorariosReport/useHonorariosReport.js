import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request } from '@Helpers/core';

export const useHonorariosReport = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const [allData, setAllData] = useState([]);
  const [total, setTotal] = useState(0);

  const { formState, onInputChange } = useForm({
    dateStart: DateHelper.format(DateHelper.startOf(DateHelper.now(), 'month')),
    dateEnd: DateHelper.format(DateHelper.endOf(DateHelper.now(), 'month')),
    search: ''
  });

  const { dateStart, dateEnd, search } = formState;

  const [table, setTable] = useState({
    title: IntlMessages("page.honorariosReport.table.title"),
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", type: 'date', headerStyle: { width: '10%' } },
      { text: IntlMessages("page.honorariosReport.table.documentNumber"), dataField: "documentNumber", headerStyle: { width: '13%' } },
      { text: IntlMessages("page.honorariosReport.table.patientName"), dataField: "patientName", headerStyle: { width: '20%' } },
      { text: IntlMessages("table.column.provider"), dataField: "providerName", headerStyle: { width: '20%' } },
      { text: IntlMessages("page.honorariosReport.table.productName"), dataField: "productName", headerStyle: { width: '20%' } },
      { text: IntlMessages("page.honorariosReport.table.qty"), dataField: "qty", type: 'number', headerStyle: { width: '5%' } },
      { text: IntlMessages("page.honorariosReport.table.price"), dataField: "price", type: 'number', headerStyle: { width: '6%' } },
      { text: IntlMessages("table.column.total"), dataField: "total", type: 'number', headerStyle: { width: '6%' } }
    ],
    data: []
  });

  const fnCalcTotal = (data) => {
    const sum = data.reduce((acc, item) => acc + Number(item.total || 0), 0);
    setTotal(sum);
  }

  const fnSearchReport = () => {
    setLoading(true);
    request.POST('hospital/reports/honorarios', { startDate: dateStart, endDate: dateEnd }, (resp) => {
      const data = resp.data;
      setAllData(data);
      setTable((prev) => ({ ...prev, data }));
      fnCalcTotal(data);
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
      return `${item.date || ''}${item.documentNumber || ''}${item.patientName || ''}${item.providerName || ''}${item.productName || ''}`
        .toUpperCase()
        .includes(upperValue);
    });
    setTable((prev) => ({ ...prev, data: filtered }));
  }

  const onSearchChange = (e) => {
    onInputChange(e);
    fnFilterData(e.target.value);
  }

  const fnExportExcel = () => {
    fnExport('hospital/reports/honorarios/exportXlsx', { startDate: dateStart, endDate: dateEnd }, 'ReporteHonorariosServiciosSubrogados.xlsx');
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
    fnExportExcel
  }

  const propsToTotals = {
    total: formatNumber(total)
  }

  return {
    table,
    propsToHeaderReport,
    propsToTotals
  }
}
