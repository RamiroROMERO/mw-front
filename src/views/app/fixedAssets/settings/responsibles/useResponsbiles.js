import { useEffect, useState } from 'react'
import { useForm } from '@Hooks';
import { validInt } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import { buildResponsiblePayload, validateResponsible } from './responsibleRules';

// Cada campo se valida con las mismas reglas del back (responsibleRules.js); el mensaje es la clave de traducción de la regla (la traduce el campo).
const BASE = { name: 'abcdefghij', areaId: 1 };
const rule = (field) => [(val) => validateResponsible({ ...BASE, [field]: val })[field] === undefined, validateResponsible({ ...BASE, [field]: '' })[field]];

export const useResponsibles = ({ setLoading }) => {

  const [tableData, setTableData] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);

  const validation = {
    areaId: rule('areaId'),
    name: rule('name')
  };

  const { formState, onInputChange, onResetForm, onBulkForm, formValidation, isFormValid } = useForm({
    id: 0,
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
      request.POST('fixedAssets/settings/responsibles', buildResponsiblePayload(formState), () => {
        setLoading(false);
        fnGetTableData();
        fnClear();
      }, (err) => {
        setLoading(false);
      })
    } else {
      request.PUT(`fixedAssets/settings/responsibles/${id}`, buildResponsiblePayload(formState), () => {
        setLoading(false);
        fnGetTableData();
        fnClear();
      }, (err) => {
        setLoading(false);
      });
    }
  };

  // Eliminar borra al responsable solo si no tiene activos asignados (el back rechaza con su mensaje y se queda); "Activo" lo saca de los combos sin eliminarlo.
  const fnRemoveDocument = () => {
    setOpenMsgQuestion(false);
    if (formState.id && formState.id > 0) {
      setLoading(true);
      request.DELETE(`fixedAssets/settings/responsibles/${formState.id}`, () => {
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
    // Departamentos activos de la empresa (admin_areas); el combo usa { id, name }.
    request.getJSON('fixedAssets/settings/responsibles/areas', {}, (resp) => {
      setAreaList((resp.data || []).map((item) => ({ id: item.id, name: item.name })));
    });
  }

  const fnGetTableData = () => {
    setLoading(true);
    request.GET('fixedAssets/settings/responsibles', (resp) => {
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
    formValidation,
    onInputChange,
    fnClear,
    fnSave: fnSaveDocument,
    isFormValid,
    lists: { areaList },
    sendForm
  };

  return {
    propsToMsgDelete,
    propsToDetailTable,
    propsToDetail
  }
}
