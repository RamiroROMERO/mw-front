import { useEffect, useState } from 'react';
import { useForm } from '@/hooks';
import { IntlMessages, validInt } from '@/helpers/Utils';
import { request } from '@/helpers/core';

export const useDetail = ({ currentItem, fnGetData, setLoading, setCurrentItem }) => {
  const [sendForm, setSendForm] = useState(false);

  const validation = {
    name: [(val) => val.length > 5, IntlMessages("msg.required.input.name")]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0,
    name: '',
    status: true
  }, validation);

  const { id, name, status } = formState;

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newData = {
      name,
      status
    }

    setLoading(true);
    if (validInt(id) === 0) {
      request.POST('hospital/settings/specialties', newData, (resp) => {
        setLoading(false);
        fnGetData();
        fnClear();
      }, (err) => {
        console.log(err);
        setLoading(false);
      })
    } else {
      request.PUT(`hospital/settings/specialties/${id}`, newData, (resp) => {
        setLoading(false);
        fnGetData();
        fnClear();
      }, (err) => {
        console.log(err);
        setLoading(false);
      });
    }
  }

  const fnClear = () => {
    onResetForm();
    setCurrentItem({});
    setSendForm(false);
  }

  useEffect(() => {
    onBulkForm(currentItem);
  }, [currentItem]);

  return (
    {
      formState,
      onInputChange,
      formValidation,
      sendForm,
      IntlMessages,
      fnSaveDocument,
      fnClear
    }
  )
}
