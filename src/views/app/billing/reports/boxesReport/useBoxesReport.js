import { formatDate, formatNumber, IntlMessages } from '@/helpers/Utils';
import { request } from '@/helpers/core';
import { useForm } from '@/hooks'
import { useEffect, useState } from 'react';

export const useBoxesReport = ({ setLoading }) => {
  const [listCashiers, setListCashiers] = useState([]);
  const [listPaymentMethods, setListPaymentMethods] = useState([]);
  const [listCashRegisters, setListCashRegisters] = useState([]);
  const [openModalSummary, setOpenModalSummary] = useState(false);

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    startDate: '',
    endDate: '',
    cashId: 0,
    cashierId: 0,
    paymentTypeId: 0
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
        dataField: "invoiceCode",
        headerStyle: { width: "20%" },
        classes: 'd-md-none-table-cell',
        headerClasses: 'd-md-none-table-cell'
      },
      {
        text: IntlMessages("table.column.customer"),
        dataField: "customerName",
        headerStyle: { width: "45%" }
      },
      {
        text: IntlMessages("table.column.methodPayment"),
        dataField: "paymentTypeName",
        headerStyle: { width: "15%" }
      },
      {
        text: IntlMessages("table.column.value"),
        dataField: "total",
        headerStyle: { 'width': '10%' },
        classes: 'd-sm-none-table-cell',
        headerClasses: 'd-sm-none-table-cell',
        style: { textAlign: 'right' },
        cell: ({ row }) => {
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
      }
    ]

    setLoading(true);
    request.POST('billing/reports/cash', { ...formState }, resp => {
      let { data } = resp;
      setTable({ ...table, data, actions: newActions });
      setLoading(false);
    }, err => {
      setLoading(false);
    }, false);
  };

  const fnViewSummary = () => {
    setOpenModalSummary(true);
  }

  useEffect(() => {
    setLoading(true);
    request.GET('admin/users/getSellers', (resp) => {
      const cashiers = resp.data.map((item) => {
        return {
          label: `${item.sellerCode} | ${item.name}`,
          value: item.sellerCode,
          code: item.sellerCode,
          isSeller: item.isSeller,
          name: item.name
        }
      });
      setListCashiers(cashiers);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('admin/paymentTypes/getSL', (resp) => {
      const paymentMethod = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListPaymentMethods(paymentMethod);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('billing/settings/cashRegisters', (resp) => {
      const cashRegisters = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setListCashRegisters(cashRegisters);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }, []);

  const propsToHeaderReport = {
    formState,
    onInputChange,
    listCashiers,
    listPaymentMethods,
    listCashRegisters,
    fnSearchReport,
    fnViewSummary
  }

  return (
    {
      table,
      propsToHeaderReport,
      openModalSummary,
      setOpenModalSummary
    }
  )
}