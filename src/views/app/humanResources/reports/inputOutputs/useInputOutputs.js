import React, { useState } from 'react'
import { request } from '@Helpers/core';
import { useForm } from '@Hooks';
import notification from '@Containers/ui/Notifications';

export const useInputOutputs = ({ setLoading, adminControl }) => {
  const [dataInput, setDataInput] = useState([]);
  const enableGenerateReport = adminControl.find(ctrl => ctrl.code === "07.03.001")?.active || false;

  const { formState, setBulkForm, onResetForm, onInputChange } = useForm({
    id: 0,
    date: ''
  });
  const { date } = formState;

  const fnGetData = () => {
    if (enableGenerateReport === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(`rrhh/proccess/attendanceControl?date=${date}`, (resp) => {
      const data = resp.data.map(item => {
        item.employeeName = item.rrhhEmployee ? `${item.rrhhEmployee.firstName}  ${item.rrhhEmployee.secondName}  ${item.rrhhEmployee.lastName} ${item.rrhhEmployee.secondLastName}` : ""
        return item
      });
      setDataInput(data);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const propsToDetailTable = {
    dataInput
  }

  const propsToDetailInput = {
    date,
    onInputChange,
    fnGetData
  }

  return (
    {
      propsToDetailInput,
      propsToDetailTable
    }
  )
}
