import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { useExportExcel } from '@Hooks';
import { request } from '@Helpers/core';
import { BASE_PATH, normalizeCash } from '../cxpShared/cxpReportsRules';

// Detalle Facturas de Contado (cont_cxp_detail_cash.sc2, SPEC v2-133-sr): TODOS los documentos "Contado" (el filtro opuesto al de la pantalla de Cuentas por Pagar) de todos los proveedores con saldo pendiente a hoy,
// con la misma fórmula de saldo de Cuentas por Pagar; el estado respecto del vencimiento lo calcula el back (`numDays`: días de vencido, negativo si aún no vence). El único botón por fila ("Camb.") reclasifica el
// documento de Contado a Crédito tras confirmar (privilegio 99.02.010); el otro botón del legacy ("Distribuir") está oculto allá y no se migra.
const noDueDateLabel = 'page.cxpCashInvoices.table.noDueDate';
const overdueLabel = 'page.cxpCashInvoices.table.overdue';
const dueInLabel = 'page.cxpCashInvoices.table.dueIn';

export const useCxPCashInvoices = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const [data, setData] = useState(normalizeCash(undefined));
  const [openConfirm, setOpenConfirm] = useState(false);
  const [rowToChange, setRowToChange] = useState(null);

  const noDueDate = IntlMessages(noDueDateLabel);
  const overdueText = IntlMessages(overdueLabel);
  const dueInText = IntlMessages(dueInLabel);

  const fnSearch = () => {
    setLoading(true);
    request.GET(`${BASE_PATH}/cashInvoices`, (resp) => {
      setData(normalizeCash(resp.data));
      setLoading(false);
    }, () => setLoading(false));
  };

  useEffect(() => { fnSearch(); }, []);

  const rows = data.rows
    .map((row) => {
      const numDays = row.numDays === null || row.numDays === undefined ? null : row.numDays;
      const estado = numDays === null ? noDueDate : (numDays > 0 ? `${numDays} ${overdueText}` : `${Math.abs(numDays)} ${dueInText}`);
      return { ...row, estado };
    })
    .sort((a, b) => (b.numDays ?? -Infinity) - (a.numDays ?? -Infinity));

  const fnAskChange = (row) => {
    setRowToChange(row);
    setOpenConfirm(true);
  };

  const fnOkChange = () => {
    setOpenConfirm(false);
    setLoading(true);
    request.PUT(`${BASE_PATH}/cashInvoices/changeToCredit`, {
      providerId: rowToChange.providerId,
      documentCode: rowToChange.documentCode
    }, () => {
      fnSearch();
    }, () => setLoading(false));
  };

  const table = {
    title: IntlMessages('page.cxpCashInvoices.table.title'),
    columns: [
      { text: IntlMessages('page.cxpCashInvoices.table.document'), dataField: 'documentCode', headerStyle: { width: '16%' } },
      { text: IntlMessages('page.cxpProviderHistory.input.provider'), dataField: 'providerName', headerStyle: { width: '28%' } },
      { text: IntlMessages('table.column.date'), dataField: 'invoiceDate', type: 'date', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.cxpProviderHistory.table.dueDate'), dataField: 'dueDate', type: 'date', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.cxpProviderHistory.table.status'), dataField: 'estado', headerStyle: { width: '16%' } },
      { text: IntlMessages('page.cxpProviderHistory.table.balance'), dataField: 'balance', type: 'number', headerStyle: { width: '12%' } },
      {
        text: '',
        dataField: 'actions',
        headerStyle: { width: '4%' },
        cell: ({ row }) => (
          <i
            className="bi bi-arrow-repeat cursor-pointer"
            title={IntlMessages('page.cxpCashInvoices.table.changeToCredit')}
            onClick={() => fnAskChange(row.original)}
          />
        )
      }
    ],
    data: rows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const totalBalance = formatNumber(data.totals.balance);

  const fnExportXlsx = () => fnExport(`${BASE_PATH}/cashInvoices/exportXLSX`, {}, 'FacturasDeContado.xlsx');

  const propsToConfirm = {
    open: openConfirm,
    setOpen: setOpenConfirm,
    fnOnOk: fnOkChange,
    title: 'page.cxpCashInvoices.msg.changeToCredit.title'
  };

  return { table, totalBalance, fnExportXlsx, propsToConfirm };
};
