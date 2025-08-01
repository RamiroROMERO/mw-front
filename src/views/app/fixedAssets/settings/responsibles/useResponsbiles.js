import React, { useEffect, useState } from 'react'
import { useForm } from '@/hooks';
import { IntlMessagesFn, validInt } from '@/helpers/Utils';
import { request } from '@/helpers/core';

export const useResponsibles = ({ setLoading }) => {

  const [tableData, setTableData] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const validation = {
    companyId: [(val) => validInt(val) !== 0, IntlMessagesFn("page.validation.companyId")],
    areaId: [(val) => validInt(val) !== 0, IntlMessagesFn("page.validation.areaId")],
    name: [(val) => val.length > 8, IntlMessagesFn("page.validation.name")]
  };

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0,
    companyId: 0,
    areaId: 0,
    name: '',
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
      request.POST('fixedAssets/settings/responsibles', formState, () => {
        setLoading(false);
        fnGetTableData();
        fnClear();
      }, (err) => {
        console.log(err);
        setLoading(false);
      })
    } else {
      request.PUT(`fixedAssets/settings/responsibles/${id}`, formState, () => {
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
      request.PUT(`fixedAssets/settings/responsibles/${id}`, data, () => {
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
    request.getJSON("admin/companies/getSL", {}, (resp) => {
      const { data } = resp;
      const list = data.map(item => {
        item.value = item.id;
        item.label = item.name;
        return item;
      });
      setCompanyList(list);
    });
    request.getJSON("admin/areas", {}, (resp) => {
      const { data } = resp;
      const list = data.map(item => {
        item.value = item.cta;
        item.label = `${item.cta}-${item.nombre}`;
        return item;
      });
      setAreaList(list);
    });
  }

  const fnGetTableData = () => {
    setLoading(true);
    request.GET('fixedAssets/settings/responsibles', (resp) => {
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
    formValidation,
    onInputChange,
    fnClear,
    fnSave: fnSaveDocument,
    isFormValid,
    lists: { companyList, areaList },
    sendForm
  };

  return {
    propsToMsgDelete,
    propsToDetailTable,
    propsToDetail
  }
}
