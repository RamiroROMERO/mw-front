import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks'
import { useState } from 'react'

export const useModalChangeSalary = ({ setLoading }) => {
  const [sendForm, setSendForm] = useState(false);

  const validations = {
    salary: [(val) => validInt(val) > 0, "msg.required.input.salary"],
    jobPositionId: [(val) => validInt(val) > 0, "msg.required.select.jobPosition"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    salary: 0,
    jobPositionId: 0
  }, validations);

  const { salary, jobPositionId } = formState;

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    setLoading(true);
    request.PUT(`rrhh/process/employees?jobPositionId=${jobPositionId}`, { defaultSalary: salary }, () => {
      onResetForm();
      setSendForm(false);
      setLoading(false);
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
