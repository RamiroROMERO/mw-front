import React, { useEffect, useState } from 'react';
import { validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import { useForm } from '@Hooks';
import notification from '@Containers/ui/Notifications';

export const useFaultTypes = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [dataFaultTypes, setDataFaultTypes] = useState([]);
  const [typesFault, setTypesFault] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const faulTypesValidations = {
    name: [(val) => val !== "", "msg.required.input.name"],
    faulClassificationId: [(val) => validInt(val) > 0, "msg.required.input.faulClassification"]
  }

  const { formState, formValidation, isFormValid, onBulkForm, onResetForm, onInputChange } = useForm({
    id: 0,
    faulClassificationId: '',
    name: '',
    status: true
  }, faulTypesValidations);

  const { id, faulClassificationId, name, status } = formState;

  const fnGetData = () => {
    setLoading(true);
    request.GET('rrhh/settings/faulTypes', (resp) => {
      const data = resp.data.map((item) => {
        item.classificationName = item.rrhhFaulClassification?.name || ''
        item.statusIcon = validInt(item.status) === 1 ? <i className="medium-icon bi bi-check2-square" /> : <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataFaultTypes(data);
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

    if (id > 0) {
      if (fnUpdate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.PUT(`rrhh/settings/faulTypes/${id}`, formState, () => {
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
      request.POST('rrhh/settings/faulTypes', formState, () => {
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
      request.PUT(`rrhh/settings/faulTypes/${formState.id}`, data, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  useEffect(() => {
    setLoading(true);
    request.GET('rrhh/settings/faulClassifications', (resp) => {
      const company = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setTypesFault([{ value: 0, label: 'Seleccione' }, ...company]);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    fnGetData();
  }, []);

  const propsToDetailTable = {
    dataFaultTypes,
    onBulkForm,
    setOpenMsgQuestion,
    fnDelete
  }

  const propsToDetailTypes = {
    id,
    faulClassificationId,
    name,
    status,
    onInputChange,
    typesFault,
    sendForm,
    formValidation,
    fnSave,
    fnClearInputs
  }

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", onResetForm }

  return (
    {
      propsToDetailTable,
      propsToDetailTypes,
      propsToMsgDelete
    }
  )
}
