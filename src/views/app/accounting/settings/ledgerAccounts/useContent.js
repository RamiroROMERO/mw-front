import { useState, useEffect, useMemo, useRef } from 'react'
import { IntlMessages, getCurrentUser } from "@Helpers/Utils";
import { request, notifyError } from '@Helpers/core';
import { useForm } from '@Hooks';
import { INITIAL_ACCOUNT_FORM, buildAccountPayload, formatAccountCode, mapAccountToForm, validateAccount } from './ledgerAccountRules';

// Cuentas Contables (cont_ccc*.sc2, SPEC v2-119-sr). Validación por campo con las mismas reglas del back (ledgerAccountRules.js): un formulario inválido se marca y NO llama al back.
// El nivel lo calcula el back con el formato de cuentas (`GET .../accountants/format` da el largo de cada nivel y el formato). "Eliminar" es una baja lógica con bloqueo por uso
// (DELETE accounting/settings/accountants/:id: el back rechaza con su mensaje real si la cuenta tiene hijas, partidas o está asignada); la casilla "Activa" es independiente.
export const useContent = ({ setLoading }) => {

  const [listTypeAccount, setlistTypeAcount] = useState([]);
  const [listTypeSpent, setlistTypeSpent] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [levels, setLevels] = useState([]);
  const [codeFormat, setCodeFormat] = useState('');
  const [sendForm, setSendForm] = useState(false);
  const listCurrency = [{ id: "1", name: "Lempiras" },
  { id: "2", name: "Dolares" }];

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({ ...INITIAL_ACCOUNT_FORM });
  const isEdit = formState.id > 0;
  const errors = useMemo(() => validateAccount(formState, { levels, isEdit }), [formState, levels, isEdit]);

  const fnClearInputs = () => {
    setSendForm(false);
    onResetForm();
  }

  const fnEditItem = (item) => {
    setSendForm(false);
    setBulkForm(mapAccountToForm(item));
  }

  const fnDeleteItem = (item) => {
    setBulkForm({ ...INITIAL_ACCOUNT_FORM, id: item.id });
    setOpenMsgQuestion(true);
  }

  // Formato de cuentas para mostrar el código en la tabla (la celda lo lee de la ref: la columna se define una sola vez).
  const codeFormatRef = useRef('');
  const [formatConfig, setFormatConfig] = useState(null);
  const [openFormatModal, setOpenFormatModal] = useState(false);
  // La configuración de cuentas (formato y niveles) solo la abre un administrador del sistema (el back lo vuelve a comprobar).
  const isSystemAdmin = Number(getCurrentUser()?.isSystemAdmin) === 1;

  const [table, setTable] = useState({
    title: IntlMessages("page.ledgerAccounts.table.title"),
    columns: [
      {
        text: IntlMessages("page.ledgerAccounts.table.ledgerAccount"), dataField: "code", headerStyle: { 'width': '15%' },
        cell: ({ row }) => formatAccountCode(row.original.code, codeFormatRef.current)
      },
      { text: IntlMessages("page.ledgerAccounts.table.name"), dataField: "name", headerStyle: { 'width': '40%' } },
      {
        text: IntlMessages("page.ledgerAccounts.table.posteable"), dataField: "opera", headerStyle: { 'width': '15%' },
        classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell', type: 'boolean'
      },
      {
        text: IntlMessages("page.ledgerAccounts.table.status"), dataField: "status", type: 'boolean', headerStyle: { 'width': '15%' },
      },
    ],
    data: [],
    actions: [...(isSystemAdmin ? [{
      // Acción libre (botón del encabezado de la tabla): la configuración de cuentas solo la abre un administrador del sistema.
      color: 'warning',
      icon: 'gear',
      isFreeAction: true,
      onClick: () => setOpenFormatModal(true),
      title: IntlMessages('page.ledgerAccounts.button.settings')
    }] : []), {
      color: 'warning',
      icon: 'pencil',
      toolTip: 'button.edit',
      onClick: fnEditItem,
      title: IntlMessages('button.edit')
    }, {
      color: 'danger',
      icon: 'trash',
      toolTip: 'button.delete',
      onClick: fnDeleteItem,
      title: IntlMessages('button.delete')
    }],
    options: {
      enabledActionButtons: true
    }
  });

  const fnGetData = () => {
    setLoading(true);
    request.GET('accounting/settings/accountants', (resp) => {
      setTable((prev) => ({ ...prev, data: resp.data }));
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  const fnRemove = () => {
    setOpenMsgQuestion(false);
    if (!(formState.id > 0)) return;
    setLoading(true);
    request.DELETE(`accounting/settings/accountants/${formState.id}`, () => {
      fnClearInputs();
      fnGetData();
      setLoading(false);
    }, () => {
      // Rechazada (hijas, partidas o asignada): `request` ya mostró el mensaje real; se limpia para que un Guardar posterior no edite lo que se intentó eliminar.
      fnClearInputs();
      setLoading(false);
    });
  }

  const fnSave = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;

    const data = buildAccountPayload(formState, { isEdit });
    setLoading(true);
    const done = () => {
      fnClearInputs();
      fnGetData();
      setLoading(false);
    };
    if (isEdit) {
      request.PUT(`accounting/settings/accountants/${formState.id}`, data, done, () => setLoading(false));
    } else {
      request.POST('accounting/settings/accountants', data, done, () => setLoading(false));
    }
  }

  // Excel "Listado de Cuentas Contables": el back exporta lo guardado en la DB (no eliminadas), no lo que está en el formulario. Es un GET (solo lectura). GETPdf no notifica por sí
  // mismo: el error se avisa aquí.
  const fnExport = () => {
    setLoading(true);
    const stop = () => setLoading(false);
    request.GETPdf('accounting/settings/accountants/export', {}, 'Listado de Cuentas Contables.xlsx', (err) => {
      stop();
      notifyError(err, 'page.ledgerAccounts.msg.exportError');
    }, 'GET', stop);
  }

  // Formato de cuentas (cont_ctas_set): formato del código (placeholder) y largo de cada nivel. Sin él no se valida el nivel en pantalla (lo decide el back). También se llama al guardar la configuración.
  const fnLoadFormat = () => {
    request.GET('accounting/settings/accountants/format', (resp) => {
      setLevels(resp.data?.levels || []);
      setCodeFormat(resp.data?.format || '');
      setFormatConfig(resp.data || null);
      codeFormatRef.current = resp.data?.format || '';
      setTable((prev) => ({ ...prev, columns: [...prev.columns] })); // vuelve a dibujar la tabla con el formato
    }, () => { });
  };

  useEffect(() => {
    request.GET('accounting/settings/accountTypes', (resp) => {
      setlistTypeAcount(resp.data.map((item) => ({ id: item.id, name: item.name })));
    }, () => { });
    request.GET('accounting/settings/accountExpenseTypes', (resp) => {
      setlistTypeSpent(resp.data.map((item) => ({ id: item.id, name: item.name })));
    }, () => { });
    fnLoadFormat();
    fnGetData();
  }, []);

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnRemove, title: "alert.question.title" }

  return {
    listTypeAccount,
    listTypeSpent,
    listCurrency,
    formState,
    errors,
    codeFormat,
    isEdit,
    onInputChange,
    sendForm,
    fnClearInputs,
    fnSave,
    fnExport,
    table,
    propsToMsgDelete,
    isSystemAdmin,
    formatConfig,
    openFormatModal,
    setOpenFormatModal,
    fnLoadFormat
  }
}
