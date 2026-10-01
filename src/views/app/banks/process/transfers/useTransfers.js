import { useState, useEffect, useRef } from 'react'
import { useForm } from '@Hooks'
import { validFloat } from '@Helpers/Utils';
import { request, buildUrl } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';
import { createValueSync } from './transferValueSync';

const listAccountTypes = [
  { id: '', name: '' },
  { id: 'Cuenta de Cheques', name: 'Cuenta de Cheques' },
  { id: 'Cuenta de Ahorro', name: 'Cuenta de Ahorro' }
];

export const useTransfers = ({ setLoading, lines, setLines, setEditingLineIndex }) => {
  const valueSync = useRef(createValueSync()).current;
  const [listDocto, setListDocto] = useState([]);
  const [listBanks, setListBanks] = useState([]);
  const [listProvider, setListProvider] = useState([]);
  const [listCustomer, setListCustomer] = useState([]);
  const listCurrencyName = [{ id: "Lempiras", name: "Lempiras" }, { id: "Dolares", name: "Dolares" }];
  const [openModalViewTransfers, setOpenModalViewTransfers] = useState(false);
  const [openModalCxp, setOpenModalCxp] = useState(false);
  const [openModalCxc, setOpenModalCxc] = useState(false);
  const [openModalUnpaidBill, setOpenModalUnpaidBill] = useState(false);
  const [openModalUnpaidInvoice, setOpenModalUnpaidInvoice] = useState(false);
  const [openMsgDelete, setOpenMsgDelete] = useState(false);
  const [dataTransfers, setDataTransfers] = useState([]);
  const [cxpPayments, setCxpPayments] = useState([]);
  const [pendingCxp, setPendingCxp] = useState([]);
  const [cxcPayments, setCxcPayments] = useState([]);
  const [pendingCxc, setPendingCxc] = useState([]);
  const [openModalViewRequest, setOpenModalViewRequest] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sendForm, setSendForm] = useState(false);

  const validTransfer = {
    date: [(val) => val !== '', "msg.required.select.date"],
    bankCode: [(val) => val !== '', "msg.required.select.bank"],
    documentCode: [(val) => val !== '', "msg.required.select.document"],
    providerName: [(val) => val !== '', "msg.required.select.provider"]
  }

  const { formState: formStateIndex, onResetForm: onResetFormIndex, setBulkForm: setBulkFormIndex, onInputChange: onInputChangeIndex, isFormValid: isFormValidIndex, formValidation: formValidationIndex } = useForm({
    id: 0,
    documentId: 0,
    documentCode: '',
    bankCode: '',
    bankAccountName: '',
    providerId: 0,
    providerName: '',
    checkNumber: '',
    date: '',
    value: 0,
    valueUsd: 0,
    exchangeRate: 1,
    currencyName: 'Lempiras',
    referenceCode: '',
    benefRtn: '',
    accountType: '',
    requestId: 0,
    status: true
  }, validTransfer)

  const { id, bankCode, providerId, documentCode } = formStateIndex;

  const fnNewTransfer = () => {
    setSendForm(false);
    onResetFormIndex();
    setLines([]);
    setEditingLineIndex(null);
  };

  // "Cargar Solicitud de Pago" — trae solicitudes pendientes (sin Cheque/Transferencia real
  // que las haya consumido aún, ver PaymentRequestService.getPending) filtradas a las de tipo
  // Transferencia (typeId 3=Lps, 4=USD); al elegir una, autocompleta beneficiario/valor/RTN/
  // tipo de cuenta y guarda requestId para que bco_cheques.no_soli quede vinculado al guardar.
  const fnRequest = () => {
    setLoading(true);
    request.GET('banks/process/paymentRequest/pending', (resp) => {
      setPendingRequests((resp.data || []).filter((r) => Number(r.typeId) > 2));
      setOpenModalViewRequest(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnSelectRequest = (row) => {
    setOpenModalViewRequest(false);
    setBulkFormIndex({
      providerId: row.providerId || 0,
      providerName: row.providerName,
      value: row.value,
      benefRtn: row.beneficiaryRtn,
      accountType: row.accountType,
      requestId: row.id
    });
  }

  const fnLoadTransfer = (id) => {
    setLoading(true);
    request.GET(`banks/process/transfers/${id}`, (resp) => {
      const { header, lines: lineData } = resp.data;
      setBulkFormIndex(header);
      valueSync.markLoaded();
      setLines(lineData);
      setEditingLineIndex(null);
      setSendForm(false);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnViewTransfer = (row) => {
    setOpenModalViewTransfers(false);
    fnLoadTransfer(row.id);
  }

  const fnSearchTransfer = () => {
    setLoading(true);
    request.GET('banks/process/transfers/search', (resp) => {
      setDataTransfers(resp.data);
      setOpenModalViewTransfers(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnSaveTransfer = () => {
    setSendForm(true);
    if (!isFormValidIndex) return;
    if (!Array.isArray(lines) || lines.length === 0) {
      notification('warning', 'msg.transfers.lines.required', 'alert.warning.title');
      return;
    }

    const payload = { header: formStateIndex, lines };
    setLoading(true);
    if (id > 0) {
      request.PUT(`banks/process/transfers/${id}`, payload, () => {
        fnLoadTransfer(id);
        setLoading(false);
      }, () => setLoading(false));
    } else {
      request.POST('banks/process/transfers', payload, (resp) => {
        fnLoadTransfer(resp.data.header.id);
        setLoading(false);
      }, () => setLoading(false));
    }
  }

  const fnViewCxp = () => {
    if (!formStateIndex.providerId) {
      notification('warning', 'msg.transfers.selectProviderFirst', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(`banks/process/transfers/${id}/cxpPayments`, (resp) => {
      setCxpPayments(resp.data);
      setOpenModalCxp(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnGetCxpPayments = () => {
    request.GET(`banks/process/transfers/${id}/cxpPayments`, (resp) => setCxpPayments(resp.data));
  }

  const fnGetPendingCxp = () => {
    setLoading(true);
    request.GET(`banks/process/transfers/pendingCxp?providerId=${formStateIndex.providerId}`, (resp) => {
      setPendingCxp(resp.data);
      setOpenModalUnpaidBill(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnApplyCxpPayment = (cxp, amount) => {
    if (!(id > 0)) {
      notification('warning', 'msg.transfers.saveFirst', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.POST(`banks/process/transfers/${id}/cxpPayments`, {
      cxpId: cxp.id, providerId: cxp.providerId, documentCode: cxp.documentCode, amount
    }, () => {
      fnGetCxpPayments();
      setOpenModalUnpaidBill(false);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnRemoveCxpPayment = (payment) => {
    setLoading(true);
    request.DELETE(`banks/process/transfers/${id}/cxpPayments/${payment.paymentId}`, () => {
      fnGetCxpPayments();
      setLoading(false);
    }, () => setLoading(false));
  }

  // A diferencia de CxP (que se filtra por el proveedor ya elegido en el encabezado), el
  // beneficiario de una Transferencia no tiene por qué ser el cliente al que se le abona —
  // el cliente se elige dentro del propio modal de CxC (ModalCxc), no en el formulario.
  const fnViewCxc = () => {
    if (!(id > 0)) {
      notification('warning', 'msg.transfers.saveFirst', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(`banks/process/transfers/${id}/cxcPayments`, (resp) => {
      setCxcPayments(resp.data);
      setOpenModalCxc(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnGetCxcPayments = () => {
    request.GET(`banks/process/transfers/${id}/cxcPayments`, (resp) => setCxcPayments(resp.data));
  }

  const fnGetPendingCxc = (customerId) => {
    if (!customerId) {
      notification('warning', 'msg.transfers.selectCustomerFirst', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(`banks/process/transfers/pendingCxc?customerId=${customerId}`, (resp) => {
      setPendingCxc(resp.data);
      setOpenModalUnpaidInvoice(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnApplyCxcPayment = (cxc, amount) => {
    setLoading(true);
    request.POST(`banks/process/transfers/${id}/cxcPayments`, {
      cxcId: cxc.id, customerId: cxc.customerId, documentCode: cxc.documentCode, amount
    }, () => {
      fnGetCxcPayments();
      setOpenModalUnpaidInvoice(false);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnRemoveCxcPayment = (payment) => {
    setLoading(true);
    request.DELETE(`banks/process/transfers/${id}/cxcPayments/${payment.paymentId}`, () => {
      fnGetCxcPayments();
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
    request.DELETE(`banks/process/transfers/${id}`, () => {
      fnNewTransfer();
      setLoading(false);
    }, () => setLoading(false));
  }

  const propsToMsgDelete = { open: openMsgDelete, setOpen: setOpenMsgDelete, fnOnOk: fnDeleteTransferOk, title: "page.transfers.msg.deleteConfirm" }

  const propsToControlPanel = {
    fnNew: fnNewTransfer,
    fnSearch: fnSearchTransfer,
    fnSave: fnSaveTransfer,
    fnDelete: fnAskDeleteTransfer,
    buttonsHome: [
      {
        title: "button.cxp",
        icon: "iconsminds-coins",
        onClick: fnViewCxp
      },
      {
        title: "button.cxc",
        icon: "iconsminds-financial",
        onClick: fnViewCxc
      },
      {
        title: "button.request",
        icon: "simple-icon-note",
        onClick: fnRequest
      },
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  // El valor de la transferencia es el total del grid contable (debe=haber una vez
  // cuadrado, igual criterio que Cheques/DailyItemService.saveEntry). Al cargar una transferencia existente se
  // conserva el valor guardado (neto, con retenciones) en vez de reemplazarlo por el total de débitos.
  useEffect(() => {
    if (!valueSync.shouldSyncValue()) return;
    const totalDebit = lines.reduce((sum, l) => sum + (validFloat(l.valueDebit) || 0), 0);
    setBulkFormIndex({ value: totalDebit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  // Con un solo documento de transferencia disponible se preselecciona (también tras "Nuevo", que limpia el formulario).
  useEffect(() => {
    if (id > 0 || documentCode || listDocto.length !== 1) return;
    setBulkFormIndex({ documentCode: listDocto[0].value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listDocto, id, documentCode]);

  useEffect(() => {
    if (!bankCode || id > 0) return;
    const bank = listBanks.find((b) => b.value === bankCode);
    if (bank) setBulkFormIndex({ bankAccountName: bank.bankAccountName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankCode]);

  // SearchSelect solo entrega {name, value} (el id) en su onChange — el nombre del
  // beneficiario se guarda como texto propio en bco_cheques.benefic, así que se sincroniza
  // acá cada vez que cambia el proveedor elegido (igual patrón que Cheques).
  useEffect(() => {
    if (!providerId) return;
    const provider = listProvider.find((p) => p.value === providerId);
    if (provider) setBulkFormIndex({ providerName: provider.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  useEffect(() => {
    setLoading(true);
    request.GET('banks/process/transfers/documentTypes', (resp) => {
      const docto = resp.data.map((item) => ({ label: `${item.code} | ${item.name}`, value: item.code }));
      setListDocto(docto);
      setLoading(false);
    }, () => setLoading(false));

    request.GET('banks/settings/banksAccounts/getSL', (resp) => {
      const banks = resp.data.map((item) => ({
        label: `${item.code} - ${item.name}`,
        value: item.code,
        bankAccountName: item.name
      }))
      setListBanks(banks);
    });

    request.GET(buildUrl('inventory/process/providers', { status: 1 }), (resp) => {
      const providerValue = resp.data.map((item) => ({
        value: item.id,
        label: ` ${item.dni} | ${item.name}`,
        name: item.name
      }));
      setListProvider(providerValue);
    });

    request.GET('billing/settings/customers/getSL', (resp) => {
      const customerValue = resp.data.map((item) => ({ value: item.id, label: item.name, name: item.name }));
      setListCustomer(customerValue);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    {
      propsToControlPanel,
      formStateIndex,
      setBulkFormIndex,
      onInputChangeIndex,
      onResetFormIndex,
      listDocto,
      listBanks,
      listProvider,
      listCustomer,
      listCurrencyName,
      listAccountTypes,
      openModalViewTransfers,
      setOpenModalViewTransfers,
      dataTransfers,
      fnViewTransfer,
      formValidationIndex,
      sendForm,
      openModalCxp,
      setOpenModalCxp,
      openModalCxc,
      setOpenModalCxc,
      openModalUnpaidBill,
      setOpenModalUnpaidBill,
      openModalUnpaidInvoice,
      setOpenModalUnpaidInvoice,
      propsToMsgDelete,
      cxpPayments,
      fnGetCxpPayments,
      fnRemoveCxpPayment,
      pendingCxp,
      fnGetPendingCxp,
      fnApplyCxpPayment,
      cxcPayments,
      fnGetCxcPayments,
      fnRemoveCxcPayment,
      pendingCxc,
      fnGetPendingCxc,
      fnApplyCxcPayment,
      openModalViewRequest,
      setOpenModalViewRequest,
      pendingRequests,
      fnSelectRequest,
    }
  )
}
