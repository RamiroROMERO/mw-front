import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import ModalTrace from '../cxpInvoiceTrace/ModalTrace';

// Equivalente a cont_cxpdeta03.sc2 ("Historial de Cuentas por Proveedor"). Muestra TODOS
// los documentos de un proveedor (Contado y Crédito mezclados, pagados y pendientes) en
// un rango de fechas — a diferencia de la pantalla principal de CxP, que solo trae
// pendientes tipo Crédito. El doble-click del legacy sobre una fila abre
// `cont_cxp_deta_view_payments`, que reproduce el mismo desglose de pagos que ya
// construimos para "Rastreo de Cuentas por Pagar" — se reutiliza ese mismo modal acá en
// vez de duplicarlo. El segundo botón "Imprimir" del legacy (reporte
// "Detalle de Movimiento por Proveedor", toggle "Por Facturas"/"Por Saldos") se omite
// por redundante: la misma información ya la cubre esta grilla + el drill-down de pagos.
// NOTA: para facturas "Contado", el saldo calculado puede no ser 0 aunque ya se hayan
// pagado en efectivo al momento de la compra (nunca pasan por cont_pda2) — es una
// réplica fiel de cómo el propio legacy calcula este mismo reporte, no un bug nuevo.
const AGING_BUCKETS_LABEL_UNTIL_DUE = 'page.cxpProviderHistory.table.daysUntilDue';
const AGING_BUCKETS_LABEL_OVERDUE = 'page.cxpProviderHistory.table.daysOverdue';

export const useCxPProviderHistory = ({ setLoading }) => {
  const location = useLocation();
  const { fnExport } = useExportExcel(setLoading);
  const { formState, onInputChange } = useForm({
    providerId: location.state?.providerId || 0,
    dateStart: DateHelper.format(DateHelper.startOf(DateHelper.now(), 'year')),
    dateEnd: DateHelper.format(DateHelper.now())
  });
  const { providerId, dateStart, dateEnd } = formState;

  const [allRows, setAllRows] = useState([]);
  const [listProviders, setListProviders] = useState([]);
  const [openTrace, setOpenTrace] = useState(false);
  const [traceData, setTraceData] = useState(null);

  const paidLabel = IntlMessages('page.cxpProviderHistory.table.paid');
  const daysUntilDueLabel = IntlMessages(AGING_BUCKETS_LABEL_UNTIL_DUE);
  const daysOverdueLabel = IntlMessages(AGING_BUCKETS_LABEL_OVERDUE);

  const fnLoadProviders = () => {
    if (listProviders.length > 0) return;
    request.GET(buildUrl('inventory/process/providers', { status: 1 }), (resp) => {
      setListProviders(resp.data.map((item) => ({ label: `${item.id} | ${item.name}`, value: item.id })));
    }, () => { });
  }

  const fnSearch = () => {
    if (Number(providerId) === 0 || !dateStart || !dateEnd) return;
    setLoading(true);
    request.GET(buildUrl('accounting/process/accountsPayable/historyByProvider', { providerId, dateStart, dateEnd }), (resp) => {
      const today = DateHelper.now();
      let accumulated = 0;
      const rows = resp.data.map((row) => {
        const balance = Number(row.balance || 0);
        accumulated += balance;
        const applied = Number(row.originalValue || 0) + Number(row.debitNoteValue || 0) - Number(row.creditNoteValue || 0) - balance;
        let estado = paidLabel;
        if (balance !== 0) {
          const numDays = row.dueDate ? DateHelper.diff(row.dueDate, today, 'day') : 0;
          estado = numDays >= 0 ? `${numDays} ${daysUntilDueLabel}` : `${Math.abs(numDays)} ${daysOverdueLabel}`;
        }
        return { ...row, balance, applied, accumulated, estado };
      });
      setAllRows(rows);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  // Soporta el drill-down desde "Saldos y Pagos" (cxpPeriodSummary), que navega acá con un
  // providerId ya elegido (`navigate(..., { state: { providerId } })`) — carga la lista de
  // proveedores (para que el SearchSelect muestre el nombre) y dispara la búsqueda de una vez.
  useEffect(() => {
    if (location.state?.providerId) {
      fnLoadProviders();
      fnSearch();
    }
  }, []);

  const fnOpenTrace = (row) => {
    setLoading(true);
    request.GET(buildUrl('accounting/process/accountsPayable/documentTrace', { cxpId: row.id }), (resp) => {
      setTraceData(resp.data);
      setOpenTrace(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

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
    data: allRows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const totals = {
    totalValue: formatNumber(allRows.reduce((sum, r) => sum + Number(r.originalValue || 0), 0)),
    totalCreditNote: formatNumber(allRows.reduce((sum, r) => sum + Number(r.creditNoteValue || 0), 0)),
    totalDebitNote: formatNumber(allRows.reduce((sum, r) => sum + Number(r.debitNoteValue || 0), 0)),
    totalBalance: formatNumber(allRows.reduce((sum, r) => sum + Number(r.balance || 0), 0))
  };

  const fnExportXlsx = () => {
    if (Number(providerId) === 0) return;
    const provider = listProviders.find((p) => p.value === Number(providerId));
    fnExport('accounting/process/accountsPayable/historyByProvider/exportXLSX', { providerId, dateStart, dateEnd, providerName: provider?.label }, 'HistorialCuentasPorProveedor.xlsx');
  }

  const propsToHeader = { providerId, dateStart, dateEnd, listProviders, onInputChange, fnSearch, fnExportXlsx, fnLoadProviders };

  const propsToModalTrace = {
    ModalContent: ModalTrace,
    title: 'page.cxpInvoiceTrace.modal.title',
    open: openTrace,
    setOpen: setOpenTrace,
    maxWidth: 'lg',
    data: { trace: traceData, formatNumber, formatDate }
  }

  return { table, totals, propsToHeader, propsToModalTrace }
}
