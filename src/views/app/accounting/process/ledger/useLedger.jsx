import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request } from '@Helpers/core';
import createNotification from '@Containers/ui/Notifications';
import ModalViewEntry from './ModalViewEntry';

const MODE_OPTIONS = [
  { id: 'single', label: 'page.ledger.radio.currentAccount' },
  { id: 'multi', label: 'page.ledger.radio.multipleAccounts' }
];

export const useLedger = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const [mode, setMode] = useState('single');
  const [listAccounts, setListAccounts] = useState([]);
  const [accountCodesMulti, setAccountCodesMulti] = useState([]);
  const [rows, setRows] = useState([]);
  const [singleMeta, setSingleMeta] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewEntryData, setViewEntryData] = useState(null);

  const { formState, onInputChange } = useForm({
    dateStart: DateHelper.format(DateHelper.startOf(DateHelper.now(), 'month')),
    dateEnd: DateHelper.format(DateHelper.endOf(DateHelper.now(), 'month')),
    accountCode: ''
  });

  const { dateStart, dateEnd, accountCode } = formState;

  const onModeChange = (e) => {
    setMode(e.target.value);
    setRows([]);
    setSingleMeta(null);
  }

  const onMultiAccountsChange = (options) => {
    setAccountCodesMulti((options || []).map((o) => o.value));
  }

  const fnViewEntry = (row) => {
    request.GET(`accounting/process/diaryBook/entry/${row.fatherId}`, (resp) => {
      setViewEntryData(resp.data);
      setOpenViewModal(true);
    }, () => { });
  }

  const viewActionColumn = {
    text: '',
    dataField: "actions",
    headerStyle: { width: '2%' },
    cell: ({ row }) => (
      <i
        className="bi bi-eye-fill cursor-pointer"
        title={IntlMessages("page.diaryBook.button.viewEntry")}
        onClick={() => fnViewEntry(row.original)}
      />
    )
  };

  const singleColumns = [
    { text: IntlMessages("page.diaryBook.table.numberPDA"), dataField: "numberPDA", headerStyle: { width: '10%' } },
    { text: IntlMessages("table.column.description"), dataField: "description", headerStyle: { width: '33%' } },
    { text: IntlMessages("page.diaryBook.table.debit"), dataField: "debit", type: 'number', headerStyle: { width: '10%' } },
    { text: IntlMessages("page.diaryBook.table.credit"), dataField: "credit", type: 'number', headerStyle: { width: '10%' } },
    { text: IntlMessages("table.column.date"), dataField: "date", type: 'date', headerStyle: { width: '9%' } },
    { text: IntlMessages("page.ledger.table.balance"), dataField: "balance", type: 'number', headerStyle: { width: '11%' } },
    { text: IntlMessages("page.ledger.table.doc"), dataField: "documentCode", headerStyle: { width: '9%' } },
    viewActionColumn
  ];

  const multiColumns = [
    { text: IntlMessages("page.diaryBook.table.accountNumber"), dataField: "accountNumber", headerStyle: { width: '10%' } },
    { text: IntlMessages("page.diaryBook.table.accountName"), dataField: "accountName", headerStyle: { width: '18%' } },
    { text: IntlMessages("page.diaryBook.table.numberPDA"), dataField: "numberPDA", headerStyle: { width: '9%' } },
    { text: IntlMessages("table.column.description"), dataField: "description", headerStyle: { width: '25%' } },
    { text: IntlMessages("page.diaryBook.table.debit"), dataField: "debit", type: 'number', headerStyle: { width: '9%' } },
    { text: IntlMessages("page.diaryBook.table.credit"), dataField: "credit", type: 'number', headerStyle: { width: '9%' } },
    { text: IntlMessages("table.column.date"), dataField: "date", type: 'date', headerStyle: { width: '9%' } },
    { text: IntlMessages("page.ledger.table.doc"), dataField: "documentCode", headerStyle: { width: '9%' } },
    viewActionColumn
  ];

  const fnSearch = () => {
    if (dateStart > dateEnd) {
      createNotification('warning', 'page.diaryBook.msg.invalidDateRange', 'alert.warning.title');
      return;
    }
    if (mode === 'single') {
      if (Number(accountCode) === 0) {
        createNotification('warning', 'page.ledger.msg.missingAccount', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.POST('accounting/process/ledger', { accountCode, startDate: dateStart, endDate: dateEnd }, (resp) => {
        setRows(resp.data.rows);
        setSingleMeta(resp.data);
        setLoading(false);
      }, () => { setLoading(false); });
    } else {
      if (accountCodesMulti.length === 0) {
        createNotification('warning', 'page.ledger.msg.missingAccounts', 'alert.warning.title');
        return;
      }
      setLoading(true);
      request.POST('accounting/process/ledger/multi', { accountCodes: accountCodesMulti, startDate: dateStart, endDate: dateEnd }, (resp) => {
        setRows(resp.data);
        setSingleMeta(null);
        setLoading(false);
      }, () => { setLoading(false); });
    }
  }

  const fnPrint = () => {
    if (mode === 'single') {
      setLoading(true);
      request.GETPdf('accounting/process/ledger/exportPDF', { accountCode, startDate: dateStart, endDate: dateEnd }, 'LibroMayor.pdf', () => { setLoading(false); });
      setLoading(false);
    } else {
      setLoading(true);
      request.GETPdf('accounting/process/ledger/multi/exportPDF', { accountCodes: accountCodesMulti, startDate: dateStart, endDate: dateEnd }, 'LibroMayor.pdf', () => { setLoading(false); });
      setLoading(false);
    }
  }

  const fnExportXlsx = () => {
    if (mode === 'single') {
      fnExport('accounting/process/ledger/exportXLSX', { accountCode, startDate: dateStart, endDate: dateEnd }, 'LibroMayor.xlsx');
    } else {
      fnExport('accounting/process/ledger/multi/exportXLSX', { accountCodes: accountCodesMulti, startDate: dateStart, endDate: dateEnd }, 'LibroMayor.xlsx');
    }
  }

  useEffect(() => {
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      setListAccounts(resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta })));
    }, () => { });
  }, []);

  const table = {
    title: IntlMessages("page.ledger.table.title"),
    columns: mode === 'single' ? singleColumns : multiColumns,
    data: rows
  };

  const propsToHeaderReport = {
    mode,
    modeOptions: MODE_OPTIONS,
    onModeChange,
    dateStart,
    dateEnd,
    accountCode,
    listAccounts,
    onInputChange,
    onMultiAccountsChange,
    fnSearch,
    fnPrint,
    fnExportXlsx
  }

  const propsToSingleAccountMeta = singleMeta ? {
    accountName: `${singleMeta.account.code} - ${singleMeta.account.name}`,
    openingBalance: formatNumber(singleMeta.openingBalance),
    totalDebit: formatNumber(singleMeta.totalDebit),
    totalCredit: formatNumber(singleMeta.totalCredit),
    closingBalance: formatNumber(singleMeta.closingBalance)
  } : null;

  const propsToModalViewEntry = {
    ModalContent: ModalViewEntry,
    title: 'page.diaryBook.modal.viewEntry.title',
    open: openViewModal,
    setOpen: setOpenViewModal,
    maxWidth: 'lg',
    data: { entry: viewEntryData, formatNumber, formatDate }
  }

  return {
    mode,
    table,
    propsToHeaderReport,
    propsToSingleAccountMeta,
    propsToModalViewEntry
  }
}
