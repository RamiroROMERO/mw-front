import React, { useEffect, useState } from 'react'
import notification from '@Containers/ui/Notifications';
import { useForm } from '@Hooks/useForms';
import { request } from '@Helpers/core';
import { validInt } from '@Helpers/Utils';
import ModalBillingData from './ModalBillingData';
import ModalViewProv from './ModalViewProv';
import ModalAddBankAccount from './ModalAddBankAccount';

const providersValid = {
  providerType: [(val) => validInt(val) > 0, "msg.required.select.typeProvider"],
  dni: [(val) => val !== "", "msg.required.input.dni"],
  name: [(val) => val !== "", "msg.required.input.name"],
  phone: [(val) => val !== "", "msg.required.input.phone"],
  email: [(val) => val !== "", "msg.required.input.email"],
  idCtaCxp: [(val) => validInt(val) > 0, "msg.required.select.accounts"],
  idCtaDes: [(val) => validInt(val) > 0, "msg.required.select.accounts"],
  idCtaTax: [(val) => validInt(val) > 0, "msg.required.select.accounts"],
  idCtaFle: [(val) => validInt(val) > 0, "msg.required.select.accounts"],
  idCtaOthers: [(val) => validInt(val) > 0, "msg.required.select.accounts"]
}

const companyData = JSON.parse(localStorage.getItem('mw_current_company'));

export const useProviders = ({ setLoading }) => {

  const [sendForm, setSendForm] = useState(false);
  const [openModalBankAccount, setOpenModalBankAccount] = useState(false);
  const [openModalViewProv, setOpenModalViewProv] = useState(false);
  const [openMsgQuestion, setOpenMsgQuestion] = useState(false);
  const [openMsgDeleteProv, setOpenMsgDeleteProv] = useState(false);
  const [openModalBillingData, setOpenModalBillingData] = useState(false);
  const [listTypeProviders, setListTypeProviders] = useState([]);
  const [listLedgerAccounts, setListLedgerAccounts] = useState([]);
  const [dataBankAccounts, setDataBankAccounts] = useState([]);
  const [listBanks, setListBanks] = useState([]);
  const [dataProviders, setDataProviders] = useState([]);
  const [currentItemBankAccount, setCurrentItemBankAccount] = useState({});
  const [currentItemProvider, setCurrentItemProvider] = useState({});
  const { isCoffeeControl } = companyData;

  const { formState, formValidation, isFormValid, setBulkForm, onResetForm, onInputChange } = useForm({
    id: 0,
    dni: '',
    name: '',
    providerType: 0,
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
    taxCertificateDateOut: ''
  }, providersValid);

  const fnNewProvider = () => {
    onResetForm();
    setSendForm(false);
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

    const newData = {
      ...formState,
      dateLimit: "1900-01-01",
    };

    if (formState.id > 0) {
      setLoading(true);
      request.PUT(`inventory/process/providers/${formState.id}`, newData, (resp) => {
        setLoading(false);
      }, (err) => {
        setLoading(false);
      });
    } else {
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
    request.GET(`inventory/process/providerBanks?providerId=${idProv}`, (resp) => {
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

  const fnPrintProvider = () => {

  }

  const fnDeleteProvider = () => {
    if (formState.id > 0) {
      setOpenMsgDeleteProv(true);
    }
  }

  const fnOkDeleteProvider = () => {
    setOpenMsgDeleteProv(false);
    setLoading(true);
    request.DELETE(`inventory/process/providers/${id}`, (resp) => {
      fnNewProvider();
      setLoading(false);
      // eliminar cuentas bancarias asignadas a ese proveedor
      request.DELETE(`inventory/process/providerBanks?providerId=${id}`, (resp2) => {
      }, (err) => {
      });
    }, (err) => {
      setLoading(false);
    });
  }

  const fnLedgerAccounts = () => {
    const selectFilter = listTypeProviders.filter(item => {
      return `${item.id}` === `${providerType}`;
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
      fnGetBankAccounts(id);
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
    request.GET('admin/providerTypes/', (resp) => {
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

  return {
    formState,
    onInputChange,
    formValidation,
    sendForm,
    propsToControlPanel,
    propsToModalBankAccount,
    propsToModalBillingData,
    propsToModalViewProv,
    propsToMsgDeleteAccount,
    propsToMsgDeleteProv,
    listTypeProviders,
    listLedgerAccounts,
    dataBankAccounts,
    fnEditAccount,
    fnDeleteAccount,
    fnAddAccount,
    isCoffeeControl
  }
}
