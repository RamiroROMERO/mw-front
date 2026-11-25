import { useState } from 'react'
import { useForm } from '@Hooks';
import { request } from '@Helpers/core';
import { IntlMessages, validInt } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';
import { warningMessages } from '../events/eventRules';

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
    request.PUT(`hospital/process/hospitalizations/${currentItem.id}/room`, { roomId: formState.roomId }, (resp) => {
      setLoading(false);
      warningMessages(resp.data?.warnings).forEach((key) => notification('warning', key, 'alert.warning.title'));
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
