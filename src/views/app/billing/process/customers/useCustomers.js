import { useEffect, useMemo, useState } from "react";
import { request, buildUrl } from '@Helpers/core';
import { useForm } from '@Hooks';
import notification from '@Containers/ui/Notifications';
import { validInt } from "@Helpers/Utils";
import {
  accountsFromType, buildCustomerPayload, buildInitialForm, dropUnknownAccounts, mapCustomerToForm, shouldLookupRtn, validateCustomer
} from './customerRules';

// Clientes (fac_clientes.sc2). Validación por campo con las mismas reglas del back (customerRules.js): un formulario inválido se marca y NO llama al back. Las cuentas por cobrar, de
// descuento y de impuesto son obligatorias solo con Contabilidad activa (el valor llega con admin/companyInternalSettings; mientras no se conoce se asume activa y el back decide).
// Al salir del campo RTN de un cliente nuevo se busca si ya existe y, si existe, se carga (como el legacy). "Eliminar" es una baja lógica con bloqueo por uso (DELETE
// billing/settings/customers/:id; el back rechaza con su mensaje real si algún documento lo usa).
export const useCustomers = ({ setLoading }) => {

  const [openModalViewCust, setOpenModalViewCust] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [listLedgerAccounts, setListLedgerAccounts] = useState([]);
  const [listTypeCustomers, setListTypeCustomers] = useState([]);
  const [listSellers, setListSellers] = useState([]);
  const [dataCustomers, setDataCustomers] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [isFarmControl, setIsFarmControl] = useState(false);
  const [isHospital, setIsHospital] = useState(false);
  const [accountingActive, setAccountingActive] = useState(true);
  const [listDepartments, setListDepartments] = useState([]);
  const [listMunicipalities, setListMunicipalities] = useState([]);

  const { formState, onInputChange, setBulkForm } = useForm(buildInitialForm());
  const errors = useMemo(() => validateCustomer(formState, { accountingActive }), [formState, accountingActive]);

  const onMunicRefresh = (deptoCode) => {
    if (!deptoCode) {
      setListMunicipalities([]);
      return;
    }
    request.GET(buildUrl('admin/locateMunic/getSL', { codeDepto: deptoCode }), resp => {
      setListMunicipalities(resp.data.map(item => ({ id: item.code, name: item.name })));
    }, () => { });
  }

  // Un cliente cargado (Buscar, lista o RTN existente): se normaliza (nulos a valores iniciales) y las cuentas que ya no están en el catálogo no se cargan, para que la validación
  // local pida elegir otra antes de llamar al back.
  const fnViewCustomer = (item) => {
    setSendForm(false);
    let form = mapCustomerToForm(item);
    if (listLedgerAccounts.length > 0) form = dropUnknownAccounts(form, listLedgerAccounts);
    onMunicRefresh(form.deptoCode);
    setBulkForm(form);
    setOpenModalViewCust(false);
  }

  const fnGetData = () => {
    setLoading(true);
    request.GET('billing/settings/customers/', (resp) => {
      setDataCustomers(resp.data.map((item) => ({ ...item, typeCustomer: item.customerTypeData ? item.customerTypeData.name : "" })));
      setOpenModalViewCust(true);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  useEffect(() => {
    setLoading(true);
    request.GET('accounting/settings/accountants/getSL?status=1', (resp) => {
      setListLedgerAccounts(resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta })));
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    request.GET('admin/locateDeptos/getSL', resp => {
      setListDepartments(resp.data.map(item => ({ name: item.name, id: item.code })));
    }, () => { });

    request.GET('admin/customerTypes', (resp) => {
      setListTypeCustomers(resp.data);
    }, () => { });

    // Vendedores activos (usuarios con `vende`), igual que el combo del legacy (`getActiveSellers`).
    request.GET('admin/users/getSellers', (resp) => {
      setListSellers(resp.data.map(item => ({ id: item.id, name: `${item.sellerCode} - ${item.name}` })));
    }, () => { });

    const companyData = JSON.parse(localStorage.getItem("mw_current_company"));
    if (companyData) {
      setIsFarmControl(!!companyData.isFarmControl);
      setIsHospital(!!companyData.isHospital);
      if (companyData.id) {
        request.GET(`admin/companyInternalSettings?companyId=${companyData.id}`, (resp) => {
          const [settings] = resp.data;
          setAccountingActive(!!settings?.accountingMenu);
        }, () => { });
      }
    }
  }, []);

  const fnNewCustomer = () => {
    setSendForm(false);
    setListMunicipalities([]);
    setBulkForm(buildInitialForm());
  }

  const fnSearchCustomer = () => {
    fnGetData();
  }

  const fnSaveCustomer = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) return;

    const data = buildCustomerPayload(formState, { isHospital, isFarmControl });
    const { id } = formState;
    setLoading(true);
    if (id > 0) {
      request.PUT(`billing/settings/customers/${id}`, data, () => {
        setSendForm(false);
        setLoading(false);
      }, () => {
        setLoading(false);
      });
    } else {
      request.POST('billing/settings/customers/', data, (resp) => {
        setSendForm(false);
        setBulkForm({ ...formState, id: resp.data.id });
        setLoading(false);
      }, () => {
        setLoading(false);
      });
    }
  }

  const fnDeleteCustomer = () => {
    if (validInt(formState.id) > 0) {
      setOpenMsgQuestion(true);
    } else {
      notification('warning', 'page.customers.msg.selectCustomer', 'alert.warning.title');
    }
  }

  const fnDelete = () => {
    setOpenMsgQuestion(false);
    const { id } = formState;
    if (!(validInt(id) > 0)) return;
    setLoading(true);
    request.DELETE(`billing/settings/customers/${id}`, () => {
      fnNewCustomer();
      setLoading(false);
    }, () => {
      // Rechazada (en uso o predeterminado): `request` ya mostró el mensaje real; el cliente se conserva en pantalla.
      setLoading(false);
    });
  }

  // Al salir del campo RTN de un cliente nuevo: si ya existe uno con ese RTN se carga (el back además rechaza el duplicado).
  const fnLookupRtn = () => {
    if (!shouldLookupRtn(formState)) return;
    const rtn = String(formState.rtn).trim();
    request.GET(buildUrl('billing/settings/customers', { rtn }), (resp) => {
      const [existing] = resp.data || [];
      if (existing) {
        notification('warning', 'page.customers.msg.rtnExists', 'alert.warning.title');
        fnViewCustomer(existing);
      }
    }, () => { });
  }

  // "Ctas Contab": carga las cuentas predeterminadas del tipo de cliente.
  const fnLedgerAccounts = () => {
    const type = listTypeCustomers.find(item => item.id === validInt(formState.customerTypeId));
    const accounts = accountsFromType(type);
    if (accounts) {
      setBulkForm({ ...formState, ...accounts });
    } else {
      notification('warning', 'msg.required.input.typeCustomer', 'alert.warning.title');
    }
  }

  // Al elegir el tipo en un cliente nuevo sin cuentas, se cargan las del tipo (el legacy abre "Ctas Contab" tras guardar); el usuario puede cambiarlas.
  const onTypeChange = (event) => {
    const { value } = event.target;
    const noAccounts = !formState.receivableCtaCode && !formState.discountCtaCode && !formState.taxCtaCode;
    const accounts = validInt(formState.id) === 0 && noAccounts ? accountsFromType(listTypeCustomers.find(item => item.id === validInt(value))) : null;
    if (accounts) {
      setBulkForm({ ...formState, customerTypeId: value, ...accounts });
    } else {
      onInputChange(event);
    }
  }

  const onDeptoChange = ({ target }) => {
    const { value } = target;
    setBulkForm({ ...formState, deptoCode: value, municCode: '' });
    onMunicRefresh(value);
  }

  const propsToControlPanel = {
    fnNew: fnNewCustomer,
    fnSearch: fnSearchCustomer,
    fnSave: fnSaveCustomer,
    fnDelete: fnDeleteCustomer,
    buttonsHome: [
      {
        title: "button.ledgerAccounts",
        icon: "bi bi-journal-text",
        onClick: fnLedgerAccounts
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  const propsToMsgDelete = { open: openMsgQuestion, setOpen: setOpenMsgQuestion, fnOnOk: fnDelete, title: "alert.question.title" }

  return {
    formState,
    errors,
    openModalViewCust,
    listLedgerAccounts,
    listTypeCustomers,
    listSellers,
    dataCustomers,
    sendForm,
    fnNewCustomer,
    propsToControlPanel,
    propsToMsgDelete,
    isFarmControl,
    isHospital,
    fnViewCustomer,
    fnLookupRtn,
    onInputChange,
    listDepartments,
    listMunicipalities,
    onDeptoChange,
    onTypeChange,
    setOpenModalViewCust
  }
}
