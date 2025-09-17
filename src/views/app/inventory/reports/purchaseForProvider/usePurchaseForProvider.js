import { request } from '@/helpers/core';
import { formatDate, formatNumber } from '@/helpers/Utils';
import { useForm } from '@/hooks'
import { useEffect, useState } from 'react';
import { IntlMessages } from '@/helpers/Utils'

export const usePurchaseForProvider = ({ setLoading, urlPost }) => {
  const [listProviders, setListProviders] = useState([]);
  const [dataTotals, setDataTotals] = useState({
    subtotal:	0,
    exoneratedValue: 0,
    exemptValue: 0,
    taxedValue: 0,
    discount: 0,
    tax: 0,
    fleteValue: 0,
    otherChargesValue: 0,
    total:	0
  });

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    providerId: 0,
    dateStart: '',
    dateEnd: ''
  });

  const {providerId, dateStart, dateEnd} = formState;

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "10%"},
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell',
        cell: ({row}) => {
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("table.column.documentId"),
        dataField: "numcai",
        headerStyle: {width: "10%"}
      },
      {
        text: IntlMessages("table.column.store"),
        dataField: "storeName",
        headerStyle: {width: "10%"},
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("table.column.subtotal"),
        dataField: "subtotal",
        headerStyle:{'width' : '10%'},
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({row}) => {
          return (formatNumber(row.original.subtotal, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.tax"),
        dataField: "taxValue",
        headerStyle:{'width' : '10%'},
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({row}) => {
          return (formatNumber(row.original.taxValue, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.discount"),
        dataField: "discountValue",
        headerStyle:{'width' : '10%'},
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({row}) => {
          return (formatNumber(row.original.discountValue, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.total"),
        dataField: "total",
        headerStyle:{'width' : '10%'},
        style: { textAlign: 'right' },
        cell: ({row}) => {
          return (formatNumber(row.original.total, '', 2));
        }
      }
    ],
    data: [],
    actions: []
  });

  const fnExportToExcel = () => { }

  const fnPrintReport = () => { }

  const fnSearchReport = () => {

    const newActions = [
      {
        color: "secondary",
        icon: "file-earmark-excel",
        onClick: fnExportToExcel,
        title: "Exportar",
        isFreeAction: true
      },
      {
        color: "info",
        icon: "printer",
        onClick: fnPrintReport,
        title: "Imprimir",
        isFreeAction: true
      },
    ]

    const params = {
      providerId,
      startDate: dateStart,
      endDate: dateEnd
    }

    setLoading(true);
    request.POST(urlPost, params, (resp) => {
      const {detail, totals} = resp;
      setTable({ ...table, data: detail, actions: newActions });
      totals.discount = totals.discountValue;
      totals.tax = totals.taxValue;
      setDataTotals(totals);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    }, false);
  }

  useEffect(() => {
    setLoading(true);
    request.GET(`inventory/process/providers`, (resp) => {
      const providers = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListProviders(providers);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const propsToHeaderReport = {
    ...formState,
    listProviders,
    onInputChange,
    fnSearchReport
  }

  return (
    {
      table,
      dataTotals,
      propsToHeaderReport
    }
  )
}
