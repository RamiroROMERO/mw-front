import { useState } from 'react'
import { useForm } from '@Hooks';
import { request } from '@Helpers/core';
import { IntlMessages, validInt } from '@Helpers/Utils';

export const useModalAppointment = ({ currentItem, setLoading, fnGetData, setOpen }) => {
  const [sendForm, setSendForm] = useState(false);
  const [openMsgCancel, setOpenMsgCancel] = useState(false);

  const validation = {
    patientId: [(val) => validInt(val) !== 0, IntlMessages("msg.required.select.patient")],
    specialistId: [(val) => validInt(val) !== 0, IntlMessages("msg.required.select.specialistId")],
    date: [(val) => val !== "", IntlMessages("msg.required.input.date")],
    time: [(val) => val !== "", IntlMessages("msg.required.input.time")]
  }

  const { formState, onInputChange, formValidation, isFormValid } = useForm({
    id: currentItem?.id || 0,
    patientId: currentItem?.patientId || 0,
    specialistId: currentItem?.specialistId || 0,
    date: currentItem?.date || '',
    time: currentItem?.time || '',
    reasonId: currentItem?.reasonId || 0,
    notes: currentItem?.notes || '',
    status: currentItem?.status || 1
  }, validation);

  const { id } = formState;

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    setLoading(true);
    if (validInt(id) === 0) {
      request.POST('hospital/process/appointments', formState, (resp) => {
        setLoading(false);
        fnGetData();
        setOpen(false);
      }, (err) => {
        setLoading(false);
      });
    } else {
      request.PUT(`hospital/process/appointments/${id}`, formState, (resp) => {
        setLoading(false);
        fnGetData();
        setOpen(false);
      }, (err) => {
        setLoading(false);
      });
    }
  }

  const fnCancelAppointment = () => {
    setOpenMsgCancel(true);
  }

  const fnOkCancelAppointment = () => {
    setLoading(true);
    request.PUT(`hospital/process/appointments/${id}`, { status: 2 }, (resp) => {
      setLoading(false);
      setOpenMsgCancel(false);
      fnGetData();
      setOpen(false);
    }, (err) => {
      setLoading(false);
    });
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
      onInputChange,
      fnSaveDocument,
      fnCancelAppointment,
      propsToMsgCancel
    }
  )
}
