import { formatDate, formatNumber } from '@Helpers/Utils';

// Columnas de ReactTable del reporte de ventas (SPEC v2-98-sr) a partir de las columnas de `salesReportRules.columnsFor`. `format` es
// `intl.formatMessage` (un solo `useIntl` arriba del componente: nunca `IntlMessages` dentro de un map o una condición, rompe el orden de los hooks).
export const buildSalesColumns = (columns, format) =>
  (columns || []).map((col) => {
    const column = { text: format({ id: col.label }), dataField: col.field };
    if (col.isNumber) {
      column.style = { textAlign: 'right' };
      column.cell = ({ row }) => formatNumber(row.original[col.field], '', 2);
    } else if (col.isDate) {
      column.cell = ({ row }) => formatDate(row.original[col.field]);
    }
    return column;
  });
