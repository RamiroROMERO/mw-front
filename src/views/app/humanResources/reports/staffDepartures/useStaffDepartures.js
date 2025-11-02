import { useState } from 'react';
import { formatDate, IntlMessages } from '@Helpers/Utils';

export const useStaffDepartures = ({setLoading, adminControl}) => {
  const enableGenerateReport = adminControl.find(ctrl => ctrl.code === "07.03.008")?.active || false;

  const [table, setTable] = useState({
    title: IntlMessages("page.reports.table.staffDepartures.title"),
    columns: [
      {
        text: IntlMessages("table.column.no"),
        dataField: "num",
        headerStyle: { width: "10%" }
      },
      {
        text: IntlMessages("select.employee"),
        dataField: "employee",
        headerStyle: { width: "30%" }
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
        text: IntlMessages("table.column.dateOut"),
        dataField: "date",
        headerStyle: {width: "15%"},
        cell:({row})=>{
          return (formatDate(row.original.date));
        }
      },
      {
        text: IntlMessages("page.employees.modal.viewHistory.table.comment"),
        dataField: "reason",
        headerStyle: {width: "20%"}
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
