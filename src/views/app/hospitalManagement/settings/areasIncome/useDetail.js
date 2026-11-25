import { useEffect, useState } from 'react'
import { IntlMessages, validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import { useForm } from '@Hooks';
import { isValidName, MAX_NAME } from '../hospitalCatalogRules';

export const useDetail = ({ currentItem, fnGetData, setLoading, setCurrentItem }) => {
  const [sendForm, setSendForm] = useState(false);

  const validation = {
    name: [(val) => isValidName(val, MAX_NAME.areas), IntlMessages("msg.required.input.name")]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0,
    name: '',
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
      request.POST('hospital/settings/areas', formState, (resp) => {
        setLoading(false);
        fnGetData();
        fnClear();
      }, (err) => {
        setLoading(false);
      })
    } else {
      request.PUT(`hospital/settings/areas/${id}`, formState, (resp) => {
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
