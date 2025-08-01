import React, { useEffect, useState } from 'react'
import { formatNumber, IntlMessages } from '@Helpers/Utils';
import { request } from '@Helpers/core';

export const useControlVacations = ({setLoading}) => {
  const [listEmployees, setListEmployees] = useState([]);

  const [table, setTable] = useState({
    title: IntlMessages("page.vacations.table.vacationsTaken.title"),
    columns: [
      {
        text: IntlMessages("select.employee"),
        dataField: "employee",
        headerStyle: { width: "36%" }
      },
      {
        text: IntlMessages("table.column.dateIn"),
        dataField: "dateIn",
        headerStyle: { width: "10%" },
      },
      {
        text: IntlMessages("table.column.daysGained"),
        dataField: "daysGained",
        headerStyle: { width: "9%" }
      },
      {
        text: IntlMessages("table.column.daysTakenPaid"),
        dataField: "daysTakenPaid",
        headerStyle: { width: "9%" }
      },
      {
        text: IntlMessages("table.column.daysTakenOff"),
        dataField: "daysTakenOff",
        headerStyle: { width: "9%" }
      },
      {
        text: IntlMessages("table.column.totalDays"),
        dataField: "daysTaken",
        headerStyle: { width: "9%" }
      },
      {
        text: IntlMessages("table.column.daysPending"),
        dataField: "daysPending",
        headerStyle: { width: "9%" }
      },
      {
        text: IntlMessages("table.column.payDaysPending"),
        dataField: "payDaysPending",
        headerStyle: { width: "9%" },
        style: { textAlign: 'right' },
        cell: ({row}) => {
          return (formatNumber(row.original.payDaysPending, '', 2));
        }
      },
    ],
    data: [],
    options: {
      enabledRowSelection: false,
      enabledActionButtons: false,
    },
    actions: []
  });

  const propsToHeader = {
    listEmployees,
    setLoading,
    table,
    setTable
  }

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

  return (
    {
      table,
      propsToHeader
    }
  )
}
