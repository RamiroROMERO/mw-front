import { useState } from 'react'
import { useForm } from '@Hooks';
import { request } from '@Helpers/core';
import { IntlMessages, validInt } from '@Helpers/Utils';

export const useChangeRoom = ({ currentItem, setLoading, fnGetData, setOpen }) => {
  const [sendForm, setSendForm] = useState(false);

  const validation = {
    roomId: [(val) => validInt(val) !== 0, IntlMessages("msg.required.select.room")]
  }

  const { formState, onInputChange, formValidation, isFormValid } = useForm({
    id: currentItem?.id || 0,
    roomId: currentItem?.roomId || 0
  }, validation);

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    setLoading(true);
    request.PUT(`hospital/process/events/${currentItem.id}`, { roomId: formState.roomId }, (resp) => {
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
