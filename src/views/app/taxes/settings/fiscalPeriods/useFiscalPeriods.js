import { useEffect, useState } from 'react';
import { IntlMessages } from '@Helpers/Utils';
import { useForm } from '@Hooks/useForms';
import { request } from '@Helpers/core';
import { buildPeriodPayload, validatePeriod } from './fiscalPeriodRules';

// Períodos fiscales (SPEC v2-117-sr). La validación es la de `fiscalPeriodRules` (los mismos casos del DTO del back) y NO llama al back si falla; las reglas que
// dependen de otros períodos (nombre único, traslape, un solo activo) las decide el back y su mensaje real sale con el aviso de `request`.
export const useFiscalPeriods = ({ setLoading }) => {
  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const { formState, onInputChange, setBulkForm, onResetForm } = useForm({
    id: 0,
    period: '',
    dateIn: '',
    dateOut: '',
    active: false,
    status: true
  });

  const formValidation = (() => {
    const found = validatePeriod(formState);
    return { periodValid: found.period, dateInValid: found.dateIn, dateOutValid: found.dateOut, activeValid: found.active };
  })();
  const isFormValid = Object.values(formValidation).every((value) => !value);

  const fnEditItem = (item) => {
    setBulkForm({ ...item, dateIn: String(item.dateIn || '').slice(0, 10), dateOut: String(item.dateOut || '').slice(0, 10), active: Boolean(item.active), status: Boolean(item.status) });
  };

  const fnDeleteItem = (item) => {
    setCurrentItem(item);
    setOpenMsgQuestion(true);
  };

  const [table, setTable] = useState({
    title: IntlMessages('page.fiscalPeriods.table.title'),
    columns: [
      { text: IntlMessages('page.fiscalPeriods.table.period'), dataField: 'period', headerStyle: { width: '25%' } },
      { text: IntlMessages('page.fiscalPeriods.table.dateIn'), dataField: 'dateIn', type: 'date', headerStyle: { width: '20%' } },
      { text: IntlMessages('page.fiscalPeriods.table.dateOut'), dataField: 'dateOut', type: 'date', headerStyle: { width: '20%' } },
      { text: IntlMessages('page.fiscalPeriods.table.active'), dataField: 'active', type: 'boolean', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.fiscalPeriods.table.status'), dataField: 'status', type: 'boolean', headerStyle: { width: '15%' } }
    ],
    data: [],
    actions: [{
      color: 'warning',
      icon: 'pencil',
      toolTip: IntlMessages('button.edit'),
      onClick: fnEditItem
    }, {
      color: 'danger',
      icon: 'trash',
      toolTip: IntlMessages('button.delete'),
      onClick: fnDeleteItem
    }]
  });

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  };

  const fnGetData = () => {
    setLoading(true);
    request.GET('tax/settings/fiscalPeriods', (resp) => {
      setTable((prev) => ({ ...prev, data: [...resp.data].sort((a, b) => String(b.dateIn).localeCompare(String(a.dateIn))) }));
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  };

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) return;
    const data = buildPeriodPayload(formState);
    setLoading(true);
    const onOk = () => {
      fnClearInputs();
      fnGetData();
      setLoading(false);
    };
    const onFail = () => setLoading(false);
    if (formState.id > 0) request.PUT(`tax/settings/fiscalPeriods/${formState.id}`, data, onOk, onFail);
    else request.POST('tax/settings/fiscalPeriods', data, onOk, onFail);
  };

  // "Eliminar" desactiva el período (estado 0): no existe el borrado.
  const fnDisableItem = () => {
    setOpenMsgQuestion(false);
    if (currentItem.id && currentItem.id > 0) {
      setLoading(true);
      request.PUT(`tax/settings/fiscalPeriods/${currentItem.id}`, { status: 0 }, () => {
        fnGetData();
        fnClearInputs();
        setCurrentItem({});
        setLoading(false);
      }, () => {
        setLoading(false);
      });
    }
  };

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableItem, title: 'alert.question.title', setCurrentItem };

  useEffect(() => {
    fnGetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { formState, onInputChange, formValidation, fnClearInputs, fnSave, table, propsToMsgDelete, sendForm };
};
