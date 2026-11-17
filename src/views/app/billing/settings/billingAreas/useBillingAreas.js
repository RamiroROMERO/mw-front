import { useState, useEffect, useMemo } from 'react';
import { request, buildUrl } from '@Helpers/core';
import { useForm } from '@Hooks';
import { INITIAL_AREA_FORM, buildAreaPayload, mapAreaToForm, validateArea } from './billingAreaRules';

// Áreas de facturación (fac_areas.sc2). Validación por campo con las mismas reglas del back (billingAreaRules.js): un filtro inválido se marca y NO llama al back.
// "Eliminar" es una baja lógica con bloqueo por uso (DELETE /admin/areas/:id; el back rechaza con su mensaje si el área tiene facturas, cajas, empleados, etc.): la
// casilla "Activa" sigue siendo independiente. Cuenta de ingreso obligatoria solo con Contabilidad activa (admin/companyInternalSettings).
const useBillingAreas = ({ setLoading }) => {
  const companyData = JSON.parse(localStorage.getItem("mw_current_company"));
  const [tableData, setTableData] = useState([])
  const [listLedgerAccount, setListLedgerAccount] = useState([]);
  const [listDocument, setListDocument] = useState([]);
  const [listStores, setListStores] = useState([]);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  // Mientras no se conoce la configuración se asume Contabilidad activa (el back decide; el valor real llega con admin/companyInternalSettings).
  const [accountingActive, setAccountingActive] = useState(true);
  const [isHospitalControl] = useState(companyData?.isHospitalControl || false);
  const [openModalViewDocument, setOpenModalViewDocument] = useState(false);

  const { formState, onInputChange, onResetForm, setBulkForm } = useForm({ ...INITIAL_AREA_FORM });
  const errors = useMemo(() => validateArea(formState, { accountingActive }), [formState, accountingActive]);
  const { id } = formState;

  const fnClearInputs = () => {
    setSendForm(false);
    onResetForm();
  }

  const fnDeleteItem = () => {
    if (!(id > 0)) return;
    setOpenMsgQuestion(true);
  }

  const fnNewDocument = () => {
    fnClearInputs();
  }

  const fnSearchDocument = () => {
    setLoading(true);
    request.GET('admin/areas', (resp) => {
      setTableData(resp.data);
      setOpenModalViewDocument(true);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  const fnSaveDocument = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;

    const data = buildAreaPayload(formState);
    setLoading(true);
    if (id && id > 0) {
      request.PUT(`admin/areas/${id}`, data, () => {
        fnClearInputs();
        setLoading(false);
      }, () => {
        setLoading(false);
      });
    } else {
      request.POST('admin/areas', data, () => {
        fnClearInputs();
        setLoading(false);
      }, () => {
        setLoading(false);
      });
    }
  }

  const fnViewDocument = (item) => {
    setSendForm(false);
    setBulkForm(mapAreaToForm(item));
    setOpenModalViewDocument(false);
  }

  // Baja lógica (elimina = 1). Si el back la rechaza (área en uso o predeterminada) `request.DELETE` ya muestra su mensaje real y el formulario conserva el área.
  const fnDeleteDocument = () => {
    setOpenMsgQuestion(false);
    if (!(id > 0)) return;
    setLoading(true);
    request.DELETE(`admin/areas/${id}`, () => {
      fnClearInputs();
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  const propsToControlPanel = {
    fnNew: fnNewDocument,
    fnSearch: fnSearchDocument,
    fnSave: fnSaveDocument,
    fnDelete: fnDeleteItem,
    buttonsHome: [],
    buttonsOptions: [],
    buttonsAdmin: [],
    disableTab: [false, true, true]
  }

  useEffect(() => {
    setLoading(true);
    request.GET('accounting/settings/accountants/getSL?status=1', (resp) => {
      const listAccount = resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta }));
      setListLedgerAccount(listAccount);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
    request.GET('inventory/settings/stores/getSL?type=1', (resp) => {
      setListStores(resp.data.map((item) => ({ label: item.name, value: item.id })));
    });
    request.GET(buildUrl('admin/documents/', { useBill: 1 }), (resp) => {
      setListDocument(resp.data.map((item) => ({ label: item.name, value: item.code })));
    });
    if (companyData?.id) {
      request.GET(`admin/companyInternalSettings?companyId=${companyData.id}`, (resp) => {
        const [settings] = resp.data;
        setAccountingActive(!!settings?.accountingMenu);
      }, () => { });
    }
  }, []);

  const propsToAreasDetail = {
    formState,
    onInputChange,
    listDocument,
    listLedgerAccount,
    listStores,
    sendForm,
    errors,
    accountingActive,
    isHospitalControl
  };

  return {
    tableData,
    openModalViewDocument,
    setOpenModalViewDocument,
    propsToControlPanel,
    propsToMsgDelete: {
      open: openMsgQuestion,
      setOpen: setOpenMsgQuestion,
      fnOnOk: fnDeleteDocument,
      title: "alert.question.title"
    },
    propsToAreasDetail,
    fnViewDocument
  }
}

export default useBillingAreas;
