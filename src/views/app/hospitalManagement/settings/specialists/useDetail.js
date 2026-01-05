import { useEffect, useState } from 'react'
import { request } from '@/helpers/core';
import { useForm } from '@/hooks';
import { IntlMessages, validInt } from '@/helpers/Utils';

export const useDetail = ({ currentItem, fnGetData, setLoading, setCurrentItem }) => {
  const [sendForm, setSendForm] = useState(false);

  const validation = {
    specialtyId: [(val) => validInt(val) !== 0, IntlMessages("msg.required.select.specialtyId")],
    dni: [(val) => val.length > 12 && val.length <= 16, IntlMessages("msg.required.input.dni")],
    name: [(val) => val.length > 5, IntlMessages("msg.required.input.name")]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0,
    specialtyId: 0,
    dni: '',
    name: '',
    licenceNumber: '',
    phone: '',
    email: '',
    address: '',
    attendMonday: false,
    attendMondayHour: '',
    attendTuesday: false,
    attendTuesdayHour: '',
    attendWednesday: false,
    attendWednesdayHour: '',
    attendThursday: false,
    attendThursdayHour: '',
    attendFriday: false,
    attendFridayHour: '',
    attendSaturday: false,
    attendSaturdayHour: '',
    attendSunday: false,
    attendSundayHour: '',
    hospitalPercent: 0,
    specialistPercent: 0,
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
      request.POST('hospital/settings/specialists', formState, (resp) => {
        setLoading(false);
        fnGetData();
        fnClear();
      }, (err) => {
        setLoading(false);
      })
    } else {
      request.PUT(`hospital/settings/specialists/${id}`, formState, (resp) => {
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
