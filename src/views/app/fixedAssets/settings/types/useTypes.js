import { useEffect, useState } from 'react'
import { useForm } from '@Hooks';
import { validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import { buildTypePayload, validateType } from './typeRules';

// Cada campo se valida con las mismas reglas del back (typeRules.js); el mensaje es la clave de traducción de la regla (la traduce el campo).
const BASE = { code: 'A', name: 'abcde', userLife: 1, residualValue: 1, depreciationTypeId: 1, depreciationCtaCode: '1', costCtaCode: '1' };
const rule = (field) => [(val) => validateType({ ...BASE, [field]: val })[field] === undefined, validateType({ ...BASE, [field]: '' })[field]];

export const useTypes = ({ setLoading }) => {
  const [tableData, setTableData] = useState([]);
  const [accountList, setAccountList] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const validation = {
    code: rule('code'),
    name: rule('name'),
    userLife: rule('userLife'),
    depreciationTypeId: rule('depreciationTypeId'),
    residualValue: rule('residualValue'),
    depreciationCtaCode: rule('depreciationCtaCode'),
    costCtaCode: rule('costCtaCode')
  }

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0,
    code: '',
    name: '',
    userLife: 0,
    currentCode: '',
    residualValue: 0,
    depreciationTypeId: 1,
    depreciationCtaCode: '',
    costCtaCode: '',
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
      request.POST('fixedAssets/settings/types', buildTypePayload(formState), () => {
        setLoading(false);
        fnGetTableData();
        fnClear();
      }, (err) => {
        setLoading(false);
      })
    } else {
      request.PUT(`fixedAssets/settings/types/${id}`, buildTypePayload(formState), () => {
        setLoading(false);
        fnGetTableData();
        fnClear();
      }, (err) => {
        setLoading(false);
      });
    }
  };

  // Eliminar borra el tipo solo si ningún activo lo usa (el back rechaza con su mensaje y el tipo se queda); "Activo" lo saca de los combos sin eliminarlo.
  const fnRemoveDocument = () => {
    setOpenMsgQuestion(false);
    if (formState.id && formState.id > 0) {
      setLoading(true);
      request.DELETE(`fixedAssets/settings/types/${formState.id}`, () => {
        fnGetTableData();
        fnClear();
        setLoading(false);
      }, () => {
        fnClear();
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
    fnOnOk: fnRemoveDocument,
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
