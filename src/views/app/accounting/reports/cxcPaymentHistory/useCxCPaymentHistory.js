import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';

// Equivalente a cont_cxc_history.sc2 ("Histórico de Pagos de Clientes"). A diferencia de
// las demás pantallas de este módulo, NO hace fetch automático al montar — sin filtros
// devuelve el historial COMPLETO de pagos de la empresa (13,000+ filas en datos reales),
// igual que el legacy (su propia validación de "cliente requerido" está comentada/deshabilitada
// en el .sc2 original, así que técnicamente también permite esa carga masiva, pero nadie
// lo hace en la práctica sin antes filtrar). El usuario debe aplicar al menos un filtro y
// presionar Buscar.
export const useCxCPaymentHistory = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const { formState, onInputChange } = useForm({ customerId: 0, dateStart: '', dateEnd: '' });
  const { customerId, dateStart, dateEnd } = formState;

  const [allRows, setAllRows] = useState([]);
  const [listCustomers, setListCustomers] = useState([]);

  const fnSearch = () => {
    setLoading(true);
    const customerFilter = Number(customerId) === 0 ? undefined : customerId;
    request.GET(buildUrl('accounting/process/cxc/paymentHistory', { customerId: customerFilter, dateStart: dateStart || undefined, dateEnd: dateEnd || undefined }), (resp) => {
      setAllRows(resp.data);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const table = {
    title: IntlMessages('page.cxcPaymentHistory.table.title'),
    columns: [
      { text: IntlMessages('table.column.date'), dataField: 'invoiceDate', type: 'date', headerStyle: { width: '8%' } },
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
    data: allRows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const totals = {
    totalDocuments: formatNumber(allRows.reduce((sum, r) => sum + Number(r.originalValue || 0), 0)),
    totalPaid: formatNumber(allRows.reduce((sum, r) => sum + Number(r.paidValue || 0), 0))
  };

  const fnExportXlsx = () => fnExport('accounting/process/cxc/paymentHistory/exportXLSX', { customerId: Number(customerId) === 0 ? undefined : customerId, dateStart: dateStart || undefined, dateEnd: dateEnd || undefined }, 'HistoricoPagosClientes.xlsx');

  useEffect(() => {
    request.GET('billing/settings/customers/?status=1', (resp) => {
      setListCustomers(resp.data.map((item) => ({ label: `${item.id} | ${item.nomcli}`, value: item.id })));
    }, () => { });
  }, []);

  const propsToHeader = { customerId, dateStart, dateEnd, listCustomers, onInputChange, fnSearch, fnExportXlsx }

  return { table, totals, propsToHeader }
}
