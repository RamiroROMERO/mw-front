import { useState } from 'react'
import { useForm } from '@Hooks';
import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';
import DateHelper from '@Helpers/DateHelper';
import { validateAppointment, validateReschedule, buildCreatePayload, buildUpdatePayload, buildReschedulePayload, TYPE_FREE, TYPE_PATIENT } from './appointmentRules';

const today = () => DateHelper.format(DateHelper.now());

// SPEC v2-153-sr: una cita nueva se valida con las mismas reglas del back y el turno lo asigna el back (se muestra al guardar). Una cita existente se edita (teléfono, notas y, en nombre
// libre, el nombre), se reprograma (fecha y hora, con turno nuevo si cambia el día) o se cancela; no se borra. Los avisos por campo llevan la clave de traducción (el campo la traduce).
export const useModalAppointment = ({ currentItem, setLoading, fnGetData, setOpen }) => {
  const [sendForm, setSendForm] = useState(false);
  const [openMsgCancel, setOpenMsgCancel] = useState(false);

  const { formState, onInputChange } = useForm({
    id: currentItem?.id || 0,
    typeId: currentItem?.typeId || TYPE_PATIENT,
    patientId: currentItem?.patientId || 0,
    name: currentItem?.id && Number(currentItem?.typeId) === TYPE_FREE ? currentItem.name || '' : '',
    specialistId: currentItem?.specialistId || 0,
    specialtyId: currentItem?.specialtyId || 0,
    date: currentItem?.date ? String(currentItem.date).slice(0, 10) : '',
    time: currentItem?.time || '',
    phone: currentItem?.phone || '',
    notes: currentItem?.notes || '',
    turnNumber: currentItem?.turnNumber || 0
  });

  const { id } = formState;
  const isNew = validInt(id) === 0;
  const problems = isNew ? validateAppointment(formState, today()) : validateReschedule(formState, today());
  const formValidation = Object.fromEntries(Object.entries(problems).map(([field, key]) => [`${field}Valid`, key]));

  const onTypeChange = (e) => onInputChange({ target: { name: 'typeId', value: Number(e.target.value) } });

  const finish = () => {
    setLoading(false);
    fnGetData();
    setOpen(false);
  };

  const fnSaveDocument = () => {
    setSendForm(true);
    if (isNew) {
      if (Object.keys(problems).length) return;
      setLoading(true);
      request.POST('hospital/process/appointments', buildCreatePayload(formState), (resp) => {
        // El turno lo asigna el back: se avisa al usuario (el legacy lo mostraba al guardar).
        notification('success', 'page.appointments.msg.turnAssigned', { text: String(resp.data?.turnNumber || '') });
        finish();
      }, () => setLoading(false));
      return;
    }
    // Existente: la fecha y la hora no se guardan aquí (se reprograma); el nombre de tipo 1 sí se valida.
    if (Number(formState.typeId) === TYPE_FREE && String(formState.name).trim().length < 5) return;
    setLoading(true);
    request.PUT(`hospital/process/appointments/${id}`, buildUpdatePayload(formState), finish, () => setLoading(false));
  }

  const fnReschedule = () => {
    setSendForm(true);
    if (isNew || Object.keys(validateReschedule(formState, today())).length) return;
    setLoading(true);
    request.POST(`hospital/process/appointments/${id}/reschedule`, buildReschedulePayload(formState), finish, () => setLoading(false));
  }

  const fnCancelAppointment = () => {
    setOpenMsgCancel(true);
  }

  const fnOkCancelAppointment = () => {
    setOpenMsgCancel(false);
    setLoading(true);
    request.POST(`hospital/process/appointments/${id}/cancel`, {}, finish, () => setLoading(false));
  }

  const propsToMsgCancel = {
    title: "page.appointments.alert.cancel.title",
    open: openMsgCancel,
    setOpen: setOpenMsgCancel,
    fnOnOk: fnOkCancelAppointment
  };

  return (
    {
      formState,
      formValidation,
      sendForm,
      isNew,
      onInputChange,
      onTypeChange,
      fnSaveDocument,
      fnReschedule,
      fnCancelAppointment,
      propsToMsgCancel
    }
  )
}
