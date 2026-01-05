import React, { useEffect, useState } from 'react';
import { request } from '@/helpers/core';
import { IntlMessages } from '@Helpers/Utils'
import notification from '@/containers/ui/Notifications';

export const useDetailIncomes = ({ id, projectId, setProjectId, onResetForm, listEmployeesByProject, fnGetData, setLoading, isFormValid, date, typeId, description, value, days, hours, fnCreate, fnUpdate, setIncWeekly }) => {

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

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
    setProjectId(0);
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
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
      value,
      days,
      hours
    }

    const newData = selectedItems.map(item => {
      return {
        employeeId: item.value,
        typeId,
        date,
        description,
        value,
        days,
        hours
      }
    });

    if (id === 0) {
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        setSendForm(false);
        return;
      }
      setLoading(true);
      request.POST('rrhh/process/incomes/createMany', newData, () => {
        fnGetData();
        fnClearInputs();
        setProjectId(0);
        setSelectedItems([]);
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      if (fnUpdate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        setSendForm(false);
        return;
      }
      setLoading(true);
      request.PUT(`rrhh/process/incomes/${id}`, updateData, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  useEffect(() => {
    const dataTable = { ...table, data: listEmployeesByProject };
    setTable(dataTable);
  }, [listEmployeesByProject, projectId]);

  useEffect(() => {
    setIncWeekly(selectedItems[0]?.defaultSalary || 0);
  }, [selectedItems]);

  return (
    {
      table,
      sendForm,
      fnSave,
      fnClearInputs
    }
  )
}
