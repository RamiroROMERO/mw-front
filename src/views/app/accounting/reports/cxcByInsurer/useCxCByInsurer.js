import { useEffect, useState } from 'react';
import { IntlMessages } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';

// Equivalente a cont_cxcdeta_aseg.sc2 ("Detalle de Cuentas por Cobrar por Aseguradora"),
// exclusiva del módulo Hospital. Ver comentario en
// AccountsReceivableService.findByInsurer sobre por qué se migra igual aunque los datos
// reales de esta empresa no tengan aseguradoras genuinas asignadas (decisión explícita
// del usuario 2026-09-23). "Eliminar Documento" del legacy es un utilitario destructivo
// solo-admin — mismo criterio ya aplicado en toda la familia de pantallas de CxC, no se
// migra.
const AGING_BUCKETS = [
  { field: 'current', label: 'page.cxcByInsurer.table.current', test: (d) => d <= 0 },
  { field: 'days30', label: 'page.cxcByInsurer.table.days30', test: (d) => d >= 1 && d <= 30 },
  { field: 'days60', label: 'page.cxcByInsurer.table.days60', test: (d) => d >= 31 && d <= 60 },
  { field: 'days90', label: 'page.cxcByInsurer.table.days90', test: (d) => d >= 61 && d <= 90 },
  { field: 'days120', label: 'page.cxcByInsurer.table.days120', test: (d) => d >= 91 && d <= 120 },
  { field: 'daysMore', label: 'page.cxcByInsurer.table.daysMore', test: (d) => d > 120 }
];

export const useCxCByInsurer = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const { formState, onInputChange } = useForm({ insurerId: 0, customerId: 0 });
  const { insurerId, customerId } = formState;

  const [allRows, setAllRows] = useState([]);
  const [listCustomers, setListCustomers] = useState([]);

  // Precalculados fuera del callback de fnSearch — IntlMessages() llama useIntl()
  // internamente y no puede invocarse dentro de un callback async (ver
  // feedback_intlmessages_hook_order_gotcha, variante confirmada en Otros Reportes de CxC).
  const noDueDateLabel = IntlMessages('page.cxcByInsurer.table.noDueDate');
  const daysOverdueLabel = IntlMessages('page.cxcByInsurer.table.daysOverdue');
  const daysUntilDueLabel = IntlMessages('page.cxcByInsurer.table.daysUntilDue');

  const fnSearch = () => {
    if (Number(insurerId) === 0) return;
    setLoading(true);
    const customerFilter = Number(customerId) === 0 ? undefined : customerId;
    request.GET(buildUrl('accounting/process/cxc/byInsurer', { insurerId, customerId: customerFilter }), (resp) => {
      const today = DateHelper.now();
      let accumulated = 0;
      const rows = resp.data.map((row) => {
        const numDays = row.dueDate ? DateHelper.diff(today, row.dueDate, 'day') : null;
        const estado = numDays === null
          ? noDueDateLabel
          : numDays > 0
            ? `${numDays} ${daysOverdueLabel}`
            : `${Math.abs(numDays)} ${daysUntilDueLabel}`;
        const applied = Number(row.originalValue || 0) - Number(row.balance || 0);
        accumulated += Number(row.balance || 0);
        return { ...row, numDays, estado, applied, accumulated };
      });
      setAllRows(rows);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const table = {
    title: IntlMessages('page.cxcByInsurer.table.title'),
    columns: [
      { text: IntlMessages('page.cxcByInsurer.table.patient'), dataField: 'customerName', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.cxcByInsurer.table.document'), dataField: 'documentCode', headerStyle: { width: '10%' } },
      { text: IntlMessages('table.column.date'), dataField: 'invoiceDate', type: 'date', headerStyle: { width: '7%' } },
      { text: IntlMessages('page.cxcByInsurer.table.dueDate'), dataField: 'dueDate', type: 'date', headerStyle: { width: '7%' } },
      { text: IntlMessages('page.cxcByInsurer.table.originalValue'), dataField: 'originalValue', type: 'number', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxcByInsurer.table.applied'), dataField: 'applied', type: 'number', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxcByInsurer.table.creditNoteValue'), dataField: 'creditNoteValue', type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages('page.cxcByInsurer.table.debitNoteValue'), dataField: 'debitNoteValue', type: 'number', headerStyle: { width: '7%' } },
      { text: IntlMessages('page.cxcByInsurer.table.balance'), dataField: 'balance', type: 'number', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxcByInsurer.table.accumulated'), dataField: 'accumulated', type: 'number', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxcByInsurer.table.status'), dataField: 'estado', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxcByInsurer.table.description'), dataField: 'description', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxcByInsurer.table.reference'), dataField: 'reference', headerStyle: { width: '7%' } }
    ],
    data: allRows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const totalsTable = {
    columns: [
      { text: IntlMessages('page.cxcByInsurer.table.agingBucket'), dataField: 'label', headerStyle: { width: '60%' } },
      { text: IntlMessages('page.cxcByInsurer.table.balance'), dataField: 'total', type: 'number', headerStyle: { width: '40%' } }
    ],
    data: [
      ...AGING_BUCKETS.map((b) => ({
        label: IntlMessages(b.label),
        total: allRows.reduce((sum, r) => sum + (b.test(r.numDays) ? Number(r.balance || 0) : 0), 0)
      })),
      { label: IntlMessages('page.cxcByInsurer.table.total'), total: allRows.reduce((sum, r) => sum + Number(r.balance || 0), 0) }
    ],
    options: { pageSize: 10 }
  };

  const fnExportXlsx = () => {
    if (Number(insurerId) === 0) return;
    const insurer = listCustomers.find((c) => c.value === Number(insurerId));
    fnExport('accounting/process/cxc/byInsurer/exportXLSX', { insurerId, customerId: Number(customerId) === 0 ? undefined : customerId, insurerName: insurer?.label }, 'CuentasPorCobrarAseguradora.xlsx');
  }

  const fnPrint = () => {
    if (Number(insurerId) === 0) return;
    setLoading(true);
    const insurer = listCustomers.find((c) => c.value === Number(insurerId));
    request.GETPdf('accounting/process/cxc/byInsurer/exportPDF', { insurerId, customerId: Number(customerId) === 0 ? undefined : customerId, insurerName: insurer?.label }, 'CuentasPorCobrarAseguradora.pdf', () => setLoading(false));
    setLoading(false);
  }

  useEffect(() => {
    request.GET('billing/settings/customers/?status=1', (resp) => {
      setListCustomers(resp.data.map((item) => ({ label: `${item.id} | ${item.nomcli}`, value: item.id })));
    }, () => { });
  }, []);

  const propsToHeader = { insurerId, customerId, listCustomers, onInputChange, fnSearch, fnExportXlsx, fnPrint };

  return { table, totalsTable, propsToHeader };
}
