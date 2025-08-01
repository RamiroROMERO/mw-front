import React, { useState, useEffect } from 'react';
import { request } from '@Helpers/core'
import { useForm } from '@Hooks';
import { validFloat } from '@Helpers/Utils';

export const useNeighborhoodTax = ({setLoading}) => {
  const [dataTax, setDataTax] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const neighborhoodTaxValidations = {
    rangeInit: [(val) => validFloat(val) > 0, "msg.required.input.rangeInit"],
    rangeEnd: [(val) => validFloat(val) > 0, "msg.required.input.rangeEnd"],
    range: [(val) => validFloat(val) > 0, "msg.required.input.rangeTax"],
    rate: [(val) => validFloat(val) > 0, "msg.required.input.rateTax"]
  }

  const { formState, formValidation, isFormValid, onBulkForm, onInputChange, onResetForm } = useForm({
    id: 0,
    rangeInit: '',
    rangeEnd: '',
    range: '',
    rate: '',
    total: '',
    status: true
  },neighborhoodTaxValidations);

  const { id, rangeInit, range, rangeEnd, rate, total, status } = formState;

  const fnGetData = () => {
    setLoading(true);
    request.GET('rrhh/settings/setetNeighborhoodTax', (resp) => {
      const data = resp.data;
      setDataTax(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnClearInputs = () => {
    setSendForm(false);
    onResetForm();
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const data = {
      id,
      rangeInit: validFloat(rangeInit),
      rangeEnd: validFloat(rangeEnd),
      range: validFloat(range),
      rate: validFloat(rate),
      total: validFloat(total),
      status
    }
    if (id > 0) {
      setLoading(true);
      request.PUT(`rrhh/settings/setetNeighborhoodTax/${id}`, data, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('rrhh/settings/setetNeighborhoodTax', data, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    const data = {
      status: 0
    }
    if (formState.id && formState.id > 0) {
      setLoading(true);
      request.PUT(`rrhh/settings/setetNeighborhoodTax/${formState.id}`, data, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const propsToDetailTable = {
    dataTax,
    onBulkForm,
    setOpenMsgQuestion
  }

  const propsToDetailTax = {
    id,
    rangeInit,
    rangeEnd,
    range,
    rate,
    total,
    status,
    onInputChange,
    formValidation,
    isFormValid,
    sendForm,
    fnClearInputs,
    fnSave
  }

  useEffect(() => {
    fnGetData();
  }, [])

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", onResetForm }

  return (
    {
      propsToDetailTable,
      propsToDetailTax,
      propsToMsgDelete
    }
  )
}
