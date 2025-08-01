import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks/useForms';
import React, { useEffect, useState } from 'react'

export const useTaxDocuments = ({setLoading}) => {

  const [listCompany, setlistCompany] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const taxDocumentsValid = {
    name: [(val) => val.length > 5, "msg.required.input.name"],
    description: [(val) => val.length > 5, "msg.required.input.description"],
    companyId: [(val) => validInt(val) > 0, "msg.required.input.company"],
    cai1: [(val) => val.length === 6, "msg.required.input.cai"],
    cai2: [(val) => val.length === 6, "msg.required.input.cai"],
    cai3: [(val) => val.length === 6, "msg.required.input.cai"],
    cai4: [(val) => val.length === 6, "msg.required.input.cai"],
    cai5: [(val) => val.length === 6, "msg.required.input.cai"],
    cai6: [(val) => val.length === 2, "msg.required.input.cai"],
    ndoc1: [(val) => val.length === 3, "msg.required.input.correlative"],
    ndoc2: [(val) => val.length === 3, "msg.required.input.correlative"],
    ndoc3: [(val) => val.length === 2, "msg.required.input.correlative"],
    ndoc4: [(val) => val.length === 8, "msg.required.input.correlative"],
    limitDate: [(val) => val !== "", "msg.required.input.limitDate"],
    noRange: [(val) => val.length > 0 && val.length <= 42, "msg.required.input.noRange"]
  }

  const { formState, formValidation, isFormValid, onInputChange, onResetForm, onBulkForm } = useForm({
    id: 0,
    name: '',
    description: '',
    companyId: 0,
    cai1: '',
    cai2: '',
    cai3: '',
    cai4: '',
    cai5: '',
    cai6: '',
    ndoc1: '',
    ndoc2: '',
    ndoc3: '',
    ndoc4: '',
    limitDate: '',
    noRange: '',
    minDoctos: '',
    status: true
  }, taxDocumentsValid);

  const fnGetData = () => {
    setLoading(true);
    request.GET('admin/taxDocuments', (resp) => {
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

    formState.limitDate = formState.limitDate === '' ? "1900-01-01" : formState.limitDate

    if (formState.id > 0) {
      setLoading(true);
      request.PUT(`admin/taxDocuments/${formState.id}`, formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('admin/taxDocuments', formState, () => {
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
      request.PUT(`admin/taxDocuments/${formState.id}`, data, () => {
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
    request.GET('admin/companies/', (resp) => {
      const company = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      });
      setlistCompany(company);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    fnGetData();


  }, []);

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
    listCompany,
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
