import { useEffect, useState } from 'react';
import { IntlMessages } from '@Helpers/Utils';
import { useForm } from '@Hooks/useForms';
import { request } from '@Helpers/core';
import { USE_FLAGS, buildStatNamePayload, validateStatName } from './taxStatNameRules';

const INITIAL = {
  id: 0, name: '', kind: '', isFiscal: false, fiscalCode: '', status: true, ...Object.fromEntries(USE_FLAGS.map((key) => [key, false]))
};

// Nombres de estadísticas (SPEC v2-117-sr). La validación es la de `taxStatNameRules` (los mismos casos del DTO del back) y NO llama al back si falla; que el nombre
// no se repita lo decide el back y su mensaje real sale con el aviso de `request`.
export const useTypesTaxes = ({ setLoading }) => {
  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const { formState, onInputChange, setBulkForm, onResetForm } = useForm(INITIAL);

  const formValidation = (() => {
    const found = validateStatName(formState);
    return { nameValid: found.name, kindValid: found.kind, fiscalCodeValid: found.fiscalCode };
  })();
  const isFormValid = Object.values(formValidation).every((value) => !value);

  const fnEditItem = (item) => {
    setBulkForm({
      ...INITIAL,
      ...item,
      kind: item.kind ? String(item.kind) : '',
      fiscalCode: item.fiscalCode || '',
      isFiscal: Boolean(item.isFiscal),
      status: Boolean(item.status),
      ...Object.fromEntries(USE_FLAGS.map((key) => [key, Boolean(item[key])]))
    });
  };

  const fnDeleteItem = (item) => {
    setCurrentItem(item);
    setOpenMsgQuestion(true);
  };

  const [table, setTable] = useState({
    title: IntlMessages('page.typesTaxes.table.title'),
    columns: [
      { text: IntlMessages('page.typesTaxes.table.name'), dataField: 'name', headerStyle: { width: '45%' } },
      { text: IntlMessages('page.typesTaxes.table.code'), dataField: 'kind', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.typesTaxes.table.status'), dataField: 'status', type: 'boolean', headerStyle: { width: '15%' } }
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
    request.GET('admin/taxStatNames', (resp) => {
      setTable((prev) => ({ ...prev, data: [...resp.data].sort((a, b) => a.name.localeCompare(b.name)) }));
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  };

  const fnSave = () => {
    setSendForm(true);
    if (!isFormValid) return;
    const data = buildStatNamePayload(formState);
    setLoading(true);
    const onOk = () => {
      fnClearInputs();
      fnGetData();
      setLoading(false);
    };
    const onFail = () => setLoading(false);
    if (formState.id > 0) request.PUT(`admin/taxStatNames/${formState.id}`, data, onOk, onFail);
    else request.POST('admin/taxStatNames', data, onOk, onFail);
  };

  // "Eliminar" desactiva el nombre (estado 0): no existe el borrado.
  const fnDisableItem = () => {
    setOpenMsgQuestion(false);
    if (currentItem.id && currentItem.id > 0) {
      setLoading(true);
      request.PUT(`admin/taxStatNames/${currentItem.id}`, { status: 0 }, () => {
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
