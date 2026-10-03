import { useState, useEffect } from 'react'
import { useForm } from '@Hooks'
import { validFloat } from '@Helpers/Utils';
import { request } from '@Helpers/core';
import { printDocument } from '@Helpers/printDocument';
import notification from '@Containers/ui/Notifications';

export const useCustomerDeposits = ({ setLoading }) => {
  const [listDocto, setListDocto] = useState([]);
  const [listBanks, setListBanks] = useState([]);
  const [listAccount, setListAccount] = useState([]);
  const [listCustomer, setListCustomer] = useState([]);
  const [lines, setLines] = useState([]);
  const [openModalView, setOpenModalView] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [openModalInvoices, setOpenModalInvoices] = useState(false);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [openMsgDelete, setOpenMsgDelete] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const validDeposit = {
    date: [(val) => val !== '', "msg.required.select.date"],
    documentCode: [(val) => val !== '', "msg.required.select.document"],
    bankCode: [(val) => val !== '', "msg.required.select.bank"],
    description: [(val) => (val || '').trim() !== '', "page.customerDeposits.msg.descriptionRequired"],
    customerId: [(val) => val !== '', "page.customerDeposits.msg.customerRequired"]
  }

  const {
    formState: formStateIndex, onResetForm: onResetFormIndex, setBulkForm: setBulkFormIndex,
    onInputChange: onInputChangeIndex, isFormValid: isFormValidIndex, formValidation: formValidationIndex
  } = useForm({
    id: 0,
    date: '',
    documentCode: '',
    documentId: 0,
    bankCode: '',
    bankAccountName: '',
    depositNumber: '',
    description: '',
    responsible: '',
    customerId: '',
    customerName: '',
    value: 0,
    exchangeRate: 1,
    pdaNumber: 0,
    status: true
  }, validDeposit)

  const { id, bankCode, customerId, pdaNumber } = formStateIndex;
  const isApplied = Number(pdaNumber) > 0;

  const fnNewDeposit = () => {
    setSendForm(false);
    onResetFormIndex();
    setLines([]);
  };

  const fnLoadDeposit = (depositId) => {
    setLoading(true);
    request.GET(`banks/process/customerDeposits/${depositId}`, (resp) => {
      const { header, lines: lineData } = resp.data;
      setBulkFormIndex(header);
      setLines(lineData.map((l) => ({
        documentCode: l.documentCode, date: l.date, originalValue: l.docValue,
        appliedValue: l.docValuePayment, deductionValue: l.docValueDeduction,
        deductionDescription: l.deductionDescription, deductionAccount: l.deductionCta
      })));
      setSendForm(false);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnViewDeposit = (row) => {
    setOpenModalView(false);
    fnLoadDeposit(row.id);
  }

  const fnSearchDeposit = () => {
    setLoading(true);
    request.GET('banks/process/customerDeposits/search', (resp) => {
      setDataList(resp.data);
      setOpenModalView(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnSaveDeposit = () => {
    setSendForm(true);
    if (!isFormValidIndex) return;

    const payload = { header: formStateIndex, lines };
    setLoading(true);
    if (id > 0) {
      request.PUT(`banks/process/customerDeposits/${id}`, payload, () => {
        fnLoadDeposit(id);
        setLoading(false);
      }, () => setLoading(false));
    } else {
      request.POST('banks/process/customerDeposits', payload, (resp) => {
        fnLoadDeposit(resp.data.header.id);
        setLoading(false);
      }, () => setLoading(false));
    }
  }

  const fnApplyToAccounting = () => {
    if (!(id > 0)) {
      notification('warning', 'page.customerDeposits.msg.saveFirst', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.POST(`banks/process/customerDeposits/${id}/applyToAccounting`, {}, () => {
      fnLoadDeposit(id);
      notification('success', 'page.customerDeposits.msg.appliedOk', 'alert.success.title');
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnOpenInvoicesPicker = () => {
    if (!customerId) {
      notification('warning', 'page.customerDeposits.msg.selectCustomerFirst', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(`banks/process/customerDeposits/pendingInvoices?customerId=${customerId}`, (resp) => {
      const alreadyApplied = lines.map((l) => l.documentCode);
      setPendingInvoices(resp.data.filter((inv) => !alreadyApplied.includes(inv.documentCode)));
      setOpenModalInvoices(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnApplyInvoice = (invoice) => {
    setLines((prev) => [...prev, {
      documentCode: invoice.documentCode, date: invoice.date, originalValue: invoice.originalValue,
      appliedValue: validFloat(invoice.balance), deductionValue: 0, deductionDescription: '', deductionAccount: ''
    }]);
    setPendingInvoices((prev) => prev.filter((inv) => inv.documentCode !== invoice.documentCode));
  }

  const fnUpdateLine = (index, field, value) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));
  }

  const fnRemoveLine = (index) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const fnAskDeleteDeposit = () => {
    if (!(id > 0)) return;
    setOpenMsgDelete(true);
  }

  const fnDeleteDepositOk = () => {
    setOpenMsgDelete(false);
    setLoading(true);
    request.DELETE(`banks/process/customerDeposits/${id}`, () => {
      fnNewDeposit();
      setLoading(false);
    }, () => setLoading(false));
  }

  const propsToMsgDelete = { open: openMsgDelete, setOpen: setOpenMsgDelete, fnOnOk: fnDeleteDepositOk, title: "page.customerDeposits.msg.deleteConfirm" }

  // Imprime lo guardado en DB (SPEC v2-21).
  const fnPrint = () => printDocument({ path: 'banks/process/customerDeposits', id, fileName: 'Recibo de Pago Clientes.pdf', setLoading });

  const propsToControlPanel = {
    fnNew: fnNewDeposit,
    fnSearch: fnSearchDeposit,
    fnSave: fnSaveDeposit,
    fnDelete: fnAskDeleteDeposit,
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
    if (!bankCode) return;
    const bank = listBanks.find((b) => b.value === bankCode);
    if (bank) setBulkFormIndex({ bankAccountName: bank.bankAccountName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankCode]);

  useEffect(() => {
    if (!customerId) return;
    const customer = listCustomer.find((c) => c.value === customerId);
    if (customer) setBulkFormIndex({ customerName: customer.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  useEffect(() => {
    setLoading(true);
    request.GET('banks/process/customerDeposits/documentTypes', (resp) => {
      setListDocto(resp.data.map((item) => ({ label: `${item.code} | ${item.name}`, value: item.code })));
      setLoading(false);
    }, () => setLoading(false));

    request.GET('banks/settings/banksAccounts/getSL', (resp) => {
      setListBanks(resp.data.map((item) => ({ label: `${item.code} - ${item.name}`, value: item.code, bankAccountName: item.name })));
    });

    request.GET('accounting/settings/accountants/getSL', (resp) => {
      setListAccount(resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta })));
    });

    request.GET('billing/settings/customers/getSL', (resp) => {
      setListCustomer(resp.data.map((item) => ({ value: item.id, label: item.name, name: item.name })));
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
    lines,
    fnUpdateLine,
    fnRemoveLine,
    fnOpenInvoicesPicker,
    openModalInvoices,
    setOpenModalInvoices,
    pendingInvoices,
    fnApplyInvoice,
    openModalView,
    setOpenModalView,
    dataList,
    fnViewDeposit,
    propsToMsgDelete,
    isApplied
  }
}
