import { useState } from 'react';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request } from '@Helpers/core';

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

// Equivalente a cont_repo_budget.sc2 ("Presupuesto Ejecutado"). Ver BudgetExecutionService.js
// (backend) para el detalle del bug de copia-y-pegue corregido en la fórmula de "%
// Ejecutado" bajo-presupuesto, y el hallazgo de datos reales (cont_budget_format.year
// siempre NULL, 2 de las 4 líneas reales sin ninguna cuenta enlazada, y las 2 cuentas que
// sí están enlazadas son códigos huérfanos que ya no existen en el catálogo real).
export const useBudgetExecution = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const [mode, setMode] = useState('month');
  const [rows, setRows] = useState([]);

  const { formState, onInputChange } = useForm({
    year: DateHelper.getYear(DateHelper.now()),
    month: DateHelper.getMonth(DateHelper.now()) + 1,
    monthEnd: DateHelper.getMonth(DateHelper.now()) + 1
  });
  const { year, month, monthEnd } = formState;

  const onModeChange = (e) => {
    setMode(e.target.value);
    setRows([]);
  }

  const fnSearch = () => {
    if (!year || !Number(month) || (mode === 'range' && !Number(monthEnd))) return;
    setLoading(true);
    request.POST('accounting/reports/budgetExecution', { mode, year, month, monthEnd: mode === 'range' ? monthEnd : undefined }, (resp) => {
      setRows(resp.data.rows);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnPrint = () => {
    if (!rows.length) return;
    setLoading(true);
    request.GETPdf('accounting/reports/budgetExecution/exportPDF', { mode, year, month, monthEnd: mode === 'range' ? monthEnd : undefined }, 'PresupuestoEjecutado.pdf', () => setLoading(false));
    setLoading(false);
  }

  const fnExportXlsx = () => {
    if (!rows.length) return;
    fnExport('accounting/reports/budgetExecution/exportXLSX', { mode, year, month, monthEnd: mode === 'range' ? monthEnd : undefined }, 'PresupuestoEjecutado.xlsx');
  }

  const table = {
    columns: [
      { text: IntlMessages('page.budgetExecution.table.description'), dataField: 'name', headerStyle: { width: '40%' } },
      { text: IntlMessages('page.budgetExecution.table.budgeted'), dataField: 'budgeted', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.budgetExecution.table.executed'), dataField: 'real', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.budgetExecution.table.variation'), dataField: 'diff', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.budgetExecution.table.percent'), dataField: 'percExecuted', headerStyle: { width: '15%' } }
    ],
    rows
  };

  const propsToHeader = { mode, modeOptions: MODE_OPTIONS, onModeChange, year, month, monthEnd, months: MONTHS, onInputChange, fnSearch, fnPrint, fnExportXlsx }

  return { table, propsToHeader, formatNumber }
}
