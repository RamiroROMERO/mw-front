import React, { useEffect, useState } from 'react'
import { request } from '@Helpers/core';
import { useForm } from '@Hooks/useForms';

export const useCurrency = ({setLoading}) => {
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const listDecimalMark = [{ id: ".", name: ". (Punto)" }, { id: ",", name: ", (Coma)" }];
  const listThousandSeparator = [{ id: ".", name: ". (Punto)" }, { id: ",", name: ", (Coma)" }];
  const [tableData, setTableData] = useState([]);

  const currencyValid = {
    name: [(val) => val !== "", "msg.required.input.name"],
    code: [(val) => val.length > 0 && val.length < 5, "msg.required.input.suffix"],
    decimalMark: [(val) => val !== "", "msg.required.input.deciamalMark"],
    simbol: [(val) => val !== "", "msg.required.input.simbol"],
    thousandSeparator: [(val) => val !== "", "msg.required.input.thousandSeparador"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    name: '',
    code: '',
    decimalMark: '',
    simbol: '',
    thousandSeparator: '',
    national: false,
    status: true
  }, currencyValid);

  const fnGetData = () => {
    setLoading(true);
    request.GET('admin/currencies', (resp) => {
      const data = resp.data;
      setTableData(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
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

    if (formState.id > 0) {
      setLoading(true);
      request.PUT(`admin/currencies/${formState.id}`, formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('admin/currencies', formState, () => {
        fnClearInputs();
        fnGetData();
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
      request.PUT(`admin/currencies/${formState.id}`, data, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
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
    listDecimalMark,
    listThousandSeparator,
    onInputChange,
    fnSave,
    fnClearInputs
  };

  return (
    {
      propsToDetail,
      propsToDetailTable,
      propsToMsgDelete
    }
  )
}
