import { useState, useEffect } from 'react'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

export const useCashWithdrawal = ({ setLoading }) => {
  const [listDocto, setListDocto] = useState([]);
  const [listBanks, setListBanks] = useState([]);
  const [listAccount, setListAccount] = useState([]);
  const [openModalView, setOpenModalView] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [openMsgDelete, setOpenMsgDelete] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const validWithdrawal = {
    date: [(val) => val !== '', "msg.required.select.date"],
    bankCode: [(val) => val !== '', "msg.required.select.bank"],
    documentCode: [(val) => val !== '', "msg.required.select.document"],
    idCtaCont: [(val) => val !== '', "msg.required.select.ctaCount"],
    description: [(val) => (val || '').trim().length >= 5, "page.variousDeposits.msg.descriptionInvalid"],
    referenceCode: [(val) => (val || '').trim().length >= 5, "page.cashWithdrawal.msg.referenceInvalid"]
  }

  const {
    formState: formStateIndex, onResetForm: onResetFormIndex, setBulkForm: setBulkFormIndex,
    onInputChange: onInputChangeIndex, isFormValid: isFormValidIndex, formValidation: formValidationIndex
  } = useForm({
    id: 0,
    documentCode: '',
    date: '',
    bankCode: '',
    bankAccountName: '',
    description: '',
    referenceCode: '',
    idCtaCont: '',
    value: 0,
    exchangeRate: 1,
    pdaNumber: 0,
    status: true
  }, validWithdrawal)

  const { id, bankCode } = formStateIndex;

  const fnNewWithdrawal = () => {
    setSendForm(false);
    onResetFormIndex();
  };

  const fnLoadWithdrawal = (withdrawalId) => {
    setLoading(true);
    request.GET(`banks/process/cashOut/${withdrawalId}`, (resp) => {
      setBulkFormIndex(resp.data);
      setSendForm(false);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnViewWithdrawal = (row) => {
    setOpenModalView(false);
    fnLoadWithdrawal(row.id);
  }

  const fnSearchWithdrawal = () => {
    setLoading(true);
    request.GET('banks/process/cashOut/search', (resp) => {
      setDataList(resp.data);
      setOpenModalView(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnSaveWithdrawal = () => {
    setSendForm(true);
    if (!isFormValidIndex) return;

    const payload = { header: formStateIndex };
    setLoading(true);
    if (id > 0) {
      request.PUT(`banks/process/cashOut/${id}`, payload, () => {
        fnLoadWithdrawal(id);
        setLoading(false);
      }, () => setLoading(false));
    } else {
      request.POST('banks/process/cashOut', payload, (resp) => {
        fnLoadWithdrawal(resp.data.header.id);
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
    request.POST(`banks/process/cashOut/${id}/applyToAccounting`, {}, () => {
      fnLoadWithdrawal(id);
      notification('success', 'page.variousDeposits.msg.appliedOk', 'alert.success.title');
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnAskDeleteWithdrawal = () => {
    if (!(id > 0)) return;
    setOpenMsgDelete(true);
  }

  const fnDeleteWithdrawalOk = () => {
    setOpenMsgDelete(false);
    setLoading(true);
    request.DELETE(`banks/process/cashOut/${id}`, () => {
      fnNewWithdrawal();
      setLoading(false);
    }, () => setLoading(false));
  }

  const propsToMsgDelete = { open: openMsgDelete, setOpen: setOpenMsgDelete, fnOnOk: fnDeleteWithdrawalOk, title: "page.cashWithdrawal.msg.deleteConfirm" }

  const propsToControlPanel = {
    fnNew: fnNewWithdrawal,
    fnSearch: fnSearchWithdrawal,
    fnSave: fnSaveWithdrawal,
    fnDelete: fnAskDeleteWithdrawal,
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

  useEffect(() => {
    if (!bankCode) return;
    const bank = listBanks.find((b) => b.value === bankCode);
    if (bank) setBulkFormIndex({ bankAccountName: bank.bankAccountName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankCode]);

  useEffect(() => {
    setLoading(true);
    request.GET('banks/process/cashOut/documentTypes', (resp) => {
      setListDocto(resp.data.map((item) => ({ label: `${item.code} | ${item.name}`, value: item.code })));
      setLoading(false);
    }, () => setLoading(false));

    request.GET('banks/settings/banksAccounts/getSL', (resp) => {
      setListBanks(resp.data.map((item) => ({ label: `${item.code} - ${item.name}`, value: item.code, bankAccountName: item.name })));
    });

    request.GET('accounting/settings/accountants/getSL', (resp) => {
      setListAccount(resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta })));
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
    formValidationIndex,
    sendForm,
    openModalView,
    setOpenModalView,
    dataList,
    fnViewWithdrawal,
    propsToMsgDelete
  }
}
