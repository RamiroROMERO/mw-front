import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request } from '@Helpers/core';

// Equivalente a cont_repo_er.sc2 ("Estado de Resultado"). Reporte independiente del
// Estado de Resultado — DISTINTO de settings/incomeStatement (solo administra la lista de
// cuentas por Tipo) y de accountingClosures (calcula una Utilidad Neta interna para
// generar partidas de cierre reales, nunca la muestra, y no incluye Tipo=7). Ver
// IncomeStatementReportService.js (backend) para el detalle completo de las 3 columnas
// del reporte (Detalle/Acumulados/Totales, ninguna es basura) y qué sí es código muerto
// del legacy (el cálculo "año a la fecha", comentado en las 6 ramas, nunca llegó a tener
// columna propia).
export const useIncomeStatementReport = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const today = DateHelper.now();
  const { formState, onInputChange } = useForm({
    dateStart: DateHelper.format(DateHelper.startOf(today, 'month')),
    dateEnd: DateHelper.format(today),
    level: 0,
    summaryOnly: false
  });
  const { dateStart, dateEnd, level, summaryOnly } = formState;

  const [levels, setLevels] = useState([]);
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState(null);

  useEffect(() => {
    request.GET('accounting/reports/incomeStatementReport/levels', (resp) => {
      setLevels(resp.data);
    }, () => { });
  }, []);

  const fnSearch = () => {
    if (!dateStart || !dateEnd || !Number(level)) return;
    setLoading(true);
    request.POST('accounting/reports/incomeStatementReport', { dateStart, dateEnd, level }, (resp) => {
      setRows(resp.data.rows);
      setTotals(resp.data.totals);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnPrint = () => {
    if (!rows.length) return;
    setLoading(true);
    request.GETPdf('accounting/reports/incomeStatementReport/exportPDF', { dateStart, dateEnd, level, summaryOnly }, 'EstadoDeResultado.pdf', () => setLoading(false));
    setLoading(false);
  }

  const fnExportXlsx = () => {
    if (!rows.length) return;
    fnExport('accounting/reports/incomeStatementReport/exportXLSX', { dateStart, dateEnd, level }, 'EstadoDeResultado.xlsx');
  }

  const fnExportAnnual = (kind) => {
    if (!dateStart || !Number(level)) return;
    const year = DateHelper.getYear(dateStart);
    fnExport('accounting/reports/incomeStatementReport/annual/exportXLSX', { year, level, kind }, kind === 'income' ? 'ReporteIngresosAnual.xlsx' : 'ReporteCostosGastosMensual.xlsx');
  }

  const table = {
    columns: [
      { text: IntlMessages('page.incomeStatementReport.table.description'), dataField: 'description', headerStyle: { width: '52%' } },
      { text: IntlMessages('page.incomeStatementReport.table.detail'), dataField: 'detailValue', headerStyle: { width: '16%' } },
      { text: IntlMessages('page.incomeStatementReport.table.group'), dataField: 'groupValue', headerStyle: { width: '16%' } },
      { text: IntlMessages('page.incomeStatementReport.table.total'), dataField: 'totalValue', headerStyle: { width: '16%' } }
    ],
    rows
  };

  const propsToHeader = {
    dateStart, dateEnd, level, levels, summaryOnly, onInputChange,
    fnSearch, fnPrint, fnExportXlsx,
    fnExportAnnualIncome: () => fnExportAnnual('income'),
    fnExportAnnualExpenses: () => fnExportAnnual('expenses')
  }

  return { table, totals, propsToHeader, formatNumber }
}
