import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import { BASE_PATH, buildQuery, defaultLevel, normalizeBalance, validateFilter } from './balanceGeneralRules';

// Balance General (cont_repo_bg.sc2, SPEC v2-136-sr). El back acumula los saldos al corte y devuelve filas, totales, la diferencia y los avisos que la explican; aquí solo se muestran, se imprimen y se exportan.
export const useBalanceGeneral = ({ setLoading }) => {
  const intl = useIntl();
  const { fnExport } = useExportExcel(setLoading);
  const { formState, onInputChange } = useForm({ date: DateHelper.format(DateHelper.now()), level: 0 });
  const { date, level } = formState;

  const [levels, setLevels] = useState([]);
  const [data, setData] = useState(normalizeBalance(undefined));

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
    const error = validateFilter({ date, level });
    if (error) NotificationManager.warning(intl.formatMessage({ id: error }), '', 4000, null, null, '');
    return !error;
  };

  const fnSearch = () => {
    if (!isValid()) return;
    setLoading(true);
    request.GET(buildUrl(`${BASE_PATH}/report`, buildQuery({ date, level })), (resp) => {
      setData(normalizeBalance(resp.data));
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const fnPrint = () => {
    if (!isValid()) return;
    setLoading(true);
    request.GETPdf(`${BASE_PATH}/exportPDF`, buildQuery({ date, level }), 'BalanceGeneral.pdf', () => setLoading(false), 'POST', () => setLoading(false));
  };

  const fnExportXlsx = () => {
    if (!isValid()) return;
    fnExport(`${BASE_PATH}/exportXLSX`, buildQuery({ date, level }), 'BalanceGeneral.xlsx');
  };

  const t = (id) => intl.formatMessage({ id });
  const table = {
    columns: [
      { text: t('page.balanceGeneral.table.account'), dataField: 'accountNumber', headerStyle: { width: '14%' } },
      { text: t('page.balanceGeneral.table.description'), dataField: 'accountName', headerStyle: { width: '38%' } },
      { text: t('page.balanceGeneral.table.value'), dataField: 'detailValue', headerStyle: { width: '16%' } },
      { text: t('page.balanceGeneral.table.group'), dataField: 'groupValue', headerStyle: { width: '16%' } },
      { text: t('page.balanceGeneral.table.total'), dataField: 'totalValue', headerStyle: { width: '16%' } }
    ],
    rows: data.rows
  };

  const propsToHeader = { date, level, levels, onInputChange, fnSearch, fnPrint, fnExportXlsx };

  return { table, totals: data.totals, notices: data.notices, resultsSince: data.resultsSince, propsToHeader, formatNumber, t };
};
