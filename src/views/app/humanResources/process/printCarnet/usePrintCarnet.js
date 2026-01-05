import React, { useState, useEffect } from 'react'
import { useForm } from '@Hooks';
import { validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

export const usePrintCarnet = ({ setLoading, screenControl }) => {
  const { fnCreate } = screenControl;
  const [listEmployees, setListEmployees] = useState([]);
  const [employeesSelected, setEmployeesSelected] = useState([]);
  const [sendForm, setSendForm] = useState(false);

  const carnetValidations = {
    employeeId: [(val) => validInt(val) > 0, "msg.required.select.employeeId"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    employeeId: 0
  }, carnetValidations);

  const { employeeId } = formState;

  const fnAddEmployee = () => {
    if (fnCreate === false) {
      notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
      return;
    }
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const filterEmployee = listEmployees.filter((item) => {
      return item.value === employeeId
    });

    const filterEmplSelected = employeesSelected.filter((item2) => {
      return item2.id === employeeId;
    });

    if (filterEmplSelected.length > 0) {
      notification('warning', 'msg.employeeRepeat', 'alert.warning.title');
      return;
    }

    const newData = {
      id: employeeId,
      name: filterEmployee[0].label,
      dni: filterEmployee[0].dni
    }

    setEmployeesSelected(current => [...current, newData]);
    onResetForm();
    setSendForm(false);
  }

  const fnDeleteEmployee = (item2) => {
    const newData = employeesSelected.filter((item) => {
      return item.id !== item2.id;
    });
    setEmployeesSelected(newData);
  }

  const fnPrintCarnet = () => {
    if (employeesSelected.length === 0) {
      notification('warning', 'msg.required.select.employeeId', 'alert.warning.title');
      return;
    }

    request.GETPdf('rrhh/process/employees/exportPDFCarnet', { employeesId: employeesSelected }, 'Carnet de Empleado.pdf', (err) => {

      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET('rrhh/process/employees/findSL?status=1', (resp) => {
      const employees = resp.data.map((item) => {
        return {
          value: item.id,
          label: `${item.firstName} ${item.secondName} ${item.lastName} ${item.secondLastName}`,
          dni: item.dni
        }
      });
      setListEmployees(employees);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }, []);

  return (
    {
      employeeId,
      onInputChange,
      listEmployees,
      sendForm,
      formValidation,
      employeesSelected,
      fnAddEmployee,
      fnDeleteEmployee,
      fnPrintCarnet
    }
  )
}
