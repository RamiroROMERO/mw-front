import React, { useEffect, useState } from 'react'
import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import { useForm } from '@Hooks/useForms';

export const useDaysTypes = ({ setLoading }) => {
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [listAccount, setListAccount] = useState([]);
  const [dataDaysTypes, setDataDaysTypes] = useState([]);
  const [sendForm, setSendForm] = useState(false);

  const validation = {
    name: [(val) => val.length > 4, "msg.required.input.name"]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0,
    name: '',
    noAccount: '',
    status: true
  }, validation);

  const { id } = formState;

  const fnGetData = () => {
    setLoading(true);
    request.GET('rrhh/settings/payrollDayTypes', (resp) => {
      const data = resp.data.map((item) => {
        item.ctaAccount = item.contCta?.name || ''
        item.statusIcon = (validInt(item.status) === 1 || item.status === true) ? <i className="medium-icon bi bi-check2-square" /> : <i className="medium-icon bi bi-square" />
        return item;
      });
      setDataDaysTypes(data);
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

    setLoading(true);
    if (validInt(id) === 0) {
      request.POST('rrhh/settings/payrollDayTypes', formState, () => {
        setLoading(false);
        fnGetData();
        fnClear();
      }, (err) => {
        console.log(err);
        setLoading(false);
      })
    } else {
      request.PUT(`rrhh/settings/payrollDayTypes/${id}`, formState, () => {
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
      request.PUT(`rrhh/settings/payrollDayTypes/${formState.id}`, data, () => {
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
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const propsToMsgDelete = {
    title: "alert.question.title",
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDisableDocument,
    fnOnNo: () => onResetForm
  };

  const propsToDetail = {
    formState,
    listAccount,
    onInputChange,
    formValidation,
    sendForm,
    fnSaveDocument,
    fnClear
  }

  const propsToDetailTable = {
    dataDaysTypes,
    onBulkForm,
    setOpenMsgQuestion
  }

  return (
    {
      propsToDetail,
      propsToDetailTable,
      propsToMsgDelete
    }
  )
}
