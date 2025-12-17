import React, { useEffect, useState } from 'react'
import { request } from '@/helpers/core';
import { formatDate, formatNumber, IntlMessages } from '@/helpers/Utils';
import { useForm } from '@/hooks';

export const useGeneralInvoice = ({ setLoading }) => {
  const [listCustomers, setListCustomers] = useState([]);
  const [totals, setTotals] = useState({ qty: 0, subtotal: 0, discount: 0, tax: 0, total: 0 });

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    customerId: 0,
    startDate: '',
    endDate: ''
  });

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: { width: "10%" },
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell',
        cell: ({ row }) => {
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("table.column.customer"),
        dataField: "customerName",
        headerStyle: { width: "10%" }
      },
      {
        text: IntlMessages("table.column.noInvoice"),
        dataField: "invoiceCode",
        headerStyle: { width: "10%" },
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("table.column.taxed"),
        dataField: "taxedValue",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.taxedValue, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.exempt"),
        dataField: "exemptValue",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.exemptValue, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.exonerated"),
        dataField: "exoneratedValue",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.exoneratedValue, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.discount"),
        dataField: "discount",
        headerStyle: { 'width': '7%' },
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.discount, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.tax"),
        dataField: "taxValue",
        headerStyle: { 'width': '7%' },
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.taxValue, '', 2));
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
    request.POST('billing/reports/allSales', { ...formState }, resp => {
      let { detail, totals } = resp;
      setTable({ ...table, data: detail, actions: newActions });
      totals.tax = totals.taxValue;
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
