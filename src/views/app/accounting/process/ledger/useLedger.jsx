import { useEffect, useMemo, useRef, useState } from 'react';
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils';
import { useForm, useExportExcel } from '@Hooks';
import { request, notifyError } from '@Helpers/core';
import createNotification from '@Containers/ui/Notifications';
import ModalViewEntry from './ModalViewEntry';
import {
  currentMonthRange, validateQuery, buildQuery, searchPath, exportPath, totalPages, rangeSummary, normalizeResponse
} from './ledgerRules';

const MODE_OPTIONS = [
  { id: 1, label: 'page.ledger.radio.currentAccount' },
  { id: 2, label: 'page.ledger.radio.multipleAccounts' }
];

// Libro Mayor (cont_lmayor.sc2, SPEC v2-127-sr). Rango por defecto: el mes en curso. Paginado en el servidor; el saldo anterior, los totales y el saldo final de la cuenta vienen del back para TODO
// el rango. Solo hay Excel (sin PDF): lo escribe el back por flujo con el mismo filtro.
export const useLedger = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const [mode, setMode] = useState('single');
  const [listAccounts, setListAccounts] = useState([]);
  const [accountCodesMulti, setAccountCodesMulti] = useState([]);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPageState] = useState(1);
  const [sendForm, setSendForm] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewEntryData, setViewEntryData] = useState(null);
  // Filtro de la última consulta: paginar usa ESTE, no lo que se esté digitando.
  const applied = useRef(null);
  const requestId = useRef(0);

  const { formState, onInputChange } = useForm({ ...currentMonthRange(), accountCode: '' });
  const { dateStart, dateEnd, accountCode } = formState;
  const current = { mode, dateStart, dateEnd, accountCode, accountCodes: accountCodesMulti };
  const errors = useMemo(() => validateQuery({ mode, dateStart, dateEnd, accountCode, accountCodes: accountCodesMulti }), [mode, dateStart, dateEnd, accountCode, accountCodesMulti]);

  const clearResults = () => {
    requestId.current += 1;
    applied.current = null;
    setRows([]);
    setMeta(null);
    setTotalRecords(0);
    setCurrentPageState(1);
  };

  const onModeChange = (e) => {
    setMode(Number(e.target.value) === 2 ? 'multi' : 'single'); // el RadioGroup compara ids numéricos
    setSendForm(false);
    clearResults();
  };

  const onMultiAccountsChange = (options) => {
    setAccountCodesMulti((options || []).map((o) => o.value));
  };

  const fnViewEntry = (row) => {
    request.GET(`accounting/process/diaryBook/entry/${row.fatherId}`, (resp) => {
      setViewEntryData(resp.data);
      setOpenViewModal(true);
    }, () => { });
  };

  // Una página; una respuesta vieja nunca pisa a una más nueva.
  const load = (page) => {
    if (!applied.current) return;
    const id = requestId.current + 1;
    requestId.current = id;
    setLoading(true);
    request.POST(searchPath(applied.current.mode), buildQuery(applied.current, { page }), (resp) => {
      if (id !== requestId.current) return;
      const data = normalizeResponse(resp.data);
      setRows(data.rows);
      setTotalRecords(data.totalRecords);
      setMeta(applied.current.mode === 'single'
        ? { single: true, account: data.account, openingBalance: data.openingBalance, closingBalance: data.closingBalance, totals: data.totals }
        : { single: false, totals: data.totals });
      setLoading(false);
    }, (err) => {
      if (id !== requestId.current) return;
      setLoading(false);
      notifyError(err, 'page.ledger.msg.searchError');
    }, false);
  };

  const validate = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) {
      createNotification('warning', Object.values(errors)[0], 'alert.warning.title');
      return false;
    }
    return true;
  };

  const fnSearch = () => {
    if (!validate()) return;
    applied.current = { ...current };
    setCurrentPageState(1);
    load(1);
  };

  const setCurrentPage = (page) => {
    if (page === currentPage) return; // la tabla también lo invoca al montarse
    setCurrentPageState(page);
    load(page);
  };

  const fnExportXlsx = () => {
    if (!validate()) return;
    fnExport(exportPath(mode), buildQuery(current), 'LibroMayor.xlsx');
  };

  useEffect(() => {
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      setListAccounts(resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta })));
    }, () => { });
  }, []);

  const viewActionColumn = {
    text: '',
    dataField: 'actions',
    headerStyle: { width: '2%' },
    cell: ({ row }) => (
      <i
        className="bi bi-eye-fill cursor-pointer"
        title={IntlMessages('page.diaryBook.button.viewEntry')}
        onClick={() => fnViewEntry(row.original)}
      />
    )
  };

  const singleColumns = [
    { text: IntlMessages('page.diaryBook.table.numberPDA'), dataField: 'numberPDA', headerStyle: { width: '10%' } },
    { text: IntlMessages('table.column.description'), dataField: 'description', headerStyle: { width: '33%' } },
    { text: IntlMessages('page.diaryBook.table.debit'), dataField: 'debit', type: 'number', headerStyle: { width: '10%' } },
    { text: IntlMessages('page.diaryBook.table.credit'), dataField: 'credit', type: 'number', headerStyle: { width: '10%' } },
    { text: IntlMessages('table.column.date'), dataField: 'date', type: 'date', headerStyle: { width: '9%' } },
    { text: IntlMessages('page.ledger.table.balance'), dataField: 'balance', type: 'number', headerStyle: { width: '11%' } },
    { text: IntlMessages('page.ledger.table.doc'), dataField: 'documentCode', headerStyle: { width: '9%' } },
    viewActionColumn
  ];

  const multiColumns = [
    { text: IntlMessages('page.diaryBook.table.accountNumber'), dataField: 'accountNumber', headerStyle: { width: '10%' } },
    { text: IntlMessages('page.diaryBook.table.accountName'), dataField: 'accountName', headerStyle: { width: '18%' } },
    { text: IntlMessages('page.diaryBook.table.numberPDA'), dataField: 'numberPDA', headerStyle: { width: '9%' } },
    { text: IntlMessages('table.column.description'), dataField: 'description', headerStyle: { width: '25%' } },
    { text: IntlMessages('page.diaryBook.table.debit'), dataField: 'debit', type: 'number', headerStyle: { width: '9%' } },
    { text: IntlMessages('page.diaryBook.table.credit'), dataField: 'credit', type: 'number', headerStyle: { width: '9%' } },
    { text: IntlMessages('table.column.date'), dataField: 'date', type: 'date', headerStyle: { width: '9%' } },
    { text: IntlMessages('page.ledger.table.doc'), dataField: 'documentCode', headerStyle: { width: '9%' } },
    viewActionColumn
  ];

  const table = {
    title: IntlMessages('page.ledger.table.title'),
    columns: mode === 'single' ? singleColumns : multiColumns,
    data: rows,
    options: {
      typePagination: 2,
      currentPage,
      totalPages: totalPages(totalRecords),
      setCurrentPage,
      paginationSummary: rangeSummary(currentPage, totalRecords)
    }
  };

  const propsToHeaderReport = {
    mode: mode === 'multi' ? 2 : 1,
    modeValue: mode,
    modeOptions: MODE_OPTIONS,
    onModeChange,
    dateStart,
    dateEnd,
    accountCode,
    listAccounts,
    errors,
    sendForm,
    onInputChange,
    onMultiAccountsChange,
    fnSearch,
    fnExportXlsx
  };

  const propsToTotals = meta ? {
    single: meta.single,
    accountName: meta.account ? `${meta.account.code} - ${meta.account.name}` : '',
    unknownType: Boolean(meta.account?.unknownType),
    count: String(meta.totals.count),
    openingBalance: formatNumber(meta.openingBalance || 0),
    totalDebit: formatNumber(meta.totals.debit),
    totalCredit: formatNumber(meta.totals.credit),
    closingBalance: formatNumber(meta.closingBalance || 0)
  } : null;

  const propsToModalViewEntry = {
    ModalContent: ModalViewEntry,
    title: 'page.diaryBook.modal.viewEntry.title',
    open: openViewModal,
    setOpen: setOpenViewModal,
    maxWidth: 'lg',
    data: { entry: viewEntryData, formatNumber, formatDate }
  };

  return {
    table,
    propsToHeaderReport,
    propsToTotals,
    propsToModalViewEntry
  };
};
