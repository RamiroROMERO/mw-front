import React, { useEffect, useState } from 'react';
import { validFloat } from '@Helpers/Utils';
import { useForm } from '@Hooks';
import { request } from '@Helpers/core'
import notification from '@Containers/ui/Notifications';

export const useTaxCalculation = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [dataCalculation, setDataCalculation] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const taxCalculationValidations = {
    rangeInit: [(val) => validFloat(val) > 0, "msg.required.input.rangeInit"],
    rangeEnd: [(val) => validFloat(val) > 0, "msg.required.input.rangeEnd"]
  }

  const { formState, formValidation, isFormValid, onResetForm, onBulkForm, onInputChange } = useForm({
    id: 0,
    rangeInit: "",
    rangeEnd: "",
    differValue: "",
    percentValue: "",
    total: "",
    status: true
  }, taxCalculationValidations)

  const { id, rangeInit, rangeEnd, differValue, percentValue, total, status } = formState;

  const fnGetData = () => {
    setLoading(true);
    request.GET('rrhh/settings/setISR', (resp) => {
      const data = resp.data;
      setDataCalculation(data);
      setLoading(false);
    }, (err) => {

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
      differValue: validFloat(differValue),
      percentValue: validFloat(percentValue),
      total: validFloat(total),
      status
    }
    if (id > 0) {
      if (fnUpdate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.PUT(`rrhh/settings/setISR/${id}`, data, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.POST('rrhh/settings/setISR', data, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {

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
      request.PUT(`rrhh/settings/setISR/${formState.id}`, data, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const propsToDetailCalculation = {
    id,
    rangeInit,
    rangeEnd,
    differValue,
    percentValue,
    total,
    status,
    onInputChange,
    sendForm,
    formValidation,
    fnClearInputs,
    fnSave
  }

  const propsToDetailTable = {
    dataCalculation,
    onBulkForm,
    setOpenMsgQuestion,
    fnDelete
  }

  useEffect(() => {
    fnGetData();
  }, [])

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", onResetForm }

  return (
    {
      propsToDetailCalculation,
      propsToDetailTable,
      propsToMsgDelete
    }
  )
}
