import { formatDate, formatNumber } from '@Helpers/Utils';
import { COLUMNS_BY_TYPE } from './purchaseReportRules';

// Columnas de ReactTable de un tipo de reporte de compras (SPEC v2-57-sr). `format` es `intl.formatMessage` (un solo `useIntl` arriba del
// componente: nunca `IntlMessages` dentro de un map o una condición, rompe el orden de los hooks).
export const buildColumns = (type, format) =>
  (COLUMNS_BY_TYPE[type] || []).map((col) => {
    const column = { text: format({ id: col.label }), dataField: col.field };
    if (col.isNumber) {
      column.style = { textAlign: 'right' };
      column.cell = ({ row }) => formatNumber(row.original[col.field], '', 2);
    } else if (col.isDate) {
      column.cell = ({ row }) => formatDate(row.original[col.field]);
    } else if (col.field === 'orderId') {
      column.cell = ({ row }) => (row.original.orderId ? String(row.original.orderId) : '');
    }
    return column;
  });
