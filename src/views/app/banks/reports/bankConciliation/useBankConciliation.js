import { useEffect, useMemo, useState } from 'react';
import { useForm } from '@Hooks';
import { validFloat, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';

// Categorización de documentos réplica de calculartotales (bco_conciliacion.sc2, PROCEDURE
// calculartotales, línea 1476). Se hace por texto normalizado (no por el string exacto de
// bco_conciliacion_setreport.report, que trae la variante "Tranferencias") para no depender
// de la ortografía real de esa tabla.
const normalize = (value) => (value || '').toString().toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const categorize = (label) => {
  const upper = normalize(label);
  if (upper.includes('CHEQUE')) return 'checks';
  if (upper.includes('DEPOSITO')) return 'deposits';
  if (upper.includes('CREDITO')) return 'creditNotes';
  if (upper.includes('DEBITO')) return 'debitNotes';
  if (upper.includes('TRANSF')) return 'transfers';
  return null;
}

const emptyTotals = () => ({
  checks: { book: 0, bank: 0, diff: 0 },
  deposits: { book: 0, bank: 0, diff: 0 },
  creditNotes: { book: 0, bank: 0, diff: 0 },
  debitNotes: { book: 0, bank: 0, diff: 0 },
  transfers: { book: 0, bank: 0, diff: 0 },
  adjBook: 0,
  adjBank: 0,
  finalDifference: 0
});

export const useBankConciliation = ({ setLoading }) => {
  const [listPeriods, setListPeriods] = useState([]);
  const [listBanks, setListBanks] = useState([]);
  const [docCategoryMap, setDocCategoryMap] = useState({});
  const [lines, setLines] = useState([]);
  const [openModalNew, setOpenModalNew] = useState(false);
  const [openModalSearch, setOpenModalSearch] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [sendFormNew, setSendFormNew] = useState(false);

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

  const fnResetAll = () => {
    onResetHeader();
    setLines([]);
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

  const propsToControlPanel = {
    fnNew: fnOpenNewModal,
    fnSearch: fnOpenSearchModal,
    fnSave,
    buttonsHome: [
      {
        title: 'page.bankConciliation.button.loadDocuments',
        icon: 'bi bi-arrow-repeat',
        onClick: fnLoadDocuments
      }
    ],
    buttonsOptions: [],
    buttonsAdmin: []
  }

  // Réplica exacta de calculartotales: para Cheques, el lado Banco NO filtra por fecha
  // (incluye cheques arrastrados de períodos anteriores que aún no compensan), el lado
  // Libro SÍ se restringe al rango del período; las otras 4 categorías restringen ambos
  // lados al rango del período.
  const totals = useMemo(() => {
    const result = emptyTotals();
    if (!dateIn || !dateOut) return result;

    lines.forEach((line) => {
      const category = docCategoryMap[line.documentCode];
      if (!category) return;

      const withinPeriod = line.date >= dateIn && line.date <= dateOut;
      const debit = validFloat(line.valueDebit);
      const credit = validFloat(line.valueCredit);

      if (category === 'checks') {
        if (line.isConBank && !line.annulled) result.checks.bank += debit;
        if (line.isConBook && !line.annulled && withinPeriod) result.checks.book += debit;
        return;
      }
      if (!withinPeriod) return;

      const value = (category === 'debitNotes' || category === 'transfers') ? (debit - credit) : (credit - debit);
      if (line.isConBank) result[category].bank += value;
      if (line.isConBook) result[category].book += value;
    });

    result.checks.diff = result.checks.book - result.checks.bank;
    result.deposits.diff = result.deposits.bank - result.deposits.book;
    result.creditNotes.diff = result.creditNotes.bank - result.creditNotes.book;
    result.debitNotes.diff = result.debitNotes.bank - result.debitNotes.book;
    result.transfers.diff = result.transfers.bank - result.transfers.book;

    result.adjBook = validFloat(valueBook) - result.checks.book + result.deposits.book + result.creditNotes.book - result.debitNotes.book - result.transfers.book;
    result.adjBank = validFloat(valueBank) - result.checks.bank + result.deposits.bank + result.creditNotes.bank - result.debitNotes.bank - result.transfers.bank;
    result.finalDifference = result.adjBook - result.adjBank;

    return result;
  }, [lines, docCategoryMap, dateIn, dateOut, valueBank, valueBook]);

  const propsToTotals = useMemo(() => ({
    checks: { book: formatNumber(totals.checks.book), bank: formatNumber(totals.checks.bank), diff: formatNumber(totals.checks.diff) },
    deposits: { book: formatNumber(totals.deposits.book), bank: formatNumber(totals.deposits.bank), diff: formatNumber(totals.deposits.diff) },
    creditNotes: { book: formatNumber(totals.creditNotes.book), bank: formatNumber(totals.creditNotes.bank), diff: formatNumber(totals.creditNotes.diff) },
    debitNotes: { book: formatNumber(totals.debitNotes.book), bank: formatNumber(totals.debitNotes.bank), diff: formatNumber(totals.debitNotes.diff) },
    transfers: { book: formatNumber(totals.transfers.book), bank: formatNumber(totals.transfers.bank), diff: formatNumber(totals.transfers.diff) },
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

  return {
    header,
    onInputChangeHeader,
    lines,
    fnToggleConBank,
    fnToggleConBook,
    propsToControlPanel,
    propsToModalNew,
    propsToModalSearch,
    openModalNew,
    setOpenModalNew,
    openModalSearch,
    setOpenModalSearch,
    propsToTotals
  }
}
