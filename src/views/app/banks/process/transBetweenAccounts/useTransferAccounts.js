import { useState, useEffect } from 'react'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core';
import { printDocument } from '@Helpers/printDocument';
import notification from '@Containers/ui/Notifications';

export const useTransferAccounts = ({ setLoading }) => {
  const [listDocIn, setListDocIn] = useState([]);
  const [listDocOut, setListDocOut] = useState([]);
  const [listBanks, setListBanks] = useState([]);
  const [openModalView, setOpenModalView] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [openMsgDelete, setOpenMsgDelete] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const validTransfer = {
    date: [(val) => val !== '', "msg.required.select.date"],
    documentCodeIn: [(val) => val !== '', "msg.required.select.document"],
    bankCodeIn: [(val) => val !== '', "page.transferAccounts.msg.selectOriginBank"],
    referenceNumberIn: [(val) => (val || '').trim() !== '', "page.transferAccounts.msg.referenceInRequired"],
    documentCodeOut: [(val) => val !== '', "msg.required.select.document"],
    bankCodeOut: [(val) => val !== '', "page.transferAccounts.msg.selectDestinationBank"],
    referenceNumberOut: [(val) => (val || '').trim() !== '', "page.transferAccounts.msg.referenceOutRequired"]
  }

  const {
    formState: formStateIndex, onResetForm: onResetFormIndex, setBulkForm: setBulkFormIndex,
    onInputChange: onInputChangeIndex, isFormValid: isFormValidIndex, formValidation: formValidationIndex
  } = useForm({
    id: 0,
    date: '',
    documentCodeIn: '',
    documentIdIn: 0,
    bankCodeIn: '',
    bankAccountNameIn: '',
    referenceNumberIn: '',
    documentCodeOut: '',
    documentIdOut: 0,
    bankCodeOut: '',
    bankAccountNameOut: '',
    referenceNumberOut: '',
    description: '',
    value: 0,
    exchangeRate: 1,
    pdaNumber: 0,
    status: true
  }, validTransfer)

  const { id, bankCodeIn, bankCodeOut } = formStateIndex;

  const fnNewTransfer = () => {
    setSendForm(false);
    onResetFormIndex();
  };

  const fnLoadTransfer = (transferId) => {
    setLoading(true);
    request.GET(`banks/process/transferInter/${transferId}`, (resp) => {
      setBulkFormIndex(resp.data);
      setSendForm(false);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnViewTransfer = (row) => {
    setOpenModalView(false);
    fnLoadTransfer(row.id);
  }

  const fnSearchTransfer = () => {
    setLoading(true);
    request.GET('banks/process/transferInter/search', (resp) => {
      setDataList(resp.data);
      setOpenModalView(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnSaveTransfer = () => {
    setSendForm(true);
    if (!isFormValidIndex) return;
    if (bankCodeIn && bankCodeOut && bankCodeIn === bankCodeOut) {
      notification('warning', 'page.transferAccounts.msg.sameBank', 'alert.warning.title');
      return;
    }

    const payload = { header: formStateIndex };
    setLoading(true);
    if (id > 0) {
      request.PUT(`banks/process/transferInter/${id}`, payload, (resp) => {
        setBulkFormIndex(resp.data.header);
        setLoading(false);
      }, () => setLoading(false));
    } else {
      request.POST('banks/process/transferInter', payload, (resp) => {
        setBulkFormIndex(resp.data.header);
        setLoading(false);
      }, () => setLoading(false));
    }
  }

  const fnApplyToAccounting = () => {
    if (!(id > 0)) {
      notification('warning', 'page.transferAccounts.msg.saveFirst', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.POST(`banks/process/transferInter/${id}/applyToAccounting`, {}, () => {
      fnLoadTransfer(id);
      notification('success', 'page.transferAccounts.msg.appliedOk', 'alert.success.title');
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnAskDeleteTransfer = () => {
    if (!(id > 0)) return;
    setOpenMsgDelete(true);
  }

  const fnDeleteTransferOk = () => {
    setOpenMsgDelete(false);
    setLoading(true);
    request.DELETE(`banks/process/transferInter/${id}`, () => {
      fnNewTransfer();
      setLoading(false);
    }, () => setLoading(false));
  }

  const propsToMsgDelete = { open: openMsgDelete, setOpen: setOpenMsgDelete, fnOnOk: fnDeleteTransferOk, title: "page.transferAccounts.msg.deleteConfirm" }

  // Imprime lo guardado en DB (SPEC v2-21).
  const fnPrint = () => printDocument({ path: 'banks/process/transferInter', id, fileName: 'Traslado entre Cuentas.pdf', setLoading });

  const propsToControlPanel = {
    fnNew: fnNewTransfer,
    fnSearch: fnSearchTransfer,
    fnSave: fnSaveTransfer,
    fnDelete: fnAskDeleteTransfer,
    buttonsHome: [
      {
        title: 'button.print',
        icon: 'bi bi-printer',
        onClick: fnPrint
      },
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
    if (!bankCodeIn) return;
    const bank = listBanks.find((b) => b.value === bankCodeIn);
    if (bank) setBulkFormIndex({ bankAccountNameIn: bank.bankAccountName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankCodeIn]);

  useEffect(() => {
    if (!bankCodeOut) return;
    const bank = listBanks.find((b) => b.value === bankCodeOut);
    if (bank) setBulkFormIndex({ bankAccountNameOut: bank.bankAccountName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankCodeOut]);

  useEffect(() => {
    setLoading(true);
    request.GET('banks/process/transferInter/documentTypesIn', (resp) => {
      setListDocIn(resp.data.map((item) => ({ label: `${item.code} | ${item.name}`, value: item.code })));
      setLoading(false);
    }, () => setLoading(false));

    request.GET('banks/process/transferInter/documentTypesOut', (resp) => {
      setListDocOut(resp.data.map((item) => ({ label: `${item.code} | ${item.name}`, value: item.code })));
    });

    request.GET('banks/settings/banksAccounts/getSL', (resp) => {
      const banks = resp.data.map((item) => ({
        label: `${item.code} - ${item.name}`, value: item.code, bankAccountName: item.name
      }))
      setListBanks(banks);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    propsToControlPanel,
    formStateIndex,
    onInputChangeIndex,
    listDocIn,
    listDocOut,
    listBanks,
    formValidationIndex,
    sendForm,
    openModalView,
    setOpenModalView,
    dataList,
    fnViewTransfer,
    propsToMsgDelete
  }
}
