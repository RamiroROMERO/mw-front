import React, { useEffect, useState } from 'react'
import { formatDate, formatNumber, IntlMessages } from '@Helpers/Utils';
import { request } from '@Helpers/core';

export const useSalaries = ({setLoading, adminControl}) => {
  const [listEmployees, setListEmployees] = useState([]);
  const enableGenerateReport = adminControl.find(ctrl => ctrl.code === "07.03.003")?.active || false;

  const [table, setTable] = useState({
    title: IntlMessages("menu.salaries"),
    columns: [
      {
        text: IntlMessages("table.column.no"),
        dataField: "num",
        headerStyle: { width: "5%" }
      },
      {
        text: IntlMessages("select.employee"),
        dataField: "employee",
        headerStyle: { width: "35%" }
      },
      {
        text: IntlMessages("table.column.dni"),
        dataField: "dni",
        headerStyle: { width: "15%" },
      },
      {
        text: IntlMessages("table.column.dateIn"),
        dataField: "dateIn",
        headerStyle: { width: "15%" },
        cell:({row})=>{
          return (formatDate(row.original.dateIn));
        }
      },
      {
        text: IntlMessages("table.column.salary"),
        dataField: "defaultSalary",
        headerStyle: { width: "15%" },
        style:{textAlign: 'right'},
        cell:({row})=>{
          return (formatNumber(row.original.defaultSalary,'', 2));
        }
      },
      {
        text: IntlMessages("table.column.bankAccount"),
        dataField: "accountNumber",
        headerStyle: { width: "15%" }
      },
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
    request.GET('rrhh/process/employees/findSL', (resp) => {
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
  },[])

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
