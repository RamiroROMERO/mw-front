import { useEffect, useMemo, useState } from 'react'
import notification from '@Containers/ui/Notifications';
import { useForm } from '@Hooks/useForms';
import { request, buildUrl, notifyError } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import ModalBillingData from './ModalBillingData';
import ModalViewProv from './ModalViewProv';
import ModalAddBankAccount from './ModalAddBankAccount';
import ModalUpdateAllAccounts from './ModalUpdateAllAccounts';
import { validateProvider, buildProviderPayload } from './providerRules';

const companyData = JSON.parse(localStorage.getItem('mw_current_company'));

export const useProviders = ({ setLoading }) => {

  const [sendForm, setSendForm] = useState(false);
  const [openModalBankAccount, setOpenModalBankAccount] = useState(false);
  const [openModalViewProv, setOpenModalViewProv] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [openMsgDeleteProv, setOpenMsgDeleteProv] = useState(false);
  const [openModalBillingData, setOpenModalBillingData] = useState(false);
  const [openModalUpdateAllAccounts, setOpenModalUpdateAllAccounts] = useState(false);
  const [listTypeProviders, setListTypeProviders] = useState([]);
  const [listLedgerAccounts, setListLedgerAccounts] = useState([]);
  const [dataBankAccounts, setDataBankAccounts] = useState([]);
  const [listBanks, setListBanks] = useState([]);
  const [dataProviders, setDataProviders] = useState([]);
  const [currentItemBankAccount, setCurrentItemBankAccount] = useState({});
  const { isCoffeeControl, isHospitalControl } = companyData;
  // Contabilidad activa (mw_setting.cont_menu): sin ella no se exigen ni se envían las cuentas contables. Mientras no se conoce se
  // asume activa (el back decide); el valor real llega con admin/companyInternalSettings.
  const [accountingActive, setAccountingActive] = useState(true);

  const { formState, setBulkForm, onResetForm, onInputChange } = useForm({
    id: 0,
    dni: '',
    name: '',
    providerTypeId: 0,
    phone: '',
    email: '',
    address: '',
    paymentConditions: '',
    creditDays: 0,
    shipDays: 0,
    isInternational: false,
    isPettyCash: false,
    status: true,
    isProducer: false,
    isPartner: false,
    contactManager: '',
    contactManagerPhone: '',
    contactContab: '',
    contactContabPhone: '',
    contactSales: '',
    contactSalesPhone: '',
    contactLogistic: '',
    contactLogisticPhone: '',
    payableCtaCode: '',
    discountCtaCode: '',
    taxCtaCode: '',
    freightCtaCode: '',
    bonusCtaCode: '',
    otherCtaCode: '',
    taxCertificateDateOut: '',
    percHosp: 0,
    percProv: 0
  });

  // Mismas reglas que el back (providerRules.js): errores por campo y sin llamar al back si alguna falla.
  const errors = useMemo(() => validateProvider(formState, { accountingActive }), [formState, accountingActive]);

  const fnNewProvider = () => {
    onResetForm();
    setSendForm(false);
    // Legacy (btnNewDocument.Click) también limpia el grid de Cuentas Bancarias al
    // presionar "Nuevo" — sin esto quedaban visibles las cuentas del proveedor cargado
    // previamente aunque el formulario ya estuviera vacío.
    setDataBankAccounts([]);
  }

  const fnSearchProvider = () => {
    setLoading(true);
    request.GET('inventory/process/providers', (resp) => {
      const { data } = resp;
      setDataProviders(data);
      setOpenModalViewProv(true);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }

  const fnSaveProvider = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Los datos de facturación (CAI, rango y fecha límite) los guarda el modal "Info Fact.", como el legacy.
    const payload = buildProviderPayload(formState, { accountingActive });
    setLoading(true);
    if (formState.id > 0) {
      request.PUT(`inventory/process/providers/${formState.id}`, payload, (resp) => {
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    } else {
      request.POST('inventory/process/providers', payload, (resp) => {
        onInputChange({ target: { name: 'id', value: resp.data.id } });
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    }
  }

  const fnGetBankAccounts = (idProv) => {
    request.GET(buildUrl('inventory/process/providerBanks', { providerId: idProv }), (resp) => {
      setDataBankAccounts(resp.data);
      setLoading(false);
    }, (err) => {
      setDataBankAccounts([]);
      setLoading(false);
    });
  }

  const fnViewProvider = (item) => {
    // 1900-01-01 es el "sin fecha" de la DB (legacy): el formulario lo muestra vacío.
    const noDate = (value) => (value && !String(value).startsWith('1900-01-01') ? value : '');
    setBulkForm({ ...item, taxCertificateDateOut: noDate(item.taxCertificateDateOut) });
    fnGetBankAccounts(item.id);
    setOpenModalViewProv(false);
  }

  // Legacy btnContainer.Click ("Exportar", icono Excel): el Page1 del legacy no tiene un botón "Imprimir", solo este export. Se
  // conecta al slot fnPrint del ControlPanel compartido. El back exporta lo guardado en la DB (no el formulario) y es un GET (solo
  // lectura: no exige el permiso de crear). GETPdf no notifica por sí mismo: el error se avisa aquí.
  const fnPrintProvider = () => {
    setLoading(true);
    const stop = () => setLoading(false);
    request.GETPdf('inventory/process/providers/export', {}, 'Listado de Proveedores.xlsx', (err) => {
      stop();
      notifyError(err, 'page.providers.msg.exportError');
    }, 'GET', stop);
  }

  const fnDeleteProvider = () => {
    if (formState.id > 0) {
      setOpenMsgDeleteProv(true);
    }
  }

  const fnOkDeleteProvider = () => {
    setOpenMsgDeleteProv(false);
    setLoading(true);
    // Baja lógica con bloqueo por uso (elimina = 1): el back rechaza con su mensaje si el proveedor ya tiene documentos y entonces
    // el formulario conserva el proveedor. Las cuentas bancarias no se tocan (el legacy tampoco).
    request.DELETE(`inventory/process/providers/${formState.id}`, (resp) => {
      fnNewProvider();
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnLedgerAccounts = () => {
    const selectFilter = listTypeProviders.filter(item => {
      return `${item.id}` === `${formState.providerTypeId}`;
    });
    if (selectFilter.length > 0) {
      const newAccounts = {
        payableCtaCode: selectFilter[0].idCtaCxp,
        discountCtaCode: selectFilter[0].idCtaDesc,
        taxCtaCode: selectFilter[0].idCtaIva,
        freightCtaCode: selectFilter[0].idCtaFlete,
        bonusCtaCode: selectFilter[0].idCtaBon,
        otherCtaCode: selectFilter[0].idCtaOther
      }
      setBulkForm(newAccounts);
    } else {
      notification('warning', 'msg.required.select.typeProvider', 'alert.warning.title');
    }
  }

  const fnUpdateAllAccounts = () => {
    setOpenModalUpdateAllAccounts(true);
  }

  const fnTransfer = () => {

  }

  const fnEditAccount = (item) => {
    setCurrentItemBankAccount(item);
    setOpenModalBankAccount(true);
  }

  const fnDeleteAccount = (item) => {
    setCurrentItemBankAccount(item);
    setOpenMsgQuestion(true);
  }

  const fnAddAccount = (idProv) => {
    if (validInt(idProv) === 0) {
      notification('warning', 'msg.required.input.idProvider', 'alert.warning.title');
      return;
    }
    setCurrentItemBankAccount({});
    setOpenModalBankAccount(true);
  }

  const fnOkDeleteAccount = () => {
    setOpenMsgQuestion(false);
    setLoading(true);
    request.DELETE(`inventory/process/providerBanks/${currentItemBankAccount.id}`, (resp) => {
      fnGetBankAccounts(formState.id);
      setCurrentItemBankAccount({});
      setLoading(false);
    }, (err) => {
      setLoading(false);
    });
  }

  const fnInfoFact = () => {
    if (formState.id > 0) {
      setOpenModalBillingData(true);
    }
  }

  useEffect(() => {
    // getSL (no requiere el privilegio de administración 99.01.005 de Tipos de
    // Proveedor) — Proveedores solo necesita LEER la lista para el select, igual que el
    // resto de los dropdowns de referencia en la app. Antes usaba el `find` principal,
    // que exige ese privilegio administrativo aparte: si el usuario no lo tenía asignado
    // (aunque sí tuviera acceso a Proveedores), el select de Tipo de Proveedor quedaba
    // vacío en silencio — por eso no mostraba el tipo ya guardado al cargar un proveedor.
    request.GET('admin/providerTypes/getSL', (resp) => {
      const dataType = resp.data;
      setListTypeProviders(dataType);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    setLoading(true);
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const listAccounts = resp.data.map((item) => {
        return {
          label: `${item.cta} - ${item.nombre}`,
          value: item.cta
        }
      })
      setListLedgerAccounts(listAccounts);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
    if (companyData?.id) {
      request.GET(`admin/companyInternalSettings?companyId=${companyData.id}`, (resp) => {
        const [settings] = resp.data;
        setAccountingActive(!!settings?.accountingMenu);
      }, () => { });
    }
    setLoading(true);
    request.GET('admin/bankList', (resp) => {
      const banks = resp.data.map((item) => {
        return {
          label: item.name,
          value: item.name
        }
      })
      setListBanks(banks);
      setLoading(false);
    }, (err) => {

      setLoading(false);
    });
  }, []);

  const propsToControlPanel = {
    fnNew: fnNewProvider,
    fnSearch: fnSearchProvider,
    fnSave: fnSaveProvider,
    fnPrint: fnPrintProvider,
    fnDelete: fnDeleteProvider,
    buttonsHome: [
      {
        title: "button.ledgerAccounts",
        icon: "bi bi-journal-text",
        onClick: fnLedgerAccounts
      },
      {
        title: "button.transfer",
        icon: "bi bi-arrow-down-up",
        onClick: fnTransfer
      },
      {
        title: "page.providers.button.updateAllAccounts",
        icon: "bi bi-database-gear",
        onClick: fnUpdateAllAccounts
      }
    ],
    buttonsOptions: [
      {
        title: "button.infoFact",
        icon: "bi bi-receipt",
        onClick: fnInfoFact
      }
    ],
    buttonsAdmin: []
  }

  const propsToModalBankAccount = {
    ModalContent: ModalAddBankAccount,
    title: "page.providers.modal.addBankAccount.title",
    open: openModalBankAccount,
    setOpen: setOpenModalBankAccount,
    maxWidth: 'md',
    data: {
      currentItem: currentItemBankAccount,
      listBanks,
      providerId: formState.id,
      fnGetBankAccounts,
      setLoading
    }
  }

  const propsToModalViewProv = {
    ModalContent: ModalViewProv,
    title: "page.providers.modal.viewProv.title",
    open: openModalViewProv,
    setOpen: setOpenModalViewProv,
    maxWidth: 'lg',
    data: {
      dataProviders,
      fnSelectItem: fnViewProvider
    }
  }

  const propsToMsgDeleteAccount = {
    open: openMsgQuestion,
    setOpen: setOpenMsgQuestion,
    fnOnOk: fnOkDeleteAccount,
    title: "alert.question.title",
    setCurrentItemBankAccount
  }

  const propsToMsgDeleteProv = {
    open: openMsgDeleteProv,
    setOpen: setOpenMsgDeleteProv,
    fnOnOk: fnOkDeleteProvider,
    title: "alert.question.title"
  }

  const propsToModalBillingData = {
    ModalContent: ModalBillingData,
    title: "page.providers.modal.billingData.title",
    open: openModalBillingData,
    setOpen: setOpenModalBillingData,
    maxWidth: 'md',
    data: {
      // El formulario ya trae cai, rango y fecha límite del proveedor cargado; con uno recién guardado solo tiene el id.
      currentItem: formState,
      // Deja el formulario al día con lo guardado en "Info Fact." (el guardado general no manda esos campos).
      onSaved: (saved) => setBulkForm(saved),
      setLoading
    }
  }

  const propsToModalUpdateAllAccounts = {
    ModalContent: ModalUpdateAllAccounts,
    title: "page.providers.modal.updateAllAccounts.title",
    open: openModalUpdateAllAccounts,
    setOpen: setOpenModalUpdateAllAccounts,
    maxWidth: 'md',
    data: {
      listTypeProviders,
      listLedgerAccounts,
      setLoading
    }
  }

  return {
    formState,
    onInputChange,
    errors,
    accountingActive,
    sendForm,
    propsToControlPanel,
    propsToModalBankAccount,
    propsToModalBillingData,
    propsToModalViewProv,
    propsToModalUpdateAllAccounts,
    propsToMsgDeleteAccount,
    propsToMsgDeleteProv,
    listTypeProviders,
    listLedgerAccounts,
    dataBankAccounts,
    fnEditAccount,
    fnDeleteAccount,
    fnAddAccount,
    isCoffeeControl,
    isHospitalControl
  }
}
