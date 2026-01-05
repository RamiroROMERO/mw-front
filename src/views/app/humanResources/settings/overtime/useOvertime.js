import React, { useEffect, useState } from 'react';
import { request } from '@Helpers/core';
import { validFloat, validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks';
import notification from '@Containers/ui/Notifications';

export const useOvertime = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [dataOvertime, setDataOvertime] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const listWorkingDay = [{ id: 1, name: "Diurna" }, { id: 2, name: "Nocturna" }, { id: 3, name: "Mixta" }];

  const overtimeValidations = {
    journalId: [(val) => validInt(val) > 0, "msg.required.input.journalId"],
    percentValue: [(val) => validFloat(val) > 0, "msg.required.input.percent"],
    hourInit: [(val) => val !== "", "msg.required.input.hourInit"],
    hourEnd: [(val) => val !== "", "msg.required.input.hourEnd"]
  }

  const { formState, formValidation, isFormValid, onBulkForm, onInputChange, onResetForm } = useForm({
    id: 0,
    journalId: '',
    percentValue: '',
    hourInit: '',
    hourEnd: '',
    status: true
  }, overtimeValidations);

  const fnGetData = () => {
    setLoading(true);
    request.GET('rrhh/settings/overtimes', (resp) => {
      const data = resp.data.map((item) => {
        item.journalIdName = item.journalId === 1 ? "Diurna" : item.journalId === 2 ? "Nocturna" : "Mixta"
        item.percentValueItem = validInt(item.percentValue)
        item.statusIcon = validInt(item.status) === 1 ? <i className="medium-icon bi bi-check2-square" /> : <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataOvertime(data);
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

    if (formState.id > 0) {
      if (fnUpdate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.PUT(`rrhh/settings/overtimes/${formState.id}`, formState, () => {
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
      request.POST('rrhh/settings/overtimes', formState, () => {
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
      request.PUT(`rrhh/settings/overtimes/${formState.id}`, data, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const propsToDetailOvertime = {
    ...formState,
    listWorkingDay,
    onInputChange,
    sendForm,
    formValidation,
    fnSave,
    fnClearInputs
  }

  const propsToDetailTable = {
    dataOvertime,
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
      propsToDetailOvertime,
      propsToDetailTable,
      propsToMsgDelete
    }
  )
}
