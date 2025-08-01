import { useEffect, useState } from 'react'
import { IntlMessages, validInt } from '@/helpers/Utils';
import { request } from '@/helpers/core';
import { useForm } from '@/hooks';

export const useDetail = ({ currentItem, fnGetData, setLoading, setCurrentItem }) => {
  const [sendForm, setSendForm] = useState(false);

  const validation = {
    code: [(val) => val.length > 1, IntlMessages("msg.required.input.code")],
    name: [(val) => val.length > 5, IntlMessages("msg.required.input.name")]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0,
    code: '',
    name: '',
    descrip: '',
    price: 0,
    status: true
  }, validation);

  const { id } = formState;

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    setLoading(true);
    if (validInt(id) === 0) {
      request.POST('hospital/settings/rooms', formState, (resp) => {
        setLoading(false);
        fnGetData();
        fnClear();
      }, (err) => {
        console.log(err);
        setLoading(false);
      })
    } else {
      request.PUT(`hospital/settings/rooms/${id}`, formState, (resp) => {
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
