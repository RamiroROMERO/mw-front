import React, { useEffect, useState } from 'react';
import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks/useForms';
import notification from '@/containers/ui/Notifications';

export const useInternalDocuments = ({ setLoading }) => {
  const [listComp, setListComp] = useState([]);
  const [listTaxDoc, setListTaxDoc] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const itemsCodesValid = {
    code: [(val) => val !== "", "msg.required.input.code"],
    name: [(val) => val !== "", "msg.required.input.name"],
    title: [(val) => val !== "", "msg.required.input.title"],
    companyId: [(val) => validInt(val) > 0, "msg.required.input.company"]
  }

  const { formState, formValidation, isFormValid, onBulkForm, onResetForm, onInputChange } = useForm({
    id: 0,
    code: '',
    name: '',
    type: 0,
    title: '',
    codeInt: '',
    useTaxDocument: false,
    companyId: 0,
    taxDocumentId: 0,
    isReportBank: false,
    useBill: 0,
    useAcc: 0,
    useFixass: 0,
    useInv: 0,
    useTax: 0,
    useBank: 0,
    bankCheck: false,
    bankTransfer: false,
    bankDepo: false,
    bankNcd: false,
    bankExpense: false,
    status: true,
    notes1: '',
    notes2: '',
  }, itemsCodesValid);

  const { id, useBill, useAcc, useFixass, useInv, useTax, useBank } = formState;

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('admin/documents', (resp) => {
      const data = resp.data;
      setTableData(data);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    const data = {
      status: 0
    }
    if (formState.id && formState.id > 0) {
      setLoading(true);
      request.PUT(`admin/documents/${formState.id}`, data, () => {
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

    if ((useBill === 0 || useBill === false) && (useInv === 0 || useInv === false) && (useAcc === 0 || useAcc === false)
      && (useTax === 0 || useTax === false) && (useFixass === 0 || useFixass === false) && (useBank === 0 || useBank === false)) {
      notification('warning', 'msg.required.check.useArea', 'alert.warning.title');
      return;
    }

    if (id > 0) {
      setLoading(true);
      request.PUT(`admin/documents/${id}`, formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('admin/documents', formState, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    setLoading(true);
    request.GET('admin/companies', (resp) => {
      const companies = resp.data;
      setListComp(companies)
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });

    setLoading(true);
    request.GET('admin/taxDocuments', (resp) => {
      const setTaxDoc = resp.data;
      setListTaxDoc(setTaxDoc)
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });

    fnGetData();
  }, [])

  const propsToMsgDelete = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDisableDocument,
    title: "alert.question.title",
    onResetForm
  }

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
    listComp,
    listTaxDoc,
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
