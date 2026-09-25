import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request } from '@Helpers/core';

// Equivalente a cont_repo_bal_comp.sc2 ("Balanza de Comprobación"). A diferencia de Balance
// General (solo Activo/Pasivo/Capital) y Estado de Resultado (agrupado por cont_eer), este
// reporte incluye TODOS los tipos de cuenta del catálogo real para un rango de fechas. Ver
// TrialBalanceService.js (backend) para el detalle de la regla de signo y el
// comportamiento real (no un bug) de las cuentas tipo "Cuentas de Orden" (Saldo siempre 0).
export const useTrialBalance = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const today = DateHelper.now();
  const { formState, onInputChange } = useForm({
    dateStart: DateHelper.format(DateHelper.startOf(today, 'month')),
    dateEnd: DateHelper.format(today),
    level: 0
  });
  const { dateStart, dateEnd, level } = formState;

  const [levels, setLevels] = useState([]);
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState(null);

  useEffect(() => {
    request.GET('accounting/reports/trialBalance/levels', (resp) => {
      setLevels(resp.data);
    }, () => { });
  }, []);

  const fnSearch = () => {
    if (!dateStart || !dateEnd || !Number(level)) return;
    setLoading(true);
    request.POST('accounting/reports/trialBalance', { dateStart, dateEnd, level }, (resp) => {
      setRows(resp.data.rows);
      setTotals(resp.data.totals);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnPrint = () => {
    if (!rows.length) return;
    setLoading(true);
    request.GETPdf('accounting/reports/trialBalance/exportPDF', { dateStart, dateEnd, level }, 'BalanzaDeComprobacion.pdf', () => setLoading(false));
    setLoading(false);
  }

  const fnExportXlsx = () => {
    if (!rows.length) return;
    fnExport('accounting/reports/trialBalance/exportXLSX', { dateStart, dateEnd, level }, 'BalanzaDeComprobacion.xlsx');
  }

  const fnExportAnnualIntegrated = () => {
    if (!dateStart || !Number(level)) return;
    const year = DateHelper.getYear(dateStart);
    fnExport('accounting/reports/trialBalance/annual/exportXLSX', { year, level }, 'BalanzaAnualIntegrada.xlsx');
  }

  const table = {
    columns: [
      { text: IntlMessages('page.trialBalance.table.account'), dataField: 'accountNumber', headerStyle: { width: '14%' } },
      { text: IntlMessages('page.trialBalance.table.description'), dataField: 'accountName', headerStyle: { width: '34%' } },
      { text: IntlMessages('page.trialBalance.table.accumulated'), dataField: 'accumulated', headerStyle: { width: '13%' } },
      { text: IntlMessages('page.trialBalance.table.debit'), dataField: 'debit', headerStyle: { width: '13%' } },
      { text: IntlMessages('page.trialBalance.table.credit'), dataField: 'credit', headerStyle: { width: '13%' } },
      { text: IntlMessages('page.trialBalance.table.balance'), dataField: 'balance', headerStyle: { width: '13%' } }
    ],
    rows
  };

  const propsToHeader = { dateStart, dateEnd, level, levels, onInputChange, fnSearch, fnPrint, fnExportXlsx, fnExportAnnualIntegrated }

  return { table, totals, propsToHeader, formatNumber }
}
