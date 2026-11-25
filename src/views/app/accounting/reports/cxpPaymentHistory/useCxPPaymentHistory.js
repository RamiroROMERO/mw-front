import { useState } from 'react';
import { useIntl } from 'react-intl';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import { BASE_PATH, buildHistoryQuery, normalizeHistory, validateHistoryFilter } from '../cxpShared/cxpReportsRules';
import { useCxpProviders } from '../cxpShared/useCxpProviders';

// Histórico de pagos a proveedores (cont_cxp_history.sc2, SPEC v2-133-sr). No consulta al abrir: exige un proveedor o un rango COMPLETO de fechas de FACTURA (así los pagos de esas facturas salen completos y el
// saldo corrido es correcto). Muestra pagos por cheque o transferencia, partidas, retenciones, anticipos aplicados y notas de crédito; el valor de la factura solo en su primera fila. La Caja Chica no se muestra.
// El back limita a 20,000 filas.
export const useCxPPaymentHistory = ({ setLoading }) => {
  const intl = useIntl();
  const { fnExport } = useExportExcel(setLoading);
  const listProviders = useCxpProviders();
  const { formState, onInputChange } = useForm({ providerId: 0, dateStart: '', dateEnd: '' });
  const { providerId, dateStart, dateEnd } = formState;

  const [data, setData] = useState(normalizeHistory(undefined));

  const isValid = () => {
    const error = validateHistoryFilter({ providerId, dateStart, dateEnd });
    if (error) NotificationManager.warning(intl.formatMessage({ id: error }), '', 4000, null, null, '');
    return !error;
  };

  const fnSearch = () => {
    if (!isValid()) return;
    setLoading(true);
    request.GET(buildUrl(`${BASE_PATH}/paymentHistory`, buildHistoryQuery({ providerId, dateStart, dateEnd })), (resp) => {
      setData(normalizeHistory(resp.data));
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const fnExportXlsx = () => { if (isValid()) fnExport(`${BASE_PATH}/paymentHistory/exportXLSX`, buildHistoryQuery({ providerId, dateStart, dateEnd }), 'HistoricoPagosProveedores.xlsx'); };

  const table = {
    title: IntlMessages('page.cxpPaymentHistory.table.title'),
    columns: [
      { text: IntlMessages('table.column.date'), dataField: 'invoiceDate', type: 'date', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxpPaymentHistory.table.provider'), dataField: 'providerName', headerStyle: { width: '16%' } },
      { text: IntlMessages('page.cxpPaymentHistory.table.document'), dataField: 'documentCode', headerStyle: { width: '11%' } },
      { text: IntlMessages('page.cxpPaymentHistory.table.originalValue'), dataField: 'originalValue', type: 'number', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxpPaymentHistory.table.paymentDate'), dataField: 'paymentDate', type: 'date', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxpPaymentHistory.table.paymentDocType'), dataField: 'paymentDocType', headerStyle: { width: '7%' } },
      { text: IntlMessages('page.cxpPaymentHistory.table.paymentDocNumber'), dataField: 'paymentDocNumber', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxpPaymentHistory.table.bankCode'), dataField: 'bankCode', headerStyle: { width: '6%' } },
      { text: IntlMessages('page.cxpPaymentHistory.table.depositNumber'), dataField: 'depositNumber', headerStyle: { width: '9%' } },
      { text: IntlMessages('page.cxpPaymentHistory.table.description'), dataField: 'description', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.cxpPaymentHistory.table.paidValue'), dataField: 'paidValue', type: 'number', headerStyle: { width: '9%' } },
      { text: IntlMessages('page.cxpPaymentHistory.table.balance'), dataField: 'balance', type: 'number', headerStyle: { width: '9%' } }
    ],
    data: data.rows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const totals = { totalDocuments: formatNumber(data.totals.totalDocuments), totalPaid: formatNumber(data.totals.totalPaid) };
  const propsToHeader = { providerId, dateStart, dateEnd, listProviders, onInputChange, fnSearch, fnExportXlsx };

  return { table, totals, propsToHeader };
};
