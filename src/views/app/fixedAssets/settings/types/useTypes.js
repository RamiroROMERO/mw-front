import React, { useEffect, useState } from 'react'
import { useForm } from '@/hooks';
import { IntlMessagesFn, validInt } from '@/helpers/Utils';
import { request } from '@/helpers/core';

export const useTypes = ({ setLoading }) => {
  const [tableData, setTableData] = useState([]);
  const [accountList, setAccountList] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const validation = {
    code: [(val) => val.length >= 3, IntlMessagesFn("page.fixedAssets.validation.code")],
    name: [(val) => val.length >= 5, IntlMessagesFn("page.fixedAssets.validation.name")],
    userLife: [(val) => validInt(val) !== 0, IntlMessagesFn("page.fixedAssets.validation.userLife")],
    depreciationTypeId: [(val) => validInt(val) !== 0, IntlMessagesFn("page.fixedAssets.validation.depreciationTypeId")],
    residualValue: [(val) => validInt(val) > 0 && validInt(val) <= 100, IntlMessagesFn("page.fixedAssets.validation.residualValuePercent")]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0,
    code: '',
    name: '',
    userLife: 0,
    currentCode: '',
    residualValue: 0,
    depreciationTypeId: 0,
    accDepreciation: '',
    accCost: '',
    status: 1
  }, validation);

  const { id } = formState;

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
      request.POST('fixedAssets/settings/types', formState, () => {
        setLoading(false);
        fnGetTableData();
        fnClear();
      }, (err) => {
        console.log(err);
        setLoading(false);
      })
    } else {
      request.PUT(`fixedAssets/settings/types/${id}`, formState, () => {
        setLoading(false);
        fnGetTableData();
        fnClear();
      }, (err) => {
        console.log(err);
        setLoading(false);
      });
    }
  };

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    const data = {
      status: 0
    }
    if (formState.id && formState.id > 0) {
      setLoading(true);
      request.PUT(`fixedAssets/settings/types/${formState.id}`, data, () => {
        fnGetTableData();
        fnClear();
        setLoading(false);
      }, (err) => {
        console.error(err);
        setLoading(false);
      });
    }
  }

  const fnGetData = () => {

    request.getJSON("accounting/settings/accountants/getSL", {}, (resp) => {
      const { data } = resp;
      const list = data.map(item => {
        item.value = item.cta;
        item.label = `${item.cta}-${item.nombre}`;
        return item;
      });
      setAccountList(list);
    });
  }

  const fnGetTableData = () => {
    setLoading(true);
    request.GET('fixedAssets/settings/types', (resp) => {
      const { data } = resp;
      setTableData(data);
      setLoading(false);
    }, err => {
      console.log(err)
      setLoading(false);
    });
  }

  useEffect(() => {
    fnGetData();
    fnGetTableData();
  }, []);

  const propsToMsgDelete = {
    title: "alert.question.title",
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDisableDocument,
    fnOnNo: onResetForm
  };

  const propsToDetailTable = {
    tableData,
    onBulkForm,
    setOpenMsgQuestion
  }

  const propsToDetail = {
    formState,
    accountList,
    formValidation,
    onInputChange,
    fnSave: fnSaveDocument,
    isFormValid,
    sendForm,
    fnClear
  };

  return {
    propsToDetail,
    propsToMsgDelete,
    propsToDetailTable
  }
}
