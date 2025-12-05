import React, { useEffect, useState } from 'react'
import { request } from '@/helpers/core';
import { formatDate, formatNumber, IntlMessages } from '@/helpers/Utils';
import { useForm } from '@/hooks';

export const useSummaryByProduct = ({ setLoading }) => {
  const [totals, setTotals] = useState({ qty: 0, subtotal: 0, discount: 0, tax: 0, total: 0 });

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    startDate: '',
    endDate: ''
  });

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("table.column.productCode"),
        dataField: "productCode",
        headerStyle: { width: "25%" }
      },
      {
        text: IntlMessages("table.column.productName"),
        dataField: "productName",
        headerStyle: { width: "25%" },
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("table.column.qty"),
        dataField: "qty",
        headerStyle: { 'width': '10%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.qty, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.subtotal"),
        dataField: "subtotal",
        headerStyle: { 'width': '10%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.subtotal, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.discount"),
        dataField: "discount",
        headerStyle: { 'width': '10%' },
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.discount, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.tax"),
        dataField: "tax",
        headerStyle: { 'width': '10%' },
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.tax, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.total"),
        dataField: "total",
        headerStyle: { 'width': '10%' },
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
    request.POST('billing/reports/generalSales/resumeForProduct', { ...formState }, resp => {
      let { detail, totals } = resp;
      setTable({ ...table, data: detail, actions: newActions });
      setTotals(totals);
      setLoading(false);
    }, err => {
      console.log(err);
      setLoading(false);
    }, false);
  };

  const propsToHeaderReport = {
    formState,
    onInputChange,
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
