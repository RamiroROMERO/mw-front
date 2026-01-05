import { useState } from 'react'
import { useForm } from '@/hooks';
import { request } from '@/helpers/core';
import { IntlMessages, validInt } from '@/helpers/Utils';

export const useHospitalization = ({ currentItem, setLoading, fnGetData, setOpen }) => {
  const [sendForm, setSendForm] = useState(false);

  const validation = {
    specialistId2: [(val) => validInt(val) !== 0, IntlMessages("msg.required.select.specialistId")],
    specialistId3: [(val) => validInt(val) !== 0, IntlMessages("msg.required.select.specialistId")]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: currentItem?.id || 0,
    typeId: 2,
    specialistId2: 0,
    specialistId3: 0,
    reasonId: 0,
    roomId: 0,
    status: 1
  }, validation);

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    request.PUT(`hospital/process/events/${currentItem.id}`, formState, (resp) => {
      setLoading(false);
      fnGetData();
      setOpen(false);
    }, (err) => {
      setLoading(false);
    });
  }

  return (
    {
      formState,
      formValidation,
      sendForm,
      onInputChange,
      fnSaveDocument
    }
  )
}
