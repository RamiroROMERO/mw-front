import { request } from '@Helpers/core';
import { useForm } from '@Hooks/useForms';
import React, { useEffect, useState } from 'react'

export const useCustomerTypes = ({setLoading}) => {
  const [listAccount, setListAccount] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const customerTypesValid = {
    name: [(val) => val.length > 5, "msg.required.input.name"],
    idCtaIng: [(val) => val !== "", "msg.required.select.idCtaIng"],
    idCtaCxp: [(val) => val !== "", "msg.required.select.idCtaCxc"],
    idCtaDesc: [(val) => val !== "", "msg.required.select.idCtaDesc"],
    idCtaIva: [(val) => val !== "", "msg.required.select.idCtaIva"]
  }

  const { formState, formValidation, isFormValid, onBulkForm, onResetForm, onInputChange } = useForm({
    id: 0,
    name: '',
    status: true,
    descrip: '',
    isCash: false,
    idCtaIng: '',
    idCtaCxp: '',
    idCtaDesc: '',
    idCtaBon: '',
    idCtaIva: '',
    idCtaFlete: '',
    idCtaOther: ''
  }, customerTypesValid);

  const fnGetData = () => {
    setLoading(true);
    request.GET('admin/customerTypes', (resp) => {
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
      request.PUT(`admin/customerTypes/${formState.id}`, formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('admin/customerTypes', formState, () => {
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
      request.PUT(`admin/customerTypes/${formState.id}`, data, () => {
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
    setLoading(true);
    request.GET('contAccountants/getSL', (resp) => {
      const account = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      setListAccount(account);
      setLoading(false);
      fnGetData();
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    fnGetData();
  }, [])

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", onInputChange }

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
    listAccount,
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
