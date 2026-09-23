import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm } from '@Hooks';
import { request } from '@Helpers/core';

const AGING_BUCKETS = [
  { field: 'current', label: 'page.otherReceivableReports.aging.current', test: (d) => d <= 0 },
  { field: 'days30', label: 'page.otherReceivableReports.aging.days30', test: (d) => d >= 1 && d <= 30 },
  { field: 'days60', label: 'page.otherReceivableReports.aging.days60', test: (d) => d >= 31 && d <= 60 },
  { field: 'days90', label: 'page.otherReceivableReports.aging.days90', test: (d) => d >= 61 && d <= 90 },
  { field: 'days120', label: 'page.otherReceivableReports.aging.days120', test: (d) => d >= 91 && d <= 120 },
  { field: 'daysMore', label: 'page.otherReceivableReports.aging.daysMore', test: (d) => d > 120 }
];

// Equivalente a cont_cxc_reportes.sc2 (ver comentario en OtherReceivableReportsService.js
// del backend sobre qué variantes legacy se omiten y por qué). Un solo fetch
// (statementAll) alimenta las 2 pestañas — el agrupado por antigüedad de la pestaña
// "Antigüedad" se calcula en el cliente sobre el mismo dataset ya traído, sin una segunda
// ida y vuelta al backend (mismo patrón que Cash Flow / el modal de detalle de CxC).
export const useOtherReceivableReports = ({ setLoading }) => {
  const { formState, onInputChange } = useForm({
    date: DateHelper.format(DateHelper.now()),
    customerTypeId: 0,
    customerId: 0,
    bucket: 'summary'
  });
  const { date, customerTypeId, customerId, bucket } = formState;

  const [activeTab, setActiveTab] = useState('1');
  const [allRows, setAllRows] = useState([]);
  const [listCustomerTypes, setListCustomerTypes] = useState([]);
  const [listCustomers, setListCustomers] = useState([]);

  // Precalculados fuera de fnSearch: IntlMessages() llama useIntl() internamente, y
  // fnSearch corre dentro del callback async de request.POST (fuera del render de React)
  // — invocarlo ahí lanza "Invalid hook call" (confirmado vía error real en consola,
  // variante nueva de feedback_intlmessages_hook_order_gotcha: no es un condicional, es
  // un callback async que ya salió del ciclo de render).
  const noDueDateLabel = IntlMessages('page.otherReceivableReports.table.noDueDate');
  const daysOverdueLabel = IntlMessages('page.otherReceivableReports.table.daysOverdue');
  const daysUntilDueLabel = IntlMessages('page.otherReceivableReports.table.daysUntilDue');

  const fnSearch = () => {
    setLoading(true);
    const customerTypeFilter = Number(customerTypeId) === 0 ? undefined : customerTypeId;
    const customerFilter = Number(customerId) === 0 ? undefined : customerId;
    request.POST('accounting/reports/otherReceivableReports/statementAll', { date, customerTypeId: customerTypeFilter, customerId: customerFilter }, (resp) => {
      const today = DateHelper.now();
      const rows = resp.data.map((row) => {
        const numDays = row.dueDate ? DateHelper.diff(today, row.dueDate, 'day') : null;
        const estado = numDays === null
          ? noDueDateLabel
          : numDays > 0
            ? `${numDays} ${daysOverdueLabel}`
            : `${Math.abs(numDays)} ${daysUntilDueLabel}`;
        return { ...row, numDays, estado };
      });
      setAllRows(rows);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const statementColumns = [
    { text: IntlMessages('table.column.date'), dataField: 'date', type: 'date', headerStyle: { width: '9%' } },
    { text: IntlMessages('table.column.code'), dataField: 'customerId', headerStyle: { width: '7%' } },
    { text: IntlMessages('page.otherReceivableReports.table.customer'), dataField: 'customerName', headerStyle: { width: '22%' } },
    { text: IntlMessages('page.otherReceivableReports.table.rtn'), dataField: 'rtn', headerStyle: { width: '13%' } },
    { text: IntlMessages('page.otherReceivableReports.table.document'), dataField: 'documentCode', headerStyle: { width: '14%' } },
    { text: IntlMessages('page.otherReceivableReports.table.originalValue'), dataField: 'originalValue', type: 'number', headerStyle: { width: '10%' } },
    { text: IntlMessages('page.otherReceivableReports.table.balance'), dataField: 'balance', type: 'number', headerStyle: { width: '10%' } },
    { text: IntlMessages('page.otherReceivableReports.table.dueDate'), dataField: 'dueDate', type: 'date', headerStyle: { width: '8%' } },
    { text: IntlMessages('page.otherReceivableReports.table.status'), dataField: 'estado', headerStyle: { width: '7%' } }
  ];

  const statementTable = {
    title: IntlMessages('page.otherReceivableReports.tab.statement'),
    columns: statementColumns,
    data: allRows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  // Todas las traducciones se calculan aquí, SIEMPRE, sin importar qué rama del ternario
  // de abajo termine usándose — meterlas dentro de una sola rama hace que la cantidad de
  // llamadas a IntlMessages() (y por lo tanto a useIntl()) cambie entre renders según
  // `bucket`, lo cual React detecta como cambio de orden de Hooks (confirmado vía error
  // real en consola al alternar "Resumen" vs un rango puntual).
  const translatedBuckets = AGING_BUCKETS.map((b) => ({ ...b, translatedLabel: IntlMessages(b.label) }));
  const agingTabTitle = IntlMessages('page.otherReceivableReports.tab.aging');
  const agingBucketColumnLabel = IntlMessages('page.otherReceivableReports.table.agingBucket');
  const agingBalanceColumnLabel = IntlMessages('page.otherReceivableReports.table.balance');
  const agingSummaryOptionLabel = IntlMessages('page.otherReceivableReports.aging.summary');

  const bucketOptions = [
    ...translatedBuckets.map((b) => ({ id: b.field, code: b.field, name: b.translatedLabel })),
    { id: 'summary', code: 'summary', name: agingSummaryOptionLabel }
  ];

  const agingTable = bucket === 'summary'
    ? {
      title: agingTabTitle,
      columns: [
        { text: agingBucketColumnLabel, dataField: 'label', headerStyle: { width: '70%' } },
        { text: agingBalanceColumnLabel, dataField: 'total', type: 'number', headerStyle: { width: '30%' } }
      ],
      data: translatedBuckets.map((b) => ({
        label: b.translatedLabel,
        total: allRows.reduce((sum, r) => sum + (b.test(r.numDays) ? Number(r.balance || 0) : 0), 0)
      })),
      options: { pageSize: 10 }
    }
    : {
      title: agingTabTitle,
      columns: statementColumns,
      data: allRows.filter((r) => {
        const def = translatedBuckets.find((b) => b.field === bucket);
        return def ? def.test(r.numDays) : true;
      }),
      options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
    };

  useEffect(() => {
    request.GET('admin/customerTypes', (resp) => {
      setListCustomerTypes(resp.data.map((item) => ({ label: item.name, value: item.id })));
    }, () => { });
    request.GET('billing/settings/customers/?status=1', (resp) => {
      setListCustomers(resp.data.map((item) => ({ label: `${item.id} | ${item.nomcli}`, value: item.id })));
    }, () => { });
    fnSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const propsToHeader = {
    date, customerTypeId, customerId,
    listCustomerTypes, listCustomers,
    onInputChange, fnSearch
  }

  const propsToAgingHeader = { bucket, bucketOptions, onInputChange }

  return {
    activeTab, setActiveTab,
    propsToHeader, propsToAgingHeader,
    statementTable, agingTable,
    formatNumber, formatDate
  }
}
