import { useForm } from '@Hooks'
import React, { useState } from 'react'

export const useDefaultValues = ({ setLoading }) => {

  const [sendForm, setSendForm] = useState(false);

  const { formState, onImputChange } = useForm({
    id: 0,
    maxHoursDay: 0,
    maxHoursWeek: 0,
    maxHoursMonth: 0
  });

  const fnSave = () => {
    setSendForm(true);
  }

  return {
    formState,
    onImputChange,
    sendForm,
    fnSave
  }
}
