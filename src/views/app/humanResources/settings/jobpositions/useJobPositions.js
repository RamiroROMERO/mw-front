import React, { useState, useEffect } from 'react'
import { request } from '@/helpers/core';
import { useForm } from '@/hooks';
import { validInt } from '@Helpers/Utils';
import notification from '@Containers/ui/Notifications';

export const useJobPositions = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [listLevel, setListLevel] = useState([]);
  const [openModalLevel, setOpenModalLevel] = useState(false);
  const [dataJobPosition, setDataJobPosition] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const jobPositionValid = {
    levelId: [(val) => val !== 0, "msg.required.select.levelId"],
    name: [(val) => val !== "", "msg.required.input.name"],
    // maxHours: [(val) => val !== 0, "msg.required.input.maxHours"]
  }

  const { formState, formValidation, isFormValid, onResetForm, onBulkForm, onInputChange } = useForm({
    id: 0,
    levelId: 0,
    name: '',
    description: '',
    maxHours: 0,
    status: 1
  }, jobPositionValid)

  const { id, levelId, name, description, maxHours, status } = formState;

  const fnGetData = () => {
    setLoading(true);
    request.GET('rrhh/settings/jobPositions', (resp) => {
      const data = resp.data.map((item) => {
        item.statusIcon = validInt(item.status) === 1 ? <i className="medium-icon bi bi-check2-square" /> : <i className="medium-icon bi bi-square" />
        item.levelName = item.rrhhJobPositionLevel?.name || '';
        return item;
      });
      setDataJobPosition(data);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnLevels = () => {
    setLoading(true)
    request.GET('rrhh/settings/jobPositionLevels?status=1', (resp) => {
      const employees = resp.data.map((item) => {
        return {
          value: item.id,
          label: item.name,
        }
      });
      employees.unshift({ value: '0', label: 'Seleccione' });
      setListLevel(employees);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    const newdata = {
      id,
      levelId,
      name,
      description,
      maxHours,
      status
    }
    if (id > 0) {
      if (fnUpdate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.PUT(`rrhh/settings/jobPositions/${id}`, newdata, () => {
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
      request.POST('rrhh/settings/jobPositions', newdata, () => {
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
      request.PUT(`rrhh/settings/jobPositions/${formState.id}`, data, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const fnFormLevel = () => {
    setOpenModalLevel(true);
  }

  const propsToDetailJobPosition = {
    id,
    levelId,
    name,
    description,
    maxHours,
    status,
    onInputChange,
    formValidation,
    sendForm,
    fnSave,
    listLevel,
    fnFormLevel,
    fnLevels,
    fnClearInputs
  }

  const propsToDetailTable = {
    fnDelete,
    dataJobPosition,
    onBulkForm,
    setOpenMsgQuestion,
  }

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", onResetForm }

  useEffect(() => {
    setLoading(true);
    fnLevels();
    fnGetData();
  }, []);

  return (
    {
      propsToMsgDelete,
      propsToDetailJobPosition,
      propsToDetailTable,
      openModalLevel,
      setOpenModalLevel,
      fnLevels
    }
  )
}
