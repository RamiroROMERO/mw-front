import { useState } from 'react';
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils';
import { useForm } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';
import ModalTrace from './ModalTrace';

// Equivalente a cont_cxprast.sc2 ("Rastreo de Cuentas por Pagar"). El legacy carga su
// picker de búsqueda con TODO cont_cxp sin filtro (impracticable acá) — se exige al
// menos un filtro (documento o proveedor), igual que el backend (searchDocuments
// devuelve [] sin filtros). A diferencia de su espejo en CxC, acá el botón "Eliminar
// Pago" del legacy SÍ es funcional de verdad (no código muerto) — de todas formas no se
// migra, mismo criterio ya aplicado a "Eliminar Documento" en toda esta familia:
// utilitario destructivo solo-admin, fuera de alcance para una pantalla de solo lectura.
export const useCxPInvoiceTrace = ({ setLoading }) => {
  const { formState, onInputChange } = useForm({ documentCode: '', providerId: 0 });
  const { documentCode, providerId } = formState;

  const [allRows, setAllRows] = useState([]);
  const [listProviders, setListProviders] = useState([]);
  const [openTrace, setOpenTrace] = useState(false);
  const [traceData, setTraceData] = useState(null);

  const fnLoadProviders = () => {
    if (listProviders.length > 0) return;
    request.GET(buildUrl('inventory/process/providers', { status: 1 }), (resp) => {
      setListProviders(resp.data.map((item) => ({ label: `${item.id} | ${item.name}`, value: item.id })));
    }, () => { });
  }

  const fnSearch = () => {
    const providerFilter = Number(providerId) === 0 ? undefined : providerId;
    if (!documentCode && !providerFilter) return;
    setLoading(true);
    request.GET(buildUrl('accounting/process/accountsPayable/searchDocuments', { documentCode: documentCode || undefined, providerId: providerFilter }), (resp) => {
      setAllRows(resp.data);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnOpenTrace = (row) => {
    setLoading(true);
    request.GET(buildUrl('accounting/process/accountsPayable/documentTrace', { cxpId: row.cxpId }), (resp) => {
      setTraceData(resp.data);
      setOpenTrace(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

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

  const propsToHeader = { documentCode, providerId, listProviders, onInputChange, fnSearch, fnLoadProviders };

  const propsToModalTrace = {
    ModalContent: ModalTrace,
    title: 'page.cxpInvoiceTrace.modal.title',
    open: openTrace,
    setOpen: setOpenTrace,
    maxWidth: 'lg',
    data: { trace: traceData, formatNumber, formatDate }
  }

  return { table, propsToHeader, propsToModalTrace }
}
