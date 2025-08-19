import React, { useEffect, useState } from 'react';
import { request } from '@/helpers/core';
import { IntlMessages } from '@Helpers/Utils'
import notification from '@/containers/ui/Notifications';

export const useDetailDeductions = ({id, projectId, setProjectId, onResetForm, listEmployeesByProject, fnGetData, setLoading, isFormValid, date, typeId, description, value}) => {

  const [sendForm, setSendForm] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const [table, setTable] = useState({
    title: IntlMessages("page.projects.table.employees.title"),
    columns: [
      {
        text: IntlMessages("select.employee"),
        dataField: "label",
        headerStyle: { width: "100%" }
      },
    ],
    data: [],
    options: {
      pageSize: 5,
      enabledRowSelection: true,
      enabledActionButtons: false,
      setRowSelected: setSelectedItems
    }
  });

  const fnClearInputs = ()=>{
    onResetForm();
    setSendForm(false);
    setProjectId(0);
  }

  const fnSave = () =>{
    setSendForm(true);
    if(!isFormValid){
      return;
    }

    if (id === 0 && selectedItems.length === 0) {
      notification('warning', 'msg.required.select.employeeId', 'alert.warning.title');
      return;
    }

    const updateData = {
      date,
      typeId,
      description,
      value
    }

    const newData = selectedItems.map(item => {
      return {
        employeeId: item.value,
        typeId,
        date,
        description,
        value
      }
    });

    if(id === 0){
      setLoading(true);
      request.POST('rrhh/process/deductions/createMany', newData, () => {
        fnGetData();
        fnClearInputs();
        setProjectId(0);
        setSelectedItems([]);
        setLoading(false);
      },(err)=>{
        console.error(err);
        setLoading(false);
      });
    }else{
      setLoading(true);
      request.PUT(`rrhh/process/deductions/${id}`, updateData, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  useEffect(()=>{
    const dataTable = {...table, data: listEmployeesByProject};
    setTable(dataTable);
  },[listEmployeesByProject, projectId]);

  return (
    {
      table,
      sendForm,
      fnSave,
      fnClearInputs
    }
  )
}
