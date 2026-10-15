import { useEffect, useMemo, useState } from 'react'
import { useForm } from '@Hooks/useForms';
import { IntlMessages, validInt } from "@Helpers/Utils";
import { request, notifyError } from '@Helpers/core';
import { validateType, buildTypePayload } from './typeProductRules';

export const useTypeProducts = ({ setLoading }) => {
  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [listLedgerAccount, setListLedgerAccount] = useState([]);

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({
    id: 0,
    name: '',
    description: '',
    codeInit: '',
    codeSeq: '00000',
    invCtaCode: '',
    costCtaCode: '',
    expenseCtaCode: '',
    incomeCtaCode: '',
    status: true
  });

  // Mismas reglas que el back (typeProductRules.js): errores por campo y sin llamar al back si alguna falla.
  const errors = useMemo(() => validateType(formState), [formState]);

  const fnEditItem = (item) => {
    request.moveScrollTop();
    setBulkForm(item);
  };

  const fnDeleteItem = (item) => {
    setCurrentItem(item);
    setOpenMsgQuestion(true);
  };

  const [table, setTable] = useState({
    title: IntlMessages("page.typeProducts.table.title"),
    columns: [
      { text: IntlMessages("page.typeProducts.table.name"), dataField: "name", headerStyle: { 'width': '35%' } },
      { text: IntlMessages("page.typeProducts.table.codeInit"), dataField: "codeInit", headerStyle: { 'width': '15%' } },
      {
        text: IntlMessages("page.typeProducts.table.codeSeq"), dataField: "codeSeq", headerStyle: { 'width': '15%' },
        classes: 'd-xxs-none-table-cell', headerClasses: 'd-xxs-none-table-cell', style: { textAlign: 'right' }
      },
      { text: IntlMessages("page.typeProducts.table.status"), dataField: "status", type: 'boolean', headerStyle: { 'width': '10%' } }
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
    }],
    defaultPageSize: 5
  });

  const fnGetData = () => {
    setLoading(true);
    request.GET('inventory/settings/productsClassifications', (resp) => {
      const { data } = resp;
      const tableData = {
        ...table, data
      }
      setTable(tableData);
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnClearInputs = () => {
    setCurrentItem({});
    onResetForm();
    setSendForm(false);
  }

  const fnSave = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Editar o crear lo decide el id del formulario (fnEditItem lo carga con setBulkForm; currentItem solo lo usa Eliminar).
    const editingId = validInt(formState.id);
    const payload = buildTypePayload(formState, { isEdit: editingId > 0 });

    if (editingId > 0) {
      setLoading(true);
      request.PUT(`inventory/settings/productsClassifications/${editingId}`, payload, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, () => {
        setLoading(false);
      });
    } else {
      setLoading(true);
      request.POST('inventory/settings/productsClassifications', payload, () => {
        fnClearInputs();
        fnGetData();
        setLoading(false);
      }, () => {
        setLoading(false);
      });
    }
  }

  // Eliminar = baja lógica (DELETE): el back rechaza el tipo si ya tiene productos asignados y muestra su mensaje.
  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    if (currentItem.id && currentItem.id > 0) {
      setLoading(true);
      request.DELETE(`inventory/settings/productsClassifications/${currentItem.id}`, () => {
        fnGetData();
        fnClearInputs();
        setLoading(false);
      }, () => {
        setLoading(false);
      });
    }
  }

  // Excel de Tipos de producto (SPEC v2-05-sr): el back exporta lo guardado en la DB, no lo que está en el formulario. Es un GET
  // (solo lectura: no exige el permiso de crear). GETPdf no notifica por sí mismo: el error se avisa aquí.
  const fnExport = () => {
    setLoading(true);
    const stop = () => setLoading(false);
    request.GETPdf('inventory/settings/productsClassifications/export', {}, 'Clasificaciones de Productos.xlsx', (err) => {
      stop();
      notifyError(err, 'page.typeProducts.msg.exportError');
    }, 'GET', stop);
  }

  useEffect(() => {
    fnGetData();

    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const listAccount = resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta }));
      setListLedgerAccount(listAccount);
    }, () => { });
  }, []);

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "alert.question.title", setCurrentItem }

  return (
    {
      sendForm,
      table,
      propsToMsgDelete,
      formState,
      errors,
      listLedgerAccount,
      fnClearInputs,
      fnSave,
      fnExport,
      onInputChange
    }
  )
}
