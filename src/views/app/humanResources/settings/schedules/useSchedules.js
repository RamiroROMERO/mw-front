import React, { useEffect, useState } from 'react'
import { validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import { useForm } from '@Hooks';
import notification from '@Containers/ui/Notifications';

export const useSchedules = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [dataSchedules, setDataSchedules] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const { formState, onBulkForm, onResetForm, onInputChange } = useForm({
    id: 0,
    name: '',
    d1Status: 0,
    d1HourIn: '',
    d1HourOut: '',
    d2Status: 0,
    d2HourIn: '',
    d2HourOut: '',
    d3Status: 0,
    d3HourIn: '',
    d3HourOut: '',
    d4Status: 0,
    d4HourIn: '',
    d4HourOut: '',
    d5Status: 0,
    d5HourIn: '',
    d5HourOut: '',
    d6Status: 0,
    d6HourIn: '',
    d6HourOut: '',
    d7Status: 0,
    d7HourIn: '',
    d7HourOut: '',
    timeOffIn: 0,
    timeOffOut: 0,
    nightly: 0,
    breaktimeOut: '',
    breaktimeIn: '',
    color: '',
    status: 1
  })

  const { id, name, d1Status, d1HourIn, d1HourOut, d2Status, d2HourIn, d2HourOut, d3Status, d3HourIn, d3HourOut, d4Status,
    d4HourIn, d4HourOut, d5Status, d5HourIn, d5HourOut, d6Status, d6HourIn, d6HourOut, d7Status, d7HourIn, d7HourOut, timeOffIn, timeOffOut, nightly, breaktimeIn, breaktimeOut, color, status } = formState;

  const fnGetData = () => {
    setLoading(true);
    request.GET('rrhhSchedules', (resp) => {
      const data = resp.data.map((item) => {
        item.statusIcon = validInt(item.status) === 1 ? <i className="medium-icon bi bi-check2-square" /> : <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataSchedules(data);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnSave = () => {
    if (name === '') {
      notification('warning', 'msg.required.input.name', 'alert.warning.title');
      return;
    }

    if ((d1Status === 0 || d1Status === false) && (d2Status === 0 || d2Status === false) && (d3Status === 0 || d3Status === false)
      && (d4Status === 0 || d4Status === false) && (d5Status === 0 || d5Status === false) && (d6Status === 0 || d6Status === false)
      && (d7Status === 0 || d7Status === false)) {
      notification('warning', 'msg.required.input.day', 'alert.warning.title');
      return;
    }
    if (d1Status === true && d1HourIn === '') {
      notification('warning', 'msg.required.input.hourInit', 'alert.warning.title');
      return;
    }
    if (d1Status === true && d1HourOut === '') {
      notification('warning', 'msg.required.input.hourEnd', 'alert.warning.title');
      return;
    }
    if (d2Status === true && d2HourIn === '') {
      notification('warning', 'msg.required.input.hourInit', 'alert.warning.title');
      return;
    }
    if (d2Status === true && d2HourOut === '') {
      notification('warning', 'msg.required.input.hourEnd', 'alert.warning.title');
      return;
    }
    if (d3Status === true && d3HourIn === '') {
      notification('warning', 'msg.required.input.hourInit', 'alert.warning.title');
      return;
    }
    if (d3Status === true && d3HourOut === '') {
      notification('warning', 'msg.required.input.hourEnd', 'alert.warning.title');
      return;
    }
    if (d4Status === true && d4HourIn === '') {
      notification('warning', 'msg.required.input.hourInit', 'alert.warning.title');
      return;
    }
    if (d4Status === true && d4HourOut === '') {
      notification('warning', 'msg.required.input.hourEnd', 'alert.warning.title');
      return;
    }
    if (d5Status === true && d5HourIn === '') {
      notification('warning', 'msg.required.input.hourInit', 'alert.warning.title');
      return;
    }
    if (d5Status === true && d5HourOut === '') {
      notification('warning', 'msg.required.input.hourEnd', 'alert.warning.title');
      return;
    }
    if (d6Status === true && d6HourIn === '') {
      notification('warning', 'msg.required.input.hourInit', 'alert.warning.title');
      return;
    }
    if (d6Status === true && d6HourOut === '') {
      notification('warning', 'msg.required.input.hourEnd', 'alert.warning.title');
      return;
    }
    if (d7Status === true && d7HourIn === '') {
      notification('warning', 'msg.required.input.hourInit', 'alert.warning.title');
      return;
    }
    if (d7Status === true && d7HourOut === '') {
      notification('warning', 'msg.required.input.hourEnd', 'alert.warning.title');
      return;
    }
    const data = {
      id,
      name,
      d1Status,
      d1HourIn,
      d1HourOut,
      d2Status,
      d2HourIn,
      d2HourOut,
      d3Status,
      d3HourIn,
      d3HourOut,
      d4Status,
      d4HourIn,
      d4HourOut,
      d5Status,
      d5HourIn,
      d5HourOut,
      d6Status,
      d6HourIn,
      d6HourOut,
      d7Status,
      d7HourIn,
      d7HourOut,
      timeOffIn,
      timeOffOut,
      nightly,
      breaktimeIn,
      breaktimeOut,
      color,
      status
    }
    if (id > 0) {
      if (fnUpdate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.PUT(`rrhhSchedules/${id}`, data, () => {
        fnGetData();
        onResetForm();
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
      request.POST('rrhhSchedules', data, () => {
        fnGetData();
        onResetForm();
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
      request.PUT(`rrhhSchedules/${formState.id}`, data, () => {
        fnGetData();
        onResetForm();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const propsToDetailSchedules = { ...formState, onInputChange, onResetForm, fnSave }

  const propsToDetailTable = {
    dataSchedules, onBulkForm, setOpenMsgQuestion, fnDelete
  }

  useEffect(() => {
    fnGetData();
  }, [])

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", onResetForm }

  return (
    {
      propsToMsgDelete,
      propsToDetailSchedules,
      propsToDetailTable
    }
  )
}
