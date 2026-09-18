import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { request } from '@Helpers/core';
import { useForm } from '@Hooks';
import DateHelper from '@Helpers/DateHelper';
import { formatNumber, formatDate } from '@Helpers/Utils';
import createNotification from '@Containers/ui/Notifications';

// inv_repo_kardex.sc2 — 4 reportes de saldo HISTÓRICO de inv_kardex a una fecha de corte
// (distinto del stock "en vivo" que usa invProcessSTocks/getStocks en el resto de la
// app). El reporte 2 (General de Existencias) no pide almacén — es un pivot con todos
// los almacenes reales como columnas.
const ENDPOINT_BY_TYPE = {
  1: 'existenceReport',
  2: 'generalExistenceReport',
  3: 'noMovementReport',
  4: 'existenceByExpiryDate'
};

// Columnas fijas por tipo de reporte (1/3/4) — el reporte 2 arma sus columnas aparte
// (pivot dinámico por almacén, ver buildPivotColumns). `useIntl()` se llama UNA sola vez
// arriba y `intl.formatMessage` (función común, no hook) se usa acá adentro — nunca
// IntlMessages() con un conteo de columnas que varía según el tipo de reporte, ver
// feedback_intlmessages_hook_order_gotcha (bug real ya confirmado con este mismo patrón
// en useModalOtherReports.js).
const COLUMNS_BY_TYPE = {
  1: [
    { field: 'productCode', label: 'table.column.code' },
    { field: 'productName', label: 'page.purchaseReport.table.column.description' },
    { field: 'tradeMark', label: 'page.costsAndPrices.table.trademark' },
    { field: 'outputUnit', label: 'page.costsAndPrices.table.outputUnit' },
    { field: 'debitQty', label: 'page.costAdjustment.table.debitQty', isNumber: true },
    { field: 'creditQty', label: 'page.costAdjustment.table.creditQty', isNumber: true },
    { field: 'stock', label: 'page.kardexReport.table.stock', isNumber: true },
    { field: 'costValue', label: 'page.costAdjustment.table.cost', isNumber: true },
    { field: 'total', label: 'table.column.total', isNumber: true }
  ],
  3: [
    { field: 'productCode', label: 'table.column.code' },
    { field: 'productName', label: 'page.purchaseReport.table.column.description' },
    { field: 'stock', label: 'page.kardexReport.table.stock', isNumber: true },
    { field: 'costValue', label: 'page.costAdjustment.table.cost', isNumber: true },
    { field: 'total', label: 'table.column.total', isNumber: true },
    { field: 'lastMovementDate', label: 'page.kardexReport.table.lastMovementDate', isDate: true }
  ],
  4: [
    { field: 'productCode', label: 'table.column.code' },
    { field: 'productName', label: 'page.purchaseReport.table.column.description' },
    { field: 'tradeMark', label: 'page.costsAndPrices.table.trademark' },
    { field: 'debitQty', label: 'page.costAdjustment.table.debitQty', isNumber: true },
    { field: 'creditQty', label: 'page.costAdjustment.table.creditQty', isNumber: true },
    { field: 'stock', label: 'page.kardexReport.table.stock', isNumber: true },
    { field: 'costValue', label: 'page.costAdjustment.table.cost', isNumber: true },
    { field: 'total', label: 'table.column.total', isNumber: true },
    { field: 'dateExp', label: 'page.kardexReport.table.dateExp', isDate: true }
  ]
};

export const useKardexReport = ({ setLoading }) => {
  const intl = useIntl();
  const [listStores, setListStores] = useState([]);
  const [data, setData] = useState([]);
  const [pivotStores, setPivotStores] = useState([]);

  const { formState, onInputChange } = useForm({
    reportType: 1,
    option: 3,
    storeId: 0,
    maxDate: DateHelper.format(new Date())
  });

  const { reportType, storeId, maxDate } = formState;
  const needsStore = Number(reportType) !== 2;
  const needsOption = Number(reportType) !== 3;

  useEffect(() => {
    request.GET('inventory/settings/stores?type=1', (resp) => {
      setListStores(resp.data.map((item) => ({ label: item.name, value: item.id })));
    }, () => { });
  }, []);

  const onReportTypeChange = (e) => {
    onInputChange(e);
    setData([]);
    setPivotStores([]);
  }

  const fnSearch = () => {
    if (!maxDate) {
      createNotification('warning', 'page.kardexReport.msg.dateRequired', 'alert.warning.title');
      return;
    }
    if (needsStore && Number(storeId) === 0) {
      createNotification('warning', 'msg.required.select.warehouse', 'alert.warning.title');
      return;
    }
    const endpoint = ENDPOINT_BY_TYPE[reportType];
    setLoading(true);
    request.POST(`inventory/reports/kardexReport/${endpoint}`, formState, (resp) => {
      if (Number(reportType) === 2) {
        setPivotStores(resp.data.stores);
        setData(resp.data.rows);
      } else {
        setPivotStores([]);
        setData(resp.data);
      }
      setLoading(false);
    }, () => { setLoading(false); }, false);
  }

  const buildCell = (col) => {
    if (col.isNumber) return ({ row }) => formatNumber(row.original[col.field], '', 2);
    if (col.isDate) return ({ row }) => (row.original[col.field] ? formatDate(row.original[col.field]) : '');
    return undefined;
  }

  const columns = Number(reportType) === 2
    ? [
      { text: intl.formatMessage({ id: 'table.column.code' }), dataField: 'productCode' },
      { text: intl.formatMessage({ id: 'page.purchaseReport.table.column.description' }), dataField: 'productName' },
      { text: intl.formatMessage({ id: 'page.costsAndPrices.table.trademark' }), dataField: 'tradeMark' },
      { text: intl.formatMessage({ id: 'page.costsAndPrices.table.outputUnit' }), dataField: 'outputUnit' },
      ...pivotStores.map((store) => ({
        text: store.name,
        dataField: `store_${store.id}`,
        style: { textAlign: 'right' },
        cell: ({ row }) => formatNumber(row.original.byStore?.[store.id], '', 2)
      })),
      { text: intl.formatMessage({ id: 'page.kardexReport.table.qtyTotal' }), dataField: 'qtyTotal', style: { textAlign: 'right' }, cell: ({ row }) => formatNumber(row.original.qtyTotal, '', 2) },
      { text: intl.formatMessage({ id: 'page.costAdjustment.table.cost' }), dataField: 'costValue', style: { textAlign: 'right' }, cell: ({ row }) => formatNumber(row.original.costValue, '', 2) },
      { text: intl.formatMessage({ id: 'table.column.total' }), dataField: 'total', style: { textAlign: 'right' }, cell: ({ row }) => formatNumber(row.original.total, '', 2) }
    ]
    : (COLUMNS_BY_TYPE[reportType] || []).map((col) => {
      const column = { text: intl.formatMessage({ id: col.label }), dataField: col.field };
      if (col.isNumber) column.style = { textAlign: 'right' };
      const cell = buildCell(col);
      if (cell) column.cell = cell;
      return column;
    });

  return {
    formState,
    onInputChange,
    onReportTypeChange,
    fnSearch,
    listStores,
    needsStore,
    needsOption,
    data,
    columns
  }
}
