import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request } from '@Helpers/core';
import createNotification from '@Containers/ui/Notifications';

export const useBanksBook = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const [allData, setAllData] = useState([]);
  const [listBanks, setListBanks] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [openingBalanceUsd, setOpeningBalanceUsd] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  const [closingBalanceUsd, setClosingBalanceUsd] = useState(0);
  const [dataTotals, setDataTotals] = useState({ valueDebit: 0, valueCredit: 0, valueDebitUsd: 0, valueCreditUsd: 0 });

  const { formState, onInputChange } = useForm({
    dateStart: DateHelper.format(DateHelper.startOf(DateHelper.now(), 'month')),
    dateEnd: DateHelper.format(DateHelper.endOf(DateHelper.now(), 'month')),
    bankCode: '',
    search: ''
  });

  const { dateStart, dateEnd, bankCode, search } = formState;

  const [table, setTable] = useState({
    title: IntlMessages("page.banksBook.table.title"),
    columns: [
      { text: IntlMessages("table.column.date"), dataField: "date", type: 'date', headerStyle: { width: '9%' } },
      { text: IntlMessages("input.document"), dataField: "documentCode", headerStyle: { width: '8%' } },
      { text: IntlMessages("page.variousDeposits.input.documentNumber"), dataField: "documentId", headerStyle: { width: '7%' } },
      { text: IntlMessages("table.column.beneficiary"), dataField: "benefName", headerStyle: { width: '17%' } },
      { text: IntlMessages("page.variousDeposits.input.description"), dataField: "description", headerStyle: { width: '20%' } },
      { text: IntlMessages("table.column.reference"), dataField: "reference", headerStyle: { width: '9%' } },
      { text: IntlMessages("page.checks.input.valueDebe"), dataField: "valueDebit", type: 'number', headerStyle: { width: '10%' } },
      { text: IntlMessages("page.checks.input.valueHaber"), dataField: "valueCredit", type: 'number', headerStyle: { width: '10%' } },
      { text: IntlMessages("page.banksBook.table.debitUsd"), dataField: "valueDebitUsd", type: 'number', headerStyle: { width: '5%' } },
      { text: IntlMessages("page.banksBook.table.creditUsd"), dataField: "valueCreditUsd", type: 'number', headerStyle: { width: '5%' } }
    ],
    data: []
  });

  const fnSearchReport = () => {
    if (!bankCode) {
      createNotification('warning', 'msg.required.select.bank', 'alert.warning.title');
      return;
    }
    if (dateStart > dateEnd) {
      createNotification('warning', 'page.diaryBook.msg.invalidDateRange', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.POST('banks/process/bankBooks', { bankCode, startDate: dateStart, endDate: dateEnd }, (resp) => {
      const { lines, openingBalance: opening, openingBalanceUsd: openingUsd, closingBalance: closing, closingBalanceUsd: closingUsd, totals } = resp.data;
      setAllData(lines);
      setTable((prev) => ({ ...prev, data: lines }));
      setOpeningBalance(opening);
      setOpeningBalanceUsd(openingUsd);
      setClosingBalance(closing);
      setClosingBalanceUsd(closingUsd);
      setDataTotals(totals);
      setLoading(false);
    }, () => setLoading(false));
  }

  const fnFilterData = (value) => {
    if (!value) {
      setTable((prev) => ({ ...prev, data: allData }));
      return;
    }
    const upperValue = value.toUpperCase();
    const filtered = allData.filter((item) => (
      `${item.documentCode || ''}${item.benefName || ''}${item.description || ''}${item.reference || ''}`
        .toUpperCase()
        .includes(upperValue)
    ));
    setTable((prev) => ({ ...prev, data: filtered }));
  }

  const onSearchChange = (e) => {
    onInputChange(e);
    fnFilterData(e.target.value);
  }

  const fnPrint = () => {
    if (!bankCode) return;
    const bankName = listBanks.find((b) => b.value === bankCode)?.label || '';
    setLoading(true);
    request.GETPdf('banks/process/bankBooks/exportPDF', { bankCode, startDate: dateStart, endDate: dateEnd, bankName }, 'LibroDeBancos.pdf', () => {
      setLoading(false);
    });
    setLoading(false);
  }

  const fnExportXlsx = () => {
    if (!bankCode) return;
    const bankName = listBanks.find((b) => b.value === bankCode)?.label || '';
    fnExport('banks/process/bankBooks/exportXLSX', { bankCode, startDate: dateStart, endDate: dateEnd, bankName }, 'LibroDeBancos.xlsx');
  }

  useEffect(() => {
    request.GET('banks/settings/banksAccounts/getSL', (resp) => {
      setListBanks(resp.data.map((item) => ({ label: `${item.code} - ${item.name}`, value: item.code })));
    }, () => { });
  }, []);

  const propsToHeaderReport = {
    dateStart,
    dateEnd,
    bankCode,
    search,
    listBanks,
    onInputChange,
    onSearchChange,
    fnSearchReport,
    fnPrint,
    fnExportXlsx
  }

  const propsToTotals = {
    openingBalance: formatNumber(openingBalance),
    openingBalanceUsd: formatNumber(openingBalanceUsd),
    valueDebit: formatNumber(dataTotals.valueDebit),
    valueCredit: formatNumber(dataTotals.valueCredit),
    valueDebitUsd: formatNumber(dataTotals.valueDebitUsd),
    valueCreditUsd: formatNumber(dataTotals.valueCreditUsd),
    closingBalance: formatNumber(closingBalance),
    closingBalanceUsd: formatNumber(closingBalanceUsd)
  }

  return {
    table,
    propsToHeaderReport,
    propsToTotals
  }
}
