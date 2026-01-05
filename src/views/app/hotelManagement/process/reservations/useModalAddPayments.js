import { request } from '@/helpers/core';
import { validFloat, validInt } from '@/helpers/Utils';
import { useForm } from '@/hooks';
import { useState } from 'react'

export const useModalAddPayments = ({ bookingId, currentPayment, setLoading, fnGetDataPayments, setOpen }) => {
  const [sendForm, setSendForm] = useState(false);

  const validation = {
    date: [(val) => val !== "", "msg.required.input.date"],
    paymentTypeId: [(val) => validFloat(val) > 0, "msg.required.select.paymentType"]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: currentPayment?.id || 0,
    bookingId: currentPayment?.bookingId || bookingId,
    date: currentPayment?.date || "",
    paymentTypeId: currentPayment?.paymentTypeId || 0,
    code: currentPayment?.code || 0,
    value: currentPayment?.value || 0
  }, validation);

  const { id } = formState;

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (validInt(id) === 0) {
      setLoading(true);
      request.POST('hotel/process/bookingPayments', formState, (resp) => {
        const { data } = resp;
        onBulkForm(data);
        setLoading(false);
        fnGetDataPayments();
        setOpen(false);
      }, (err) => {
        setLoading(false);
      })
    } else {
      setLoading(true);
      request.PUT(`hotel/process/bookingPayments/${id}`, formState, () => {
        setLoading(false);
        fnGetDataPayments();
        setOpen(false);
      }, (err) => {
        setLoading(false);
      });
    }
  }

  return (
    {
      formState,
      formValidation,
      sendForm,
      onInputChange,
      fnSave
    }
  )
}
