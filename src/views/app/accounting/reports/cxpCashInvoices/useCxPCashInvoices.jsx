import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useExportExcel } from '@Hooks';
import { request } from '@Helpers/core';

// Equivalente a cont_cxp_detail_cash.sc2 ("Detalle Facturas de Contado"). A diferencia de
// cont_cxpdeta03 (un proveedor, rango de fechas), esta pantalla trae TODOS los documentos
// "Contado" (cxp.type_fp = 1 — filtro OPUESTO al de la pantalla principal de CxP, que
// EXCLUYE Contado) de TODOS los proveedores con saldo pendiente, sin filtro alguno — el
// legacy carga todo al abrir el formulario (Init), factible (407 filas reales). El único
// botón por fila ("Camb.") reclasifica el documento de Contado a Crédito
// (cont_cxp_deta_cashd.sc2, Commandbutton_hw2.Click) tras confirmar; el otro botón de esa
// fila ("Distribuir", Column12) está oculto en el legacy (Visible = .F.) y nunca es
// alcanzable por el usuario — no se migra.
const noDueDateLabel = 'page.cxpCashInvoices.table.noDueDate';
const overdueLabel = 'page.cxpCashInvoices.table.overdue';
const dueInLabel = 'page.cxpCashInvoices.table.dueIn';

export const useCxPCashInvoices = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const [rows, setRows] = useState([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [rowToChange, setRowToChange] = useState(null);

  const noDueDate = IntlMessages(noDueDateLabel);
  const overdueText = IntlMessages(overdueLabel);
  const dueInText = IntlMessages(dueInLabel);

  const fnSearch = () => {
    setLoading(true);
    request.GET('accounting/process/accountsPayable/pendingCashInvoices', (resp) => {
      const today = DateHelper.now();
      const data = resp.data
        .map((row) => {
          const numDays = row.dueDate ? DateHelper.diff(row.dueDate, today, 'day') : null;
          const estado = numDays === null ? noDueDate : (numDays < 0 ? `${Math.abs(numDays)} ${overdueText}` : `${numDays} ${dueInText}`);
          return { ...row, numDays: numDays ?? 0, estado };
        })
        .sort((a, b) => a.numDays - b.numDays);
      setRows(data);
      setLoading(false);
    }, () => setLoading(false));
  }

  useEffect(() => { fnSearch(); }, []);

  const fnAskChange = (row) => {
    setRowToChange(row);
    setOpenConfirm(true);
  }

  const fnOkChange = () => {
    setOpenConfirm(false);
    setLoading(true);
    request.PUT('accounting/process/accountsPayable/pendingCashInvoices/changeToCredit', {
      providerId: rowToChange.providerId,
      documentCode: rowToChange.documentCode
    }, () => {
      setRows((prev) => prev.filter((r) => r.id !== rowToChange.id));
      setLoading(false);
    }, () => setLoading(false));
  }

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

  const totalBalance = formatNumber(rows.reduce((sum, r) => sum + Number(r.balance || 0), 0));

  const fnExportXlsx = () => fnExport('accounting/process/accountsPayable/pendingCashInvoices/exportXLSX', {}, 'FacturasDeContado.xlsx');

  const propsToConfirm = {
    open: openConfirm,
    setOpen: setOpenConfirm,
    fnOnOk: fnOkChange,
    title: 'page.cxpCashInvoices.msg.changeToCredit.title'
  }

  return { table, totalBalance, fnExportXlsx, propsToConfirm };
}
