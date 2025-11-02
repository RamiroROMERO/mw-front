import { useEffect, useState } from 'react';
import { request } from '@Helpers/core';
import { IntlMessages } from '@Helpers/Utils';

export const useProjectTransfers = ({setLoading, adminControl}) => {
  const [listProjects, setListProjects] = useState([]);
  const enableGenerateReport = adminControl.find(ctrl => ctrl.code === "07.03.009")?.active || false;

  const [table, setTable] = useState({
      title: IntlMessages("page.reports.table.employeesByCust.title"),
      columns: [
        {
          text: IntlMessages("table.column.no"),
          dataField: "num",
          headerStyle: { width: "5%" }
        },
        {
          text: IntlMessages("select.dateIn"),
          dataField: "dateIn",
          type: 'date',
          headerStyle: { width: "15%" }
        },
        {
          text: IntlMessages("select.employee"),
          dataField: "employee",
          headerStyle: { width: "25%" }
        },
        {
          text: IntlMessages("input.code"),
          dataField: "codeEmployee",
          headerStyle: { width: "15%" }
        },
        {
          text: IntlMessages("table.column.reason"),
          dataField: "reason",
          headerStyle: { width: "25%" }
        },
        {
          text: IntlMessages("select.prevProjectId"),
          dataField: "prevProject",
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
    request.GET('rrhh/process/projects', (resp)=>{
      const projects = resp.data.map((item) => {
        return {
          id: item.id,
          label: item.name,
          value: item.id
        }
      });
      setListProjects(projects);
      setLoading(false);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });
  },[]);

  const propsToHeader = {
    listProjects,
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
