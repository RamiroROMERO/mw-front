import { useEffect, useState } from 'react'
import { IntlMessages, validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import { useForm } from '@Hooks';

export const useDetail = ({ currentItem, fnGetData, setLoading, setCurrentItem }) => {
  const [sendForm, setSendForm] = useState(false);

  const validation = {
    name: [(val) => val.length > 4, "msg.required.input.name"]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0,
    name: '',
    noAccount: '',
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
      request.POST('rrhh/settings/deductionTypes', formState, (resp) => {
        setLoading(false);
        fnGetData();
        fnClear();
      }, (err) => {
        console.log(err);
        setLoading(false);
      })
    } else {
      request.PUT(`rrhh/settings/deductionTypes/${id}`, formState, (resp) => {
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
