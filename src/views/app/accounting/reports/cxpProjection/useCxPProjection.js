import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { IntlMessages } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import { BASE_PATH, buildAsOfQuery, normalizeProjection, validateAsOfDate } from '../cxpShared/cxpReportsRules';
import { useCxpProviders } from '../cxpShared/useCxpProviders';

// Proyección de Cuentas por Pagar (cont_cxpdeta_comercial.sc2, SPEC v2-133-sr). El saldo y los 7 rangos de antigüedad los calcula el back A LA FECHA DE CORTE (misma fórmula histórica de Cuentas por Pagar);
// aquí solo se muestran. Proveedor 0 = todos.
const AGING_COLUMNS = [
  { field: 'valCurr', label: 'page.cxpProjection.table.current' },
  { field: 'val30', label: 'page.cxpProjection.table.days30' },
  { field: 'val60', label: 'page.cxpProjection.table.days60' },
  { field: 'val90', label: 'page.cxpProjection.table.days90' },
  { field: 'val120', label: 'page.cxpProjection.table.days120' },
  { field: 'val150', label: 'page.cxpProjection.table.days150' },
  { field: 'valMore', label: 'page.cxpProjection.table.daysMore' }
];

export const useCxPProjection = ({ setLoading }) => {
  const intl = useIntl();
  const { fnExport } = useExportExcel(setLoading);
  const listProviders = useCxpProviders();
  const { formState, onInputChange } = useForm({ date: DateHelper.format(DateHelper.now()), providerId: 0 });
  const { date, providerId } = formState;

  const [data, setData] = useState(normalizeProjection(undefined));

  const isValid = () => {
    const error = validateAsOfDate(date);
    if (error) NotificationManager.warning(intl.formatMessage({ id: error }), '', 4000, null, null, '');
    return !error;
  };

  const fnSearch = () => {
    if (!isValid()) return;
    setLoading(true);
    request.GET(buildUrl(`${BASE_PATH}/projection`, buildAsOfQuery({ date, providerId })), (resp) => {
      setData(normalizeProjection(resp.data));
      setLoading(false);
    }, () => { setLoading(false); });
  };

  useEffect(() => { fnSearch(); }, []);

  const table = {
    title: IntlMessages('page.cxpProjection.table.title'),
    columns: [
      { text: IntlMessages('table.column.date'), dataField: 'invoiceDate', type: 'date', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxpProjection.table.document'), dataField: 'documentCode', headerStyle: { width: '11%' } },
      { text: IntlMessages('page.cxpProjection.table.provider'), dataField: 'providerName', headerStyle: { width: '17%' } },
      { text: IntlMessages('page.cxpProjection.table.balance'), dataField: 'balance', type: 'number', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxpProjection.table.dueDate'), dataField: 'dueDate', type: 'date', headerStyle: { width: '8%' } },
      ...AGING_COLUMNS.map((b) => ({ text: IntlMessages(b.label), dataField: b.field, type: 'number', headerStyle: { width: '7%' } })),
      { text: IntlMessages('page.cxpProjection.table.days'), dataField: 'numDays', headerStyle: { width: '6%' } }
    ],
    data: data.rows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const totalsTable = {
    columns: [
      { text: IntlMessages('page.cxpProjection.table.agingBucket'), dataField: 'label', headerStyle: { width: '40%' } },
      { text: IntlMessages('page.cxpProjection.table.balance'), dataField: 'total', type: 'number', headerStyle: { width: '30%' } },
      { text: '%', dataField: 'percent', headerStyle: { width: '30%' } }
    ],
    data: [
      ...AGING_COLUMNS.map((b) => ({ label: IntlMessages(b.label), total: data.totals[b.field], percent: `${Number(data.percents[b.field] || 0).toFixed(2)}%` })),
      { label: IntlMessages('page.cxpProjection.table.total'), total: data.totals.total, percent: '100.00%' }
    ],
    options: { pageSize: 10 }
  };

  const fnExportXlsx = () => { if (isValid()) fnExport(`${BASE_PATH}/projection/exportXLSX`, buildAsOfQuery({ date, providerId }), 'ProyeccionCuentasPorPagar.xlsx'); };

  const propsToHeader = { date, providerId, listProviders, onInputChange, fnSearch, fnExportXlsx };

  return { table, totalsTable, propsToHeader };
};
