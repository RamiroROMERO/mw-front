import { useEffect, useState } from 'react';
import { request } from '@Helpers/core';
import { useForm } from '@Hooks';
import DateHelper from '@Helpers/DateHelper';
import { formatDate, formatNumber, IntlMessages } from '@Helpers/Utils';
import { REPORT_TYPES } from './reportConfig';
import { buildPivotTable } from './pivotBuilder';

export const useOtherSalesReports = ({ setLoading }) => {
  const [listCustomers, setListCustomers] = useState([]);
  const [listCashiers, setListCashiers] = useState([]);
  const [data, setData] = useState([]);

  const { formState, onInputChange, setBulkForm } = useForm({
    reportType: REPORT_TYPES[0].key,
    startDate: DateHelper.format(new Date()),
    endDate: DateHelper.format(new Date()),
    currency: 1,
    customerId: 0,
    cashierId: 0,
    isPartner: false
  });

  const { reportType, startDate, endDate, currency, customerId, cashierId, isPartner } = formState;
  const currentConfig = REPORT_TYPES.find((item) => item.key === reportType) || REPORT_TYPES[0];

  useEffect(() => {
    request.GET('billing/settings/customers/?status=1', (resp) => {
      const customers = resp.data.map((item) => ({ label: `${item.id} | ${item.nomcli}`, value: item.id }));
      setListCustomers(customers);
    }, () => { });

    request.GET('admin/users?isSeller=1&status=1', (resp) => {
      const cashiers = resp.data.map((item) => ({ label: item.name, value: item.id }));
      setListCashiers(cashiers);
    }, () => { });
  }, []);

  // Columnas dinámicas según el tipo de reporte seleccionado — cada tipo tiene su propio
  // set de columnas (ver reportConfig.js), no hay una tabla fija.
  const buildColumns = (config) => config.columns.map((col) => {
    const column = { text: IntlMessages(col.label), dataField: col.field };
    if (col.isNumber) column.style = { textAlign: 'right' };
    if (col.isDate) column.cell = ({ row }) => formatDate(row.original[col.field]);
    else if (col.isNumber) column.cell = ({ row }) => formatNumber(row.original[col.field], '', 2);
    return column;
  });

  const fnSearchReport = () => {
    setLoading(true);
    const body = { startDate, endDate, currency };
    if (currentConfig.filters.includes('customerId') && customerId > 0) body.customerId = customerId;
    if (currentConfig.filters.includes('cashierId') && cashierId > 0) body.cashierId = cashierId;
    if (currentConfig.filters.includes('isPartner') && isPartner) body.isPartner = true;

    request.POST(`billing/reports/otherSales/${currentConfig.endpoint}`, body, (resp) => {
      setData(resp.data);
      setLoading(false);
    }, () => { setLoading(false); }, false);
  }

  const onReportTypeChange = (e) => {
    setBulkForm({ reportType: e.target.value, customerId: 0, cashierId: 0, isPartner: false });
    setData([]);
  }

  // buildColumns/buildPivotTable llaman a IntlMessages (hook useIntl) o simplemente deben
  // recalcularse en cada render — nunca dentro de fnSearchReport (callback async), o React
  // lanza "Invalid hook call" (ver bug real encontrado y corregido en esta misma pantalla).
  const table = currentConfig.isPivot
    ? { title: IntlMessages(currentConfig.label), ...buildPivotTable(currentConfig.pivot, data), actions: [] }
    : { title: IntlMessages(currentConfig.label), columns: buildColumns(currentConfig), data, actions: [] };

  const propsToHeaderReport = {
    formState,
    onInputChange,
    onReportTypeChange,
    listCustomers,
    listCashiers,
    currentConfig,
    fnSearchReport
  }

  return { table, propsToHeaderReport }
}
