import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { formatNumber, formatDate } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import { normalizeSettings } from '../cxcShared/cxcReportsRules';
import { useCxcCustomers, useCxcSettings } from '../cxcShared/useCxcCustomers';
import { BASE_PATH, EXPIRY_OPTIONS, buildQuery, normalizeStatement, validateFilter } from './otherReceivableRules';

// Otros Reportes de CxC (cont_cxc_reportes.sc2, "Hasta la Fecha" y "Por Vencimiento", SPEC v2-139-sr). El back calcula el saldo a la FECHA DE CORTE de todos los clientes, el estado de cada documento contra esa
// fecha y los subtotales; aquí solo se muestra, se imprime y se exporta. La antigüedad por rangos la cubre la Proyección de CxC.
export const useOtherReceivableReports = ({ setLoading }) => {
  const intl = useIntl();
  const { fnExport } = useExportExcel(setLoading);
  const settings = useCxcSettings(normalizeSettings);
  const listCustomers = useCxcCustomers();
  const { formState, onInputChange } = useForm({ date: DateHelper.format(DateHelper.now()), currency: 1, customerTypeId: 0, customerId: 0, expiry: 'all' });
  const { date, currency, customerTypeId, customerId, expiry } = formState;

  const [data, setData] = useState(normalizeStatement(undefined));
  const [listCustomerTypes, setListCustomerTypes] = useState([]);

  const query = () => buildQuery({ date, currency, customerId, customerTypeId, expiry }, settings);
  const isValid = () => {
    const error = validateFilter({ date, expiry });
    if (error) NotificationManager.warning(intl.formatMessage({ id: error }), '', 4000, null, null, '');
    return !error;
  };

  const fnSearch = () => {
    if (!isValid()) return;
    setLoading(true);
    request.GET(buildUrl(`${BASE_PATH}/statement`, query()), (resp) => {
      setData(normalizeStatement(resp.data));
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const fnPrint = () => {
    if (!isValid()) return;
    setLoading(true);
    request.GETPdf(`${BASE_PATH}/exportPDF`, query(), 'EstadoDeCuentaClientes.pdf', () => setLoading(false), 'POST', () => setLoading(false));
  };

  const fnExportXlsx = () => { if (isValid()) fnExport(`${BASE_PATH}/exportXLSX`, query(), 'EstadoDeCuentaClientes.xlsx'); };

  useEffect(() => {
    request.GET('admin/customerTypes/getForCustomers', (resp) => {
      setListCustomerTypes(resp.data.map((item) => ({ label: item.name, value: item.id })));
    }, () => { });
  }, []);

  const t = (id) => intl.formatMessage({ id });
  const expiryOptions = EXPIRY_OPTIONS.map((o) => ({ id: o.id, name: t(o.label) }));
  const statusText = (row) => {
    const days = row.status?.days;
    if (row.status?.code === 'overdue') return `${days} ${t('page.otherReceivableReports.table.daysOverdue')}`;
    if (row.status?.code === 'toDue') return `${days} ${t('page.otherReceivableReports.table.daysUntilDue')}`;
    return t('page.otherReceivableReports.table.noDueDate');
  };

  const propsToHeader = {
    date, currency, hasDualCurrency: settings.hasDualCurrency, customerTypeId, customerId, expiry, expiryOptions, listCustomerTypes, listCustomers, onInputChange, fnSearch, fnPrint, fnExportXlsx
  };

  return { propsToHeader, rows: data.rows, totals: data.totals, counts: data.counts, formatNumber, formatDate, statusText, t };
};
