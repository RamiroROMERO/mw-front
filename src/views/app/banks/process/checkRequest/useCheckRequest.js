import { useEffect, useState } from 'react';
import { useForm } from '@Hooks';
import { validFloat } from '@Helpers/Utils';
import { request, buildUrl } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

export const useCheckRequest = ({ setLoading }) => {
  const [listProvider, setListProvider] = useState([]);
  const [lines, setLines] = useState([]);
  const [openModalCxp, setOpenModalCxp] = useState(false);
  const [pendingCxp, setPendingCxp] = useState([]);
  const [openModalView, setOpenModalView] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [openMsgDelete, setOpenMsgDelete] = useState(false);
  const [sendForm, setSendForm] = useState(false);

  const validRequest = {
    date: [(val) => val !== '', 'msg.required.select.date'],
    value: [(val) => validFloat(val) > 0, 'page.checkRequest.msg.valueRequired'],
    typeId: [(val) => Number(val) > 0, 'page.checkRequest.msg.typeRequired'],
    providerName: [(val) => (val || '').trim() !== '', 'page.checkRequest.msg.beneficiaryRequired'],
    concept: [(val) => (val || '').trim().length >= 5, 'page.checkRequest.msg.conceptRequired'],
    requestedBy: [(val) => (val || '').trim() !== '', 'page.checkRequest.msg.requestedByRequired']
  }

  const {
    formState: formStateIndex, onResetForm: onResetFormIndex, setBulkForm: setBulkFormIndex,
    onInputChange: onInputChangeIndex, isFormValid: isFormValidIndex, formValidation: formValidationIndex
  } = useForm({
    id: 0,
    date: '',
    value: 0,
    typeId: 0,
    providerId: '',
    providerName: '',
    concept: '',
    requestedBy: '',
    bankName: '',
    bankAccount: '',
    accountType: '',
    beneficiaryAccountName: '',
    beneficiaryRtn: '',
    beneficiaryEmail: '',
    extraChargeDescription1: '',
    extraChargeValue1: 0,
    extraChargeDescription2: '',
    extraChargeValue2: 0,
    status: 'Pendiente'
  }, validRequest);

  const { id, typeId, providerId } = formStateIndex;
  const isTransfer = Number(typeId) > 2;

  const fnNewRequest = () => {
    setSendForm(false);
    onResetFormIndex();
    setLines([]);
  };

  const fnLoadRequest = (requestId) => {
    setLoading(true);
    request.GET(`banks/process/paymentRequest/${requestId}`, (resp) => {
      const { header, lines: lineData } = resp.data;
      setBulkFormIndex(header);
      setLines(lineData);
      setSendForm(false);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnViewRequest = (row) => {
    setOpenModalView(false);
    fnLoadRequest(row.id);
  }

  const fnSearchRequest = () => {
    setLoading(true);
    request.GET('banks/process/paymentRequest/search', (resp) => {
      setDataList(resp.data);
      setOpenModalView(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnSaveRequest = () => {
    setSendForm(true);
    if (!isFormValidIndex) return;

    const payload = { header: formStateIndex, lines };
    setLoading(true);
    if (id > 0) {
      request.PUT(`banks/process/paymentRequest/${id}`, payload, () => {
        fnLoadRequest(id);
        setLoading(false);
      }, () => setLoading(false));
    } else {
      request.POST('banks/process/paymentRequest', payload, (resp) => {
        fnLoadRequest(resp.data.id);
        setLoading(false);
      }, () => setLoading(false));
    }
  }

  const fnOpenCxpPicker = () => {
    if (!(Number(providerId) > 0)) {
      notification('warning', 'page.checkRequest.msg.selectProviderFirst', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.GET(`banks/process/paymentRequest/pendingCxp?providerId=${providerId}`, (resp) => {
      const alreadyAdded = lines.map((l) => l.documentCode);
      setPendingCxp(resp.data.filter((inv) => !alreadyAdded.includes(inv.documentCode)));
      setOpenModalCxp(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnApplyCxp = (invoice) => {
    setLines((prev) => [...prev, {
      documentCode: invoice.documentCode, documentId: invoice.id, providerId: invoice.providerId,
      providerName: invoice.providerName, invoiceDate: invoice.date, invoiceValue: invoice.balance,
      paymentValue: invoice.balance
    }]);
    setPendingCxp((prev) => prev.filter((inv) => inv.documentCode !== invoice.documentCode));
  }

  const fnUpdateLine = (index, field, value) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));
  }

  const fnRemoveLine = (index) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const fnAskDelete = () => {
    if (!(id > 0)) return;
    setOpenMsgDelete(true);
  }

  const fnDeleteOk = () => {
    setOpenMsgDelete(false);
    setLoading(true);
    request.DELETE(`banks/process/paymentRequest/${id}`, () => {
      fnNewRequest();
      setLoading(false);
    }, () => setLoading(false));
  }

  const propsToMsgDelete = { open: openMsgDelete, setOpen: setOpenMsgDelete, fnOnOk: fnDeleteOk, title: 'page.checkRequest.msg.deleteConfirm' }

  const propsToControlPanel = {
    fnNew: fnNewRequest,
    fnSearch: fnSearchRequest,
    fnSave: fnSaveRequest,
    fnDelete: fnAskDelete,
    buttonsHome: [],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  useEffect(() => {
    if (!providerId) return;
    const provider = listProvider.find((p) => Number(p.value) === Number(providerId));
    if (provider) setBulkFormIndex({ providerName: provider.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  useEffect(() => {
    request.GET(buildUrl('inventory/process/providers', { status: 1 }), (resp) => {
      setListProvider((resp.data || []).map((item) => ({ value: item.id, label: `${item.dni} | ${item.name}`, name: item.name })));
    }, () => { });
  }, []);

  return {
    propsToControlPanel,
    formStateIndex,
    onInputChangeIndex,
    listProvider,
    formValidationIndex,
    sendForm,
    isTransfer,
    lines,
    fnUpdateLine,
    fnRemoveLine,
    fnOpenCxpPicker,
    openModalCxp,
    setOpenModalCxp,
    pendingCxp,
    fnApplyCxp,
    openModalView,
    setOpenModalView,
    dataList,
    fnViewRequest,
    propsToMsgDelete
  }
}
