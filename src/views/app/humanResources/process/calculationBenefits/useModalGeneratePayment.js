import { request } from '@/helpers/core';
import { validFloat } from '@/helpers/Utils';
import { useForm } from '@/hooks';
import React, { useState } from 'react'

export const useModalGeneratePayment = ({employeeId, totalBenefits, setLoading, setOpen}) => {
  const [sendForm, setSendForm] = useState(false);

  const paymentsValid = {
    date: [(val) => val !== "", "msg.required.input.date"],
    description: [(val) => val.length > 5, "msg.required.input.description"],
    value: [(val) => validFloat(val) > 0, "msg.required.input.value"],
    valueQuote: [(val) => validFloat(val) > 0, "msg.required.input.valueQuote"],
    startDate: [(val) => val !== "", "msg.required.select.dateStart"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    date: '',
    description: '',
    value: totalBenefits,
    noQuotes: 0,
    valueQuote: 0,
    startDate: '',
    notes: ''
  }, paymentsValid);

  const { id, date, description, value, noQuotes, valueQuote, startDate, notes} = formState;

  const onValueChange = e =>{
    const valuePay = e.target.value;

    const numQuotas = validFloat(valueQuote)>0 ? validFloat(valuePay) / validFloat(valueQuote):0;

    const newValue = {
      value: valuePay,
      noQuotes: validFloat(numQuotas)
    }
    setBulkForm(newValue);
  }

  const onValueQuoteChange = e =>{
    const valQuote = e.target.value;

    const numQuotas = validFloat(valQuote)>0 ? validFloat(value) / validFloat(valQuote):0;

    const newValue = {
      valueQuote: valQuote,
      noQuotes: validFloat(numQuotas)
    }
    setBulkForm(newValue);
  }

  const fnSavePaymentPlan = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (employeeId === 0) {
      notification('warning', 'msg.required.select.employeeId', 'alert.warning.title');
      return;
    }

    const updateData = {
      date,
      description,
      value,
      noQuotes,
      valueQuote,
      startDate,
      notes
    }

    if (id === 0) {
      const newData = {
        employeeId,
        date,
        description,
        value,
        noQuotes,
        valueQuote,
        startDate,
        notes
      }

      setLoading(true);
      request.POST('rrhh/process/benefitsPaymentPlans', newData, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        setSendForm(false);
        setLoading(false);
        // Generar cuotas
        const dataDetail = { id: resp.data.id }
        setLoading(true);
        request.POST(`rrhh/process/benefitsPaymentPlans/generateCuotes`, dataDetail, (resp2) => {
          setOpen(false);
          setLoading(false);
        }, (err) => {
          setLoading(false);
        });
      }, (err) => {
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.PUT(`rrhh/process/benefitsPaymentPlans/${id}`, updateData, () => {
        setSendForm(false);
        setLoading(false);
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
      onValueChange,
      onValueQuoteChange,
      fnSavePaymentPlan
    }
  )
}
