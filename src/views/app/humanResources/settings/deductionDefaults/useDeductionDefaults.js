import { API_URLS } from '@/helpers/APIUrl';
import { request } from '@/helpers/core';
import { validFloat, validInt } from '@/helpers/Utils';
import { useForm } from '@/hooks';
import React, { useEffect, useState } from 'react'

export const useDeductionDefaults = ({ setLoading, screenControl }) => {
  const { fnCreate, fnUpdate, fnDelete } = screenControl;
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [listTypeDeductions, setListTypeDeductions] = useState([]);
  const [listProjects, setListProjects] = useState([]);
  const [data, setData] = useState([]);
  const [sendForm, setSendForm] = useState(false);

  const validation = {
    deductionTypeId: [(val) => validInt(val) > 0, "msg.required.select.deductionTypeId"],
    projectId: [(val) => validInt(val) > 0, "msg.required.select.project"],
    priceCeiling: [(val) => validInt(val) > 0, "msg.required.input.priceCeiling"],
    percent: [(val) => validInt(val) > 0, "msg.required.input.percent"]
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0,
    deductionTypeId: 0,
    priceCeiling: 0,
    percent: 0,
    isIhss: 0,
    isRap: 0,
    projectId: 0,
    status: true
  }, validation);

  const { id, priceCeiling, percent } = formState;

  const fnClear = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET(`${API_URLS.RRHH_SET_DEDUCTIONS_DEFAULT}`, (resp) => {
      const data = resp.data.map((item) => {
        item.deductionType = item.deductionTypeData?.name || ''
        item.projectName = item.projectData?.name || ''
        item.statusIcon = (validInt(item.status) === 1 || item.status === true) ? <i className="medium-icon bi bi-check2-square" /> : <i className="medium-icon bi bi-square" />
        return item;
      });
      setData(data);
      setLoading(false);
    }, err => {
      setLoading(false);
    });
  }

  const fnSaveDocument = () => {
    setSendForm(true);
    if (!isFormValid) {
      return;
    }

    formState.priceCeiling = validFloat(priceCeiling);
    formState.percent = validFloat(percent);

    if (validInt(id) === 0) {
      if (fnCreate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.POST(`${API_URLS.RRHH_SET_DEDUCTIONS_DEFAULT}`, formState, () => {
        setLoading(false);
        fnGetData();
        fnClear();
      }, (err) => {
        setLoading(false);
      })
    } else {
      if (fnUpdate === false) {
        notification('warning', 'msg.alert.unauthorizedUser', 'alert.warning.title');
        return;
      }
      request.PUT(`${API_URLS.RRHH_SET_DEDUCTIONS_DEFAULT}/${id}`, formState, () => {
        setLoading(false);
        fnGetData();
        fnClear();
      }, (err) => {
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
      request.PUT(`${API_URLS.RRHH_SET_DEDUCTIONS_DEFAULT}/${formState.id}`, data, () => {
        fnGetData();
        fnClear();
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    fnGetData();

    setLoading(true);
    request.GET('rrhh/settings/deductionTypes/getSL', (resp) => {
      const data = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.id
        }
      })
      setListTypeDeductions(data);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });

    setLoading(true);
    request.GET('rrhh/process/projects', (resp) => {
      const projectsList = resp.data.map((item) => {
        return {
          id: item.id,
          label: `${item.code}| ${item.name}`,
          value: item.id
        }
      });
      setListProjects(projectsList);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }, []);

  const propsToMsgDelete = {
    title: "alert.question.title",
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnDisableDocument,
    fnOnNo: onResetForm
  };

  const propsToDetail = {
    formState,
    onInputChange,
    formValidation,
    sendForm,
    listTypeDeductions,
    listProjects,
    fnSaveDocument,
    fnClear
  }

  const propsToDetailTable = {
    data,
    onBulkForm,
    setOpenMsgQuestion,
    fnDelete
  }

  return (
    {
      propsToMsgDelete,
      propsToDetail,
      propsToDetailTable
    }
  )
}
