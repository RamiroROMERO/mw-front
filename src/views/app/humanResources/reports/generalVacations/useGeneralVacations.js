import { useEffect, useState } from 'react'
import { request } from '@/helpers/core';
import { IntlMessages } from '@Helpers/Utils';

export const useGeneralVacations = ({ setLoading, adminControl }) => {
  const [listEmployees, setListEmployees] = useState([]);
  const enableGenerateReport = adminControl.find(ctrl => ctrl.code === "07.03.012")?.active || false;

  const [table, setTable] = useState({
    title: IntlMessages("page.reports.table.generalVacacions.title"),
    columns: [
      {
        text: IntlMessages("table.column.no"),
        dataField: "num",
        headerStyle: { width: "10%" }
      },
      {
        text: IntlMessages("select.employee"),
        dataField: "employee",
        headerStyle: { width: "35%" }
      },
      {
        text: IntlMessages("select.project"),
        dataField: "projectName",
        headerStyle: { width: "15%" }
      },
      {
        text: IntlMessages("table.column.dateIn"),
        dataField: "dateIn",
        headerStyle: { width: "10%" },
      },
      {
        text: IntlMessages("table.column.year"),
        dataField: "year",
        headerStyle: { width: "10%" }
      },
      {
        text: IntlMessages("table.column.month"),
        dataField: "monthLetter",
        headerStyle: { width: "10%" }
      },
      {
        text: IntlMessages("table.column.totalDays"),
        dataField: "daysVacations",
        headerStyle: { width: "10%" }
      }
    ],
    data: [],
    options: {
      enabledRowSelection: false,
      enabledActionButtons: false,
    },
    actions: []
  });

  useEffect(() => {
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

      setLoading(false);
    });
  }, []);

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
