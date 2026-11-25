import { useState } from 'react';
import { useIntl } from 'react-intl';
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils';
import { useForm } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import { BASE_PATH, validateSearch } from '../cxpShared/cxpReportsRules';
import { useCxpProviders } from '../cxpShared/useCxpProviders';
import ModalTrace from './ModalTrace';

// Rastreo de Cuentas por Pagar (cont_cxprast.sc2, SPEC v2-133-sr). El legacy carga su picker con TODO cont_cxp sin filtro (impracticable): se exige un proveedor o al menos 3 caracteres del documento, igual que el back
// (que escapa los comodines y devuelve hasta 100). El modal muestra la composición de la compra (si la hay) y TODOS los pagos del mismo proveedor y documento (la Caja Chica incluida), notas de crédito y de débito.
// "Eliminar Pago" del legacy no se migra: utilitario destructivo solo-admin fuera de una pantalla de lectura.
export const useCxPInvoiceTrace = ({ setLoading }) => {
  const intl = useIntl();
  const { formState, onInputChange } = useForm({ documentCode: '', providerId: 0 });
  const { documentCode, providerId } = formState;

  const listProviders = useCxpProviders();
  const [allRows, setAllRows] = useState([]);
  const [openTrace, setOpenTrace] = useState(false);
  const [traceData, setTraceData] = useState(null);

  const fnSearch = () => {
    const error = validateSearch({ providerId, documentCode });
    if (error) {
      NotificationManager.warning(intl.formatMessage({ id: error }), '', 4000, null, null, '');
      return;
    }
    setLoading(true);
    const providerFilter = Number(providerId) === 0 ? undefined : providerId;
    request.GET(buildUrl(`${BASE_PATH}/searchDocuments`, { documentCode: documentCode.trim() || undefined, providerId: providerFilter }), (resp) => {
      setAllRows(Array.isArray(resp.data) ? resp.data : []);
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const fnOpenTrace = (row) => {
    setLoading(true);
    request.GET(buildUrl(`${BASE_PATH}/documentTrace`, { cxpId: row.cxpId }), (resp) => {
      setTraceData(resp.data);
      setOpenTrace(true);
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const table = {
    title: IntlMessages('page.cxpInvoiceTrace.table.title'),
    columns: [
      { text: IntlMessages('table.column.date'), dataField: 'date', type: 'date', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.cxpInvoiceTrace.table.provider'), dataField: 'providerName', headerStyle: { width: '25%' } },
      { text: IntlMessages('page.cxpInvoiceTrace.table.document'), dataField: 'documentCode', headerStyle: { width: '18%' } },
      { text: IntlMessages('page.cxpInvoiceTrace.table.originalValue'), dataField: 'originalValue', type: 'number', headerStyle: { width: '12%' } },
      { text: IntlMessages('page.cxpInvoiceTrace.table.dueDate'), dataField: 'dueDate', type: 'date', headerStyle: { width: '10%' } },
      {
        text: '',
        dataField: 'actions',
        headerStyle: { width: '5%' },
        cell: ({ row }) => (
          <i
            className="bi bi-eye-fill cursor-pointer"
            title={IntlMessages('page.cxpInvoiceTrace.table.viewDetail')}
            onClick={() => fnOpenTrace(row.original)}
          />
        )
      }
    ],
    data: allRows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const propsToHeader = { documentCode, providerId, listProviders, onInputChange, fnSearch, fnLoadProviders: () => { } };

  const propsToModalTrace = {
    ModalContent: ModalTrace,
    title: 'page.cxpInvoiceTrace.modal.title',
    open: openTrace,
    setOpen: setOpenTrace,
    maxWidth: 'lg',
    data: { trace: traceData, formatNumber, formatDate }
  };

  return { table, propsToHeader, propsToModalTrace };
};
