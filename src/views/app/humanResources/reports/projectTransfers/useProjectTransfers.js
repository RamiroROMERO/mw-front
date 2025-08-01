import { useEffect, useState } from 'react';
import { request } from '@Helpers/core';
import { IntlMessages } from '@Helpers/Utils';

export const useProjectTransfers = ({setLoading}) => {
  const [listProjects, setListProjects] = useState([]);

  const [table, setTable] = useState({
      title: IntlMessages("page.reports.table.employeesByCust.title"),
      columns: [
        {
          text: IntlMessages("select.dateIn"),
          dataField: "dateIn",
          type: 'date',
          headerStyle: { width: "15%" }
        },
        {
          text: IntlMessages("select.employee"),
          dataField: "employee",
          headerStyle: { width: "30%" }
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
    setTable
  }

  return (
    {
      propsToHeader,
      table
    }
  )
}
