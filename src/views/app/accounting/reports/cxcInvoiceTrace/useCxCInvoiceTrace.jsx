import { useState } from 'react';
import { useIntl } from 'react-intl';
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils';
import { useForm } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import { BASE_PATH, validateSearch } from '../cxcShared/cxcReportsRules';
import { useCxcCustomers } from '../cxcShared/useCxcCustomers';
import ModalTrace from './ModalTrace';

// Rastreo de Cuentas por Cobrar (cont_cxc_rast.sc2, SPEC v2-132-sr): el buscador exige un cliente o al menos 3 caracteres del documento (hasta 100 resultados) y el detalle muestra la composición, los pagos del
// MISMO cliente (depósitos, partidas, cheques, transferencias y notas de crédito), las notas de débito y el saldo (el mismo de Cuentas por Cobrar). Pantalla de solo lectura.
export const useCxCInvoiceTrace = ({ setLoading }) => {
  const intl = useIntl();
  const { formState, onInputChange } = useForm({ documentCode: '', customerId: 0 });
  const { documentCode, customerId } = formState;

  const listCustomers = useCxcCustomers();
  const [allRows, setAllRows] = useState([]);
  const [openTrace, setOpenTrace] = useState(false);
  const [traceData, setTraceData] = useState(null);

  const fnSearch = () => {
    const error = validateSearch({ documentCode, customerId });
    if (error) { NotificationManager.warning(intl.formatMessage({ id: error }), '', 4000, null, null, ''); return; }
    setLoading(true);
    const customerFilter = Number(customerId) === 0 ? undefined : customerId;
    request.GET(buildUrl(`${BASE_PATH}/searchInvoices`, { documentCode: documentCode.trim() || undefined, customerId: customerFilter }), (resp) => {
      setAllRows(resp.data);
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const fnOpenTrace = (row) => {
    setLoading(true);
    request.GET(buildUrl(`${BASE_PATH}/invoiceTrace`, { cxcId: row.cxcId }), (resp) => {
      setTraceData(resp.data);
      setOpenTrace(true);
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const table = {
    title: IntlMessages('page.cxcInvoiceTrace.table.title'),
    columns: [
      { text: IntlMessages('table.column.date'), dataField: 'invoiceDate', type: 'date', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.cxcInvoiceTrace.table.customer'), dataField: 'customerName', headerStyle: { width: '25%' } },
      { text: IntlMessages('page.cxcInvoiceTrace.table.document'), dataField: 'documentCode', headerStyle: { width: '18%' } },
      { text: IntlMessages('page.cxcInvoiceTrace.table.type'), dataField: 'typeDescription', headerStyle: { width: '15%' } },
      { text: IntlMessages('page.cxcInvoiceTrace.table.originalValue'), dataField: 'originalValue', type: 'number', headerStyle: { width: '12%' } },
      { text: IntlMessages('page.cxcInvoiceTrace.table.dueDate'), dataField: 'dueDate', type: 'date', headerStyle: { width: '10%' } },
      {
        text: '', dataField: 'actions', headerStyle: { width: '5%' },
        cell: ({ row }) => (<i className="bi bi-eye-fill cursor-pointer" title={IntlMessages('page.cxcInvoiceTrace.table.viewDetail')} onClick={() => fnOpenTrace(row.original)} />)
      }
    ],
    data: allRows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const propsToHeader = { documentCode, customerId, listCustomers, onInputChange, fnSearch };

  const propsToModalTrace = {
    ModalContent: ModalTrace,
    title: 'page.cxcInvoiceTrace.modal.title',
    open: openTrace,
    setOpen: setOpenTrace,
    maxWidth: 'lg',
    data: { trace: traceData, formatNumber, formatDate }
  };

  return { table, propsToHeader, propsToModalTrace };
};
