import { useEffect, useMemo, useState } from 'react';
import { useForm } from '@Hooks';
import { validFloat, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';
import { calculateTotals, categorize } from './bankConciliationTotals';

export const useBankConciliation = ({ setLoading }) => {
  const [listPeriods, setListPeriods] = useState([]);
  const [listBanks, setListBanks] = useState([]);
  const [docCategoryMap, setDocCategoryMap] = useState({});
  const [lines, setLines] = useState([]);
  const [openModalNew, setOpenModalNew] = useState(false);
  const [openModalSearch, setOpenModalSearch] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [sendFormNew, setSendFormNew] = useState(false);
  const [openModalPrint, setOpenModalPrint] = useState(false);
  const [savedSignature, setSavedSignature] = useState('');

  const validNew = {
    periodId: [(val) => !!val, 'page.bankConciliation.msg.periodBankRequired'],
    bankCode: [(val) => !!val, 'page.bankConciliation.msg.periodBankRequired']
  }

  const {
    formState: formStateNew, onInputChange: onInputChangeNew, isFormValid: isFormValidNew,
    formValidation: formValidationNew, onResetForm: onResetFormNew
  } = useForm({ periodId: '', bankCode: '', date: DateHelper.format(DateHelper.now()) }, validNew);

  const {
    formState: header, setBulkForm: setBulkHeader, onInputChange: onInputChangeHeader, onResetForm: onResetHeader
  } = useForm({
    id: 0, periodId: '', bankCode: '', date: '', periodName: '', bankName: '', dateIn: '', dateOut: '',
    valueBank: 0, valueBook: 0
  });

  const { id, dateIn, dateOut, valueBank, valueBook } = header;

  // Firma de lo marcado y de los saldos: sirve para saber si hay cambios sin guardar antes de imprimir.
  const signatureOf = (list, bank, book) => JSON.stringify([list.map((l) => [l.id, !!l.isConBank, !!l.isConBook]), validFloat(bank), validFloat(book)]);

  const fnResetAll = () => {
    onResetHeader();
    setLines([]);
    setSavedSignature(signatureOf([], 0, 0));
  }

  const fnOpenNewModal = () => {
    onResetFormNew();
    setSendFormNew(false);
    setOpenModalNew(true);
  }

  const fnCreateConciliation = () => {
    setSendFormNew(true);
    if (!isFormValidNew) return;

    setLoading(true);
    request.POST('banks/process/conciliations', formStateNew, (resp) => {
      const h = resp.data;
      fnResetAll();
      setBulkHeader({
        id: h.id, periodId: h.periodId, bankCode: h.bankCode, date: h.date,
        periodName: h.periodName, bankName: h.bankName, dateIn: h.dateIn, dateOut: h.dateOut,
        valueBank: h.valueBank, valueBook: h.valueBook
      });
      setOpenModalNew(false);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnOpenSearchModal = () => {
    setLoading(true);
    request.GET('banks/process/conciliations/search', (resp) => {
      setDataList(resp.data);
      setOpenModalSearch(true);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnSelectConciliation = (row) => {
    setOpenModalSearch(false);
    setLoading(true);
    request.GET(`banks/process/conciliations/${row.id}`, (resp) => {
      const { header: h, lines: lineData } = resp.data;
      setBulkHeader({
        id: h.id, periodId: h.periodId, bankCode: h.bankCode, date: h.date,
        periodName: h.periodName, bankName: h.bankName, dateIn: h.dateIn, dateOut: h.dateOut,
        valueBank: h.valueBank, valueBook: h.valueBook
      });
      setLines(lineData);
      setSavedSignature(signatureOf(lineData, h.valueBank, h.valueBook));
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnLoadDocuments = () => {
    if (!(id > 0)) {
      notification('warning', 'page.bankConciliation.msg.selectFirst', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.POST(`banks/process/conciliations/${id}/items`, {}, (resp) => {
      setLines(resp.data);
      setSavedSignature(signatureOf(resp.data, valueBank, valueBook));
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnToggleConBank = (lineId) => {
    setLines((prev) => prev.map((l) => (l.id === lineId ? { ...l, isConBank: !l.isConBank } : l)));
  }

  const fnToggleConBook = (lineId) => {
    setLines((prev) => prev.map((l) => (l.id === lineId ? { ...l, isConBook: !l.isConBook } : l)));
  }

  const fnSave = () => {
    if (!(id > 0)) {
      notification('warning', 'page.bankConciliation.msg.selectFirst', 'alert.warning.title');
      return;
    }
    setLoading(true);
    const payload = {
      valueBank: validFloat(valueBank),
      valueBook: validFloat(valueBook),
      lines: lines.map((l) => ({ id: l.id, date: l.date, isConBank: l.isConBank, isConBook: l.isConBook, idConBank: l.idConBank }))
    };
    request.PUT(`banks/process/conciliations/${id}`, payload, () => {
      notification('success', 'page.bankConciliation.msg.savedOk', 'alert.success.title');
      fnLoadDocuments();
    }, () => setLoading(false));
  }

  const fnOpenPrintModal = () => {
    if (!(id > 0)) {
      notification('warning', 'page.bankConciliation.msg.selectFirst', 'alert.warning.title');
      return;
    }
    if (signatureOf(lines, valueBank, valueBook) !== savedSignature) {
      notification('warning', 'page.bankConciliation.msg.unsavedChanges', 'alert.warning.title');
      return;
    }
    setOpenModalPrint(true);
  }

  // El reporte se arma en el back con lo guardado en DB (por eso se exige guardar antes).
  const fnPrint = (type) => {
    setOpenModalPrint(false);
    request.GETPdf(`banks/process/conciliations/${id}/report`, { type }, 'Conciliacion Bancaria.pdf', () => setLoading(false), 'GET');
  }

  const propsToControlPanel = {
    fnNew: fnOpenNewModal,
    fnSearch: fnOpenSearchModal,
    fnSave,
    buttonsHome: [
      {
        title: 'page.bankConciliation.button.loadDocuments',
        icon: 'bi bi-arrow-repeat',
        onClick: fnLoadDocuments
      },
      {
        title: 'button.print',
        icon: 'bi bi-printer',
        onClick: fnOpenPrintModal
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  // Réplica de calculartotales (ver bankConciliationTotals.js).
  const totals = useMemo(
    () => calculateTotals({ lines, docCategoryMap, dateIn, dateOut, valueBank, valueBook }),
    [lines, docCategoryMap, dateIn, dateOut, valueBank, valueBook]
  );

  const propsToTotals = useMemo(() => ({
    checks: { book: formatNumber(totals.checks.book), bank: formatNumber(totals.checks.bank), diff: formatNumber(totals.checks.diff) },
    deposits: { book: formatNumber(totals.deposits.book), bank: formatNumber(totals.deposits.bank), diff: formatNumber(totals.deposits.diff) },
    creditNotes: { book: formatNumber(totals.creditNotes.book), bank: formatNumber(totals.creditNotes.bank), diff: formatNumber(totals.creditNotes.diff) },
    debitNotes: { book: formatNumber(totals.debitNotes.book), bank: formatNumber(totals.debitNotes.bank), diff: formatNumber(totals.debitNotes.diff) },
    transfers: { book: formatNumber(totals.transfers.book), bank: formatNumber(totals.transfers.bank), diff: formatNumber(totals.transfers.diff) },
    annulledChecksBook: formatNumber(totals.annulledChecksBook),
    adjBook: formatNumber(totals.adjBook),
    adjBank: formatNumber(totals.adjBank),
    finalDifference: formatNumber(totals.finalDifference)
  }), [totals]);

  useEffect(() => {
    request.GET('banks/process/conciliations/periods', (resp) => {
      setListPeriods(resp.data.map((p) => ({
        value: p.id, label: `${(p.month || '').toUpperCase()}-${DateHelper.format(p.dateIn, 'YYYY')}`
      })));
    }, () => { });

    request.GET('banks/settings/banksAccounts/getSL', (resp) => {
      setListBanks(resp.data.map((item) => ({ label: `${item.code} - ${item.name}`, value: item.code })));
    }, () => { });

    request.GET('banks/process/conciliations/categories', (resp) => {
      const map = {};
      resp.data.forEach((row) => {
        const category = categorize(row.category);
        if (category) map[row.documentCode] = category;
      });
      setDocCategoryMap(map);
    }, () => { });
  }, []);

  const propsToModalNew = {
    formStateNew, onInputChangeNew, listPeriods, listBanks, formValidationNew, sendFormNew, fnCreateConciliation
  }

  const propsToModalSearch = {
    dataList, fnSelectConciliation
  }

  const propsToModalPrint = { fnPrint }

  return {
    header,
    onInputChangeHeader,
    lines,
    fnToggleConBank,
    fnToggleConBook,
    propsToControlPanel,
    propsToModalNew,
    propsToModalSearch,
    propsToModalPrint,
    openModalPrint,
    setOpenModalPrint,
    openModalNew,
    setOpenModalNew,
    openModalSearch,
    setOpenModalSearch,
    propsToTotals
  }
}
