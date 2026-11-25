import { useEffect, useState } from 'react'
import { request } from '@Helpers/core';
import { useForm } from '@Hooks';
import { isValidName, isValidSpecialistDni, isValidPercent, isValidPercentSum, MAX_SPECIALIST } from '../hospitalCatalogRules';
import { IntlMessages, validInt } from '@Helpers/Utils';

export const useDetail = ({ currentItem, fnGetData, setLoading, setCurrentItem }) => {
  const [sendForm, setSendForm] = useState(false);

  const validation = {
    specialtyId: [(val) => validInt(val) !== 0, IntlMessages("msg.required.select.specialtyId")],
    dni: [(val) => isValidSpecialistDni(val), IntlMessages("msg.invalid.input.dni")],
    name: [(val) => isValidName(val, MAX_SPECIALIST.name), IntlMessages("msg.required.input.name")],
    hospitalPercent: [(val) => isValidPercent(val), IntlMessages("msg.invalid.input.percent")],
    specialistPercent: [(val) => isValidPercent(val), IntlMessages("msg.invalid.input.percent")]
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
