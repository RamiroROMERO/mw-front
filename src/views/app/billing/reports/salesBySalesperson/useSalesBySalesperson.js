import { formatDate } from '@/helpers/Utils';
import { request } from '@Helpers/core';
import { useForm } from '@/hooks'
import { formatNumber, IntlMessages } from '@Helpers/Utils';
import { useEffect, useState } from 'react'

export const useSalesBySalesperson = ({ setLoading }) => {
  const [listSellers, setlistSellers] = useState([]);
  const [dataSummary, setDataSummary] = useState([]);
  const [dataNewCustomers, setDataNewCustomers] = useState([]);
  const [openModalViewSummary, setOpenModalViewSummary] = useState(false);
  const [openModalNewCustomers, setOpenModalNewCustomers] = useState(false);

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    sellerCode: '',
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
        text: IntlMessages("table.column.noInvoice"),
        dataField: "numcai",
        headerStyle: { width: "10%" },
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("page.purchaseReport.table.column.description"),
        dataField: "productName",
        headerStyle: { width: "10%" }
      },
      {
        text: IntlMessages("table.column.qty"),
        dataField: "qty",
        headerStyle: { 'width': '7%' },
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.qty, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.price"),
        dataField: "price",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.price, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.subtotal"),
        dataField: "subtotal",
        headerStyle: { 'width': '7%' },
        classes: 'd-xs-none-table-cell',
        headerClasses: 'd-xs-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.subtotal, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.commissionPercent"),
        dataField: "commissionPercent",
        headerStyle: { 'width': '7%' },
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.commissionPercent, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.commissionValue"),
        dataField: "commissionValue",
        headerStyle: { 'width': '7%' },
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
          return (formatNumber(row.original.commissionValue, '', 2));
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
    request.POST('billing/reports/sellers/details', { ...formState }, resp => {
      let { data } = resp;
      setTable({ ...table, data, actions: newActions });
      setLoading(false);
    }, err => {
      setLoading(false);
    }, false);
  };

  const fnViewSummary = () => {
    setLoading(true);
    request.POST('billing/reports/sellers/resume', { ...formState }, resp => {
      let { data } = resp;
      setDataSummary(data);
      setOpenModalViewSummary(true);
      setLoading(false);
    }, err => {
      setLoading(false);
    }, false);
  }

  const fnViewNewCustomers = () => {
    setLoading(true);
    request.POST('billing/reports/sellers/newCustomers', { ...formState }, resp => {
      let { data } = resp;
      setDataNewCustomers(data);
      setOpenModalNewCustomers(true);
      setLoading(false);
    }, err => {
      setLoading(false);
    }, false);
  }

  useEffect(() => {
    setLoading(true);
    request.GET('admin/users/getSellers', (resp) => {
      const sellers = resp.data.map((item) => {
        return {
          label: `${item.sellerCode} | ${item.name}`,
          value: item.sellerCode,
          code: item.sellerCode,
          isSeller: item.isSeller,
          name: item.name
        }
      });
      setlistSellers(sellers);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }, []);

  const propsToHeaderReport = {
    formState,
    onInputChange,
    listSellers,
    fnSearchReport,
    fnViewSummary,
    fnViewNewCustomers
  }

  return (
    {
      table,
      dataSummary,
      dataNewCustomers,
      openModalViewSummary,
      openModalNewCustomers,
      setOpenModalViewSummary,
      setOpenModalNewCustomers,
      propsToHeaderReport
    }
  )
}
