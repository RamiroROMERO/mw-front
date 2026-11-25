import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import { BASE_PATH, buildRangeQuery, normalizeProviderHistory, validateProviderHistory } from '../cxpShared/cxpReportsRules';
import { useCxpProviders } from '../cxpShared/useCxpProviders';
import ModalTrace from '../cxpInvoiceTrace/ModalTrace';

// Historial de Cuentas por Proveedor (cont_cxpdeta03.sc2, SPEC v2-133-sr): TODOS los documentos de un proveedor (Contado y Crédito, pagados y pendientes) con fecha de factura en el rango, con el saldo a hoy
// calculado por el back (misma fórmula de Cuentas por Pagar). El ojo abre el rastreo del documento (mismo modal que "Rastreo de Cuentas por Pagar"). Para una factura de Contado el saldo puede no ser 0 aunque se haya
// pagado en efectivo al comprar: así lo calcula también el legacy.
const AGING_BUCKETS_LABEL_UNTIL_DUE = 'page.cxpProviderHistory.table.daysUntilDue';
const AGING_BUCKETS_LABEL_OVERDUE = 'page.cxpProviderHistory.table.daysOverdue';

export const useCxPProviderHistory = ({ setLoading }) => {
  const location = useLocation();
  const intl = useIntl();
  const { fnExport } = useExportExcel(setLoading);
  const listProviders = useCxpProviders();
  const { formState, onInputChange } = useForm({
    providerId: location.state?.providerId || 0,
    dateStart: DateHelper.format(DateHelper.startOf(DateHelper.now(), 'year')),
    dateEnd: DateHelper.format(DateHelper.now())
  });
  const { providerId, dateStart, dateEnd } = formState;

  const [data, setData] = useState(normalizeProviderHistory(undefined));
  const [openTrace, setOpenTrace] = useState(false);
  const [traceData, setTraceData] = useState(null);

  const paidLabel = IntlMessages('page.cxpProviderHistory.table.paid');
  const daysUntilDueLabel = IntlMessages(AGING_BUCKETS_LABEL_UNTIL_DUE);
  const daysOverdueLabel = IntlMessages(AGING_BUCKETS_LABEL_OVERDUE);

  const isValid = () => {
    const error = validateProviderHistory({ providerId, dateStart, dateEnd });
    if (error) NotificationManager.warning(intl.formatMessage({ id: error }), '', 4000, null, null, '');
    return !error;
  };

  const fnSearch = () => {
    if (!isValid()) return;
    setLoading(true);
    request.GET(buildUrl(`${BASE_PATH}/providerHistory`, buildRangeQuery({ providerId, dateStart, dateEnd })), (resp) => {
      setData(normalizeProviderHistory(resp.data));
      setLoading(false);
    }, () => { setLoading(false); });
  };

  // Soporta el drill-down desde "Saldos y Pagos", que navega acá con un proveedor ya elegido.
  useEffect(() => {
    if (location.state?.providerId) fnSearch();
  }, []);

  const today = DateHelper.now();
  let accumulated = 0;
  const rows = data.rows.map((row) => {
    const balance = Number(row.balance || 0);
    accumulated += balance;
    let estado = paidLabel;
    if (balance !== 0) {
      const numDays = row.dueDate ? DateHelper.diff(row.dueDate, today, 'day') : 0;
      estado = numDays >= 0 ? `${numDays} ${daysUntilDueLabel}` : `${Math.abs(numDays)} ${daysOverdueLabel}`;
    }
    return { ...row, applied: Number(row.payments || 0), accumulated, estado };
  });

  const fnOpenTrace = (row) => {
    setLoading(true);
    request.GET(buildUrl(`${BASE_PATH}/documentTrace`, { cxpId: row.id }), (resp) => {
      setTraceData(resp.data);
      setOpenTrace(true);
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const table = {
    title: IntlMessages('page.cxpProviderHistory.table.title'),
    columns: [
      { text: IntlMessages('page.cxpProviderHistory.table.document'), dataField: 'documentCode', headerStyle: { width: '13%' } },
      { text: IntlMessages('table.column.date'), dataField: 'invoiceDate', type: 'date', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxpProviderHistory.table.dueDate'), dataField: 'dueDate', type: 'date', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxpProviderHistory.table.originalValue'), dataField: 'originalValue', type: 'number', headerStyle: { width: '9%' } },
      { text: IntlMessages('page.cxpProviderHistory.table.paymentTerm'), dataField: 'paymentTerm', headerStyle: { width: '7%' } },
      { text: IntlMessages('page.cxpProviderHistory.table.applied'), dataField: 'applied', type: 'number', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxpProviderHistory.table.creditNoteValue'), dataField: 'creditNoteValue', type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages('page.cxpProviderHistory.table.debitNoteValue'), dataField: 'debitNoteValue', type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages('page.cxpProviderHistory.table.balance'), dataField: 'balance', type: 'number', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxpProviderHistory.table.accumulated'), dataField: 'accumulated', type: 'number', headerStyle: { width: '8%' } },
      {
        text: IntlMessages('page.cxpProviderHistory.table.lastPaymentDate'),
        dataField: 'lastPaymentDate',
        headerStyle: { width: '8%' },
        cell: ({ row }) => (row.original.lastPaymentDate ? formatDate(row.original.lastPaymentDate) : '')
      },
      { text: IntlMessages('page.cxpProviderHistory.table.status'), dataField: 'estado', headerStyle: { width: '10%' } },
      {
        text: '',
        dataField: 'actions',
        headerStyle: { width: '4%' },
        cell: ({ row }) => (
          <i
            className="bi bi-eye-fill cursor-pointer"
            title={IntlMessages('page.cxpProviderHistory.table.viewDetail')}
            onClick={() => fnOpenTrace(row.original)}
          />
        )
      }
    ],
    data: rows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const totals = {
    totalValue: formatNumber(data.totals.originalValue),
    totalCreditNote: formatNumber(data.totals.creditNoteValue),
    totalDebitNote: formatNumber(data.totals.debitNoteValue),
    totalBalance: formatNumber(data.totals.balance)
  };

  const fnExportXlsx = () => {
    if (!isValid()) return;
    const provider = listProviders.find((p) => p.value === Number(providerId));
    fnExport(`${BASE_PATH}/providerHistory/exportXLSX`, { ...buildRangeQuery({ providerId, dateStart, dateEnd }), providerName: provider?.label }, 'HistorialCuentasPorProveedor.xlsx');
  };

  const propsToHeader = { providerId, dateStart, dateEnd, listProviders, onInputChange, fnSearch, fnExportXlsx, fnLoadProviders: () => { } };

  const propsToModalTrace = {
    ModalContent: ModalTrace,
    title: 'page.cxpInvoiceTrace.modal.title',
    open: openTrace,
    setOpen: setOpenTrace,
    maxWidth: 'lg',
    data: { trace: traceData, formatNumber, formatDate }
  };

  return { table, totals, propsToHeader, propsToModalTrace };
};
