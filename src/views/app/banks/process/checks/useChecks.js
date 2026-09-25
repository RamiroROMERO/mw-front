import { useState, useEffect } from 'react'
import { useForm } from '@Hooks'
import { validFloat } from '@Helpers/Utils';
import { request, buildUrl } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

export const useChecks = ({ setLoading, lines, setLines, setEditingLineIndex }) => {
  const [listDocto, setListDocto] = useState([]);
  const [listBanks, setListBanks] = useState([]);
  const [listProvider, setListProvider] = useState([]);
  const listCurrencyName = [{ id: "Lempiras", name: "Lempiras" }, { id: "Dolares", name: "Dolares" }];
  const [openModalViewChecks, setOpenModalViewChecks] = useState(false);
  const [openModalPrintCheck, setOpenModalPrintCheck] = useState(false);
  const [openModalViewRequest, setOpenModalViewRequest] = useState(false);
  const [openModalExpenses, setOpenModalExpenses] = useState(false);
  const [openModalAnticiped, setOpenModalAnticiped] = useState(false);
  const [openModalCxp, setOpenModalCxp] = useState(false);
  const [openModalCxc, setOpenModalCxc] = useState(false)
  const [openModalUnpaidBill, setOpenModalUnpaidBill] = useState(false);
  const [openMsgVoid, setOpenMsgVoid] = useState(false);
  const [dataChecks, setDataChecks] = useState([]);
  const [dataExpenses] = useState([]);
  const [cxpPayments, setCxpPayments] = useState([]);
  const [pendingCxp, setPendingCxp] = useState([]);
  const [sendForm, setSendForm] = useState(false);

  const validCheck = {
    date: [(val) => val !== '', "msg.required.select.date"],
    bankCode: [(val) => val !== '', "msg.required.select.bank"],
    providerName: [(val) => val !== '', "msg.required.select.provider"]
  }

  const { formState: formStateIndex, onResetForm: onResetFormIndex, setBulkForm: setBulkFormIndex, onInputChange: onInputChangeIndex, isFormValid: isFormValidIndex, formValidation: formValidationIndex } = useForm({
    id: 0,
    documentId: 0,
    document: '',
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
    requestId: 0,
    pdaNumber: 0,
    pdaNumber2: 0,
    status: true
  }, validCheck)

  const { id, bankCode, providerId, pdaNumber2 } = formStateIndex;
  const isVoided = Number(pdaNumber2) > 0;

  const fnNewCheck = () => {
    setSendForm(false);
    onResetFormIndex();
    setLines([]);
    setEditingLineIndex(null);
  };

  const fnLoadCheck = (id) => {
    setLoading(true);
    request.GET(`banks/process/checks/${id}`, (resp) => {
      const { header, lines: lineData } = resp.data;
      setBulkFormIndex(header);
      setLines(lineData);
      setEditingLineIndex(null);
      setSendForm(false);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnViewCheck = (row) => {
    setOpenModalViewChecks(false);
    fnLoadCheck(row.id);
  }

  const fnSearchCheck = () => {
    setLoading(true);
    request.GET('banks/process/checks/search', (resp) => {
      setDataChecks(resp.data);
      setOpenModalViewChecks(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnRequest = () => {
    setOpenModalViewRequest(true)
  }

  const fnGeneratePrintCheck = () => {
    setOpenModalPrintCheck(true)
  }

  const fnSaveCheck = () => {
    setSendForm(true);
    if (!isFormValidIndex) return;
    if (!Array.isArray(lines) || lines.length === 0) {
      notification('warning', 'msg.checks.lines.required', 'alert.warning.title');
      return;
    }

    const payload = { header: formStateIndex, lines };
    setLoading(true);
    if (id > 0) {
      request.PUT(`banks/process/checks/${id}`, payload, () => {
        fnLoadCheck(id);
        setLoading(false);
      }, () => setLoading(false));
    } else {
      request.POST('banks/process/checks', payload, (resp) => {
        fnLoadCheck(resp.data.header.id);
        setLoading(false);
      }, () => setLoading(false));
    }
  }

  const fnExpenses = () => {
    setOpenModalExpenses(true);
  }

  const fnAnticiped = () => {
    setOpenModalAnticiped(true);
  }

  const fnViewCxp = () => {
    if (!formStateIndex.providerId) {
      notification('warning', 'msg.checks.selectProviderFirst', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(`banks/process/checks/${id}/cxpPayments`, (resp) => {
      setCxpPayments(resp.data);
      setOpenModalCxp(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnGetCxpPayments = () => {
    request.GET(`banks/process/checks/${id}/cxpPayments`, (resp) => setCxpPayments(resp.data));
  }

  const fnGetPendingCxp = () => {
    setLoading(true);
    request.GET(`banks/process/checks/pendingCxp?providerId=${formStateIndex.providerId}`, (resp) => {
      setPendingCxp(resp.data);
      setOpenModalUnpaidBill(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnApplyCxpPayment = (cxp, amount) => {
    if (!(id > 0)) {
      notification('warning', 'msg.checks.saveFirst', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.POST(`banks/process/checks/${id}/cxpPayments`, {
      cxpId: cxp.id, providerId: cxp.providerId, documentCode: cxp.documentCode, amount
    }, () => {
      fnGetCxpPayments();
      setOpenModalUnpaidBill(false);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnRemoveCxpPayment = (payment) => {
    setLoading(true);
    request.DELETE(`banks/process/checks/${id}/cxpPayments/${payment.paymentId}`, () => {
      fnGetCxpPayments();
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnViewCxc = () => {
    setOpenModalCxc(true)
  }

  const fnAskVoidCheck = () => {
    if (!(id > 0)) return;
    setOpenMsgVoid(true);
  }

  const fnVoidCheckOk = () => {
    setOpenMsgVoid(false);
    setLoading(true);
    request.POST(`banks/process/checks/${id}/void`, {}, () => {
      fnLoadCheck(id);
      setLoading(false);
    }, () => setLoading(false));
  }

  const propsToMsgVoid = { open: openMsgVoid, setOpen: setOpenMsgVoid, fnOnOk: fnVoidCheckOk, title: "page.checks.msg.voidConfirm" }

  const propsToControlPanel = {
    fnNew: fnNewCheck,
    fnSearch: fnSearchCheck,
    fnSave: fnSaveCheck,
    fnDelete: fnAskVoidCheck,
    buttonsHome: [
      {
        title: "button.checks",
        icon: "bi bi-cash-coin",
        onClick: fnGeneratePrintCheck
      },
      {
        title: "button.request",
        icon: "simple-icon-note",
        onClick: fnRequest
      },
      {
        title: "button.expenses",
        icon: "iconsminds-financial",
        onClick: fnExpenses
      },
      {
        title: "button.preview",
        icon: "bi bi-clock",
        onClick: fnAnticiped
      },
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
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  // El valor del cheque es el total del grid contable (debe=haber una vez cuadrado, igual
  // criterio que DailyItemService.saveEntry) — el input de Valor en el encabezado está
  // deshabilitado a propósito, se calcula acá.
  useEffect(() => {
    const totalDebit = lines.reduce((sum, l) => sum + (validFloat(l.valueDebit) || 0), 0);
    setBulkFormIndex({ value: totalDebit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  // Sugerencia de número de cheque al elegir el banco (bco_ctas.correla) — solo para
  // cheques nuevos, no pisa el número ya guardado al editar uno existente.
  useEffect(() => {
    if (!bankCode || id > 0) return;
    request.GET(`banks/process/checks/suggestedCheckNumber?bankCode=${bankCode}`, (resp) => {
      setBulkFormIndex({ checkNumber: resp.data.currentCheck });
    });
    const bank = listBanks.find((b) => b.value === bankCode);
    if (bank) setBulkFormIndex({ bankAccountName: bank.bankAccountName });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankCode]);

  // SearchSelect solo entrega {name, value} (el id) en su onChange — el nombre del
  // beneficiario se guarda como texto propio en bco_cheques.benefic (igual que el legacy),
  // así que se sincroniza acá cada vez que cambia el proveedor elegido.
  useEffect(() => {
    if (!providerId) return;
    const provider = listProvider.find((p) => p.value === providerId);
    if (provider) setBulkFormIndex({ providerName: provider.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  useEffect(() => {
    setLoading(true);
    request.GET('banks/process/checks/documentTypes', (resp) => {
      const docto = resp.data.map((item) => ({ label: `${item.code} | ${item.name}`, value: item.code, documentId: item.id }));
      setListDocto(docto);
      if (docto.length === 1) {
        setBulkFormIndex({ documentId: docto[0].value, document: docto[0].label });
      }
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
      listCurrencyName,
      openModalViewChecks,
      setOpenModalViewChecks,
      dataChecks,
      fnViewCheck,
      openModalPrintCheck,
      setOpenModalPrintCheck,
      openModalViewRequest,
      setOpenModalViewRequest,
      formValidationIndex,
      sendForm,
      openModalExpenses,
      setOpenModalExpenses,
      dataExpenses,
      openModalAnticiped,
      setOpenModalAnticiped,
      openModalCxc,
      setOpenModalCxc,
      openModalCxp,
      setOpenModalCxp,
      openModalUnpaidBill,
      setOpenModalUnpaidBill,
      propsToMsgVoid,
      isVoided,
      cxpPayments,
      fnGetCxpPayments,
      fnRemoveCxpPayment,
      pendingCxp,
      fnGetPendingCxp,
      fnApplyCxpPayment,
    }
  )
}
