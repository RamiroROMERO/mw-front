import React, { useEffect, useState } from 'react'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core'
import { validFloat, validInt } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';

export const useVacations = ({setLoading, screenControl}) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [dataVacations, setDataVacations] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const vacationsValidations = {
    name: [(val) => val !== "", "msg.required.input.description"],
    qtyYears: [(val) => validFloat(val) > 0, "msg.required.input.percent"],
    qtyDays: [(val) => val !== "", "msg.required.input.qtyDays"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onBulkForm, onResetForm } = useForm({
    id: 0,
    name: '',
    qtyYears: '',
    qtyDays: '',
    status: true
  }, vacationsValidations);

  const { id, name, qtyYears, qtyDays, status } = formState;

  const fnGetData = () => {
    setLoading(true);
    request.GET('rrhh/settings/setVacations', (resp) => {
      const data = resp.data.map((item) => {
        item.statusIcon = validInt(item.status) === 1 ? <i className="medium-icon bi bi-check2-square" /> : <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataVacations(data);
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

    if (id > 0) {
      if (fnUpdate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.PUT(`rrhh/settings/setVacations/${id}`, formState, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.POST('rrhh/settings/setVacations', formState, () => {
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
      request.PUT(`rrhh/settings/setVacations/${formState.id}`, data, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const propsToDetailVacations = {
    id,
    name,
    qtyYears,
    qtyDays,
    status,
    onInputChange,
    sendForm,
    formValidation,
    fnSave,
    fnClearInputs
  }

  const propsToDetailTable = {
    dataVacations,
    onBulkForm,
    setOpenMsgQuestion,
    fnDelete
  }

  useEffect(() => {
    fnGetData();
  }, []);

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", onResetForm }

  return (
    {
      propsToDetailTable,
      propsToDetailVacations,
      propsToMsgDelete
    }
  )
}
