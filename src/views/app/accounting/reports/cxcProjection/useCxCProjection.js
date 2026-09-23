import { useEffect, useState } from 'react';
import { IntlMessages } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';

// Equivalente a cont_cxcdeta01.sc2 ("Proyección Cuentas por Cobrar"). Los 7 rangos de
// antigüedad son idénticos a los ya usados en Cash Flow (Corriente/1-30/31-60/61-90/91-120/
// 121-150/>150) — el legacy de ESTA pantalla usa exactamente esos mismos cortes (a
// diferencia del modal de detalle de Cuentas por Cobrar, que usa 6 rangos más simples).
// El backend (findProjection) ya trae el saldo real por factura; el bucketing por
// antigüedad se calcula acá, en el cliente, sobre `date` (fecha de corte editable) — mismo
// patrón de cálculo en cliente ya usado en toda esta migración.
const AGING_BUCKETS = [
  { field: 'current', label: 'page.cxcProjection.table.current', test: (d) => d <= 0 },
  { field: 'days30', label: 'page.cxcProjection.table.days30', test: (d) => d >= 1 && d <= 30 },
  { field: 'days60', label: 'page.cxcProjection.table.days60', test: (d) => d >= 31 && d <= 60 },
  { field: 'days90', label: 'page.cxcProjection.table.days90', test: (d) => d >= 61 && d <= 90 },
  { field: 'days120', label: 'page.cxcProjection.table.days120', test: (d) => d >= 91 && d <= 120 },
  { field: 'days150', label: 'page.cxcProjection.table.days150', test: (d) => d >= 121 && d <= 150 },
  { field: 'daysMore', label: 'page.cxcProjection.table.daysMore', test: (d) => d > 150 }
];

export const useCxCProjection = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const { formState, onInputChange } = useForm({ date: DateHelper.format(DateHelper.now()), customerId: 0, customerTypeId: 0 });
  const { date, customerId, customerTypeId } = formState;

  const [allRows, setAllRows] = useState([]);
  const [listCustomers, setListCustomers] = useState([]);
  const [listCustomerTypes, setListCustomerTypes] = useState([]);

  const fnSearch = () => {
    setLoading(true);
    const customerFilter = Number(customerId) === 0 ? undefined : customerId;
    const customerTypeFilter = Number(customerTypeId) === 0 ? undefined : customerTypeId;
    request.GET(buildUrl('accounting/process/cxc/projection', { customerId: customerFilter, customerTypeId: customerTypeFilter }), (resp) => {
      const rows = resp.data.map((row) => {
        const numDays = row.dueDate ? DateHelper.diff(date, row.dueDate, 'day') : 0;
        const bucketRow = AGING_BUCKETS.reduce((acc, b) => {
          acc[b.field] = b.test(numDays) ? Number(row.balance || 0) : 0;
          return acc;
        }, {});
        return { ...row, numDays, ...bucketRow };
      });
      setAllRows(rows);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const table = {
    title: IntlMessages('page.cxcProjection.table.title'),
    columns: [
      { text: IntlMessages('table.column.date'), dataField: 'invoiceDate', type: 'date', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxcProjection.table.document'), dataField: 'documentCode', headerStyle: { width: '11%' } },
      { text: IntlMessages('page.cxcProjection.table.customer'), dataField: 'customerName', headerStyle: { width: '17%' } },
      { text: IntlMessages('page.cxcProjection.table.balance'), dataField: 'balance', type: 'number', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxcProjection.table.dueDate'), dataField: 'dueDate', type: 'date', headerStyle: { width: '8%' } },
      ...AGING_BUCKETS.map((b) => ({ text: IntlMessages(b.label), dataField: b.field, type: 'number', headerStyle: { width: '7%' } })),
      { text: IntlMessages('page.cxcProjection.table.days'), dataField: 'numDays', headerStyle: { width: '6%' } }
    ],
    data: allRows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const totalsTable = {
    columns: [
      { text: IntlMessages('page.cxcProjection.table.agingBucket'), dataField: 'label', headerStyle: { width: '40%' } },
      { text: IntlMessages('page.cxcProjection.table.balance'), dataField: 'total', type: 'number', headerStyle: { width: '30%' } },
      { text: '%', dataField: 'percent', headerStyle: { width: '30%' } }
    ],
    data: (() => {
      const grandTotal = allRows.reduce((sum, r) => sum + Number(r.balance || 0), 0);
      const rows = AGING_BUCKETS.map((b) => {
        const total = allRows.reduce((sum, r) => sum + Number(r[b.field] || 0), 0);
        return { label: IntlMessages(b.label), total, percent: grandTotal !== 0 ? `${((total / grandTotal) * 100).toFixed(2)}%` : '0.00%' };
      });
      rows.push({ label: IntlMessages('page.cxcProjection.table.total'), total: grandTotal, percent: '100.00%' });
      return rows;
    })(),
    options: { pageSize: 10 }
  };

  const fnExportXlsx = () => {
    const customerFilter = Number(customerId) === 0 ? undefined : customerId;
    const customerTypeFilter = Number(customerTypeId) === 0 ? undefined : customerTypeId;
    fnExport('accounting/process/cxc/projection/exportXLSX', { customerId: customerFilter, customerTypeId: customerTypeFilter }, 'ProyeccionCuentasPorCobrar.xlsx');
  }

  useEffect(() => {
    request.GET('billing/settings/customers/?status=1', (resp) => {
      setListCustomers(resp.data.map((item) => ({ label: `${item.id} | ${item.nomcli}`, value: item.id })));
    }, () => { });
    request.GET('admin/customerTypes', (resp) => {
      setListCustomerTypes(resp.data.map((item) => ({ label: item.name, value: item.id })));
    }, () => { });
    fnSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const propsToHeader = { date, customerId, customerTypeId, listCustomers, listCustomerTypes, onInputChange, fnSearch, fnExportXlsx }

  return { table, totalsTable, propsToHeader }
}
