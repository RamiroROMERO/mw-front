import { useEffect, useState } from 'react';
import { useForm } from '@Hooks';
import DateHelper from '@Helpers/DateHelper';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

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
  const [dataList, setDataList] = useState([]);
  const [openModalChange, setOpenModalChange] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [openModalDepreciation, setOpenModalDepreciation] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const validRegister = {
    typeId: [(val) => Number(val) > 0, 'page.fixedAssets.msg.typeRequired'],
    condition: [(val) => (val || '') !== '', 'page.fixedAssets.msg.conditionRequired'],
    code: [(val) => (val || '') !== '', 'page.fixedAssets.msg.codeRequired'],
    name: [(val) => (val || '').trim() !== '', 'page.fixedAssets.msg.nameRequired'],
    dateIn: [(val) => (val || '') !== '', 'page.fixedAssets.msg.dateInRequired']
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
  };

  const fnLoadRegister = (registerId) => {
    setLoading(true);
    request.GET(`fixedAssets/process/fixedAssets/${registerId}`, (resp) => {
      const { header, lines: lineData } = resp.data;
      setBulkFormIndex(header);
      setLines(lineData);
      setSendForm(false);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnViewRegister = (row) => {
    setOpenModalView(false);
    fnLoadRegister(row.id);
  }

  const fnSearchRegister = () => {
    setLoading(true);
    request.GET('fixedAssets/process/fixedAssets/search', (resp) => {
      setDataList(resp.data);
      setOpenModalView(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnGenerateCode = () => {
    if (formStateIndex.code) return;
    if (!(Number(typeId) > 0)) {
      notification('warning', 'page.fixedAssets.msg.selectTypeFirst', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(`fixedAssets/process/fixedAssets/generateCode?typeId=${typeId}`, (resp) => {
      setBulkFormIndex({ code: resp.data.code });
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnSaveRegister = () => {
    setSendForm(true);
    if (!isFormValidIndex) return;

    setLoading(true);
    if (id > 0) {
      request.PUT(`fixedAssets/process/fixedAssets/${id}`, { header: formStateIndex }, () => {
        fnLoadRegister(id);
        setLoading(false);
      }, () => setLoading(false));
    } else {
      request.POST('fixedAssets/process/fixedAssets', { header: formStateIndex }, (resp) => {
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
    request.GET('fixedAssets/settings/types', (resp) => {
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
    fnGenerateCode,
    fnOpenAddChange,
    fnOpenEditChange,
    openModalChange,
    setOpenModalChange,
    editingLine,
    fnSaveChangeLine,
    openModalView,
    setOpenModalView,
    dataList,
    fnViewRegister,
    openModalDepreciation,
    setOpenModalDepreciation,
    assetId: id
  }
}
