import { useState } from 'react';
import { useIntl } from 'react-intl';
import { formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import { BASE_PATH, buildQuery, normalizeReport, validateFilter } from './budgetExecutionRules';

const MODE_OPTIONS = [
  { id: 'month', label: 'page.budgetExecution.radio.byMonth' },
  { id: 'range', label: 'page.budgetExecution.radio.monthRange' }
];

const MONTHS = [
  { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
];

// Presupuesto Ejecutado (cont_repo_budget.sc2, SPEC v2-138-sr). El back arma el reporte (presupuesto del mes o del rango, ejecutado de las cuentas enlazadas, variación, % y avisos); aquí solo se muestra, se imprime
// (completo o solo resumen) y se exporta.
export const useBudgetExecution = ({ setLoading }) => {
  const intl = useIntl();
  const { fnExport } = useExportExcel(setLoading);
  const [mode, setMode] = useState('month');
  const [data, setData] = useState(normalizeReport(undefined));

  const { formState, onInputChange } = useForm({
    year: DateHelper.getYear(DateHelper.now()),
    month: DateHelper.getMonth(DateHelper.now()) + 1,
    monthEnd: DateHelper.getMonth(DateHelper.now()) + 1,
    summaryOnly: false
  });
  const { year, month, monthEnd, summaryOnly } = formState;

  const onModeChange = (e) => {
    setMode(e.target.value);
    setData(normalizeReport(undefined));
  };

  const isValid = () => {
    const error = validateFilter({ mode, year, month, monthEnd });
    if (error) NotificationManager.warning(intl.formatMessage({ id: error }), '', 4000, null, null, '');
    return !error;
  };

  const fnSearch = () => {
    if (!isValid()) return;
    setLoading(true);
    request.GET(buildUrl(`${BASE_PATH}/report`, buildQuery({ mode, year, month, monthEnd })), (resp) => {
      setData(normalizeReport(resp.data));
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const fnPrint = () => {
    if (!isValid()) return;
    setLoading(true);
    request.GETPdf(`${BASE_PATH}/exportPDF`, { ...buildQuery({ mode, year, month, monthEnd }), summaryOnly }, 'PresupuestoEjecutado.pdf', () => setLoading(false), 'POST', () => setLoading(false));
  };

  const fnExportXlsx = () => {
    if (!isValid()) return;
    fnExport(`${BASE_PATH}/exportXLSX`, buildQuery({ mode, year, month, monthEnd }), 'PresupuestoEjecutado.xlsx');
  };

  const t = (id) => intl.formatMessage({ id });
  const table = {
    columns: [
      { text: t('page.budgetExecution.table.description'), dataField: 'name', headerStyle: { width: '40%' } },
      { text: t('page.budgetExecution.table.budgeted'), dataField: 'budgeted', headerStyle: { width: '15%' } },
      { text: t('page.budgetExecution.table.executed'), dataField: 'real', headerStyle: { width: '15%' } },
      { text: t('page.budgetExecution.table.variation'), dataField: 'diff', headerStyle: { width: '15%' } },
      { text: t('page.budgetExecution.table.percent'), dataField: 'percExecuted', headerStyle: { width: '15%' } }
    ],
    rows: data.rows
  };

  const propsToHeader = { mode, modeOptions: MODE_OPTIONS, onModeChange, year, month, monthEnd, months: MONTHS, summaryOnly, onInputChange, fnSearch, fnPrint, fnExportXlsx };

  return { table, notices: data.notices, propsToHeader, formatNumber, t };
};
