import { formatNumber } from '@Helpers/Utils';

const MONTH_ABBR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Helpers reusables para pivotConfig.colKeyFn/colLabelFn/colSortFn cuando la columna
// dinámica es un mes (los 4 reportes pivote de "Otros Reportes" usan mes como columna,
// salvo el que usa vendedor como columna).
export const monthYearKey = (row) => `${row.noYear}-${String(row.noMonth).padStart(2, '0')}`;
export const monthYearLabel = (row) => `${MONTH_ABBR[row.noMonth - 1]}-${row.noYear}`;
export const monthYearSort = (a, b) => (a.noYear - b.noYear) || (a.noMonth - b.noMonth);

// Arma columnas + filas de una tabla dinámica (pivote) a partir de datos PLANOS del
// backend, replicando en el frontend lo que el legacy hacía en VFP con
// `ALTER TABLE cur_salida ADD COLUMN ...` en un loop + macro-sustitución (`&cCommand`)
// — un idioma dinámico de cursores sin equivalente directo en JS/SQL. Decisión tomada
// en la sesión: no pivotear en el backend, devolver GROUP BY plano y pivotear acá.
//
// pivotConfig:
//   rowColumns: [{ field, label, valueFn(row) }] — 1+ columnas que identifican cada fila
//     (ej. solo "tipo de producto", o "mes"+"tipo de producto" juntos).
//   colKeyFn(row) / colLabelFn(row) / colSortFn(a,b) — cómo derivar la columna dinámica
//     (clave interna, texto visible, orden) desde cada fila plana.
//   valueFields: [{ field, prefix?, decimals? }] — 1 o más valores por columna dinámica
//     (ej. solo "total", o "cantidad"+"total" como en Frecuencia de Compra).
//   totalField — cuál valueField se suma para la columna "Total" (default: el primero).
//   showGrandTotal — agrega una columna "Total" con la suma de `totalField` en todas las columnas.
//   sortByTotal — si true, ordena filas por el total DESC (Frecuencia de Compra); si no,
//     usa rowSortKeyFn (si viene) o alfabético por el primer rowColumn.
//   rowSortKeyFn(row) — clave de orden calculada sobre la fila PLANA original (ej. para
//     ordenar cronológicamente cuando el primer rowColumn es un label de mes como texto).
export function buildPivotTable(pivotConfig, data) {
  const { rowColumns, colKeyFn, colLabelFn, colSortFn, valueFields, showGrandTotal, sortByTotal, rowSortKeyFn } = pivotConfig;
  const totalField = pivotConfig.totalField || valueFields[0].field;

  const colMap = new Map();
  data.forEach((row) => {
    const key = colKeyFn(row);
    if (!colMap.has(key)) colMap.set(key, { key, label: colLabelFn(row), sortRow: row });
  });
  const cols = Array.from(colMap.values()).sort((a, b) => colSortFn(a.sortRow, b.sortRow));

  const rowMap = new Map();
  data.forEach((row) => {
    const rowKey = rowColumns.map((rc) => rc.valueFn(row)).join('|');
    if (!rowMap.has(rowKey)) {
      const base = {};
      rowColumns.forEach((rc) => { base[rc.field] = rc.valueFn(row); });
      if (rowSortKeyFn) base.__sortKey = rowSortKeyFn(row);
      rowMap.set(rowKey, base);
    }
    const rec = rowMap.get(rowKey);
    const colKey = colKeyFn(row);
    valueFields.forEach((vf) => {
      rec[`${vf.field}__${colKey}`] = vf.accessor ? vf.accessor(row) : row[vf.field];
    });
  });

  let rows = Array.from(rowMap.values()).map((rec) => {
    let total = 0;
    cols.forEach((c) => { total += Number(rec[`${totalField}__${c.key}`] || 0); });
    return { ...rec, __total: total };
  });
  if (sortByTotal) {
    rows = rows.sort((a, b) => b.__total - a.__total);
  } else if (rowSortKeyFn) {
    rows = rows.sort((a, b) => (a.__sortKey > b.__sortKey ? 1 : a.__sortKey < b.__sortKey ? -1 : 0));
  } else {
    rows = rows.sort((a, b) => String(a[rowColumns[0].field]).localeCompare(String(b[rowColumns[0].field])));
  }

  const columns = rowColumns.map((rc) => ({ text: rc.label, dataField: rc.field }));
  cols.forEach((c) => {
    valueFields.forEach((vf) => {
      const dataField = `${vf.field}__${c.key}`;
      columns.push({
        text: valueFields.length > 1 ? `${vf.prefix} ${c.label}` : c.label,
        dataField,
        style: { textAlign: 'right' },
        cell: ({ row }) => formatNumber(row.original[dataField] || 0, '', vf.decimals ?? 2)
      });
    });
  });
  if (showGrandTotal) {
    columns.push({
      text: 'Total',
      dataField: '__total',
      style: { textAlign: 'right' },
      cell: ({ row }) => formatNumber(row.original.__total, '', 2)
    });
  }
  return { columns, data: rows };
}
