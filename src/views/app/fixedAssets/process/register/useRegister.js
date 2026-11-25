import { useEffect, useState } from 'react';
import { useForm } from '@Hooks';
import DateHelper from '@Helpers/DateHelper';
import { request } from '@Helpers/core';
import { buildHeaderPayload, NULL_DATE, validateRegister } from './registerRules';

// Cada campo se valida con las mismas reglas del back (registerRules.js); el mensaje es la clave de traducción de la regla (la traduce el campo).
const BASE = { typeId: 1, condition: 'Nuevo', name: 'a', dateIn: '2000-01-01', valueBuy: 1, valueIn: 1 };
const rule = (field) => [(val) => validateRegister({ ...BASE, [field]: val })[field] === undefined, validateRegister({ ...BASE, [field]: '' })[field] ?? 'page.fixedAssets.msg.tooLong'];

const CONDITION_OPTIONS = [
  { value: 'Nuevo', label: 'Nuevo' },
  { value: 'Semi-Nuevo', label: 'Semi-Nuevo' },
  { value: 'Usado', label: 'Usado' },
  { value: 'Reparado', label: 'Reparado' },
  { value: 'Casa', label: 'Casa' }
];

export const useRegister = ({ setLoading }) => {
  const [typeList, setTypeList] = useState([]);
  const [lines, setLines] = useState([]);
  const [openModalView, setOpenModalView] = useState(false);
  const [codePreview, setCodePreview] = useState('');
  const [valueLocked, setValueLocked] = useState(false);
  const [openModalChange, setOpenModalChange] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [openModalDepreciation, setOpenModalDepreciation] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const validRegister = {
    typeId: rule('typeId'),
    condition: rule('condition'),
    name: rule('name'),
    dateIn: rule('dateIn'),
    dateBuy: rule('dateBuy'),
    valueBuy: rule('valueBuy'),
    valueIn: rule('valueIn')
  }

  const {
    formState: formStateIndex, onResetForm: onResetFormIndex, setBulkForm: setBulkFormIndex,
    onInputChange: onInputChangeIndex, isFormValid: isFormValidIndex, formValidation: formValidationIndex
  } = useForm({
    id: 0,
    typeId: '',
    code: '',
    name: '',
    condition: '',
    trademark: '',
    model: '',
    serial1: '',
    serial2: '',
    dateBuy: '',
    dateIn: '',
    providerName: '',
    invoiceNumber: '',
    valueBuy: 0,
    valueIn: 0,
    description: '',
    notes: '',
    isActive: 1
  }, validRegister);

  const { id, typeId } = formStateIndex;

  const fnNewRegister = () => {
    setSendForm(false);
    onResetFormIndex();
    setLines([]);
    setValueLocked(false);
  };

  const fnLoadRegister = (registerId) => {
    setLoading(true);
    request.GET(`fixedAssets/process/fixedAssets/${registerId}`, (resp) => {
      const { header, lines: lineData, valueLocked: locked } = resp.data;
      setBulkFormIndex({ ...header, dateBuy: String(header.dateBuy || '').slice(0, 10) === NULL_DATE ? '' : header.dateBuy });
      setLines(lineData);
      setValueLocked(!!locked);
      setSendForm(false);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnViewRegister = (row) => {
    setOpenModalView(false);
    fnLoadRegister(row.id);
  }

  const fnSearchRegister = () => setOpenModalView(true);

  // El código lo asigna el back al guardar (con el correlativo del tipo); aquí solo se muestra el siguiente número, sin consumirlo.
  useEffect(() => {
    setCodePreview('');
    if (id > 0 || !(Number(typeId) > 0)) return;
    request.GET(`fixedAssets/process/fixedAssets/generateCode?typeId=${typeId}`, (resp) => setCodePreview(resp.data.code), () => { });
  }, [typeId, id]);

  const fnSaveRegister = () => {
    setSendForm(true);
    if (!isFormValidIndex) return;

    setLoading(true);
    if (id > 0) {
      request.PUT(`fixedAssets/process/fixedAssets/${id}`, { header: buildHeaderPayload(formStateIndex) }, () => {
        fnLoadRegister(id);
        setLoading(false);
      }, () => setLoading(false));
    } else {
      request.POST('fixedAssets/process/fixedAssets', { header: buildHeaderPayload(formStateIndex) }, (resp) => {
        fnLoadRegister(resp.data.id);
        setLoading(false);
      }, () => setLoading(false));
    }
  }

  const fnOpenAddChange = () => {
    if (!(id > 0)) return;
    setEditingLine({ date: DateHelper.format(DateHelper.now()), description: '', value: 0 });
    setOpenModalChange(true);
  }

  const fnOpenEditChange = (line) => {
    if (!line.isEdit) return;
    setEditingLine(line);
    setOpenModalChange(true);
  }

  const fnSaveChangeLine = (data) => {
    setLoading(true);
    if (data.id) {
      request.PUT(`fixedAssets/process/fixedAssets/${id}/changes/${data.id}`, data, () => {
        setOpenModalChange(false);
        fnLoadRegister(id);
        setLoading(false);
      }, () => setLoading(false));
    } else {
      request.POST(`fixedAssets/process/fixedAssets/${id}/changes`, data, () => {
        setOpenModalChange(false);
        fnLoadRegister(id);
        setLoading(false);
      }, () => setLoading(false));
    }
  }

  const fnOpenDepreciation = () => {
    if (!(id > 0)) return;
    setOpenModalDepreciation(true);
  }

  const propsToControlPanel = {
    fnNew: fnNewRegister,
    fnSearch: fnSearchRegister,
    fnSave: fnSaveRegister,
    buttonsHome: [
      {
        title: 'page.fixedAssets.button.depreciation',
        icon: 'bi bi-graph-down',
        onClick: fnOpenDepreciation
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  useEffect(() => {
    request.GET('fixedAssets/settings/types/getSL', (resp) => {
      setTypeList((resp.data || []).map((item) => ({ value: item.id, label: item.name })));
    }, () => { });
  }, []);

  return {
    propsToControlPanel,
    formStateIndex,
    onInputChangeIndex,
    typeList,
    conditionOptions: CONDITION_OPTIONS,
    formValidationIndex,
    sendForm,
    lines,
    codePreview,
    valueLocked,
    fnOpenAddChange,
    fnOpenEditChange,
    openModalChange,
    setOpenModalChange,
    editingLine,
    fnSaveChangeLine,
    openModalView,
    setOpenModalView,
    fnViewRegister,
    openModalDepreciation,
    setOpenModalDepreciation,
    assetId: id
  }
}
