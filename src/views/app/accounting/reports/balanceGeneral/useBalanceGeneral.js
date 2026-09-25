import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request } from '@Helpers/core';

// Equivalente a cont_repo_bg.sc2 ("Balance General"). A diferencia de Estado de Resultado
// (rango de fechas), corte a una sola fecha ("Hasta"). Ver BalanceGeneralService.js
// (backend) para el detalle de la desviación confirmada vs legacy (rótulo "TOTAL
// PATRIMONIO" desactualizado — hoy la cuenta se llama "CAPITAL" en el catálogo real) y el
// hallazgo de que Cont_BalCTAGanancia está confirmada vacía hoy.
export const useBalanceGeneral = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const today = DateHelper.now();
  const { formState, onInputChange } = useForm({
    date: DateHelper.format(today),
    level: 0
  });
  const { date, level } = formState;

  const [levels, setLevels] = useState([]);
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState(null);

  useEffect(() => {
    request.GET('accounting/reports/balanceGeneral/levels', (resp) => {
      setLevels(resp.data);
    }, () => { });
  }, []);

  const fnSearch = () => {
    if (!date || !Number(level)) return;
    setLoading(true);
    request.POST('accounting/reports/balanceGeneral', { date, level }, (resp) => {
      setRows(resp.data.rows);
      setTotals(resp.data.totals);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnPrint = () => {
    if (!rows.length) return;
    setLoading(true);
    request.GETPdf('accounting/reports/balanceGeneral/exportPDF', { date, level }, 'BalanceGeneral.pdf', () => setLoading(false));
    setLoading(false);
  }

  const fnExportXlsx = () => {
    if (!rows.length) return;
    fnExport('accounting/reports/balanceGeneral/exportXLSX', { date, level }, 'BalanceGeneral.xlsx');
  }

  const table = {
    columns: [
      { text: IntlMessages('page.balanceGeneral.table.account'), dataField: 'accountNumber', headerStyle: { width: '18%' } },
      { text: IntlMessages('page.balanceGeneral.table.description'), dataField: 'accountName', headerStyle: { width: '46%' } },
      { text: IntlMessages('page.balanceGeneral.table.value'), dataField: 'value', headerStyle: { width: '18%' } },
      { text: IntlMessages('page.balanceGeneral.table.total'), dataField: 'total', headerStyle: { width: '18%' } }
    ],
    rows
  };

  const propsToHeader = { date, level, levels, onInputChange, fnSearch, fnPrint, fnExportXlsx }

  return { table, totals, propsToHeader, formatNumber }
}
