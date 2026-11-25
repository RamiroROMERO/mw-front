import { useEffect, useState } from 'react';
import { useForm } from '@Hooks';
import { request } from '@Helpers/core';
import { printDocument } from '@Helpers/printDocument';
import { assignState, buildAssignPayload, validateAssign } from './assignRules';

// Cada campo se valida con las mismas reglas del back (assignRules.js); el mensaje es la clave de traducción de la regla (la traduce el campo).
const BASE = { date: '2000-01-01', assetId: 1, assetValue: 1, responsibleId: 1, areaId: 1 };
const rule = (field) => [(val) => validateAssign({ ...BASE, [field]: val })[field] === undefined, validateAssign({ ...BASE, [field]: '' })[field]];

export const useAssign = ({ setLoading }) => {
  const [assetList, setAssetList] = useState([]);
  const [responsibleList, setResponsibleList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [openModalView, setOpenModalView] = useState(false);
  const [openModalAsset, setOpenModalAsset] = useState(false);
  const [openModalFinish, setOpenModalFinish] = useState(false);
  const [openMsgDelete, setOpenMsgDelete] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const validAssign = {
    date: rule('date'),
    assetId: rule('assetId'),
    assetValue: rule('assetValue'),
    responsibleId: rule('responsibleId'),
    areaId: rule('areaId')
  }

  const {
    formState: formStateIndex, onResetForm: onResetFormIndex, setBulkForm: setBulkFormIndex,
    onInputChange: onInputChangeIndex, isFormValid: isFormValidIndex, formValidation: formValidationIndex
  } = useForm({
    id: 0, date: '', assetId: '', assetCode: '', assetName: '', trademark: '', model: '', serial1: '',
    assetValue: 0, responsibleId: '', areaId: '', others: '', notes: '', isApplied: 0, dateEnd: '', notesEnd: ''
  }, validAssign);

  const { id } = formStateIndex;
  const state = assignState(formStateIndex);
  const isLocked = state.locked;

  const fnNewAssign = () => {
    setSendForm(false);
    onResetFormIndex();
  };

  const fnLoadAssign = (assignId) => {
    setLoading(true);
    request.GET(`fixedAssets/process/assign/${assignId}`, (resp) => {
      setBulkFormIndex(resp.data);
      setSendForm(false);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnViewAssign = (row) => {
    setOpenModalView(false);
    fnLoadAssign(row.id);
  }

  const fnSearchAssign = () => setOpenModalView(true);

  const fnOpenAssetPicker = () => {
    setLoading(true);
    request.GET('fixedAssets/process/assign/availableAssets', (resp) => {
      setAssetList(resp.data);
      setOpenModalAsset(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnSelectAsset = (row) => {
    setOpenModalAsset(false);
    setBulkFormIndex({
      assetId: row.id, assetCode: row.code, assetName: row.name, trademark: row.trademark,
      model: row.model, serial1: row.serial1, assetValue: row.currentValue || 0
    });
  }

  const fnSaveAssign = () => {
    setSendForm(true);
    if (!isFormValidIndex) return;

    setLoading(true);
    if (id > 0) {
      request.PUT(`fixedAssets/process/assign/${id}`, { header: buildAssignPayload(formStateIndex) }, () => {
        fnLoadAssign(id);
        setLoading(false);
      }, () => setLoading(false));
    } else {
      request.POST('fixedAssets/process/assign', { header: buildAssignPayload(formStateIndex) }, (resp) => {
        fnLoadAssign(resp.data.id);
        setLoading(false);
      }, () => setLoading(false));
    }
  }

  const fnApplyAssign = () => {
    if (!state.canApply) return;
    setLoading(true);
    request.POST(`fixedAssets/process/assign/${id}/apply`, {}, () => {
      fnLoadAssign(id);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnOpenFinish = () => {
    if (!state.canFinish) return;
    setOpenModalFinish(true);
  }

  const fnFinishAssign = ({ dateEnd, notesEnd }) => {
    setLoading(true);
    request.POST(`fixedAssets/process/assign/${id}/finish`, { dateEnd, notesEnd }, () => {
      setOpenModalFinish(false);
      fnLoadAssign(id);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnAskDelete = () => {
    if (!state.canDelete) return;
    setOpenMsgDelete(true);
  }

  const fnDeleteOk = () => {
    setOpenMsgDelete(false);
    setLoading(true);
    request.DELETE(`fixedAssets/process/assign/${id}`, () => {
      fnNewAssign();
      setLoading(false);
    }, () => setLoading(false));
  }

  const propsToMsgDelete = { open: openMsgDelete, setOpen: setOpenMsgDelete, fnOnOk: fnDeleteOk, title: 'page.fixedAssets.msg.deleteAssignConfirm' }

  // Imprime lo guardado en DB (SPEC v2-21).
  const fnPrint = () => printDocument({ path: 'fixedAssets/process/assign', id, fileName: 'Acta de Asignacion.pdf', setLoading });

  const propsToControlPanel = {
    fnNew: fnNewAssign,
    fnSearch: fnSearchAssign,
    fnSave: fnSaveAssign,
    fnDelete: fnAskDelete,
    buttonsHome: [
      {
        title: 'button.print',
        icon: 'bi bi-printer',
        onClick: fnPrint
      },
      {
        title: 'page.fixedAssets.button.apply',
        icon: 'bi bi-check2-square',
        onClick: fnApplyAssign
      },
      {
        title: 'page.fixedAssets.button.finish',
        icon: 'bi bi-box-arrow-left',
        onClick: fnOpenFinish
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  useEffect(() => {
    request.GET('fixedAssets/settings/responsibles/getSL', (resp) => {
      setResponsibleList((resp.data || []).map((item) => ({ value: item.id, label: item.name })));
    }, () => { });
    request.GET('fixedAssets/process/assign/areas', (resp) => {
      setAreaList((resp.data || []).map((item) => ({ value: item.id, label: item.name })));
    }, () => { });
  }, []);

  return {
    propsToControlPanel,
    formStateIndex,
    onInputChangeIndex,
    responsibleList,
    areaList,
    formValidationIndex,
    sendForm,
    isLocked,
    fnOpenAssetPicker,
    openModalAsset,
    setOpenModalAsset,
    assetList,
    fnSelectAsset,
    openModalView,
    setOpenModalView,
    fnViewAssign,
    assignDate: formStateIndex.date,
    openModalFinish,
    setOpenModalFinish,
    fnFinishAssign,
    propsToMsgDelete
  }
}
