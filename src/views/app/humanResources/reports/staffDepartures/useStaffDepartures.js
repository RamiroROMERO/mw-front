import { useState } from 'react';
import { formatDate, IntlMessages } from '@Helpers/Utils';

export const useStaffDepartures = ({setLoading}) => {

  const [table, setTable] = useState({
    title: IntlMessages("page.reports.table.staffDepartures.title"),
    columns: [
      {
        text: IntlMessages("select.employee"),
        dataField: "employee",
        headerStyle: { width: "30%" }
      },
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: {width: "15%"},
        cell:({row})=>{
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("page.employees.modal.viewHistory.table.comment"),
        dataField: "reason",
        headerStyle: {width: "30%"}
      },
      {
        text: IntlMessages("page.employees.modal.viewHistory.table.column.status"),
        dataField: "statusName",
        headerStyle: {width: "10%"}
      },
      {
        text: IntlMessages("page.employees.modal.viewHistory.table.column.isHireable"),
        dataField: "hireable",
        headerStyle: {width: "15%"}
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
    setTable
  }

  return (
    {
      propsToHeader,
      table
    }
  )
}
