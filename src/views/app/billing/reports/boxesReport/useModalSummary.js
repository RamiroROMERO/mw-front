import React, { useState } from 'react'
import notification from '@Containers/ui/Notifications';
import { request } from '@/helpers/core';
import { useForm } from '@/hooks';
import { formatNumber, IntlMessages } from '@/helpers/Utils';

export const useModalSummary = ({ setLoading }) => {

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    cashId: false,
    cashierId: false,
    paymentTypeId: false
  });

  const { cashId, cashierId, paymentTypeId } = formState;

  const [table, setTable] = useState({
    title: '',
    columns: [
      {
        text: IntlMessages("table.column.cashName"),
        dataField: "cashName",
        headerStyle: { width: "20%" }
      },
      {
        text: IntlMessages("table.column.cashierName"),
        dataField: "cashierName",
        headerStyle: { width: "25%" }
      },
      {
        text: IntlMessages("table.column.methodPayment"),
        dataField: "paymentTypeName",
        headerStyle: { width: "45%" }
      },
      {
        text: IntlMessages("table.column.total"),
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
    actions: [],
    hideShowColumns: []
  });

  const fnExportToExcel = () => { }

  const fnViewReport = () => {
    const newActions = [
      {
        color: "secondary",
        icon: "file-earmark-excel",
        onClick: fnExportToExcel,
        title: "Exportar",
        isFreeAction: true
      }
    ]

    let hideShowColumns = {};
    let url = "";
    if (cashId === true && cashierId === false && paymentTypeId === false) {
      url = "billing/reports/cash/resume/cash";
      hideShowColumns = { cashName: true, cashierName: false, paymentTypeName: false };
    } else if (cashId === true && cashierId === true && paymentTypeId === false) {
      url = "billing/reports/cash/resume/cashCashier";
      hideShowColumns = { cashName: true, cashierName: true, paymentTypeName: false };
    } else if (cashId === true && cashierId === true && paymentTypeId === true) {
      url = "billing/reports/cash/resume/cashCashierPaymentType";
      hideShowColumns = { cashName: true, cashierName: true, paymentTypeName: true };
    } else if (cashId === true && cashierId === false && paymentTypeId === true) {
      url = "billing/reports/cash/resume/cashPaymentType";
      hideShowColumns = { cashName: true, cashierName: false, paymentTypeName: true };
    } else if (cashId === false && cashierId === true && paymentTypeId === false) {
      url = "billing/reports/cash/resume/cashier";
      hideShowColumns = { cashName: false, cashierName: true, paymentTypeName: false };
    } else if (cashId === false && cashierId === true && paymentTypeId === true) {
      url = "billing/reports/cash/resume/cashierPaymentType";
      hideShowColumns = { cashName: false, cashierName: true, paymentTypeName: true };
    } else if (cashId === false && cashierId === false && paymentTypeId === true) {
      url = "billing/reports/cash/resume/paymentType";
      hideShowColumns = { cashName: false, cashierName: false, paymentTypeName: true };
    } else {
      notification('warning', 'msg.select', 'alert.warning.title');
      return;
    }

    setLoading(true);
    request.POST(url, { ...formState }, resp => {
      let { data } = resp;
      setTable({ ...table, data, actions: newActions, hideShowColumns });
      setLoading(false);
    }, err => {
      setLoading(false);
    }, false);
  }

  return (
    {
      table,
      formState,
      onInputChange,
      fnViewReport
    }
  )
}
