import { useForm } from '@Hooks'
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { request } from '@Helpers/core';
import { formatDate, formatNumber } from '@Helpers/Utils';
import createNotification from '@Containers/ui/Notifications';

// Los 13 tipos de "Otros Reportes" de inv_repocompras.sc2. 1/2/3/4/5/13 ya están
// cubiertos por pantallas propias (purchaseForstore/purchaseForProvider/purchaseReport/
// expensesServices) y 7 (Bonificaciones) por el checkbox "isBonus" del propio
// purchaseReport (mainPurchases) — no se repiten acá. 6/10/11 (mensual pivot,
// declaración de impuestos, gastos administrativos) quedan pendientes.
const IMPLEMENTED_TYPES = {
  8: 'taxedExemptDetail',
  9: 'taxedExemptSummary',
  12: 'byProductQty'
};

const COLUMNS_BY_TYPE = {
  8: [
    { field: 'date', label: 'table.column.date', isDate: true },
    { field: 'purchaseCode', label: 'table.column.noPurchase' },
    { field: 'providerName', label: 'table.column.provider' },
    { field: 'storeName', label: 'table.column.store' },
    { field: 'productCode', label: 'table.column.code' },
    { field: 'productName', label: 'page.purchaseReport.table.column.description' },
    { field: 'qty', label: 'table.column.qty', isNumber: true },
    { field: 'subtotal', label: 'table.column.subtotal', isNumber: true },
    { field: 'discount', label: 'table.column.discount', isNumber: true },
    { field: 'tax', label: 'table.column.tax', isNumber: true },
    { field: 'total', label: 'table.column.total', isNumber: true },
    { field: 'taxCategory', label: 'page.purchaseReport.table.column.taxCategory' }
  ],
  9: [
    { field: 'taxCategory', label: 'page.purchaseReport.table.column.taxCategory' },
    { field: 'qty', label: 'table.column.qty', isNumber: true },
    { field: 'subtotal', label: 'table.column.subtotal', isNumber: true },
    { field: 'discount', label: 'table.column.discount', isNumber: true },
    { field: 'tax', label: 'table.column.tax', isNumber: true },
    { field: 'total', label: 'table.column.total', isNumber: true }
  ],
  12: [
    { field: 'productCode', label: 'table.column.code' },
    { field: 'productName', label: 'page.purchaseReport.table.column.description' },
    { field: 'qty', label: 'table.column.qty', isNumber: true },
    { field: 'subtotal', label: 'table.column.subtotal', isNumber: true },
    { field: 'discount', label: 'table.column.discount', isNumber: true },
    { field: 'tax', label: 'table.column.tax', isNumber: true },
    { field: 'total', label: 'table.column.total', isNumber: true }
  ]
};

export const useModalOtherReports = ({ setLoading }) => {
  const [data, setData] = useState([]);
  const intl = useIntl();

  const { formState, onInputChange, onResetForm } = useForm({
    providerId: 0,
    storeId: 0,
    productId: 0,
    dateStart: '',
    dateEnd: '',
    exportToXls: 0,
    typeReport: 0
  });

  const { typeReport, dateStart, dateEnd } = formState;

  const fnSearchOtherReport = () => {
    const endpoint = IMPLEMENTED_TYPES[typeReport];
    if (!endpoint) {
      createNotification('warning', 'msg.purchaseReport.otherReports.notImplemented', 'alert.warning.title');
      return;
    }
    setLoading(true);
    request.POST(`inventory/reports/otherPurchases/${endpoint}`, { startDate: dateStart, endDate: dateEnd }, (resp) => {
      setData(resp.data);
      setLoading(false);
    }, () => { setLoading(false); }, false);
  }

  const onTypeChange = (e) => {
    onInputChange(e);
    setData([]);
  }

  // `useIntl()` se llama UNA sola vez arriba (siempre, sin condicionar) — `intl.formatMessage`
  // es una función común, no un hook, así que sí se puede invocar dentro del .map() sin
  // problema. Usar `IntlMessages()` (que llama a useIntl() internamente) acá adentro
  // rompía las reglas de Hooks dos veces: la cantidad de columnas cambia según
  // typeReport (8/9/12 tienen distinto largo), y controlarla desde el callback async de
  // fnSearchOtherReport violaba la regla de "solo durante el render" — ver
  // feedback_intlmessages_hook_order_gotcha, ambos bugs reales confirmados en consola.
  const columns = (COLUMNS_BY_TYPE[typeReport] || []).map((col) => {
    const column = { text: intl.formatMessage({ id: col.label }), dataField: col.field };
    if (col.isNumber) {
      column.style = { textAlign: 'right' };
      column.cell = ({ row }) => formatNumber(row.original[col.field], '', 2);
    } else if (col.isDate) {
      column.cell = ({ row }) => formatDate(row.original[col.field]);
    }
    return column;
  });

  return (
    {
      formState,
      onInputChange,
      onTypeChange,
      onResetForm,
      fnSearchOtherReport,
      data,
      columns
    }
  )
}
