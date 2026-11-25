import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import { BASE_PATH, buildQuery, defaultLevel, normalizeStatement, validateFilter } from './incomeStatementRules';

// Estado de Resultado (cont_repo_er.sc2, SPEC v2-135-sr). El back arma el estado con la estructura de `cont_eer` (cada cuenta cuenta una sola vez, en el grupo más específico) y devuelve filas, totales y avisos;
// aquí solo se muestran, se imprimen (PDF completo o solo resumen) y se exportan. Los reportes anuales de ingresos y costos/gastos pasaron a "Reportes Contables".
export const useIncomeStatementReport = ({ setLoading }) => {
  const intl = useIntl();
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
  const [data, setData] = useState(normalizeStatement(undefined));

  useEffect(() => {
    request.GET(`${BASE_PATH}/levels`, (resp) => {
      const list = Array.isArray(resp.data) ? resp.data : [];
      setLevels(list);
      const first = defaultLevel(list, 0);
      if (first) onInputChange({ target: { name: 'level', value: first } });
    }, () => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isValid = () => {
    const error = validateFilter({ dateStart, dateEnd, level });
    if (error) NotificationManager.warning(intl.formatMessage({ id: error }), '', 4000, null, null, '');
    return !error;
  };

  const fnSearch = () => {
    if (!isValid()) return;
    setLoading(true);
    request.GET(buildUrl(`${BASE_PATH}/report`, buildQuery({ dateStart, dateEnd, level })), (resp) => {
      setData(normalizeStatement(resp.data));
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const fnPrint = () => {
    if (!isValid()) return;
    setLoading(true);
    request.GETPdf(`${BASE_PATH}/exportPDF`, { ...buildQuery({ dateStart, dateEnd, level }), summaryOnly }, 'EstadoDeResultado.pdf', () => setLoading(false));
  };

  const fnExportXlsx = () => {
    if (!isValid()) return;
    fnExport(`${BASE_PATH}/exportXLSX`, buildQuery({ dateStart, dateEnd, level }), 'EstadoDeResultado.xlsx');
  };

  const t = (id) => intl.formatMessage({ id });
  const table = {
    columns: [
      { text: t('page.incomeStatementReport.table.description'), dataField: 'description', headerStyle: { width: '52%' } },
      { text: t('page.incomeStatementReport.table.detail'), dataField: 'detailValue', headerStyle: { width: '16%' } },
      { text: t('page.incomeStatementReport.table.group'), dataField: 'groupValue', headerStyle: { width: '16%' } },
      { text: t('page.incomeStatementReport.table.total'), dataField: 'totalValue', headerStyle: { width: '16%' } }
    ],
    rows: data.rows
  };

  const propsToHeader = { dateStart, dateEnd, level, levels, summaryOnly, onInputChange, fnSearch, fnPrint, fnExportXlsx };

  return { table, notices: data.notices, propsToHeader, formatNumber, t };
};
