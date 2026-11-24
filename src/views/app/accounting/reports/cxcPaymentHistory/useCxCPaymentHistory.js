import { useState } from 'react';
import { useIntl } from 'react-intl';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import { BASE_PATH, buildHistoryQuery, normalizeHistory, validateHistoryFilter } from '../cxcShared/cxcReportsRules';
import { useCxcCustomers } from '../cxcShared/useCxcCustomers';

// Histórico de pagos de clientes (cont_cxc_history.sc2, SPEC v2-132-sr). No consulta al abrir: exige un cliente o un rango COMPLETO de fechas de FACTURA (así los pagos de esas facturas salen completos y el saldo
// corrido es correcto). Muestra depósitos, pagos por partida y notas de crédito; el valor de la factura solo en su primera fila. El back limita a 20,000 filas y exige el privilegio 03.03.008.
export const useCxCPaymentHistory = ({ setLoading }) => {
  const intl = useIntl();
  const { fnExport } = useExportExcel(setLoading);
  const listCustomers = useCxcCustomers();
  const { formState, onInputChange } = useForm({ customerId: 0, dateStart: '', dateEnd: '' });
  const { customerId, dateStart, dateEnd } = formState;

  const [data, setData] = useState(normalizeHistory(undefined));

  const isValid = () => {
    const error = validateHistoryFilter({ customerId, dateStart, dateEnd });
    if (error) NotificationManager.warning(intl.formatMessage({ id: error }), '', 4000, null, null, '');
    return !error;
  };

  const fnSearch = () => {
    if (!isValid()) return;
    setLoading(true);
    request.GET(buildUrl(`${BASE_PATH}/paymentHistory`, buildHistoryQuery({ customerId, dateStart, dateEnd })), (resp) => {
      setData(normalizeHistory(resp.data));
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const fnExportXlsx = () => { if (isValid()) fnExport(`${BASE_PATH}/paymentHistory/exportXLSX`, buildHistoryQuery({ customerId, dateStart, dateEnd }), 'HistoricoPagosClientes.xlsx'); };

  const table = {
    title: IntlMessages('page.cxcPaymentHistory.table.title'),
    columns: [
      { text: IntlMessages('page.cxcPaymentHistory.table.invoiceDate'), dataField: 'invoiceDate', type: 'date', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxcPaymentHistory.table.customer'), dataField: 'customerName', headerStyle: { width: '16%' } },
      { text: IntlMessages('page.cxcPaymentHistory.table.document'), dataField: 'documentCode', headerStyle: { width: '11%' } },
      { text: IntlMessages('page.cxcPaymentHistory.table.originalValue'), dataField: 'originalValue', type: 'number', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxcPaymentHistory.table.paymentDate'), dataField: 'paymentDate', type: 'date', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxcPaymentHistory.table.paymentDocType'), dataField: 'paymentDocType', headerStyle: { width: '7%' } },
      { text: IntlMessages('page.cxcPaymentHistory.table.paymentDocNumber'), dataField: 'paymentDocNumber', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.cxcPaymentHistory.table.bankCode'), dataField: 'bankCode', headerStyle: { width: '6%' } },
      { text: IntlMessages('page.cxcPaymentHistory.table.depositNumber'), dataField: 'depositNumber', headerStyle: { width: '9%' } },
      { text: IntlMessages('page.cxcPaymentHistory.table.description'), dataField: 'description', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.cxcPaymentHistory.table.paidValue'), dataField: 'paidValue', type: 'number', headerStyle: { width: '9%' } },
      { text: IntlMessages('page.cxcPaymentHistory.table.balance'), dataField: 'balance', type: 'number', headerStyle: { width: '9%' } }
    ],
    data: data.rows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const totals = { totalDocuments: formatNumber(data.totals.totalDocuments), totalPaid: formatNumber(data.totals.totalPaid) };
  const propsToHeader = { customerId, dateStart, dateEnd, listCustomers, onInputChange, fnSearch, fnExportXlsx };

  return { table, totals, propsToHeader };
};
