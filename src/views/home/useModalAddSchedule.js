import React, { useEffect, useState } from 'react'
import { validInt, IntlMessages } from '@Helpers/Utils';
import { useForm } from '@Hooks/useForms';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

export const useModalAddSchedule = ({projectId, currentItem, setLoading, fnGetData, setOpen}) => {
  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const projectsValid = {
    turnId: [(val) => validInt(val) > 0, "msg.required.select.turnId"],
    dateStart: [(val) => val !== '', "msg.required.select.dateStart"],
    dateEnd: [(val) => val !== '', "msg.required.select.dateOut"],
    typeId: [(val) => validInt(val) > 0, "msg.required.select.typeId"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: currentItem?.idWorkSheduling || 0,
    projectId: currentItem?.projectId || projectId,
    turnId: currentItem?.turnId || 0,
    dateStart: currentItem?.dateStart || '',
    dateEnd: currentItem?.dateEnd || '',
    typeId: currentItem?.typeId || 0
  }, projectsValid);

  const {id} = formState;

  const [table, setTable] = useState({
    title: IntlMessages("page.home.table.detail.title"),
    columns: [
      {
        text: IntlMessages("select.employee"),
        dataField: "employee",
        headerStyle: { width: "35%" }
      }
    ],
    data: [],
    options: {
      pageSize: 5,
      enabledRowSelection: false,
      enabledActionButtons: false,
    },
    actions: []
  });

  const fnGetDataDetail = () => {
    setLoading(true);
    request.GET(`rrhh/process/workSchedulingDetails/groupByEmpl?idFather=${id}`, (resp) => {
      const projectDeta = resp.data.map((item) => {
        item.employee = `${item.rrhhEmployee?.firstName || ''} ${item.rrhhEmployee?.secondName || ''} ${item.rrhhEmployee?.lastName || ''} ${item.rrhhEmployee?.secondLastName || ''}`
        return item;
      });
      setTable({ ...table, data: projectDeta });
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (id === 0) {
      setLoading(true);
      request.POST('rrhh/process/workSchedulings', formState, (resp) => {
        fnGetData();
        onResetForm();
        setSendForm(false);
        setOpen(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        notification('error', err.messages[0].description, 'alert.error.title', '', 0);
        setLoading(false);
      }, false);
    } else {
      setLoading(true);
      request.PUT(`rrhh/process/workSchedulings/${id}`, formState, () => {
        fnGetData();
        onResetForm();
        setSendForm(false);
        setOpen(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnConfirmGenerateDetail = () => {
    setOpenMsgQuestion(true);
  }

  const fnGenerateDetail = () => {
    setOpenMsgQuestion(false);
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (id > 0) {
      setLoading(true);
      request.POST('rrhh/process/workSchedulings/createWithDetail', formState, (resp) => {
        fnGetData();
        onResetForm();
        setSendForm(false);
        setOpen(false);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    fnGetDataDetail();
  }, []);

  const propsToMsgConfirm = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnGenerateDetail,
    title: "page.home.alert.question.title",
    fnOnNo: onResetForm
  }

  return (
    {
      table,
      formState,
      formValidation,
      sendForm,
      propsToMsgConfirm,
      onInputChange,
      fnSave,
      fnConfirmGenerateDetail
    }
  )
}
