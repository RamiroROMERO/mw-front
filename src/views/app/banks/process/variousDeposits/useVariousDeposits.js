import { useState, useEffect } from 'react'
import { useForm } from '@Hooks'
import { request, buildUrl } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

export const useVariousDeposits = ({ setLoading }) => {
  const [listDocto, setListDocto] = useState([]);
  const [listBanks, setListBanks] = useState([]);
  const [listAccount, setListAccount] = useState([]);
  const [listCustomer, setListCustomer] = useState([]);
  const [openModalViewDeposits, setOpenModalViewDeposits] = useState(false);
  const [dataDeposits, setDataDeposits] = useState([]);
  const [openModalAdvance, setOpenModalAdvance] = useState(false);
  const [pendingAdvances, setPendingAdvances] = useState([]);
  const [openMsgDelete, setOpenMsgDelete] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const validDeposit = {
    date: [(val) => val !== '', "msg.required.select.date"],
    bankCode: [(val) => val !== '', "msg.required.select.bank"],
    documentCode: [(val) => val !== '', "msg.required.select.document"],
    idCtaCont: [(val) => val !== '', "msg.required.select.ctaCount"],
    description: [(val) => (val || '').trim().length >= 5, "page.variousDeposits.msg.descriptionInvalid"],
    referenceCode: [(val) => (val || '').trim().length >= 3, "page.variousDeposits.msg.referenceInvalid"]
  }

  const {
    formState: formStateIndex, onResetForm: onResetFormIndex, setBulkForm: setBulkFormIndex,
    onInputChange: onInputChangeIndex, isFormValid: isFormValidIndex, formValidation: formValidationIndex
  } = useForm({
    id: 0,
    documentId: '',
    documentCode: '',
    date: '',
    bankCode: '',
    bankAccountName: '',
    description: '',
    referenceCode: '',
    idCtaCont: '',
    value: 0,
    exchangeRate: 1,
    customerId: '',
    customerName: '',
    advanceId: 0,
    advanceProviderName: '',
    advanceValue: 0,
    numberPDA: 0,
    status: true
  }, validDeposit)

  const { id, bankCode, customerId } = formStateIndex;

  const fnNewDeposit = () => {
    setSendForm(false);
    onResetFormIndex();
  };

  const fnLoadDeposit = (depositId) => {
    setLoading(true);
    request.GET(`banks/process/deposits/${depositId}`, (resp) => {
      setBulkFormIndex(resp.data);
      setSendForm(false);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnViewDeposit = (row) => {
    setOpenModalViewDeposits(false);
    fnLoadDeposit(row.id);
  }

  const fnSearchDeposit = () => {
    setLoading(true);
    request.GET('banks/process/deposits/search', (resp) => {
      setDataDeposits(resp.data);
      setOpenModalViewDeposits(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnSaveDeposit = () => {
    setSendForm(true);
    if (!isFormValidIndex) return;

    const payload = { header: formStateIndex };
    setLoading(true);
    if (id > 0) {
      request.PUT(`banks/process/deposits/${id}`, payload, (resp) => {
        setBulkFormIndex(resp.data.header);
        setLoading(false);
      }, () => setLoading(false));
    } else {
      request.POST('banks/process/deposits', payload, (resp) => {
        setBulkFormIndex(resp.data.header);
        setLoading(false);
      }, () => setLoading(false));
    }
  }

  const fnApplyToAccounting = () => {
    if (!(id > 0)) {
      notification('warning', 'page.variousDeposits.msg.saveFirst', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.POST(`banks/process/deposits/${id}/applyToAccounting`, {}, () => {
      fnLoadDeposit(id);
      notification('success', 'page.variousDeposits.msg.appliedOk', 'alert.success.title');
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnSelectAdvance = () => {
    setLoading(true);
    request.GET('banks/process/deposits/pendingAdvances', (resp) => {
      setPendingAdvances(resp.data);
      setOpenModalAdvance(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnApplyAdvance = (advance) => {
    setBulkFormIndex({
      advanceId: advance.id, advanceProviderName: advance.providerName, advanceValue: advance.balance
    });
    setOpenModalAdvance(false);
  }

  const fnRemoveAdvance = () => {
    setBulkFormIndex({ advanceId: 0, advanceProviderName: '', advanceValue: 0 });
  }

  const fnAskDeleteDeposit = () => {
    if (!(id > 0)) return;
    setOpenMsgDelete(true);
  }

  const fnDeleteDepositOk = () => {
    setOpenMsgDelete(false);
    setLoading(true);
    request.DELETE(`banks/process/deposits/${id}`, () => {
      fnNewDeposit();
      setLoading(false);
    }, () => setLoading(false));
  }

  const propsToMsgDelete = { open: openMsgDelete, setOpen: setOpenMsgDelete, fnOnOk: fnDeleteDepositOk, title: "page.variousDeposits.msg.deleteConfirm" }

  const propsToControlPanel = {
    fnNew: fnNewDeposit,
    fnSearch: fnSearchDeposit,
    fnSave: fnSaveDeposit,
    fnDelete: fnAskDeleteDeposit,
    buttonsHome: [
      {
        title: "page.variousDeposits.button.applyAccounting",
        icon: "bi bi-journal-check",
        onClick: fnApplyToAccounting
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  // Auto-completa el nombre/número de cuenta contable del banco al elegirlo (bcoSetBankAccounts).
  useEffect(() => {
    if (!bankCode) return;
    const bank = listBanks.find((b) => b.value === bankCode);
    if (bank) setBulkFormIndex({ bankAccountName: bank.bankAccountName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankCode]);

  // SearchSelect solo entrega {name, value} en su onChange — el nombre del cliente se
  // guarda como texto propio en bco_deposit.cust_name (igual que Cheques con providerName).
  useEffect(() => {
    if (!customerId) return;
    const customer = listCustomer.find((c) => c.value === customerId);
    if (customer) setBulkFormIndex({ customerName: customer.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  useEffect(() => {
    setLoading(true);
    request.GET('banks/process/deposits/documentTypes', (resp) => {
      const docto = resp.data.map((item) => ({ label: `${item.code} | ${item.name}`, value: item.code, documentId: item.id }));
      setListDocto(docto);
      setLoading(false);
    }, () => setLoading(false));

    request.GET('banks/settings/banksAccounts/getSL', (resp) => {
      const banks = resp.data.map((item) => ({
        label: `${item.code} - ${item.name}`, value: item.code, bankAccountName: item.name
      }))
      setListBanks(banks);
    });

    request.GET('accounting/settings/accountants/getSL', (resp) => {
      const accounts = resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta }));
      setListAccount(accounts);
    });

    request.GET(buildUrl('billing/settings/customers/getSL', {}), (resp) => {
      const customers = resp.data.map((item) => ({ value: item.id, label: item.name, name: item.name }));
      setListCustomer(customers);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    propsToControlPanel,
    formStateIndex,
    onInputChangeIndex,
    listDocto,
    listBanks,
    listAccount,
    listCustomer,
    formValidationIndex,
    sendForm,
    openModalViewDeposits,
    setOpenModalViewDeposits,
    dataDeposits,
    fnViewDeposit,
    openModalAdvance,
    setOpenModalAdvance,
    pendingAdvances,
    fnSelectAdvance,
    fnApplyAdvance,
    fnRemoveAdvance,
    propsToMsgDelete
  }
}
