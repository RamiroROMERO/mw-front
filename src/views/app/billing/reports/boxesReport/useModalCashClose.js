import { useState } from 'react'
import { request } from '@Helpers/core';
import { formatDate, formatNumber, IntlMessages } from '@Helpers/Utils';

export const useModalCashClose = ({ setLoading, startDate, endDate }) => {

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("table.column.date"), dataField: "date", headerStyle: { width: "10%" },
        cell: ({ row }) => formatDate(row.original.date)
      },
      { text: IntlMessages("page.boxesReport.select.cashierId"), dataField: "cashierName", headerStyle: { width: "15%" } },
      { text: IntlMessages("select.cashId"), dataField: "cashName", headerStyle: { width: "15%" } },
      { text: IntlMessages("select.paymentMethod"), dataField: "paymentTypeName", headerStyle: { width: "20%" } },
      {
        text: IntlMessages("page.boxesReport.table.paymentTypeTotal"), dataField: "paymentTypeTotal", headerStyle: { width: "10%" }, style: { textAlign: 'right' },
        cell: ({ row }) => formatNumber(row.original.paymentTypeTotal, '', 2)
      },
      {
        text: IntlMessages("page.boxesReport.table.expenseValue"), dataField: "expenseValue", headerStyle: { width: "10%" }, style: { textAlign: 'right' },
        cell: ({ row }) => formatNumber(row.original.expenseValue, '', 2)
      },
      {
        text: IntlMessages("table.column.total"), dataField: "total", headerStyle: { width: "10%" }, style: { textAlign: 'right' },
        cell: ({ row }) => formatNumber(row.original.total, '', 2)
      },
      {
        text: IntlMessages("page.boxesReport.table.totalInvoiced"), dataField: "totalInvoiced", headerStyle: { width: "10%" }, style: { textAlign: 'right' },
        cell: ({ row }) => formatNumber(row.original.totalInvoiced, '', 2)
      }
    ],
    data: [],
    actions: []
  });

  const fnViewReport = () => {
    setLoading(true);
    request.POST('billing/reports/cash/resume/cashClose', { startDate, endDate }, (resp) => {
      setTable((current) => ({ ...current, data: resp.data }));
      setLoading(false);
    }, () => { setLoading(false); }, false);
  }

  return { table, fnViewReport }
}
