import { useEffect, useState } from 'react';
import { useForm } from '@Hooks';
import { IntlMessages, validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import { isValidName, MAX_NAME } from '../hospitalCatalogRules';

export const useDetail = ({ currentItem, fnGetData, setLoading, setCurrentItem }) => {
  const [sendForm, setSendForm] = useState(false);

  const validation = {
    name: [(val) => isValidName(val, MAX_NAME.specialties), IntlMessages("msg.required.input.name")]
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
        setLoading(false);
      })
    } else {
      request.PUT(`hospital/settings/specialties/${id}`, newData, (resp) => {
        setLoading(false);
        fnGetData();
        fnClear();
      }, (err) => {
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
