import { useState } from 'react'
import { useForm } from '@Hooks';
import { request } from '@Helpers/core';
import DateHelper from '@Helpers/DateHelper';
import notification from '@Containers/ui/Notifications';
import { validateHospitalization, buildHospitalizePayload, warningMessages } from './eventRules';

export const useHospitalization = ({ currentItem, setLoading, fnGetData, setOpen }) => {
  const [sendForm, setSendForm] = useState(false);

  const { formState, onInputChange } = useForm({
    id: currentItem?.id || 0,
    dateIn: DateHelper.format(DateHelper.now()),
    admissionSpecialistId: 0,
    responsibleSpecialistId: 0,
    reasonId: 0,
    roomId: 0
  });

  // Mismas reglas del back: fecha de ingreso no futura ni anterior a la del evento, dos médicos y la habitación.
  const problems = validateHospitalization(formState, { today: DateHelper.format(DateHelper.now()), eventDate: currentItem?.date });
  const formValidation = Object.fromEntries(Object.entries(problems).map(([field, key]) => [`${field}Valid`, key]));
  const isFormValid = Object.keys(problems).length === 0;

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    setLoading(true);
    request.POST(`hospital/process/events/${currentItem.id}/hospitalize`, buildHospitalizePayload(formState), (resp) => {
      setLoading(false);
      // Una habitación ocupada solo avisa.
      warningMessages(resp.data?.warnings).forEach((key) => notification('warning', key, 'alert.warning.title'));
      fnGetData();
      setOpen(false);
    }, (err) => {
      setLoading(false);
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
