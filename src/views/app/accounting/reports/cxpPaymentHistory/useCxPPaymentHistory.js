import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl } from '@Helpers/core';

// Equivalente a cont_cxp_history.sc2 ("Histórico de Pagos a Proveedores"). Ver
// AccountsPayableService.findPaymentHistory (backend) para el detalle de por qué difiere
// de CxC (cxcPaymentHistory): 3 fuentes de pago unidas (cheque/transferencia + Partida de
// Diario + Retenciones fiscales aplicadas), no 2 — las retenciones no tienen equivalente
// del lado CxC. Igual que CxC, sin fetch automático al montar: el usuario debe filtrar y
// presionar Buscar.
export const useCxPPaymentHistory = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const { formState, onInputChange } = useForm({ providerId: 0, dateStart: '', dateEnd: '' });
  const { providerId, dateStart, dateEnd } = formState;

  const [allRows, setAllRows] = useState([]);
  const [listProviders, setListProviders] = useState([]);

  const fnSearch = () => {
    setLoading(true);
    const providerFilter = Number(providerId) === 0 ? undefined : providerId;
    request.GET(buildUrl('accounting/process/accountsPayable/paymentHistory', { providerId: providerFilter, dateStart: dateStart || undefined, dateEnd: dateEnd || undefined }), (resp) => {
      setAllRows(resp.data);
      setLoading(false);
    }, () => { setLoading(false); });
  }

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
    data: allRows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const totals = {
    totalDocuments: formatNumber(allRows.reduce((sum, r) => sum + Number(r.originalValue || 0), 0)),
    totalPaid: formatNumber(allRows.reduce((sum, r) => sum + Number(r.paidValue || 0), 0))
  };

  const fnExportXlsx = () => fnExport('accounting/process/accountsPayable/paymentHistory/exportXLSX', { providerId: Number(providerId) === 0 ? undefined : providerId, dateStart: dateStart || undefined, dateEnd: dateEnd || undefined }, 'HistoricoPagosProveedores.xlsx');

  useEffect(() => {
    request.GET(buildUrl('inventory/process/providers', { status: 1 }), (resp) => {
      setListProviders(resp.data.map((item) => ({ label: `${item.id} | ${item.name}`, value: item.id })));
    }, () => { });
  }, []);

  const propsToHeader = { providerId, dateStart, dateEnd, listProviders, onInputChange, fnSearch, fnExportXlsx }

  return { table, totals, propsToHeader }
}
