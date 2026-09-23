import { useEffect, useMemo, useState } from 'react';
import { request, buildUrl } from '@Helpers/core';
import { useForm } from '@Hooks/useForms';
import { useExportExcel } from '@Hooks';
import { validFloat, IntlMessagesFn } from '@Helpers/Utils';
import createNotification from '@Containers/ui/Notifications';
import { NotificationManager } from '@Components/common/react-notifications';

const today = () => new Date().toISOString().substring(0, 10);
// Todo se contabiliza en Lempiras aunque algunos documentos se registren en dólares — el
// selector de moneda queda oculto por ahora, pero el valor se sigue enviando al backend.
const DEFAULT_CURRENCY_CODE = '01';

export const useDailyItems = ({ setLoading }) => {
  const [lines, setLines] = useState([]);
  const [listAccounts, setListAccounts] = useState([]);
  const [listCurrencies, setListCurrencies] = useState([]);
  const [listDocuments, setListDocuments] = useState([]);
  const [listCustomers, setListCustomers] = useState([]);
  const [listProviders, setListProviders] = useState([]);
  const [openSearchModal, setOpenSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [openEditLineModal, setOpenEditLineModal] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [openMsgDeleteLine, setOpenMsgDeleteLine] = useState(false);
  const [openMsgDeleteDoc, setOpenMsgDeleteDoc] = useState(false);
  const [lineToDelete, setLineToDelete] = useState(null);
  const [openViewFile, setOpenViewFile] = useState(false);
  const [documentPath, setDocumentPath] = useState('');

  const [openCxcModal, setOpenCxcModal] = useState(false);
  const [cxcPayments, setCxcPayments] = useState([]);
  const [openCxcAddModal, setOpenCxcAddModal] = useState(false);
  const [pendingCxc, setPendingCxc] = useState([]);

  const [openCxpModal, setOpenCxpModal] = useState(false);
  const [cxpPayments, setCxpPayments] = useState([]);
  const [openCxpAddModal, setOpenCxpAddModal] = useState(false);
  const [pendingCxp, setPendingCxp] = useState([]);

  const [openAdvanceModal, setOpenAdvanceModal] = useState(false);
  const [existingAdvance, setExistingAdvance] = useState(null);
  const [openAdvanceSelectModal, setOpenAdvanceSelectModal] = useState(false);
  const [pendingAdvances, setPendingAdvances] = useState([]);

  const [openRecurringModal, setOpenRecurringModal] = useState(false);
  const [pendingRecurring, setPendingRecurring] = useState([]);

  const [openConceptsModal, setOpenConceptsModal] = useState(false);
  const [pendingConcepts, setPendingConcepts] = useState([]);

  const [openAdminExpensesModal, setOpenAdminExpensesModal] = useState(false);
  const [pendingAdminExpenses, setPendingAdminExpenses] = useState([]);

  const { fnExport } = useExportExcel(setLoading);

  const savedMessage = IntlMessagesFn('page.dailyItems.msg.saved');
  const updatedMessage = IntlMessagesFn('page.dailyItems.msg.updated');
  const deletedMessage = IntlMessagesFn('page.dailyItems.msg.deleted');
  const auxAppliedMessage = IntlMessagesFn('page.dailyItems.msg.auxApplied');
  const auxErrorMessage = IntlMessagesFn('page.dailyItems.msg.auxError');
  const paymentAppliedMessage = IntlMessagesFn('page.dailyItems.msg.paymentApplied');
  const paymentApplyErrorMessage = IntlMessagesFn('page.dailyItems.msg.paymentApplyError');
  const paymentRemovedMessage = IntlMessagesFn('page.dailyItems.msg.paymentRemoved');
  const advanceSavedMessage = IntlMessagesFn('page.dailyItems.msg.advanceSaved');
  const advanceRemovedMessage = IntlMessagesFn('page.dailyItems.msg.advanceRemoved');
  const deleteErrorMessage = IntlMessagesFn('page.dailyItems.msg.deleteError');

  const { formState, onInputChange, onBulkForm, onResetForm } = useForm({
    id: 0,
    numberPDA: 0,
    documentCode: '',
    documentId: 0,
    date: today(),
    currencyCode: DEFAULT_CURRENCY_CODE,
    description: '',
    advanceId: 0,
    advanceValue: 0,
    advanceProviderName: ''
  });

  const {
    id, numberPDA, documentCode, documentId, date, currencyCode, description,
    advanceId, advanceValue
  } = formState;

  useEffect(() => {
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      setListAccounts(resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta, name: item.nombre })));
    }, () => { });

    request.GET('accounting/settings/currencies/getSL', (resp) => {
      setListCurrencies(resp.data.map((item) => ({ label: `${item.code} - ${item.name}`, value: item.code })));
    }, () => { });

    request.GET('accounting/process/dailyItems/documentTypes', (resp) => {
      setListDocuments(resp.data.map((item) => ({ label: `${item.code} - ${item.name}`, value: item.code })));
    }, () => { });

    request.GET('billing/settings/customers/getSL', (resp) => {
      setListCustomers(resp.data.map((item) => ({ label: item.name, value: item.id })));
    }, () => { });

    request.GET('inventory/process/providers/getSL', (resp) => {
      setListProviders(resp.data.map((item) => ({ label: item.name, value: item.id })));
    }, () => { });
  }, []);

  const totals = useMemo(() => {
    const totalDebit = lines.reduce((sum, l) => sum + (Number(l.valueDebit) || 0), 0);
    const totalCredit = lines.reduce((sum, l) => sum + (Number(l.valueCredit) || 0), 0);
    return {
      totalDebit,
      totalCredit,
      diff: Number((totalDebit - totalCredit).toFixed(2))
    };
  }, [lines]);

  const fnNew = () => {
    onResetForm();
    setLines([]);
  }

  const onDocumentCodeChange = (e) => {
    onInputChange(e);
    if (validFloat(id) > 0) return;
    const code = e.target.value;
    if (!code) return;

    request.POST('admin/documents/getCurrentNumber', { code }, (resp) => {
      onBulkForm({ documentId: resp.data?.codeInt || 0 });
    }, () => { }, false);
  }

  const fnOpenSearch = () => {
    setOpenSearchModal(true);
    request.GET('accounting/process/dailyItems/search', (resp) => {
      setSearchResults(resp.data);
    }, () => { });
  }

  const fnSelectEntry = (row) => {
    setLoading(true);
    request.GET(`accounting/process/dailyItems/${row.id}`, (resp) => {
      const { header, lines: detailLines } = resp.data;
      onBulkForm(header);
      setLines(detailLines.map((line) => {
        const account = listAccounts.find((a) => a.value === line.accountNumber);
        const customer = listCustomers.find((c) => c.value === line.customerId);
        const provider = listProviders.find((p) => p.value === line.providerId);
        return {
          ...line,
          accountName: account?.label || line.accountNumber,
          customerName: customer?.label || '',
          providerName: provider?.label || ''
        };
      }));
      setOpenSearchModal(false);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnAddLine = (line) => {
    if (!line.accountNumber) {
      createNotification('warning', 'page.dailyItems.msg.missingData', 'alert.warning.title');
      return false;
    }
    if (!line.description) {
      createNotification('warning', 'page.dailyItems.msg.missingData', 'alert.warning.title');
      return false;
    }
    if (validFloat(line.valueDebit) === 0 && validFloat(line.valueCredit) === 0) {
      createNotification('warning', 'page.dailyItems.msg.zeroItem', 'alert.warning.title');
      return false;
    }

    const account = listAccounts.find((a) => a.value === line.accountNumber);
    setLines((prev) => [...prev, {
      ...line,
      tempId: Date.now(),
      accountName: account?.label || line.accountNumber,
      valueDebit: validFloat(line.valueDebit),
      valueCredit: validFloat(line.valueCredit)
    }]);
    return true;
  }

  const fnEditLine = (line) => {
    setEditingLine(line);
    setOpenEditLineModal(true);
  }

  const fnUpdateLine = (updatedLine) => {
    if (validFloat(updatedLine.valueDebit) === 0 && validFloat(updatedLine.valueCredit) === 0) {
      createNotification('warning', 'page.dailyItems.msg.zeroItem', 'alert.warning.title');
      return false;
    }
    const account = listAccounts.find((a) => a.value === updatedLine.accountNumber);
    const customer = listCustomers.find((c) => c.value === validFloat(updatedLine.customerId, 0));
    const provider = listProviders.find((p) => p.value === validFloat(updatedLine.providerId, 0));
    const key = updatedLine.id || updatedLine.tempId;
    setLines((prev) => prev.map((l) => ((l.id || l.tempId) === key
      ? {
        ...updatedLine,
        accountName: account?.label || updatedLine.accountNumber,
        customerName: customer?.label || '',
        providerName: provider?.label || '',
        valueDebit: validFloat(updatedLine.valueDebit),
        valueCredit: validFloat(updatedLine.valueCredit)
      }
      : l)));
    setOpenEditLineModal(false);
    return true;
  }

  const fnAskDeleteLine = (line) => {
    setLineToDelete(line);
    setOpenMsgDeleteLine(true);
  }

  const fnDeleteLineOk = () => {
    const key = lineToDelete.id || lineToDelete.tempId;
    setLines((prev) => prev.filter((l) => (l.id || l.tempId) !== key));
    setOpenMsgDeleteLine(false);
  }

  const fnSave = () => {
    if (lines.length === 0) {
      createNotification('warning', 'page.dailyItems.msg.noDetail', 'alert.warning.title');
      return;
    }
    if (totals.diff !== 0) {
      createNotification('warning', 'page.dailyItems.msg.unbalanced', 'alert.warning.title');
      return;
    }

    const header = {
      documentCode, documentId: validFloat(documentId, 0), date, currencyCode, description,
      advanceId: validFloat(advanceId, 0), advanceValue: validFloat(advanceValue, 0)
    };
    const payloadLines = lines.map((l) => ({
      accountNumber: l.accountNumber,
      description: l.description,
      reference: l.reference || '',
      valueDebit: l.valueDebit,
      valueCredit: l.valueCredit,
      customerId: validFloat(l.customerId, 0) || undefined,
      providerId: validFloat(l.providerId, 0) || undefined
    }));

    setLoading(true);
    if (validFloat(id) === 0) {
      request.POST('accounting/process/dailyItems', { header, lines: payloadLines }, (resp) => {
        setLoading(false);
        NotificationManager.success(`${savedMessage} ${resp.data?.numberPDA || ''}`, '', 4000, null, null, '');
        fnSelectEntry({ id: resp.data.header.id });
      }, () => { setLoading(false); }, false);
    } else {
      request.PUT(`accounting/process/dailyItems/${id}`, { header, lines: payloadLines }, (resp) => {
        setLoading(false);
        NotificationManager.success(`${updatedMessage} ${resp.data?.numberPDA || ''}`, '', 4000, null, null, '');
        fnSelectEntry({ id });
      }, () => { setLoading(false); }, false);
    }
  }

  const fnAskDeleteDoc = () => {
    if (validFloat(id) === 0) return;
    setOpenMsgDeleteDoc(true);
  }

  const fnDeleteDocOk = () => {
    setOpenMsgDeleteDoc(false);
    setLoading(true);
    request.DELETE(`accounting/process/dailyItems/${id}`, () => {
      setLoading(false);
      NotificationManager.success(deletedMessage, '', 4000, null, null, '');
      fnNew();
    }, (err) => {
      setLoading(false);
      const backendDescription = err?.messages?.[0]?.description;
      const msg = (typeof backendDescription === 'object' ? backendDescription?.description : backendDescription) || deleteErrorMessage;
      NotificationManager.error(msg, '', 5000, null, null, '');
    }, false);
  }

  const fnApplyAuxiliaries = () => {
    if (validFloat(id) === 0) return;
    setLoading(true);
    request.POST(`accounting/process/dailyItems/${id}/applyAuxiliaries`, {}, () => {
      setLoading(false);
      NotificationManager.success(auxAppliedMessage, '', 4000, null, null, '');
    }, (err) => {
      setLoading(false);
      const backendDescription = err?.messages?.[0]?.description;
      const msg = (typeof backendDescription === 'object' ? backendDescription?.description : backendDescription) || auxErrorMessage;
      NotificationManager.error(msg, '', 5000, null, null, '');
    }, false);
  }

  // Botones "CxC"/"CxP" (cont_pdacxc.sc2 / cont_pdacxp.sc2): aplican el valor de esta
  // partida como pago contra facturas de CxC/CxP YA EXISTENTES (rebajan su saldo) — a
  // diferencia de "Act. Aux." que crea CxC/CxP nuevas desde las líneas de esta partida.
  const fnOpenCxc = () => {
    if (validFloat(id) === 0) return;
    request.GET(`accounting/process/dailyItems/${id}/cxcPayments`, (resp) => {
      setCxcPayments(resp.data);
      setOpenCxcModal(true);
    }, () => { });
  }

  const fnOpenCxcAdd = () => {
    request.GET('accounting/process/cxc/pending', (resp) => {
      setPendingCxc(resp.data);
      setOpenCxcAddModal(true);
    }, () => { });
  }

  const fnApplyCxcPayments = (rows) => {
    setLoading(true);
    const applyNext = (index) => {
      if (index >= rows.length) {
        setLoading(false);
        setOpenCxcAddModal(false);
        NotificationManager.success(paymentAppliedMessage, '', 4000, null, null, '');
        fnOpenCxc();
        return;
      }
      const row = rows[index];
      request.POST(`accounting/process/dailyItems/${id}/cxcPayments`, { cxcId: row.id, amount: row.amount }, () => {
        applyNext(index + 1);
      }, (err) => {
        setLoading(false);
        const backendDescription = err?.messages?.[0]?.description;
        const msg = (typeof backendDescription === 'object' ? backendDescription?.description : backendDescription) || paymentApplyErrorMessage;
        NotificationManager.error(msg, '', 5000, null, null, '');
      }, false);
    };
    applyNext(0);
  }

  const fnRemoveCxcPayment = (paymentId) => {
    setLoading(true);
    request.DELETE(`accounting/process/dailyItems/${id}/cxcPayments/${paymentId}`, () => {
      setLoading(false);
      NotificationManager.success(paymentRemovedMessage, '', 4000, null, null, '');
      fnOpenCxc();
    }, () => { setLoading(false); }, false);
  }

  const fnOpenCxp = () => {
    if (validFloat(id) === 0) return;
    request.GET(`accounting/process/dailyItems/${id}/cxpPayments`, (resp) => {
      setCxpPayments(resp.data);
      setOpenCxpModal(true);
    }, () => { });
  }

  const fnOpenCxpAdd = () => {
    request.GET('accounting/process/accountsPayable/pending', (resp) => {
      setPendingCxp(resp.data);
      setOpenCxpAddModal(true);
    }, () => { });
  }

  const fnApplyCxpPayments = (rows) => {
    setLoading(true);
    const applyNext = (index) => {
      if (index >= rows.length) {
        setLoading(false);
        setOpenCxpAddModal(false);
        NotificationManager.success(paymentAppliedMessage, '', 4000, null, null, '');
        fnOpenCxp();
        return;
      }
      const row = rows[index];
      request.POST(`accounting/process/dailyItems/${id}/cxpPayments`, { cxpId: row.id, amount: row.amount }, () => {
        applyNext(index + 1);
      }, (err) => {
        setLoading(false);
        const backendDescription = err?.messages?.[0]?.description;
        const msg = (typeof backendDescription === 'object' ? backendDescription?.description : backendDescription) || paymentApplyErrorMessage;
        NotificationManager.error(msg, '', 5000, null, null, '');
      }, false);
    };
    applyNext(0);
  }

  const fnRemoveCxpPayment = (paymentId) => {
    setLoading(true);
    request.DELETE(`accounting/process/dailyItems/${id}/cxpPayments/${paymentId}`, () => {
      setLoading(false);
      NotificationManager.success(paymentRemovedMessage, '', 4000, null, null, '');
      fnOpenCxp();
    }, () => { setLoading(false); }, false);
  }

  // Botón "Anticipo" (Controlpanelbtn3 de cont_pdas.sc2, equivalente a cont_pda_advance.sc2):
  // crea/edita/elimina el Anticipo a Proveedores que ESTA partida originó (id_father=id).
  // Distinto de "Aplicar Anticipo" (fnOpenAdvanceSelect), que consume un anticipo YA
  // EXISTENTE (de cualquier proveedor) contra esta partida.
  const fnOpenAdvance = () => {
    if (validFloat(id) === 0) return;
    request.GET(`accounting/process/dailyItems/${id}/advance`, (resp) => {
      // ResponseHelper.send coerces a null single-object result to [] (`data: data || []`,
      // the shared convention for list endpoints) — normalize back to null here so
      // ModalAdvance's `if (existingAdvance)` check doesn't treat an empty array as "exists".
      setExistingAdvance(Array.isArray(resp.data) ? null : resp.data);
      setOpenAdvanceModal(true);
    }, () => { });
  }

  const fnSaveAdvance = ({ providerId, date: advDate, value, description: advDescription }) => {
    setLoading(true);
    request.POST(`accounting/process/dailyItems/${id}/advance`, { providerId, date: advDate, value, description: advDescription }, (resp) => {
      setLoading(false);
      setExistingAdvance(resp.data);
      NotificationManager.success(advanceSavedMessage, '', 4000, null, null, '');
    }, (err) => {
      setLoading(false);
      const backendDescription = err?.messages?.[0]?.description;
      const msg = (typeof backendDescription === 'object' ? backendDescription?.description : backendDescription) || '';
      if (msg) NotificationManager.error(msg, '', 5000, null, null, '');
    }, false);
  }

  const fnRemoveAdvance = () => {
    if (!existingAdvance?.id) return;
    setLoading(true);
    request.DELETE(`accounting/process/dailyItems/advances/${existingAdvance.id}`, () => {
      setLoading(false);
      setExistingAdvance(null);
      setOpenAdvanceModal(false);
      NotificationManager.success(advanceRemovedMessage, '', 4000, null, null, '');
    }, () => { setLoading(false); }, false);
  }

  // "Seleccionar" (Commandbutton_hw4 de cont_pdas.sc2): aplica un Anticipo YA EXISTENTE
  // (de cualquier proveedor) contra esta partida — el valor se guarda en el encabezado
  // (advanceId/advanceValue) y se hace efectivo junto con "Act. Aux.".
  const fnOpenAdvanceSelect = () => {
    request.GET('accounting/process/dailyItems/pendingAdvances', (resp) => {
      setPendingAdvances(resp.data);
      setOpenAdvanceSelectModal(true);
    }, () => { });
  }

  const fnSelectAdvance = (row, amount) => {
    onBulkForm({ advanceId: row.id, advanceValue: amount, advanceProviderName: row.providerName });
    setOpenAdvanceSelectModal(false);
  }

  const fnClearAdvanceSelection = () => {
    onBulkForm({ advanceId: 0, advanceValue: 0, advanceProviderName: '' });
  }

  // "Asientos Pre." (Page2.Controlpanelbtn4 de cont_pdas.sc2 — distinto del Controlpanelbtn4
  // de Page1, que es "Act. Aux." / fnApplyAuxiliaries): carga las líneas de una Partida
  // Recurrente (ver accounting/settings/recurringItems) en un documento NUEVO — reemplaza
  // TODAS las líneas actuales y la Descripción, igual que el legacy (ZAP + reinsertar).
  // Solo disponible para un documento nuevo (id===0), igual que el legacy
  // (`IF Thisform.Textbox_hw1.Value != 0 THEN RETURN`).
  const fnOpenRecurringSelect = () => {
    if (validFloat(id) > 0) return;
    request.GET(buildUrl('accounting/settings/recurringItems/search', { status: 1 }), (resp) => {
      setPendingRecurring(resp.data);
      setOpenRecurringModal(true);
    }, () => { });
  }

  const fnSelectRecurring = (row) => {
    request.GET(`accounting/settings/recurringItems/${row.id}`, (resp) => {
      const { header, lines: detailLines } = resp.data;
      setLines(detailLines.map((l) => ({
        tempId: Date.now() + Math.random(),
        accountNumber: l.idCtaAccount,
        accountName: l.accountName || l.idCtaAccount,
        description: l.name,
        reference: l.referenceCode || '',
        valueDebit: validFloat(l.valDebe),
        valueCredit: validFloat(l.valHaber)
      })));
      onBulkForm({ description: header.descrip });
      setOpenRecurringModal(false);
    }, () => { });
  }

  // "Gastos Admin." (btnContabDocument.Click de cont_pdas.sc2): a diferencia de "Asientos
  // Pre." (que REEMPLAZA todas las líneas), esto AGREGA las líneas del documento de Gastos
  // Administrativos elegido como líneas de Débito nuevas — no reemplaza nada, no requiere
  // documento nuevo (sin guard de id===0 en el legacy). El Proveedor/No.Documento de cada
  // línea de origen NO se traslada a la partida (el legacy tampoco lo hace).
  const fnOpenAdminExpenses = () => {
    request.GET('accounting/process/adminExpenses/search', (resp) => {
      setPendingAdminExpenses(resp.data);
      setOpenAdminExpensesModal(true);
    }, () => { });
  }

  const fnSelectAdminExpense = (row) => {
    request.GET(`accounting/process/adminExpenses/${row.id}`, (resp) => {
      const { lines: detailLines } = resp.data;
      const newRows = detailLines.map((l) => ({
        tempId: Date.now() + Math.random(),
        accountNumber: l.idCtaCont,
        accountName: l.nomcta || l.idCtaCont,
        description: l.name,
        reference: '',
        valueDebit: validFloat(l.value),
        valueCredit: 0
      }));
      setLines((prev) => [...prev, ...newRows]);
      setOpenAdminExpensesModal(false);
    }, () => { });
  }

  // "Conceptos" (btnGenAuxiliar.Click de cont_pdas.sc2 — reutiliza el nombre de clase
  // compartido "btnGenAuxiliar" pero su caption real es "Conceptos", DISTINTO de "Act. Aux."
  // /Controlpanelbtn4.Click de la misma página). Autocompleta la cuenta de la línea NUEVA
  // (no una ya agregada) según los "Conceptos y Transacciones" configurados para el Tipo de
  // Documento actualmente seleccionado — ver DailyItemService.getConceptsByDocumentType.
  const fnOpenConcepts = () => {
    if (!documentCode) {
      createNotification('warning', 'page.dailyItems.msg.missingDocumentType', 'alert.warning.title');
      return;
    }
    request.GET(buildUrl('accounting/process/dailyItems/concepts', { documentCode }), (resp) => {
      setPendingConcepts(resp.data);
      setOpenConceptsModal(true);
    }, () => { });
  }

  const fnPrint = () => {
    if (validFloat(id) === 0) return;
    request.GETPdfUrl('accounting/process/dailyItems/exportPDF', { id }, (resp) => {
      setDocumentPath(resp);
      setOpenViewFile(true);
    }, () => { });
  }

  const fnExportExcel = () => {
    if (validFloat(id) === 0) return;
    fnExport('accounting/process/dailyItems/exportXlsx', { id }, `PartidaDiaria_${numberPDA}.xlsx`);
  }

  const propsToMsgDeleteLine = { open: openMsgDeleteLine, setOpen: setOpenMsgDeleteLine, fnOnOk: fnDeleteLineOk, title: 'page.dailyItems.msg.deleteLineConfirm' };
  const propsToMsgDeleteDoc = { open: openMsgDeleteDoc, setOpen: setOpenMsgDeleteDoc, fnOnOk: fnDeleteDocOk, title: 'page.dailyItems.msg.deleteDocConfirm' };

  return {
    formState, onInputChange, onDocumentCodeChange,
    lines, totals,
    listAccounts, listCurrencies, listDocuments, listCustomers, listProviders,
    fnNew, fnSave, fnOpenSearch, fnSelectEntry,
    fnAddLine, fnEditLine, fnUpdateLine, fnAskDeleteLine,
    fnAskDeleteDoc, fnPrint, fnExportExcel, fnApplyAuxiliaries,
    openSearchModal, setOpenSearchModal, searchResults,
    openEditLineModal, setOpenEditLineModal, editingLine,
    openViewFile, setOpenViewFile, documentPath,
    propsToMsgDeleteLine, propsToMsgDeleteDoc,
    fnOpenCxc, openCxcModal, setOpenCxcModal, cxcPayments,
    fnOpenCxcAdd, openCxcAddModal, setOpenCxcAddModal, pendingCxc, fnApplyCxcPayments, fnRemoveCxcPayment,
    fnOpenCxp, openCxpModal, setOpenCxpModal, cxpPayments,
    fnOpenCxpAdd, openCxpAddModal, setOpenCxpAddModal, pendingCxp, fnApplyCxpPayments, fnRemoveCxpPayment,
    fnOpenAdvance, openAdvanceModal, setOpenAdvanceModal, existingAdvance, fnSaveAdvance, fnRemoveAdvance,
    fnOpenAdvanceSelect, openAdvanceSelectModal, setOpenAdvanceSelectModal, pendingAdvances, fnSelectAdvance,
    fnClearAdvanceSelection,
    fnOpenRecurringSelect, openRecurringModal, setOpenRecurringModal, pendingRecurring, fnSelectRecurring,
    fnOpenConcepts, openConceptsModal, setOpenConceptsModal, pendingConcepts,
    fnOpenAdminExpenses, openAdminExpensesModal, setOpenAdminExpensesModal, pendingAdminExpenses, fnSelectAdminExpense
  }
}
