import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import { BASE_PATH, buildQuery, fileNameOf, monthLabels, normalizeReport, validateFilter } from './accountingReportsRules';

// Reportes Contables (cont_reportes.sc2, SPEC v2-134-sr): solo las pestañas Ingresos y Costos/Gastos (las demás del legacy ya son pantallas propias). Tres formatos por tipo: mensual (12 meses), resumen anual y
// por fechas, por nivel de cuenta. El back sube las cuentas de movimiento al nivel pedido y devuelve filas, totales y avisos; aquí solo se muestran y se exportan.
export const useAccountingReports = ({ setLoading }) => {
  const intl = useIntl();
  const { fnExport } = useExportExcel(setLoading);
  const today = DateHelper.now();
  const { formState, onInputChange } = useForm({
    kind: 'income',
    mode: 'monthly',
    year: String(DateHelper.getYear(DateHelper.format(today))),
    dateStart: DateHelper.format(DateHelper.startOf(today, 'month')),
    dateEnd: DateHelper.format(today),
    level: 0
  });
  const { kind, mode, year, dateStart, dateEnd, level } = formState;

  const [levels, setLevels] = useState([]);
  const [data, setData] = useState(normalizeReport(undefined));
  const [shown, setShown] = useState({ kind, mode });

  useEffect(() => {
    request.GET(`${BASE_PATH}/levels`, (resp) => setLevels(Array.isArray(resp.data) ? resp.data : []), () => { });
  }, []);

  const isValid = () => {
    const error = validateFilter({ kind, mode, year, dateStart, dateEnd, level });
    if (error) NotificationManager.warning(intl.formatMessage({ id: error }), '', 4000, null, null, '');
    return !error;
  };

  const fnSearch = () => {
    if (!isValid()) return;
    setLoading(true);
    request.GET(buildUrl(`${BASE_PATH}/report`, buildQuery({ kind, mode, year, dateStart, dateEnd, level })), (resp) => {
      setData(normalizeReport(resp.data));
      setShown({ kind, mode });
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const fnExportXlsx = () => {
    if (!isValid()) return;
    fnExport(`${BASE_PATH}/exportXLSX`, buildQuery({ kind, mode, year, dateStart, dateEnd, level }), fileNameOf({ kind, mode }));
  };

  const kinds = [
    { value: 'income', label: intl.formatMessage({ id: 'page.accountingReports.kind.income' }) },
    { value: 'expenses', label: intl.formatMessage({ id: 'page.accountingReports.kind.expenses' }) }
  ];
  const modes = [
    { value: 'monthly', label: intl.formatMessage({ id: 'page.accountingReports.mode.monthly' }) },
    { value: 'annual', label: intl.formatMessage({ id: 'page.accountingReports.mode.annual' }) },
    { value: 'range', label: intl.formatMessage({ id: 'page.accountingReports.mode.range' }) }
  ];

  const t = (id) => intl.formatMessage({ id });
  const months = monthLabels(intl.locale);
  const columns = shown.mode === 'monthly'
    ? [
      { text: t('page.accountingReports.table.account'), dataField: 'account' },
      { text: t('page.accountingReports.table.description'), dataField: 'name' },
      ...months.map((m, i) => ({ text: m, dataField: `m${i + 1}`, number: true })),
      { text: t('page.accountingReports.table.total'), dataField: 'total', number: true }
    ]
    : [
      { text: t('page.accountingReports.table.account'), dataField: 'account' },
      { text: t('page.accountingReports.table.description'), dataField: 'name' },
      { text: t('page.accountingReports.table.value'), dataField: 'total', number: true }
    ];

  const table = { columns, rows: data.rows, totals: data.totals, mode: shown.mode };
  const propsToHeader = { kind, mode, year, dateStart, dateEnd, level, levels, kinds, modes, onInputChange, fnSearch, fnExportXlsx };

  return { table, notices: data.notices, propsToHeader, formatNumber, t };
};
