import { useState, useEffect } from 'react'
import { useForm } from '@Hooks'
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

export const useTransferAffiliates = ({ setLoading }) => {
  const [listDocIn, setListDocIn] = useState([]);
  const [listBanks, setListBanks] = useState([]);
  const [listAffiliates, setListAffiliates] = useState([]);
  const [openModalView, setOpenModalView] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [openMsgDelete, setOpenMsgDelete] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const validTransfer = {
    date: [(val) => val !== '', "msg.required.select.date"],
    description: [(val) => (val || '').trim() !== '', "page.customerDeposits.msg.descriptionRequired"],
    documentCodeIn: [(val) => val !== '', "msg.required.select.document"],
    bankCodeIn: [(val) => val !== '', "page.transferAccounts.msg.selectOriginBank"],
    referenceIn: [(val) => (val || '').trim() !== '', "page.transferAccounts.msg.referenceInRequired"],
    affiliatedId: [(val) => val !== '', "page.transferAffiliates.msg.affiliateRequired"],
    documentCodeOut: [(val) => (val || '').trim() !== '', "page.transferAffiliates.msg.affiliateDocumentRequired"],
    bankCodeOut: [(val) => (val || '').trim() !== '', "page.transferAffiliates.msg.affiliateBankRequired"],
    referenceOut: [(val) => (val || '').trim() !== '', "page.transferAccounts.msg.referenceOutRequired"]
  }

  const {
    formState: formStateIndex, onResetForm: onResetFormIndex, setBulkForm: setBulkFormIndex,
    onInputChange: onInputChangeIndex, isFormValid: isFormValidIndex, formValidation: formValidationIndex
  } = useForm({
    id: 0,
    date: '',
    description: '',
    value: 0,
    exchangeRate: 1,
    documentCodeIn: '',
    documentIdIn: 0,
    bankCodeIn: '',
    bankAccountNameIn: '',
    referenceIn: '',
    affiliatedId: '',
    documentCodeOut: '',
    documentNameOut: '',
    documentIdOut: 0,
    bankCodeOut: '',
    bankNameOut: '',
    bankNumberOut: '',
    affiliateContCta: '',
    referenceOut: '',
    pdaNumberIn: 0,
    internalCode: '',
    status: true
  }, validTransfer)

  const { id, bankCodeIn, affiliatedId } = formStateIndex;

  const fnNewTransfer = () => {
    setSendForm(false);
    onResetFormIndex();
  };

  const fnLoadTransfer = (transferId) => {
    setLoading(true);
    request.GET(`banks/process/transfersIntercompany/${transferId}`, (resp) => {
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
    request.GET('banks/process/transfersIntercompany/search', (resp) => {
      setDataList(resp.data);
      setOpenModalView(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnSaveTransfer = () => {
    setSendForm(true);
    if (!isFormValidIndex) return;

    const payload = { header: formStateIndex };
    setLoading(true);
    if (id > 0) {
      request.PUT(`banks/process/transfersIntercompany/${id}`, payload, () => {
        fnLoadTransfer(id);
        setLoading(false);
      }, () => setLoading(false));
    } else {
      request.POST('banks/process/transfersIntercompany', payload, (resp) => {
        fnLoadTransfer(resp.data.header.id);
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
    request.POST(`banks/process/transfersIntercompany/${id}/applyToAccounting`, {}, () => {
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
    request.DELETE(`banks/process/transfersIntercompany/${id}`, () => {
      fnNewTransfer();
      notification('warning', 'page.transferAffiliates.msg.manualAffiliateReminder', 'alert.warning.title');
      setLoading(false);
    }, () => setLoading(false));
  }

  const propsToMsgDelete = { open: openMsgDelete, setOpen: setOpenMsgDelete, fnOnOk: fnDeleteTransferOk, title: "page.transferAccounts.msg.deleteConfirm" }

  const propsToControlPanel = {
    fnNew: fnNewTransfer,
    fnSearch: fnSearchTransfer,
    fnSave: fnSaveTransfer,
    fnDelete: fnAskDeleteTransfer,
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
    if (!bankCodeIn) return;
    const bank = listBanks.find((b) => b.value === bankCodeIn);
    if (bank) setBulkFormIndex({ bankAccountNameIn: bank.bankAccountName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankCodeIn]);

  // Al elegir la afiliada, se autocompletan las sugerencias de documento/nombre de destino
  // configuradas en set_intercompany (code_depo/name_depo) — solo si el usuario aún no
  // escribió nada, para no pisar datos ya cargados al reabrir un documento existente.
  useEffect(() => {
    if (!affiliatedId) return;
    const affiliate = listAffiliates.find((a) => a.value === affiliatedId);
    if (affiliate && !formStateIndex.documentCodeOut) {
      setBulkFormIndex({ documentCodeOut: affiliate.codeDepo || '', documentNameOut: affiliate.nameDepo || '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [affiliatedId]);

  useEffect(() => {
    setLoading(true);
    request.GET('banks/process/transfersIntercompany/documentTypesIn', (resp) => {
      setListDocIn(resp.data.map((item) => ({ label: `${item.code} | ${item.name}`, value: item.code })));
      setLoading(false);
    }, () => setLoading(false));

    request.GET('banks/settings/banksAccounts/getSL', (resp) => {
      setListBanks(resp.data.map((item) => ({ label: `${item.code} - ${item.name}`, value: item.code, bankAccountName: item.name })));
    });

    request.GET('banks/process/transfersIntercompany/affiliates', (resp) => {
      setListAffiliates(resp.data.map((item) => ({
        value: item.id, label: item.name, codeDepo: item.codeDepo, nameDepo: item.nameDepo
      })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    propsToControlPanel,
    formStateIndex,
    onInputChangeIndex,
    listDocIn,
    listBanks,
    listAffiliates,
    formValidationIndex,
    sendForm,
    openModalView,
    setOpenModalView,
    dataList,
    fnViewTransfer,
    propsToMsgDelete
  }
}
