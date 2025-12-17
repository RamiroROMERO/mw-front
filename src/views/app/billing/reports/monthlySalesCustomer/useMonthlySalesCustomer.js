import React, { useEffect, useState } from 'react'
import { request } from '@/helpers/core';
import { formatNumber, IntlMessages } from '@/helpers/Utils';
import { useForm } from '@/hooks';

export const useMonthlySalesCustomer = ({ setLoading }) => {
  const [listCustomers, setListCustomers] = useState([]);
  const [totals, setTotals] = useState({ total: 0 });

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    customerId: 0,
    noYear: 0
  });

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("table.column.customer"),
        dataField: "customerName",
        headerStyle: { width: "9%" }
      },
      {
        text: IntlMessages("table.column.month1"),
        dataField: "month_1",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.month_1, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.month2"),
        dataField: "month_2",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.month_2, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.month3"),
        dataField: "month_3",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.month_3, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.month4"),
        dataField: "month_4",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.month_4, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.month5"),
        dataField: "month_5",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.month_5, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.month6"),
        dataField: "month_6",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.month_6, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.month7"),
        dataField: "month_7",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.month_7, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.month8"),
        dataField: "month_8",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.month_8, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.month9"),
        dataField: "month_9",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.month_9, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.month10"),
        dataField: "month_10",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.month_10, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.month11"),
        dataField: "month_11",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.month_11, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.month12"),
        dataField: "month_12",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.month_12, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.total"),
        dataField: "total",
        headerStyle: { 'width': '7%' },
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.total, '', 2));
        }
      }
    ],
    data: [],
    actions: []
  });

  const fnExportToExcel = () => { };

  const fnPrintReport = () => { };

  const fnSearchReport = () => {
    const newActions = [
      {
        color: "secondary",
        icon: "file-earmark-excel",
        onClick: fnExportToExcel,
        title: "Exportar",
        isFreeAction: true
      }
    ]

    setLoading(true);
    request.POST('billing/reports/customersMonthly', { ...formState }, resp => {
      let { detail, totals } = resp;
      setTable({ ...table, data: detail, actions: newActions });
      setTotals(totals);
      setLoading(false);
    }, err => {
      console.log(err);
      setLoading(false);
    }, false);
  };

  useEffect(() => {
    setLoading(true);
    request.GET('billing/settings/customers/?status=1', (resp) => {
      const customers = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.id} | ${item.rtn} | ${item.nomcli}`,
          value: item.id
        }
      });
      setListCustomers(customers);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const propsToHeaderReport = {
    formState,
    onInputChange,
    listCustomers,
    fnSearchReport
  }

  return (
    {
      totals,
      table,
      propsToHeaderReport
    }
  )
}
