import React, { useEffect, useState } from 'react'
import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks/useForms';
import notification from '@Containers/ui/Notifications';

export const useRoomStatus = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [dataStatus, setDataStatus] = useState([]);
  const [sendForm, setSendForm] = useState(false);

  const validation = {
    name: [(val) => val.length > 4, "msg.required.input.name"],
    color: [(val) => val.length > 4, "msg.required.input.color"]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0,
    name: '',
    color: '',
    status: true
  }, validation);

  const { id } = formState;

  const fnGetData = () => {
    setLoading(true);
    request.GET('hotel/settings/roomStatus', (resp) => {
      const data = resp.data.map((item) => {
        item.statusIcon = (validInt(item.status) === 1 || item.status === true) ? <i className="medium-icon bi bi-check2-square" /> : <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataStatus(data);
      setLoading(false);
    }, err => {
      console.log(err)
      setLoading(false);
    });
  }

  const fnClear = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (validInt(id) === 0) {
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.POST('hotel/settings/roomStatus', formState, () => {
        setLoading(false);
        fnGetData();
        fnClear();
      }, (err) => {
        console.log(err);
        setLoading(false);
      })
    } else {
      if (fnUpdate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.PUT(`hotel/settings/roomStatus/${id}`, formState, () => {
        setLoading(false);
        fnGetData();
        fnClear();
      }, (err) => {
        console.log(err);
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
      request.PUT(`hotel/settings/roomStatus/${formState.id}`, data, () => {
        fnGetData();
        fnClear();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    fnGetData();
  }, []);

  const propsToMsgDisable = {
    title: "alert.question.disable",
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDisableDocument,
    fnOnNo: () => onResetForm
  };

  const propsToDetail = {
    formState,
    formValidation,
    sendForm,
    onInputChange,
    fnSaveDocument,
    fnClear
  }

  const propsToDetailTable = {
    dataStatus,
    onBulkForm,
    setOpenMsgQuestion,
    fnDelete
  }

  return (
    {
      propsToDetail,
      propsToDetailTable,
      propsToMsgDisable
    }
  )
}
