import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import ModalDetail from './ModalDetail';

const AGING_BUCKETS = [
  { field: 'current', label: 'page.accountsReceivable.table.current', test: (d) => d <= 0 },
  { field: 'days30', label: 'page.accountsReceivable.table.days30', test: (d) => d >= 1 && d <= 30 },
  { field: 'days60', label: 'page.accountsReceivable.table.days60', test: (d) => d >= 31 && d <= 60 },
  { field: 'days90', label: 'page.accountsReceivable.table.days90', test: (d) => d >= 61 && d <= 90 },
  { field: 'days120', label: 'page.accountsReceivable.table.days120', test: (d) => d >= 91 && d <= 120 },
  { field: 'daysMore', label: 'page.accountsReceivable.table.daysMore', test: (d) => d > 120 }
];

export const useAccountsReceivable = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const { formState, onInputChange } = useForm({ date: DateHelper.format(DateHelper.now()), customerTypeId: 0, search: '' });
  const { date, customerTypeId, search } = formState;

  const [allRows, setAllRows] = useState([]);
  const [listCustomerTypes, setListCustomerTypes] = useState([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const fnSearch = () => {
    setLoading(true);
    // SearchSelect vuelve a "0" (string) al limpiar la selección, no a "" — normalizar
    // antes de mandarlo al backend para no filtrar por un tipo de cliente literal "0".
    const customerTypeFilter = Number(customerTypeId) === 0 ? '' : customerTypeId;
    request.GET(buildUrl('accounting/process/cxc/summary', { date, customerTypeId: customerTypeFilter }), (resp) => {
      setAllRows(resp.data);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnFilterData = (rows, value) => {
    if (!value) return rows;
    const upperValue = value.toUpperCase();
    return rows.filter((r) => `${r.customerId}${r.customerName || ''}${r.rtn || ''}`.toUpperCase().includes(upperValue));
  }

  const onSearchChange = (e) => onInputChange(e);

  const table = {
    title: IntlMessages('page.accountsReceivable.table.title'),
    columns: [
      { text: IntlMessages('table.column.code'), dataField: 'customerId', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.accountsReceivable.table.customer'), dataField: 'customerName', headerStyle: { width: '55%' } },
      { text: IntlMessages('page.accountsReceivable.table.rtn'), dataField: 'rtn', headerStyle: { width: '20%' } },
      { text: IntlMessages('page.accountsReceivable.table.total'), dataField: 'balance', type: 'number', headerStyle: { width: '15%' } },
      {
        text: '',
        dataField: 'actions',
        headerStyle: { width: '5%' },
        cell: ({ row }) => (
          <i
            className="bi bi-eye-fill cursor-pointer"
            title={IntlMessages('page.accountsReceivable.table.viewDetail')}
            onClick={() => fnOpenDetail(row.original)}
          />
        )
      }
    ],
    data: fnFilterData(allRows, search)
  };

  const fnOpenDetail = (row) => {
    setLoading(true);
    request.GET(buildUrl('accounting/process/cxc/pendingByCustomer', { customerId: row.customerId }), (resp) => {
      const today = DateHelper.now();
      const rows = resp.data.map((line) => {
        const numDays = line.dueDate ? DateHelper.diff(today, line.dueDate, 'day') : 0;
        return { ...line, numDays };
      });
      const aging = AGING_BUCKETS.reduce((acc, bucket) => {
        acc[bucket.field] = rows.reduce((sum, r) => sum + (bucket.test(r.numDays) ? Number(r.balance || 0) : 0), 0);
        return acc;
      }, {});
      const total = rows.reduce((sum, r) => sum + Number(r.balance || 0), 0);
      setDetailData({ customerId: row.customerId, customerName: row.customerName, rows, aging, total });
      setOpenDetail(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnPrintSummary = () => {
    setLoading(true);
    request.GETPdf('accounting/process/cxc/summary/exportPDF', { date, customerTypeId }, 'CuentasPorCobrar.pdf', () => setLoading(false));
    setLoading(false);
  }
  const fnExportSummaryXlsx = () => fnExport('accounting/process/cxc/summary/exportXLSX', { date, customerTypeId }, 'CuentasPorCobrar.xlsx');

  const fnPrintDetail = () => {
    if (!detailData) return;
    setLoading(true);
    request.GETPdf('accounting/process/cxc/pendingByCustomer/exportPDF', { customerId: detailData.customerId, customerName: detailData.customerName }, 'DetalleCuentaPorCobrar.pdf', () => setLoading(false));
    setLoading(false);
  }
  const fnExportDetailXlsx = () => {
    if (!detailData) return;
    fnExport('accounting/process/cxc/pendingByCustomer/exportXLSX', { customerId: detailData.customerId, customerName: detailData.customerName }, 'DetalleCuentaPorCobrar.xlsx');
  }

  useEffect(() => {
    request.GET('admin/customerTypes', (resp) => {
      setListCustomerTypes(resp.data.map((item) => ({ label: item.name, value: item.id })));
    }, () => { });
    fnSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const propsToHeader = {
    date,
    customerTypeId,
    search,
    listCustomerTypes,
    onInputChange,
    onSearchChange,
    fnSearch,
    fnPrint: fnPrintSummary,
    fnExportXlsx: fnExportSummaryXlsx
  }

  const propsToModalDetail = {
    ModalContent: ModalDetail,
    title: 'page.accountsReceivable.modal.detail.title',
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
