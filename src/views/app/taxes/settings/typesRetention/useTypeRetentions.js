import { useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl';
import { useForm } from '@Hooks/useForms';
import { request } from '@Helpers/core';
import { INITIAL_WITHHOLDING_FORM, buildWithholdingPayload, mapWithholdingToForm, validateWithholdingType } from './withholdingTypeRules';

// Tipos de Retención (imp_retenctypes.sc2, SPEC v2-112-sr). Validación por campo con las mismas reglas del back (withholdingTypeRules.js): un formulario inválido se marca y NO llama
// al back. No hay "Eliminar": la única baja es "Activo" (el icono de la tabla desactiva con PUT { status: 0 } y pide confirmación). El back valida siempre la cuenta contable.
export const useTypeRetentions = ({ setLoading }) => {
  const { formatMessage } = useIntl();

  const [listAccount, setListAccount] = useState([]);
  const [listReportTypes, setListReportTypes] = useState([]);
  const [currentItem, setCurrentItem] = useState({});
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const { formState, onInputChange, setBulkForm, onResetForm } = useForm({ ...INITIAL_WITHHOLDING_FORM });
  const errors = useMemo(() => validateWithholdingType(formState), [formState]);

  // Una cuenta guardada que ya no está en el catálogo (RAP e IHSS de algunas bases) no se carga: el combo la mostraría vacía y se enviaría igual; el back la rechaza de todos modos.
  const fnEditItem = (item) => {
    setSendForm(false);
    const form = mapWithholdingToForm(item);
    if (form.withholdingCtaCode && !listAccount.some((account) => account.value === form.withholdingCtaCode)) form.withholdingCtaCode = '';
    setBulkForm(form);
  }

  const fnDeactivateItem = (item) => {
    setCurrentItem(item)
    setOpenMsgQuestion(true);
  }

  // La tabla se arma en cada cambio de datos o de cuentas: las acciones deben ver la lista de cuentas ya cargada (un estado inicial las dejaría con la lista vacía y borraría la cuenta al editar).
  const [tableData, setTableData] = useState([]);
  const table = useMemo(() => ({
    title: formatMessage({ id: "page.typesRetention.table.title" }),
    columns: [
      { text: formatMessage({ id: "page.typesRetention.table.name" }), dataField: "name", headerStyle: { 'width': '45%' } },
      { text: formatMessage({ id: "page.typesRetention.table.idCtaAccount" }), dataField: "withholdingCtaCode", headerStyle: { 'width': '35%' } }
    ],
    data: tableData,
    actions: [{
      color: 'warning',
      icon: 'pencil',
      toolTip: formatMessage({ id: "button.edit" }),
      onClick: fnEditItem
    }, {
      color: 'danger',
      icon: 'trash',
      toolTip: formatMessage({ id: "button.disable" }),
      onClick: fnDeactivateItem
    }]
  }), [tableData, listAccount, formatMessage]);

  const fnClearInputs = () => {
    onResetForm();
    setSendForm(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('tax/settings/withholdingTypes', (resp) => {
      setTableData(resp.data);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  const fnSave = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;

    const data = buildWithholdingPayload(formState);
    setLoading(true);
    const done = () => {
      fnClearInputs();
      fnGetData();
      setLoading(false);
    };
    if (formState.id > 0) {
      request.PUT(`tax/settings/withholdingTypes/${formState.id}`, data, done, () => setLoading(false));
    } else {
      request.POST('tax/settings/withholdingTypes', data, done, () => setLoading(false));
    }
  };

  const fnDisableDocument = () => {
    setOpenMsgQuestion(false);
    if (!(currentItem.id > 0)) return;
    setLoading(true);
    request.PUT(`tax/settings/withholdingTypes/${currentItem.id}`, { status: false }, () => {
      fnGetData();
      fnClearInputs();
      setCurrentItem({});
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDisableDocument, title: "page.typesRetention.alert.deactivate", setCurrentItem }

  useEffect(() => {
    setLoading(true);
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      setListAccount(resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta })));
      setLoading(false);
      fnGetData();
    }, () => {
      setLoading(false);
    });
    request.GET('tax/settings/withholdingTypes/reportTypes', (resp) => {
      setListReportTypes(resp.data.map((item) => ({ label: item.name, value: String(item.id) })));
    }, () => { });
  }, []);

  return {
    formState,
    errors,
    onInputChange,
    fnClearInputs,
    fnSave,
    table,
    propsToMsgDelete,
    sendForm,
    listAccount,
    listReportTypes
  }
}
