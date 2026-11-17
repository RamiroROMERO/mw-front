import { formatDate, formatNumber } from '@Helpers/Utils';
import { typeOf } from './inventoryReportRules';

// Columnas de ReactTable de un tipo de reporte de inventarios (SPEC v2-60-sr). `format` es `intl.formatMessage` (un solo `useIntl` arriba del componente:
// nunca `IntlMessages` dentro de un map o una condición, rompe el orden de los hooks).
export const buildColumns = (typeId, format) =>
  (typeOf(typeId)?.columns || []).map((col) => {
    const column = { text: format({ id: col.label }), dataField: col.field };
    if (col.isNumber) {
      column.style = { textAlign: 'right' };
      column.cell = ({ row }) => formatNumber(row.original[col.field], '', 2);
    } else if (col.isDate) {
      column.cell = ({ row }) => formatDate(row.original[col.field]);
    }
    return column;
  });
