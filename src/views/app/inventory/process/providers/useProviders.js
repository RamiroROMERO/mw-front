import { useEffect, useState } from 'react'
import notification from '@Containers/ui/Notifications';
import { useForm } from '@Hooks/useForms';
import { useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import ModalBillingData from './ModalBillingData';
import ModalViewProv from './ModalViewProv';
import ModalAddBankAccount from './ModalAddBankAccount';
import ModalUpdateAllAccounts from './ModalUpdateAllAccounts';

// Cta. Flete y Cta. Otros Recargos NO son requeridas en el legacy (inv_providers.sc2,
// btnSaveDocument.Click solo exige NumCCxP/NumCDes/NumCImp) — antes estaban acá como
// requeridas por error, más estricto que el legacy.
// `providerTypeId` (no `providerType`): debe coincidir exacto con el atributo del modelo
// (database/invProcessProviders.js) — antes se llamaba `providerType`, un nombre que
// getValuesPOST/PUT descartaba en silencio (nunca se guardaba el tipo real) y que
// tampoco coincidía con `providerTypeId` que trae el GET, así que al cargar un proveedor
// el select de Tipo de Proveedor quedaba en blanco aunque el registro sí tuviera tipo.
const providersValid = {
  providerTypeId: [(val) => validInt(val) > 0, "msg.required.select.typeProvider"],
  dni: [(val) => val !== "", "msg.required.input.dni"],
  name: [(val) => val !== "", "msg.required.input.name"],
  phone: [(val) => val !== "", "msg.required.input.phone"],
  email: [(val) => val !== "", "msg.required.input.email"],
  idCtaCxp: [(val) => validInt(val) > 0, "msg.required.select.accounts"],
  idCtaDes: [(val) => validInt(val) > 0, "msg.required.select.accounts"],
  idCtaTax: [(val) => validInt(val) > 0, "msg.required.select.accounts"]
}

const companyData = JSON.parse(localStorage.getItem('mw_current_company'));

export const useProviders = ({ setLoading }) => {

  const { fnExport: fnExportExcel } = useExportExcel(setLoading);
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
  const [currentItemProvider, setCurrentItemProvider] = useState({});
  const { isCoffeeControl, isHospitalControl } = companyData;

  const { formState, formValidation, isFormValid, setBulkForm, onResetForm, onInputChange } = useForm({
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
    idCtaCxp: 0,
    idCtaDes: 0,
    idCtaTax: 0,
    idCtaFle: 0,
    idCtaBonific: 0,
    idCtaOthers: 0,
    taxCertificateDateOut: '',
    percHosp: 0,
    percProv: 0
  }, providersValid);

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
    if (!isFormValid) {
      return;
    }

    if (formState.id > 0) {
      // dateLimit NO va acá: lo maneja el modal "Info Fact." (ModalBillingData.jsx) por
      // separado — el legacy tampoco lo toca en btnSaveDocument.Click. Mandarlo fijo en
      // cada guardado general pisaba el vencimiento ya configurado ahí.
      setLoading(true);
      request.PUT(`inventory/process/providers/${formState.id}`, formState, (resp) => {
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    } else {
      // En alta, sí se manda el sentinel "sin vencimiento configurado" (mismo valor que
      // usa el legacy como default de fábrica para date_limit).
      const newData = {
        ...formState,
        dateLimit: "1900-01-01",
      };
      setLoading(true);
      request.POST('inventory/process/providers', newData, (resp) => {
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
    setBulkForm(item);
    fnGetBankAccounts(item.id);
    setOpenModalViewProv(false);
    setCurrentItemProvider(item);
  }

  // Legacy Controlpanel21.OptPages.Page1.btnContainer.Click ("Exportar", icono Excel) —
  // el Page1 del legacy no tiene un botón "Imprimir" propiamente dicho, solo este export.
  // Se conecta acá al slot fnPrint del ControlPanel compartido (siempre rotulado
  // "Imprimir" con ícono de impresora) porque es la única acción de "salida" que existe
  // en esta pantalla — evita agregar un botón nuevo redundante junto al ya visible.
  const fnPrintProvider = () => {
    fnExportExcel('inventory/process/providers/exportXlsx', {}, 'ListadoProveedores.xlsx');
  }

  const fnDeleteProvider = () => {
    if (formState.id > 0) {
      setOpenMsgDeleteProv(true);
    }
  }

  const fnOkDeleteProvider = () => {
    setOpenMsgDeleteProv(false);
    setLoading(true);
    // Borrado lógico (status:0), igual que el legacy (SET elimina=1) — un DELETE físico
    // rompería el historial de compras/kardex que referencia este proveedor. Las cuentas
    // bancarias del proveedor NO se tocan (el legacy tampoco las borra al eliminar).
    request.PUT(`inventory/process/providers/${formState.id}`, { status: 0 }, (resp) => {
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
        idCtaCxp: selectFilter[0].idCtaCxp,
        idCtaDes: selectFilter[0].idCtaDesc,
        idCtaTax: selectFilter[0].idCtaIva,
        idCtaFle: selectFilter[0].idCtaFlete,
        idCtaBonific: selectFilter[0].idCtaBon,
        idCtaOthers: selectFilter[0].idCtaOther
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
      currentItem: currentItemProvider,
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
    formValidation,
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
