import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { IntlMessages } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import { BASE_PATH, AGING_FIELDS, buildAsOfQuery, normalizeProjection, normalizeSettings, validateAsOfDate } from '../cxcShared/cxcReportsRules';
import { useCxcCustomers, useCxcSettings } from '../cxcShared/useCxcCustomers';

const AGING_LABELS = {
  valCurr: 'page.cxcProjection.table.current', val30: 'page.cxcProjection.table.days30', val60: 'page.cxcProjection.table.days60', val90: 'page.cxcProjection.table.days90',
  val120: 'page.cxcProjection.table.days120', val150: 'page.cxcProjection.table.days150', valMore: 'page.cxcProjection.table.daysMore'
};

// Proyección de Cuentas por Cobrar (cont_cxcdeta01.sc2, SPEC v2-132-sr): el back calcula el saldo a la FECHA DE CORTE y los 7 rangos de antigüedad (los mismos del Flujo de Efectivo) con sus totales y porcentajes;
// la pantalla y el Excel muestran exactamente lo mismo. Un documento sin vencimiento cuenta como "más de 150".
export const useCxCProjection = ({ setLoading }) => {
  const intl = useIntl();
  const { fnExport } = useExportExcel(setLoading);
  const settings = useCxcSettings(normalizeSettings);
  const listCustomers = useCxcCustomers();
  const { formState, onInputChange } = useForm({ date: DateHelper.format(DateHelper.now()), currency: 1, customerId: 0, customerTypeId: 0 });
  const { date, currency, customerId, customerTypeId } = formState;

  const [data, setData] = useState(normalizeProjection(undefined));
  const [listCustomerTypes, setListCustomerTypes] = useState([]);

  const query = () => buildAsOfQuery({ date, currency, customerId, customerTypeId }, settings);
  const isValid = () => {
    const error = validateAsOfDate(date);
    if (error) NotificationManager.warning(intl.formatMessage({ id: error }), '', 4000, null, null, '');
    return !error;
  };

  const fnSearch = () => {
    if (!isValid()) return;
    setLoading(true);
    request.GET(buildUrl(`${BASE_PATH}/projection`, query()), (resp) => {
      setData(normalizeProjection(resp.data));
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const fnExportXlsx = () => { if (isValid()) fnExport(`${BASE_PATH}/projection/exportXLSX`, query(), 'ProyeccionCuentasPorCobrar.xlsx'); };

  const table = {
    title: IntlMessages('page.cxcProjection.table.title'),
    columns: [
      { text: IntlMessages('table.column.date'), dataField: 'invoiceDate', type: 'date', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxcProjection.table.document'), dataField: 'documentCode', headerStyle: { width: '11%' } },
      { text: IntlMessages('page.cxcProjection.table.customer'), dataField: 'customerName', headerStyle: { width: '17%' } },
      { text: IntlMessages('page.cxcProjection.table.balance'), dataField: 'balance', type: 'number', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxcProjection.table.dueDate'), dataField: 'dueDate', type: 'date', headerStyle: { width: '8%' } },
      ...AGING_FIELDS.map((f) => ({ text: IntlMessages(AGING_LABELS[f]), dataField: f, type: 'number', headerStyle: { width: '7%' } })),
      { text: IntlMessages('page.cxcProjection.table.days'), dataField: 'numDays', headerStyle: { width: '6%' } }
    ],
    data: data.rows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const totalsTable = {
    columns: [
      { text: IntlMessages('page.cxcProjection.table.agingBucket'), dataField: 'label', headerStyle: { width: '40%' } },
      { text: IntlMessages('page.cxcProjection.table.balance'), dataField: 'total', type: 'number', headerStyle: { width: '30%' } },
      { text: '%', dataField: 'percent', headerStyle: { width: '30%' } }
    ],
    data: [
      ...AGING_FIELDS.map((f) => ({ label: IntlMessages(AGING_LABELS[f]), total: data.totals[f], percent: `${Number(data.percents[f] || 0).toFixed(2)}%` })),
      { label: IntlMessages('page.cxcProjection.table.total'), total: data.totals.total, percent: '100.00%' }
    ],
    options: { pageSize: 10 }
  };

  useEffect(() => {
    request.GET('admin/customerTypes/getForCustomers', (resp) => {
      setListCustomerTypes(resp.data.map((item) => ({ label: item.name, value: item.id })));
    }, () => { });
    fnSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const propsToHeader = { date, currency, hasDualCurrency: settings.hasDualCurrency, customerId, customerTypeId, listCustomers, listCustomerTypes, onInputChange, fnSearch, fnExportXlsx };

  return { table, totalsTable, propsToHeader };
};
