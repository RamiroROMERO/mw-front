import { useEffect, useState } from 'react';
import { IntlMessages } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';

// Equivalente a cont_cxpdeta_comercial.sc2 ("Proyección Cuentas por Pagar") — espejo de
// cxcProjection, lado proveedores. NO es un análogo 1:1: el legacy de esta pantalla llama
// `getCurrentCxP` (controles_hw.vc2, mismo query ya replicado como CXP_BALANCE_JOINS/EXPR),
// con providerId opcional (0 = todos) en vez del filtro cliente+tipoCliente de CxC. Los 7
// rangos de antigüedad (Corriente/1-30/31-60/61-90/91-120/121-150/>150) son los mismos ya
// usados en cxcProjection/Cash Flow — se calculan acá en el cliente sobre `date` (fecha de
// corte editable, Textbox_hw2 en el legacy), igual patrón que el resto de esta migración.
const AGING_BUCKETS = [
  { field: 'current', label: 'page.cxpProjection.table.current', test: (d) => d <= 0 },
  { field: 'days30', label: 'page.cxpProjection.table.days30', test: (d) => d >= 1 && d <= 30 },
  { field: 'days60', label: 'page.cxpProjection.table.days60', test: (d) => d >= 31 && d <= 60 },
  { field: 'days90', label: 'page.cxpProjection.table.days90', test: (d) => d >= 61 && d <= 90 },
  { field: 'days120', label: 'page.cxpProjection.table.days120', test: (d) => d >= 91 && d <= 120 },
  { field: 'days150', label: 'page.cxpProjection.table.days150', test: (d) => d >= 121 && d <= 150 },
  { field: 'daysMore', label: 'page.cxpProjection.table.daysMore', test: (d) => d > 150 }
];

export const useCxPProjection = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const { formState, onInputChange } = useForm({ date: DateHelper.format(DateHelper.now()), providerId: 0 });
  const { date, providerId } = formState;

  const [allRows, setAllRows] = useState([]);
  const [listProviders, setListProviders] = useState([]);

  const fnSearch = () => {
    setLoading(true);
    const providerFilter = Number(providerId) === 0 ? undefined : providerId;
    request.GET(buildUrl('accounting/process/accountsPayable/projection', { providerId: providerFilter }), (resp) => {
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

  useEffect(() => {
    request.GET(buildUrl('inventory/process/providers', { status: 1 }), (resp) => {
      setListProviders(resp.data.map((item) => ({ label: `${item.id} | ${item.name}`, value: item.id })));
    }, () => { });
    fnSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const table = {
    title: IntlMessages('page.cxpProjection.table.title'),
    columns: [
      { text: IntlMessages('table.column.date'), dataField: 'invoiceDate', type: 'date', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxpProjection.table.document'), dataField: 'documentCode', headerStyle: { width: '11%' } },
      { text: IntlMessages('page.cxpProjection.table.provider'), dataField: 'providerName', headerStyle: { width: '17%' } },
      { text: IntlMessages('page.cxpProjection.table.balance'), dataField: 'balance', type: 'number', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxpProjection.table.dueDate'), dataField: 'dueDate', type: 'date', headerStyle: { width: '8%' } },
      ...AGING_BUCKETS.map((b) => ({ text: IntlMessages(b.label), dataField: b.field, type: 'number', headerStyle: { width: '7%' } })),
      { text: IntlMessages('page.cxpProjection.table.days'), dataField: 'numDays', headerStyle: { width: '6%' } }
    ],
    data: allRows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const totalsTable = {
    columns: [
      { text: IntlMessages('page.cxpProjection.table.agingBucket'), dataField: 'label', headerStyle: { width: '40%' } },
      { text: IntlMessages('page.cxpProjection.table.balance'), dataField: 'total', type: 'number', headerStyle: { width: '30%' } },
      { text: '%', dataField: 'percent', headerStyle: { width: '30%' } }
    ],
    data: (() => {
      const grandTotal = allRows.reduce((sum, r) => sum + Number(r.balance || 0), 0);
      const rows = AGING_BUCKETS.map((b) => {
        const total = allRows.reduce((sum, r) => sum + Number(r[b.field] || 0), 0);
        return { label: IntlMessages(b.label), total, percent: grandTotal !== 0 ? `${((total / grandTotal) * 100).toFixed(2)}%` : '0.00%' };
      });
      rows.push({ label: IntlMessages('page.cxpProjection.table.total'), total: grandTotal, percent: '100.00%' });
      return rows;
    })(),
    options: { pageSize: 10 }
  };

  const fnExportXlsx = () => {
    const providerFilter = Number(providerId) === 0 ? undefined : providerId;
    fnExport('accounting/process/accountsPayable/projection/exportXLSX', { providerId: providerFilter }, 'ProyeccionCuentasPorPagar.xlsx');
  }

  const propsToHeader = { date, providerId, listProviders, onInputChange, fnSearch, fnExportXlsx }

  return { table, totalsTable, propsToHeader }
}
