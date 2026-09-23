import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import ModalDetail from './ModalDetail';

const AGING_BUCKETS = [
  { field: 'current', label: 'page.accountsToPay.table.current', test: (d) => d <= 0 },
  { field: 'days30', label: 'page.accountsToPay.table.days30', test: (d) => d >= 1 && d <= 30 },
  { field: 'days60', label: 'page.accountsToPay.table.days60', test: (d) => d >= 31 && d <= 60 },
  { field: 'days90', label: 'page.accountsToPay.table.days90', test: (d) => d >= 61 && d <= 90 },
  { field: 'days120', label: 'page.accountsToPay.table.days120', test: (d) => d >= 91 && d <= 120 },
  { field: 'daysMore', label: 'page.accountsToPay.table.daysMore', test: (d) => d > 120 }
];

export const useAccountsToPay = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const { formState, onInputChange } = useForm({ date: DateHelper.format(DateHelper.now()), search: '' });
  const { date, search } = formState;

  const [allRows, setAllRows] = useState([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const fnSearch = () => {
    setLoading(true);
    request.GET(buildUrl('accounting/process/accountsPayable/summary', { date }), (resp) => {
      setAllRows(resp.data);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnFilterData = (rows, value) => {
    if (!value) return rows;
    const upperValue = value.toUpperCase();
    return rows.filter((r) => `${r.providerId}${r.providerName || ''}${r.rtn || ''}`.toUpperCase().includes(upperValue));
  }

  const onSearchChange = (e) => onInputChange(e);

  const table = {
    title: IntlMessages('page.accountsToPay.table.title'),
    columns: [
      { text: IntlMessages('table.column.code'), dataField: 'providerId', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.accountsToPay.table.provider'), dataField: 'providerName', headerStyle: { width: '55%' } },
      { text: IntlMessages('page.accountsToPay.table.rtn'), dataField: 'rtn', headerStyle: { width: '20%' } },
      { text: IntlMessages('page.accountsToPay.table.total'), dataField: 'balance', type: 'number', headerStyle: { width: '15%' } },
      {
        text: '',
        dataField: 'actions',
        headerStyle: { width: '5%' },
        cell: ({ row }) => (
          <i
            className="bi bi-eye-fill cursor-pointer"
            title={IntlMessages('page.accountsToPay.table.viewDetail')}
            onClick={() => fnOpenDetail(row.original)}
          />
        )
      }
    ],
    data: fnFilterData(allRows, search)
  };

  const fnOpenDetail = (row) => {
    setLoading(true);
    Promise.all([
      new Promise((resolve) => request.GET(buildUrl('accounting/process/accountsPayable/findPendingByProvider', { providerId: row.providerId }), (resp) => resolve(resp.data), () => resolve([]))),
      new Promise((resolve) => request.GET(buildUrl('accounting/process/accountsPayable/pendingAdvances', { providerId: row.providerId }), (resp) => resolve(resp.data), () => resolve([])))
    ]).then(([lines, advances]) => {
      const today = DateHelper.now();
      const rows = (lines || []).map((line) => {
        const numDays = line.dueDate ? DateHelper.diff(today, line.dueDate, 'day') : 0;
        return { ...line, numDays };
      });
      const aging = AGING_BUCKETS.reduce((acc, bucket) => {
        acc[bucket.field] = rows.reduce((sum, r) => sum + (bucket.test(r.numDays) ? Number(r.balance || 0) : 0), 0);
        return acc;
      }, {});
      const total = rows.reduce((sum, r) => sum + Number(r.balance || 0), 0);
      setDetailData({ providerId: row.providerId, providerName: row.providerName, rows, aging, total, advances: advances || [] });
      setOpenDetail(true);
      setLoading(false);
    });
  }

  const fnPrintSummary = () => {
    setLoading(true);
    request.GETPdf('accounting/process/accountsPayable/summary/exportPDF', { date }, 'CuentasPorPagar.pdf', () => setLoading(false));
    setLoading(false);
  }
  const fnExportSummaryXlsx = () => fnExport('accounting/process/accountsPayable/summary/exportXLSX', { date }, 'CuentasPorPagar.xlsx');

  const fnPrintDetail = () => {
    if (!detailData) return;
    setLoading(true);
    request.GETPdf('accounting/process/accountsPayable/findPendingByProvider/exportPDF', { providerId: detailData.providerId, providerName: detailData.providerName }, 'DetalleCuentaPorPagar.pdf', () => setLoading(false));
    setLoading(false);
  }
  const fnExportDetailXlsx = () => {
    if (!detailData) return;
    fnExport('accounting/process/accountsPayable/findPendingByProvider/exportXLSX', { providerId: detailData.providerId, providerName: detailData.providerName }, 'DetalleCuentaPorPagar.xlsx');
  }

  useEffect(() => {
    fnSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const propsToHeader = {
    date,
    search,
    onInputChange,
    onSearchChange,
    fnSearch,
    fnPrint: fnPrintSummary,
    fnExportXlsx: fnExportSummaryXlsx
  }

  const propsToModalDetail = {
    ModalContent: ModalDetail,
    title: 'page.accountsToPay.modal.detail.title',
    open: openDetail,
    setOpen: setOpenDetail,
    maxWidth: 'xl',
    data: {
      detail: detailData,
      agingBuckets: AGING_BUCKETS,
      formatNumber,
      formatDate,
      fnPrint: fnPrintDetail,
      fnExportXlsx: fnExportDetailXlsx
    }
  }

  return {
    table,
    propsToHeader,
    propsToModalDetail,
    fnOpenDetail
  }
}
