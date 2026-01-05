import { request } from '@/helpers/core';
import { formatNumber, IntlMessages } from '@/helpers/Utils';
import React, { useEffect, useState } from 'react'

export const useBiweeklyIncomes = ({ setLoading, adminControl }) => {
  const enableGenerateReport = adminControl.find(ctrl => ctrl.code === "07.03.010")?.active || false;
  const [listProjects, setListProjects] = useState([]);
  const [listTypeIncomes, setListTypeIncomes] = useState([]);

  const [table, setTable] = useState({
    title: IntlMessages("page.biweeklyIncomes.table.biweeklyIncomes.title"),
    columns: [
      {
        text: IntlMessages("table.column.no"),
        dataField: "num",
        headerStyle: { width: "5%" }
      },
      {
        text: IntlMessages("select.employee"),
        dataField: "employee",
        headerStyle: { width: "25%" }
      },
      {
        text: IntlMessages("table.column.dateIn"),
        dataField: "dateIn",
        headerStyle: { width: "10%" },
      },
      {
        text: IntlMessages("select.project"),
        dataField: "projectName",
        headerStyle: { width: "15%" }
      },
      {
        text: IntlMessages("table.column.description"),
        dataField: "description",
        headerStyle: { width: "25%" }
      },
      {
        text: IntlMessages("table.column.date"),
        dataField: "date",
        headerStyle: { width: "10%" },
      },
      {
        text: IntlMessages("table.column.value"),
        dataField: "value",
        headerStyle: { width: "10%" },
        cell: ({ row }) => {
          return (formatNumber(row.original.value, '', 2));
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

  useEffect(() => {
    setLoading(true);
    request.GET('rrhh/process/projects', (resp) => {
      const projectsList = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.code}| ${item.name}`,
          value: item.id
        }
      });
      setListProjects(projectsList);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhh/settings/payrollDayTypes', (resp) => {
      const listTypes = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id,
          noAccount: item.noAccount
        }
      });
      setListTypeIncomes(listTypes);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }, []);

  const propsToHeader = {
    listProjects,
    setLoading,
    table,
    enableGenerateReport,
    listTypeIncomes,
    setTable
  }

  return (
    {
      table,
      propsToHeader
    }
  )
}
