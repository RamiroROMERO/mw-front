import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from '@Hooks';
import { validFloat, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { request } from '@Helpers/core';
import notification from '@Containers/ui/Notifications';
import {
  DEBOUNCE_MS, buildPrintRequest, buildTotalsBody, shouldFetchTotals, toPanelTotals, totalsWithoutLines
} from './bankConciliationTotalsClient';
import { isClosed } from '../../settings/scheduling/schedulingRules';

export const useBankConciliation = ({ setLoading }) => {
  const [listPeriods, setListPeriods] = useState([]);
  const [listBanks, setListBanks] = useState([]);
  const [totals, setTotals] = useState(() => totalsWithoutLines({ id: 0 }));
  const totalsRequestRef = useRef(0);
  const [lines, setLines] = useState([]);
  const [openModalNew, setOpenModalNew] = useState(false);
  const [openModalSearch, setOpenModalSearch] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [sendFormNew, setSendFormNew] = useState(false);
  const [openModalPrint, setOpenModalPrint] = useState(false);

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

  const { id, valueBank, valueBook } = header;

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

  const fnOpenPrintModal = () => {
    if (!(id > 0)) {
      notification('warning', 'page.bankConciliation.msg.selectFirst', 'alert.warning.title');
      return;
    }
    setOpenModalPrint(true);
  }

  // Imprime lo que hay en pantalla, esté o no guardado: el back recibe las marcas y los saldos, los superpone a
  // lo que hay en DB y no escribe nada (SPEC v2-33).
  const fnPrint = (type, format = 'pdf') => {
    setOpenModalPrint(false);
    const { url, data, fileName } = buildPrintRequest({ id, type, format, lines, valueBank, valueBook });
    request.GETPdf(url, data, fileName, () => setLoading(false));
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

  // Los totales los calcula el back (única implementación de la fórmula, SPEC v2-33) con las marcas actuales,
  // sin guardar. Se consulta con un pequeño retraso para no pedir un cálculo por cada casilla; una respuesta
  // vieja nunca pisa a una más nueva. Mientras llega la nueva se mantiene el último resultado.
  useEffect(() => {
    const requestId = totalsRequestRef.current + 1;
    totalsRequestRef.current = requestId;

    if (!shouldFetchTotals({ id, lines })) {
      setTotals(totalsWithoutLines({ id, valueBank, valueBook }));
      return undefined;
    }

    const timer = setTimeout(() => {
      request.POST(`banks/process/conciliations/${id}/totals`, buildTotalsBody({ lines, valueBank, valueBook }), (resp) => {
        if (totalsRequestRef.current === requestId) setTotals(toPanelTotals(resp.data));
      }, () => { }, false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [id, lines, valueBank, valueBook]);

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
      // Solo los períodos abiertos admiten conciliaciones nuevas (los cerrados las rechaza el back).
      setListPeriods(resp.data.filter((p) => !isClosed(p)).map((p) => ({
        value: p.id, label: `${(p.month || '').toUpperCase()}-${DateHelper.format(p.dateIn, 'YYYY')}`
      })));
    }, () => { });

    request.GET('banks/settings/banksAccounts/getSL', (resp) => {
      setListBanks(resp.data.map((item) => ({ label: `${item.code} - ${item.name}`, value: item.code })));
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
