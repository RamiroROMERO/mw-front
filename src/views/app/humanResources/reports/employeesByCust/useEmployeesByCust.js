import { useEffect, useState } from 'react'
import { request } from '@Helpers/core';
import { IntlMessages } from '@Helpers/Utils';

export const useEmployeesByCust = ({setLoading, adminControl}) => {
  const enableGenerateReport = adminControl.find(ctrl => ctrl.code === "07.03.002")?.active || false;
  const [listCustomers, setListCustomers] = useState([]);
  const [listWorkShifts, setListWorkShifts] = useState([]);

  const [table, setTable] = useState({
    title: IntlMessages("page.reports.table.employeesByCust.title"),
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
        text: IntlMessages("select.project"),
        dataField: "project",
        headerStyle: { width: "20%" }
      },
      {
        text: IntlMessages("select.workShifts"),
        dataField: "workShifts",
        headerStyle: { width: "20%" }
      },
      {
        text: IntlMessages("select.dateIn"),
        dataField: "dateIn",
        type: 'date',
        headerStyle: { width: "20%" }
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
    request.GET('facCustomers?status=1', (resp) => {
      const customers = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.id} | ${item.rtn} | ${item.nomcli}`,
          value: item.id,
          rtn: item.rtn,
          name: item.nomcli
        }
      });
      setListCustomers(customers);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhhSchedules', (resp)=>{
      const workShifts = resp.data.map((item) => {
        return {
          id: item.id,
          label: item.name,
          value: item.id
        }
      });
      setListWorkShifts(workShifts);
      setLoading(false);
    }, (err)=>{
      console.error(err);
      setLoading(false);
    });
  },[]);

  const propsToHeader = {
    listCustomers,
    listWorkShifts,
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
