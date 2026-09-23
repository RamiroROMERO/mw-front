import { useState } from 'react';
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils';
import { useForm } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import ModalTrace from './ModalTrace';

// Equivalente a cont_cxc_rast.sc2 ("Rastreo de Cuentas por Cobrar"). El legacy carga su
// picker de búsqueda con TODO cont_cxc sin filtro (impracticable acá, 13,000+ filas) —
// se exige al menos un filtro (documento o cliente) antes de buscar, igual que el backend
// ya valida (searchInvoices devuelve [] sin filtros en vez de la tabla completa).
// Los botones "Actualizar Todo"/"Eliminar" del legacy son código muerto confirmado
// (`Return` como primera línea de su Click) — pantalla 100% de solo lectura, no se migran.
export const useCxCInvoiceTrace = ({ setLoading }) => {
  const { formState, onInputChange } = useForm({ documentCode: '', customerId: 0 });
  const { documentCode, customerId } = formState;

  const [allRows, setAllRows] = useState([]);
  const [listCustomers, setListCustomers] = useState([]);
  const [openTrace, setOpenTrace] = useState(false);
  const [traceData, setTraceData] = useState(null);

  const fnLoadCustomers = () => {
    if (listCustomers.length > 0) return;
    request.GET('billing/settings/customers/?status=1', (resp) => {
      setListCustomers(resp.data.map((item) => ({ label: `${item.id} | ${item.nomcli}`, value: item.id })));
    }, () => { });
  }

  const fnSearch = () => {
    const customerFilter = Number(customerId) === 0 ? undefined : customerId;
    if (!documentCode && !customerFilter) return;
    setLoading(true);
    request.GET(buildUrl('accounting/process/cxc/searchInvoices', { documentCode: documentCode || undefined, customerId: customerFilter }), (resp) => {
      setAllRows(resp.data);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnOpenTrace = (row) => {
    setLoading(true);
    request.GET(buildUrl('accounting/process/cxc/invoiceTrace', { cxcId: row.cxcId }), (resp) => {
      setTraceData(resp.data);
      setOpenTrace(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

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
        text: '',
        dataField: 'actions',
        headerStyle: { width: '5%' },
        cell: ({ row }) => (
          <i
            className="bi bi-eye-fill cursor-pointer"
            title={IntlMessages('page.cxcInvoiceTrace.table.viewDetail')}
            onClick={() => fnOpenTrace(row.original)}
          />
        )
      }
    ],
    data: allRows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const propsToHeader = { documentCode, customerId, listCustomers, onInputChange, fnSearch, fnLoadCustomers };

  const propsToModalTrace = {
    ModalContent: ModalTrace,
    title: 'page.cxcInvoiceTrace.modal.title',
    open: openTrace,
    setOpen: setOpenTrace,
    maxWidth: 'lg',
    data: { trace: traceData, formatNumber, formatDate }
  }

  return { table, propsToHeader, propsToModalTrace }
}
