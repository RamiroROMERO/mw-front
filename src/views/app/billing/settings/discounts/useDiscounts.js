import { useState, useEffect, useMemo } from 'react'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core';
import { INITIAL_DISCOUNT_FORM, buildDiscountPayload, mapDiscountToForm, validateDiscount } from './discountRules';

// Descuentos (fac_desc.sc2). Validación por campo con las mismas reglas del back (discountRules.js): un formulario inválido se marca y NO llama al back. La cuenta contable es
// obligatoria solo con Contabilidad activa (como `If contMenu == 1` del legacy; el valor llega con admin/companyInternalSettings y, mientras no se conoce, se asume activa: el back
// decide). "Eliminar" es una baja lógica con bloqueo por uso (DELETE admin/discounts/:id; el back rechaza con su mensaje real si algún documento lo usa): la casilla "Activo" sigue
// siendo independiente.
const useDiscounts = ({ setLoading }) => {

  const [tableData, setTableData] = useState([]);
  const [listLedgerAccount, setListLedgerAccount] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [accountingActive, setAccountingActive] = useState(true);

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({ ...INITIAL_DISCOUNT_FORM });
  const errors = useMemo(() => validateDiscount(formState, { accountingActive }), [formState, accountingActive]);

  const fnClearInputs = () => {
    setSendForm(false);
    onResetForm();
  }

  // Una cuenta guardada que ya no está en el catálogo (inexistente, inactiva o de no movimiento) no se carga: el combo la mostraría vacía y se enviaría igual; sin ella, la validación
  // local pide elegir otra (con Contabilidad activa) antes de llamar al back.
  const fnEditItem = (item) => {
    setSendForm(false);
    const form = mapDiscountToForm(item);
    if (form.discountCtaCode && !listLedgerAccount.some((account) => account.value === form.discountCtaCode)) form.discountCtaCode = '';
    setBulkForm(form);
  }

  const fnDeleteItem = (item) => {
    setBulkForm({ ...INITIAL_DISCOUNT_FORM, id: item.id });
    setOpenMsgQuestion(true);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('admin/discounts', (resp) => {
      setTableData(resp.data.map((item) => ({ ...item, description: item.name, amount: item.percentValue })));
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  };

  const fnSave = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;

    const data = buildDiscountPayload(formState);
    setLoading(true);
    const done = () => {
      fnClearInputs();
      fnGetData();
      setLoading(false);
    };
    if (formState.id > 0) {
      request.PUT(`admin/discounts/${formState.id}`, data, done, () => setLoading(false));
    } else {
      request.POST('admin/discounts', data, done, () => setLoading(false));
    }
  }

  const fnRemove = () => {
    setOpenMsgQuestion(false);
    if (!(formState.id > 0)) return;
    setLoading(true);
    request.DELETE(`admin/discounts/${formState.id}`, () => {
      fnClearInputs();
      fnGetData();
      setLoading(false);
    }, () => {
      // Rechazada (en uso): `request` ya mostró el mensaje real; se limpia para que un Guardar posterior no edite lo que se intentó eliminar.
      fnClearInputs();
      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET('accounting/settings/accountants/getSL?status=1', (resp) => {
      setListLedgerAccount(resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta })));
      setLoading(false);
      fnGetData();
    }, () => {
      setLoading(false);
    });

    const companyData = JSON.parse(localStorage.getItem('mw_current_company'));
    if (companyData?.id) {
      request.GET(`admin/companyInternalSettings?companyId=${companyData.id}`, (resp) => {
        const [settings] = resp.data;
        setAccountingActive(!!settings?.accountingMenu);
      }, () => { });
    }
  }, [])

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnRemove, title: "alert.question.title" }

  return {
    formState,
    errors,
    accountingActive,
    sendForm,
    onInputChange,
    fnClearInputs,
    tableData,
    propsToMsgDelete,
    fnSave,
    listLedgerAccount,
    fnEditItem,
    fnDeleteItem
  };
}

export default useDiscounts;
