import { request } from '@/helpers/core';
import { formatNumber, IntlMessages } from '@/helpers/Utils';
import { useEffect, useState } from 'react'

export const usePaymentsHistory = ({setLoading, adminControl}) => {
  const [listEmployees, setListEmployees] = useState([]);
  const enableGenerateReport = adminControl.find(ctrl => ctrl.code === "07.03.013")?.active || false;

  const [table, setTable] = useState({
    title: IntlMessages("page.resumePayroll.table.title"),
    columns: [
      {
        text: IntlMessages("table.column.no"),
        dataField: "num",
        headerStyle: { width: "5%" }
      },
      {
        text: IntlMessages("table.column.employee"),
        dataField: "employee",
        headerStyle: {width: "25%"}
      },
      {
        text: IntlMessages("table.column.dateIn"),
        dataField: "dateIn",
        headerStyle: { width: "10%" }
      },
      {
        text: IntlMessages("page.resumePayroll.table.jobPosition"),
        dataField: "jobPosition",
        headerStyle: {width: "15%"}
      },
      {
        text: IntlMessages("page.resumePayroll.table.totalIncome"),
        dataField: "totalIncomes",
        headerStyle: {width: "15%"},
        style:{textAlign: 'right'},
        cell: ({row}) => {
          return (formatNumber(row.original.totalIncomes, '', 2));
        }
      },
      {
        text: IntlMessages("page.resumePayroll.table.totalDeductions"),
        dataField: "totalDeductions",
        headerStyle: {width: "15%"},
        style:{textAlign: 'right'},
        cell: ({row}) => {
          return (formatNumber(row.original.totalDeductions, '', 2));
        }
      },
      {
        text: IntlMessages("table.column.totalPay"),
        dataField: "totalPayment",
        headerStyle: {width: "15%"},
        style:{textAlign: 'right'},
        cell: ({row}) => {
          return (formatNumber(row.original.totalPayment, '', 2));
        }
      }
    ],
    data: [],
    options: {
      enabledRowSelection: false,
      enabledActionButtons: false,
    },
    actions: []
  });

  useEffect(()=>{
    setLoading(true);
    request.GET('rrhh/process/employees/findSL?status=1', (resp) => {
      const employees = resp.data.map((item) => {
        return {
          value: item.id,
          label: `${item.firstName} ${item.secondName} ${item.lastName} ${item.secondLastName}`
        }
      });
      setListEmployees(employees);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  },[]);

  const propsToHeader = {
    listEmployees,
    setLoading,
    table,
    enableGenerateReport,
    setTable
  }

  return (
    {
      table,
      propsToHeader
    }
  )
}
