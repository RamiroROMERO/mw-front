import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { adminRoot } from '@Constants/defaultValues';
import { NotificationManager } from '@Components/common/react-notifications';
import { BASE_PATH, buildRangeQuery, normalizePeriod, validateRange } from '../cxpShared/cxpReportsRules';

// Saldos y Pagos (cont_cxp_week_report.sc2, SPEC v2-133-sr): resumen de MOVIMIENTO por proveedor en un rango [Desde, Hasta]: saldo acumulado a la víspera de Desde (fórmula histórica de Cuentas por Pagar) +
// facturas a crédito nuevas del rango (valor completo) = total; menos los pagos del rango = saldo. Un proveedor que solo pagó en el período también aparece. Los pagos que no corresponden a ninguna cuenta por pagar
// no se suman: se avisan debajo de la tabla. El botón "ver" abre el historial del proveedor.
export const useCxPPeriodSummary = ({ setLoading }) => {
  const navigate = useNavigate();
  const intl = useIntl();
  const { fnExport } = useExportExcel(setLoading);
  const { formState, onInputChange } = useForm({
    dateStart: DateHelper.format(DateHelper.startOf(DateHelper.now(), 'month')),
    dateEnd: DateHelper.format(DateHelper.now())
  });
  const { dateStart, dateEnd } = formState;

  const [data, setData] = useState(normalizePeriod(undefined));

  const isValid = () => {
    const error = validateRange({ dateStart, dateEnd });
    if (error) NotificationManager.warning(intl.formatMessage({ id: error }), '', 4000, null, null, '');
    return !error;
  };

  const fnSearch = () => {
    if (!isValid()) return;
    setLoading(true);
    request.GET(buildUrl(`${BASE_PATH}/periodSummary`, buildRangeQuery({ dateStart, dateEnd })), (resp) => {
      setData(normalizePeriod(resp.data));
      setLoading(false);
    }, () => setLoading(false));
  };

  useEffect(() => { fnSearch(); }, []);

  const fnViewProvider = (row) => {
    navigate(`${adminRoot}/accounting/reports/cxpProviderHistory`, { state: { providerId: row.providerId } });
  };

  const table = {
    title: IntlMessages('page.cxpPeriodSummary.table.title'),
    columns: [
      { text: IntlMessages('page.cxpProviderHistory.input.provider'), dataField: 'providerName', headerStyle: { width: '34%' } },
      { text: IntlMessages('page.cxpPeriodSummary.table.accumulated'), dataField: 'accumulated', type: 'number', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.cxpPeriodSummary.table.added'), dataField: 'added', type: 'number', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.cxpPeriodSummary.table.total'), dataField: 'total', type: 'number', headerStyle: { width: '13%' } },
      { text: IntlMessages('page.cxpPeriodSummary.table.paid'), dataField: 'paid', type: 'number', headerStyle: { width: '13%' } },
      { text: IntlMessages('page.cxpPeriodSummary.table.balance'), dataField: 'balance', type: 'number', headerStyle: { width: '13%' } },
      {
        text: '',
        dataField: 'actions',
        headerStyle: { width: '4%' },
        cell: ({ row }) => (
          <i
            className="bi bi-eye-fill cursor-pointer"
            title={IntlMessages('page.cxpPeriodSummary.table.viewProvider')}
            onClick={() => fnViewProvider(row.original)}
          />
        )
      }
    ],
    data: data.rows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const totals = {
    totalAccumulated: formatNumber(data.totals.accumulated),
    totalAdded: formatNumber(data.totals.added),
    totalTotal: formatNumber(data.totals.total),
    totalPaid: formatNumber(data.totals.paid),
    totalBalance: formatNumber(data.totals.balance)
  };

  const orphans = { count: data.orphans.count, total: formatNumber(data.orphans.total) };

  const fnExportXlsx = () => { if (isValid()) fnExport(`${BASE_PATH}/periodSummary/exportXLSX`, buildRangeQuery({ dateStart, dateEnd }), 'CuentasPorPagarSaldosYPagos.xlsx'); };

  const propsToHeader = { dateStart, dateEnd, onInputChange, fnSearch, fnExportXlsx };

  return { table, totals, orphans, propsToHeader };
};
