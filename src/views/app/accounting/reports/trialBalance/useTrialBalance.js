import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import { BASE_PATH, buildAnnualQuery, buildQuery, defaultLevel, normalizeBalance, validateAnnual, validateFilter } from './trialBalanceRules';

// Balanza de Comprobación (cont_repo_bal_comp.sc2, SPEC v2-137-sr). El back acumula, arma la balanza y devuelve filas, totales de control y avisos; aquí solo se muestran, se imprimen y se exportan.
export const useTrialBalance = ({ setLoading }) => {
  const intl = useIntl();
  const { fnExport } = useExportExcel(setLoading);
  const today = DateHelper.now();
  const { formState, onInputChange } = useForm({
    dateStart: DateHelper.format(DateHelper.startOf(today, 'month')),
    dateEnd: DateHelper.format(today),
    level: 0
  });
  const { dateStart, dateEnd, level } = formState;

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

  const warn = (error) => {
    if (error) NotificationManager.warning(intl.formatMessage({ id: error }), '', 4000, null, null, '');
    return !error;
  };
  const isValid = () => warn(validateFilter({ dateStart, dateEnd, level }));

  const fnSearch = () => {
    if (!isValid()) return;
    setLoading(true);
    request.GET(buildUrl(`${BASE_PATH}/report`, buildQuery({ dateStart, dateEnd, level })), (resp) => {
      setData(normalizeBalance(resp.data));
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const fnPrint = () => {
    if (!isValid()) return;
    setLoading(true);
    request.GETPdf(`${BASE_PATH}/exportPDF`, buildQuery({ dateStart, dateEnd, level }), 'BalanzaDeComprobacion.pdf', () => setLoading(false), 'POST', () => setLoading(false));
  };

  const fnExportXlsx = () => {
    if (!isValid()) return;
    fnExport(`${BASE_PATH}/exportXLSX`, buildQuery({ dateStart, dateEnd, level }), 'BalanzaDeComprobacion.xlsx');
  };

  const fnExportAnnualIntegrated = () => {
    if (!warn(validateAnnual({ dateStart, level }))) return;
    fnExport(`${BASE_PATH}/annual/exportXLSX`, buildAnnualQuery({ dateStart, level }), 'BalanzaAnualIntegrada.xlsx');
  };

  const t = (id) => intl.formatMessage({ id });
  const table = {
    columns: [
      { text: t('page.trialBalance.table.account'), dataField: 'accountNumber', headerStyle: { width: '14%' } },
      { text: t('page.trialBalance.table.description'), dataField: 'accountName', headerStyle: { width: '34%' } },
      { text: t('page.trialBalance.table.accumulated'), dataField: 'accumulated', headerStyle: { width: '13%' } },
      { text: t('page.trialBalance.table.debit'), dataField: 'debit', headerStyle: { width: '13%' } },
      { text: t('page.trialBalance.table.credit'), dataField: 'credit', headerStyle: { width: '13%' } },
      { text: t('page.trialBalance.table.balance'), dataField: 'balance', headerStyle: { width: '13%' } }
    ],
    rows: data.rows
  };

  const propsToHeader = { dateStart, dateEnd, level, levels, onInputChange, fnSearch, fnPrint, fnExportXlsx, fnExportAnnualIntegrated };

  return { table, totals: data.totals, notices: data.notices, propsToHeader, formatNumber, t };
};
