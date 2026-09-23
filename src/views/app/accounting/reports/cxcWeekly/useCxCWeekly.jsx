import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import ModalDetail from '../../process/accountsReceivable/ModalDetail';

const WEEK_FIELDS = ['week1', 'week2', 'week3', 'week4', 'week5', 'week6', 'week7', 'week8', 'weekTotal'];
const WEEK_LABELS = {
  week1: 'page.cxcWeekly.table.week1', week2: 'page.cxcWeekly.table.week2', week3: 'page.cxcWeekly.table.week3',
  week4: 'page.cxcWeekly.table.week4', week5: 'page.cxcWeekly.table.week5', week6: 'page.cxcWeekly.table.week6',
  week7: 'page.cxcWeekly.table.week7', week8: 'page.cxcWeekly.table.week8', weekTotal: 'table.column.total'
};

// Detalle por factura reutilizado tal cual de la pantalla principal de Cuentas por Cobrar
// (mismo modal, mismo endpoint pendingByCustomer, mismos 6 buckets de antigüedad) — el
// legacy cont_cxc_week.sc2 abre exactamente ese mismo formulario (`Do Form Cont_CxCDeta`)
// desde el botón "..." de su grilla.
const AGING_BUCKETS = [
  { field: 'current', label: 'page.accountsReceivable.table.current', test: (d) => d <= 0 },
  { field: 'days30', label: 'page.accountsReceivable.table.days30', test: (d) => d >= 1 && d <= 30 },
  { field: 'days60', label: 'page.accountsReceivable.table.days60', test: (d) => d >= 31 && d <= 60 },
  { field: 'days90', label: 'page.accountsReceivable.table.days90', test: (d) => d >= 61 && d <= 90 },
  { field: 'days120', label: 'page.accountsReceivable.table.days120', test: (d) => d >= 91 && d <= 120 },
  { field: 'daysMore', label: 'page.accountsReceivable.table.daysMore', test: (d) => d > 120 }
];

export const useCxCWeekly = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const { formState, onInputChange } = useForm({ date: DateHelper.format(DateHelper.now()) });
  const { date } = formState;

  const [allRows, setAllRows] = useState([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const fnSearch = () => {
    setLoading(true);
    request.GET(buildUrl('accounting/process/cxc/weekly', { date }), (resp) => {
      setAllRows(resp.data);
      setLoading(false);
    }, () => { setLoading(false); });
  }

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

  const table = {
    title: IntlMessages('page.cxcWeekly.table.title'),
    columns: [
      { text: IntlMessages('page.cxcWeekly.table.customer'), dataField: 'customerName', headerStyle: { width: '25%' } },
      ...WEEK_FIELDS.map((f) => ({ text: IntlMessages(WEEK_LABELS[f]), dataField: f, type: 'number' })),
      {
        text: '',
        dataField: 'actions',
        headerStyle: { width: '3%' },
        cell: ({ row }) => (
          <i
            className="bi bi-eye-fill cursor-pointer"
            title={IntlMessages('page.cxcWeekly.table.viewDetail')}
            onClick={() => fnOpenDetail(row.original)}
          />
        )
      }
    ],
    data: allRows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const totalsTable = {
    columns: WEEK_FIELDS.map((f) => ({ text: IntlMessages(WEEK_LABELS[f]), dataField: f, type: 'number' })),
    data: [WEEK_FIELDS.reduce((acc, f) => {
      acc[f] = allRows.reduce((sum, r) => sum + Number(r[f] || 0), 0);
      return acc;
    }, {})],
    options: { pageSize: 1 }
  };

  const fnExportXlsx = () => fnExport('accounting/process/cxc/weekly/exportXLSX', { date }, 'CuentasPorCobrarSemanal.xlsx');

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
    fnSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const propsToHeader = { date, onInputChange, fnSearch, fnExportXlsx }

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

  return { table, totalsTable, propsToHeader, propsToModalDetail }
}
