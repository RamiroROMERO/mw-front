import { formatDate, IntlMessages } from '@/helpers/Utils';
import React, { useState } from 'react'

export const useNewStaff = ({setLoading, adminControl}) => {
  const enableGenerateReport = adminControl.find(ctrl => ctrl.code === "07.03.011")?.active || false;

  const [table, setTable] = useState({
    title: IntlMessages("page.reports.table.newStaff.title"),
    columns: [
      {
        text: IntlMessages("table.column.no"),
        dataField: "num",
        headerStyle: { width: "10%" }
      },
      {
        text: IntlMessages("select.employee"),
        dataField: "employee",
        headerStyle: { width: "25%" }
      },
      {
        text: IntlMessages("select.project"),
        dataField: "projectName",
        headerStyle: { width: "20%" }
      },
      {
        text: IntlMessages("table.column.dateIn"),
        dataField: "dateIn",
        headerStyle: {width: "15%"},
        cell:({row})=>{
          return (formatDate(row.original.dateIn));
        }
      },
      {
        text: IntlMessages("page.employees.modal.viewHistory.table.comment"),
        dataField: "reason",
        headerStyle: {width: "30%"}
      }
    ],
    data: [],
    options: {
      enabledRowSelection: false,
      enabledActionButtons: false,
    },
    actions: []
  });

  const propsToHeader = {
    setLoading,
    table,
    enableGenerateReport,
    setTable
  }

  return (
    {
      propsToHeader,
      table
    }
  )
}
