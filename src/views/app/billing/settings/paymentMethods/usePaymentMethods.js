import React, { useEffect, useState } from 'react'
import { validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks/useForms';
import { request } from '@Helpers/core';

export const usePaymentMethods = ({ setLoading }) => {
  const [tableData, setTableData] = useState([]);
  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [openModalDetail, setOpenModalDetail] = useState(false);

  const paymentMethodsValid = {
    name: [(val) => val !== "", "msg.required.input.name"],
    usageCriteria: [(val) => validInt(val) > 0, "msg.required.input.critUsageType"],
    usageType: [(val) => validInt(val) > 0, "msg.required.input.useType"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    name: '',
    usageType: 0,
    usageCriteria: 0,
    isDefault: false
  }, paymentMethodsValid);

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('admin/paymentTypes', (resp) => {
      const { data } = resp;
      setTableData(data);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    const data = {
      status: 0
    }

    if (formState.id && formState.id > 0) {
      setLoading(true);
      request.PUT(`admin/paymentTypes/${formState.id}`, data, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    if (formState && formState.id > 0) {
      setLoading(true);
      request.PUT(`admin/paymentTypes/${formState.id}`, formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('admin/paymentTypes', formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {

        setLoading(false);
      });
    }
  }

  const fnViewDetail = () => {
    if (validInt(formState.id) === 0) return;
    setOpenModalDetail(true);
  }

  useEffect(() => {
    fnGetData();
  }, [])

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", onResetForm }

  const propsToDetailTable = {
    tableData,
    onBulkForm,
    setOpenMsgQuestion
  }

  const propsToDetail = {
    formState,
    formValidation,
    isFormValid,
    sendForm,
    onInputChange,
    fnClearInputs,
    fnSave,
    fnViewDetail
  };

  return {
    recordId: formState.id,
    propsToMsgDelete,
    propsToDetail,
    propsToDetailTable,
    openModalDetail,
    setOpenModalDetail
  }
}
