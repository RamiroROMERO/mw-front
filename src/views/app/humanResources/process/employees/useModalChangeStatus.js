import { request } from '@Helpers/core';
import { getCurrentDate } from '@Helpers/Utils';
import { useForm } from '@Hooks/useForms';
import { useState } from 'react'

export const useModalChangeStatus = ({ setLoading, employeeId, statusEmployee, setOpen, setBulkForm }) => {
  const [sendForm, setSendForm] = useState(false);

  const validations = {
    date: [(val) => val !== "", "msg.required.input.date"],
    reason: [(val) => val !== '', "msg.required.input.reason"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm } = useForm({
    date: getCurrentDate(),
    employeeId: employeeId,
    reason: '',
    status: !statusEmployee,
    isHireable: true
  }, validations);

  const { date, status } = formState;

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const dataUpdate = {
      status
    }

    if (status === true) {
      dataUpdate.dateIn = date;
    }

    setLoading(true);
    request.POST('rrhh/process/employeeHistory', formState, () => {
      fnClearInputs();

      // actualizar estado en el perfil del usuario
      request.PUT(`rrhh/process/employees/${employeeId}`, dataUpdate, () => {
        setLoading(false);
        setOpen();

        setBulkForm(dataUpdate);

      }, (err) => {

        setLoading(false);
      });

      //si el status es false desactivarlo en los proyectos
      if (status === false) {
        const projectUpdate = {
          status: false
        }
        setLoading(true);
        request.PUT(`rrhh/process/projectDetail?employeeId=${employeeId}`, projectUpdate, () => {
          setLoading(false);
        }, (err) => {

          setLoading(false);
        });
      }

    }, (err) => {

      setLoading(false);
    });
  }

  return (
    {
      formState,
      formValidation,
      onInputChange,
      sendForm,
      fnSave
    }
  )
}
