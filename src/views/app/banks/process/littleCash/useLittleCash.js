import { useState, useEffect } from 'react'
import { useForm } from '@Hooks'
import { request, buildUrl } from '@Helpers/core';
import { printDocument } from '@Helpers/printDocument';
import notification from '@Containers/ui/Notifications';

export const useLittleCash = ({ setLoading }) => {
  const [listDocto, setListDocto] = useState([]);
  const [listAccount, setListAccount] = useState([]);
  const [listFunds, setListFunds] = useState([]);
  const [openModalView, setOpenModalView] = useState(false);
  const [openModalSettlement, setOpenModalSettlement] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [openMsgDelete, setOpenMsgDelete] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const validLittleCash = {
    date: [(val) => val !== '', "msg.required.select.date"],
    documentCode: [(val) => val !== '', "msg.required.select.document"],
    idCch: [(val) => val !== '', "page.littleCash.msg.fundRequired"],
    idCtaAccount: [(val) => val !== '', "msg.required.select.ctaCount"],
    providerName: [(val) => (val || '').trim().length > 0, "page.littleCash.msg.beneficRequired"],
    description: [(val) => (val || '').trim().length > 0, "page.littleCash.msg.conceptRequired"]
  }

  const {
    formState: formStateIndex, onResetForm: onResetFormIndex, setBulkForm: setBulkFormIndex,
    onInputChange: onInputChangeIndex, isFormValid: isFormValidIndex, formValidation: formValidationIndex
  } = useForm({
    id: 0,
    documentCode: '',
    date: '',
    idCch: '',
    providerName: '',
    description: '',
    idCtaAccount: '',
    valuePayment: 0,
    compTaxId: '',
    compName: '',
    compNumber: '',
    compSubt: 0,
    compExen: 0,
    compExon: 0,
    compGrav: 0,
    compDiscount: 0,
    compTax: 0,
    compTotal: 0,
    idLiquida: 0,
    accountId: 0,
    status: true
  }, validLittleCash)

  const { id, idCch } = formStateIndex;

  const fnNewLittleCash = () => {
    setSendForm(false);
    onResetFormIndex();
  };

  const fnLoadLittleCash = (littleCashId) => {
    setLoading(true);
    request.GET(`banks/process/littleCash/${littleCashId}`, (resp) => {
      setBulkFormIndex(resp.data);
      setSendForm(false);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnViewLittleCash = (row) => {
    setOpenModalView(false);
    fnLoadLittleCash(row.id);
  }

  const fnSearchLittleCash = () => {
    setLoading(true);
    const url = buildUrl('banks/process/littleCash/search', idCch ? { idCch } : {});
    request.GET(url, (resp) => {
      setDataList(resp.data);
      setOpenModalView(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnSaveLittleCash = () => {
    setSendForm(true);
    if (!isFormValidIndex) return;

    const payload = { header: formStateIndex };
    setLoading(true);
    if (id > 0) {
      request.PUT(`banks/process/littleCash/${id}`, payload, () => {
        fnLoadLittleCash(id);
        setLoading(false);
      }, () => setLoading(false));
    } else {
      request.POST('banks/process/littleCash', payload, (resp) => {
        fnLoadLittleCash(resp.data.header.id);
        setLoading(false);
      }, () => setLoading(false));
    }
  }

  const fnApplyToAccounting = () => {
    if (!(id > 0)) {
      notification('warning', 'page.littleCash.msg.saveFirst', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.POST(`banks/process/littleCash/${id}/applyToAccounting`, {}, () => {
      fnLoadLittleCash(id);
      notification('success', 'page.littleCash.msg.appliedOk', 'alert.success.title');
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnAskDeleteLittleCash = () => {
    if (!(id > 0)) return;
    setOpenMsgDelete(true);
  }

  const fnDeleteLittleCashOk = () => {
    setOpenMsgDelete(false);
    setLoading(true);
    request.DELETE(`banks/process/littleCash/${id}`, () => {
      fnNewLittleCash();
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnOpenSettlement = () => {
    if (!idCch) {
      notification('warning', 'page.littleCash.msg.selectFundFirst', 'alert.warning.title');
      return;
    }
    setOpenModalSettlement(true);
  }

  const propsToMsgDelete = { open: openMsgDelete, setOpen: setOpenMsgDelete, fnOnOk: fnDeleteLittleCashOk, title: "page.littleCash.msg.deleteConfirm" }

  // Imprime lo guardado en DB (SPEC v2-21).
  const fnPrint = () => printDocument({ path: 'banks/process/littleCash', id, fileName: 'Recibo de Caja Chica.pdf', setLoading });

  const propsToControlPanel = {
    fnNew: fnNewLittleCash,
    fnSearch: fnSearchLittleCash,
    fnSave: fnSaveLittleCash,
    fnDelete: fnAskDeleteLittleCash,
    buttonsHome: [
      {
        title: 'button.print',
        icon: 'bi bi-printer',
        onClick: fnPrint
      },
      {
        title: "page.littleCash.button.applyAccounting",
        icon: "bi bi-journal-check",
        onClick: fnApplyToAccounting
      },
      {
        title: "page.littleCash.button.settlement",
        icon: "bi bi-cash-coin",
        onClick: fnOpenSettlement
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  useEffect(() => {
    request.GET('banks/process/littleCash/documentTypes', (resp) => {
      setListDocto(resp.data.map((item) => ({ label: `${item.code} | ${item.name}`, value: item.code })));
    });

    request.GET('banks/settings/littleCashFunds/getSL', (resp) => {
      setListFunds(resp.data.map((item) => ({ label: `${item.code} - ${item.name}`, value: item.id })));
    });

    request.GET('accounting/settings/accountants/getSL', (resp) => {
      setListAccount(resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta })));
    });
  }, [])

  return {
    propsToControlPanel,
    formStateIndex,
    onInputChangeIndex,
    listDocto,
    listAccount,
    listFunds,
    formValidationIndex,
    sendForm,
    openModalView,
    setOpenModalView,
    dataList,
    fnViewLittleCash,
    propsToMsgDelete,
    openModalSettlement,
    setOpenModalSettlement,
    idCch
  }
}
