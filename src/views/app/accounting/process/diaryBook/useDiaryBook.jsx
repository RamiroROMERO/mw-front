import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils';
import ModalViewEntry from './ModalViewEntry';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request } from '@Helpers/core';
import createNotification from '@Containers/ui/Notifications';

export const useDiaryBook = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const [allData, setAllData] = useState([]);
  const [dataTotals, setDataTotals] = useState({ debit: 0, credit: 0 });
  const [listAccounts, setListAccounts] = useState([]);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewEntryData, setViewEntryData] = useState(null);

  const { formState, onInputChange } = useForm({
    dateStart: DateHelper.format(DateHelper.startOf(DateHelper.now(), 'year')),
    dateEnd: DateHelper.format(DateHelper.endOf(DateHelper.now(), 'year')),
    accountCode: '',
    search: ''
  });

  const { dateStart, dateEnd, accountCode, search } = formState;
  // SearchSelect vuelve a "0" (string) al limpiar la selección, no a "" — normalizar
  // antes de mandarlo al backend para no filtrar por una cuenta literal "0".
  const accountFilter = Number(accountCode) === 0 ? '' : accountCode;

  const fnViewEntry = (row) => {
    request.GET(`accounting/process/diaryBook/entry/${row.fatherId}`, (resp) => {
      setViewEntryData(resp.data);
      setOpenViewModal(true);
    }, () => { });
  }

  const [table, setTable] = useState({
    title: IntlMessages("page.diaryBook.table.title"),
    columns: [
      { text: IntlMessages("page.diaryBook.table.numberPDA"), dataField: "numberPDA", headerStyle: { width: '10%' } },
      { text: IntlMessages("table.column.description"), dataField: "description", headerStyle: { width: '30%' } },
      { text: IntlMessages("page.diaryBook.table.debit"), dataField: "debit", type: 'number', headerStyle: { width: '10%' } },
      { text: IntlMessages("page.diaryBook.table.credit"), dataField: "credit", type: 'number', headerStyle: { width: '10%' } },
      { text: IntlMessages("table.column.date"), dataField: "date", type: 'date', headerStyle: { width: '9%' } },
      { text: IntlMessages("page.diaryBook.table.accountNumber"), dataField: "accountNumber", headerStyle: { width: '11%' } },
      { text: IntlMessages("page.diaryBook.table.accountName"), dataField: "accountName", headerStyle: { width: '18%' } },
      {
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
      }
    ],
    data: []
  });

  const fnCalcTotals = (data) => {
    const totals = data.reduce((acc, item) => {
      acc.debit += Number(item.debit || 0);
      acc.credit += Number(item.credit || 0);
      return acc;
    }, { debit: 0, credit: 0 });
    setDataTotals(totals);
  }

  const fnSearchReport = () => {
    if (dateStart > dateEnd) {
      createNotification('warning', 'page.diaryBook.msg.invalidDateRange', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.POST('accounting/process/diaryBook', { startDate: dateStart, endDate: dateEnd, accountCode: accountFilter }, (resp) => {
      const data = resp.data;
      setAllData(data);
      setTable((prev) => ({ ...prev, data }));
      fnCalcTotals(data);
      setLoading(false);
    }, () => {
      setLoading(false);
    });
  }

  const fnFilterData = (value) => {
    if (!value) {
      setTable((prev) => ({ ...prev, data: allData }));
      return;
    }
    const upperValue = value.toUpperCase();
    const filtered = allData.filter((item) => {
      return `${item.numberPDA || ''}${item.description || ''}${item.accountNumber || ''}${item.accountName || ''}`
        .toUpperCase()
        .includes(upperValue);
    });
    setTable((prev) => ({ ...prev, data: filtered }));
  }

  const onSearchChange = (e) => {
    onInputChange(e);
    fnFilterData(e.target.value);
  }

  const fnPrint = () => {
    setLoading(true);
    request.GETPdf('accounting/process/diaryBook/exportPDF', { startDate: dateStart, endDate: dateEnd, accountCode: accountFilter }, 'LibroDiario.pdf', () => {
      setLoading(false);
    });
    setLoading(false);
  }

  const fnExportXlsx = () => {
    fnExport('accounting/process/diaryBook/exportXLSX', { startDate: dateStart, endDate: dateEnd, accountCode: accountFilter }, 'LibroDiario.xlsx');
  }

  useEffect(() => {
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      setListAccounts(resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta })));
    }, () => { });
    fnSearchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const propsToHeaderReport = {
    dateStart,
    dateEnd,
    accountCode,
    search,
    listAccounts,
    onInputChange,
    onSearchChange,
    fnSearchReport,
    fnPrint,
    fnExportXlsx
  }

  const propsToTotals = {
    debit: formatNumber(dataTotals.debit),
    credit: formatNumber(dataTotals.credit)
  }

  const propsToModalViewEntry = {
    ModalContent: ModalViewEntry,
    title: 'page.diaryBook.modal.viewEntry.title',
    open: openViewModal,
    setOpen: setOpenViewModal,
    maxWidth: 'lg',
    data: { entry: viewEntryData, formatNumber, formatDate }
  }

  return {
    table,
    propsToHeaderReport,
    propsToTotals,
    propsToModalViewEntry
  }
}
