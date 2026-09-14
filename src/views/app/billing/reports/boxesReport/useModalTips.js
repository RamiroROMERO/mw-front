import { useState } from 'react'
import { request } from '@Helpers/core';
import { formatDate, formatNumber, IntlMessages } from '@Helpers/Utils';

export const useModalTips = ({ setLoading, startDate, endDate }) => {

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { width: "10%" },
        cell: ({ row }) => formatDate(row.original.date)
      },
      { text: IntlMessages("table.column.customer"), dataField: "customerName", headerStyle: { width: "25%" } },
      { text: IntlMessages("table.column.noInvoice"), dataField: "numberCAI", headerStyle: { width: "20%" } },
      { text: IntlMessages("page.boxesReport.table.tipName"), dataField: "tipName", headerStyle: { width: "20%" } },
      {
        text: IntlMessages("table.column.total"), dataField: "total", headerStyle: { width: "10%" }, style: { textAlign: 'right' },
        cell: ({ row }) => formatNumber(row.original.total, '', 2)
      },
      {
        text: IntlMessages("page.boxesReport.table.tipValue"), dataField: "tipValue", headerStyle: { width: "15%" }, style: { textAlign: 'right' },
        cell: ({ row }) => formatNumber(row.original.tipValue, '', 2)
      }
    ],
    data: [],
    actions: []
  });

  const fnViewReport = () => {
    setLoading(true);
    request.POST('billing/reports/cash/resume/tips', { startDate, endDate }, (resp) => {
      setTable((current) => ({ ...current, data: resp.data }));
      setLoading(false);
    }, () => { setLoading(false); }, false);
  }

  return { table, fnViewReport }
}
