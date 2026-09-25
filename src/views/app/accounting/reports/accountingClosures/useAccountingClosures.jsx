import { useEffect, useState } from 'react';
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm } from '@Hooks';
import { request } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import ModalSettings from './ModalSettings';
import ModalIncomeStatement from './ModalIncomeStatement';
import ModalViewEntry from './ModalViewEntry';

// Equivalente a cont_cierres.sc2 ("Cierres Contables") + cont_cierres_set.sc2 ("Ajustes
// de Cierre"). Ver AccountingClosureService.js (backend) para el detalle completo de las
// desviaciones deliberadas del legacy (nivel hoja hardcodeado a 9/6 ya no existe en el
// catálogo real, bug de arranque del primer cierre, tabla Cont_BalCTAGanancia vacía/
// vestigial) y de las 3 cuentas de utilidad configuradas hoy apuntando a códigos que ya
// no existen — el usuario decidió migrar la pantalla igual y corregir Ajustes después.
//
// Mejora no-legacy deliberada: el legacy calcula el Estado de Resultados (btnSaldoER)
// puramente como paso interno, sin mostrarlo en ningún grid (el cursor se arma y se
// descarta). Acá se expone como "Vista Previa" ANTES de poder ejecutar un cierre real —
// dado el riesgo (partidas contables reales, irreversible), se prioriza que el usuario
// pueda revisar los números antes de comprometerse.
const unwrapError = (err, fallback) => {
  const backendDescription = err?.messages?.[0]?.description;
  return (typeof backendDescription === 'object' ? backendDescription?.description : backendDescription) || fallback;
}

export const useAccountingClosures = ({ setLoading }) => {
  const { formState, onInputChange } = useForm({ date: DateHelper.format(DateHelper.now()) });
  const { date } = formState;

  const [rows, setRows] = useState([]);
  const [openSettings, setOpenSettings] = useState(false);
  const [settings, setSettings] = useState(null);
  const [leafAccounts, setLeafAccounts] = useState([]);
  const [openIncomeStatement, setOpenIncomeStatement] = useState(false);
  const [incomeStatement, setIncomeStatement] = useState(null);
  const [openConfirmExecute, setOpenConfirmExecute] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [openViewEntry, setOpenViewEntry] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);

  const fnSearch = () => {
    setLoading(true);
    request.GET('accounting/reports/accountingClosures', (resp) => {
      setRows(resp.data);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  useEffect(() => { fnSearch(); }, []);

  const fnOpenSettings = () => {
    setLoading(true);
    Promise.all([
      new Promise((resolve) => request.GET('accounting/reports/accountingClosures/settings', (resp) => resolve(resp.data), () => resolve(null))),
      new Promise((resolve) => request.GET('accounting/reports/accountingClosures/leafAccounts', (resp) => resolve(resp.data), () => resolve([])))
    ]).then(([settingsData, accounts]) => {
      setSettings(settingsData);
      setLeafAccounts(accounts.map((a) => ({ value: a.code, label: `${a.code} | ${a.name}` })));
      setOpenSettings(true);
      setLoading(false);
    });
  }

  const fnSaveSettings = (values) => {
    setLoading(true);
    request.PUT('accounting/reports/accountingClosures/settings', values, () => {
      setOpenSettings(false);
      setLoading(false);
    }, (err) => {
      setLoading(false);
      NotificationManager.error(unwrapError(err, IntlMessages('page.accountingClosures.msg.saveSettingsError')), '', 5000, null, null, '');
    }, false);
  }

  const fnPreviewIncomeStatement = () => {
    if (!date) return;
    setLoading(true);
    request.POST('accounting/reports/accountingClosures/incomeStatement', { date }, (resp) => {
      setIncomeStatement(resp.data);
      setOpenIncomeStatement(true);
      setLoading(false);
    }, (err) => {
      setLoading(false);
      NotificationManager.error(unwrapError(err, IntlMessages('page.accountingClosures.msg.previewError')), '', 5000, null, null, '');
    }, false);
  }

  const fnAskExecute = () => {
    if (!date) return;
    setOpenConfirmExecute(true);
  }

  const fnExecute = () => {
    setOpenConfirmExecute(false);
    setLoading(true);
    request.POST('accounting/reports/accountingClosures/execute', { date }, () => {
      NotificationManager.success(IntlMessages('page.accountingClosures.msg.executeSuccess'), '', 4000, null, null, '');
      fnSearch();
      setLoading(false);
    }, (err) => {
      setLoading(false);
      NotificationManager.error(unwrapError(err, IntlMessages('page.accountingClosures.msg.executeError')), '', 5000, null, null, '');
    }, false);
  }

  const fnAskDelete = (row) => {
    setRowToDelete(row);
    setOpenConfirmDelete(true);
  }

  const fnDelete = () => {
    if (!rowToDelete) return;
    setOpenConfirmDelete(false);
    setLoading(true);
    request.DELETE(`accounting/reports/accountingClosures/${rowToDelete.id}`, () => {
      NotificationManager.success(IntlMessages('page.accountingClosures.msg.deleteSuccess'), '', 4000, null, null, '');
      fnSearch();
      setLoading(false);
    }, (err) => {
      setLoading(false);
      NotificationManager.error(unwrapError(err, IntlMessages('page.accountingClosures.msg.deleteError')), '', 5000, null, null, '');
    }, false);
  }

  const fnViewEntry = (numberPDA) => {
    if (!numberPDA) return;
    setLoading(true);
    request.GET(`accounting/reports/accountingClosures/entry/${numberPDA}`, (resp) => {
      setViewEntry(resp.data);
      setOpenViewEntry(true);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const table = {
    title: IntlMessages('page.accountingClosures.table.title'),
    columns: [
      { text: IntlMessages('table.column.date'), dataField: 'date', type: 'date', headerStyle: { width: '20%' } },
      {
        text: IntlMessages('page.accountingClosures.table.numpda'),
        dataField: 'accNumberCorrelative',
        headerStyle: { width: '20%' },
        cell: ({ row }) => (row.original.accNumberCorrelative ? (
          <span className="cursor-pointer text-primary" onClick={() => fnViewEntry(row.original.accNumberCorrelative)}>{row.original.accNumberCorrelative}</span>
        ) : '-')
      },
      {
        text: IntlMessages('page.accountingClosures.table.numpda2'),
        dataField: 'numpda2',
        headerStyle: { width: '20%' },
        cell: ({ row }) => (row.original.numpda2 ? (
          <span className="cursor-pointer text-primary" onClick={() => fnViewEntry(row.original.numpda2)}>{row.original.numpda2}</span>
        ) : '-')
      },
      {
        text: IntlMessages('page.accountingClosures.table.numpda3'),
        dataField: 'numpda3',
        headerStyle: { width: '20%' },
        cell: ({ row }) => (row.original.numpda3 ? (
          <span className="cursor-pointer text-primary" onClick={() => fnViewEntry(row.original.numpda3)}>{row.original.numpda3}</span>
        ) : '-')
      },
      {
        text: '',
        dataField: 'actions',
        headerStyle: { width: '20%' },
        cell: ({ row }) => (
          <i
            className="bi bi-trash-fill cursor-pointer"
            title={IntlMessages('button.delete')}
            onClick={() => fnAskDelete(row.original)}
          />
        )
      }
    ],
    data: rows,
    options: { pageSize: 10 }
  };

  const propsToHeader = { date, onInputChange, fnAskExecute, fnPreviewIncomeStatement, fnOpenSettings };

  const propsToModalSettings = {
    ModalContent: ModalSettings,
    title: 'page.accountingClosures.modal.settings.title',
    open: openSettings,
    setOpen: setOpenSettings,
    maxWidth: 'md',
    data: { settings, leafAccounts, fnSave: fnSaveSettings }
  }

  const propsToModalIncomeStatement = {
    ModalContent: ModalIncomeStatement,
    title: 'page.accountingClosures.modal.incomeStatement.title',
    open: openIncomeStatement,
    setOpen: setOpenIncomeStatement,
    maxWidth: 'xl',
    data: { incomeStatement, formatNumber, formatDate }
  }

  const propsToModalViewEntry = {
    ModalContent: ModalViewEntry,
    title: 'page.accountingClosures.modal.viewEntry.title',
    open: openViewEntry,
    setOpen: setOpenViewEntry,
    maxWidth: 'lg',
    data: { entry: viewEntry, formatNumber, formatDate }
  }

  const propsToConfirmExecute = {
    open: openConfirmExecute,
    setOpen: setOpenConfirmExecute,
    fnOnOk: fnExecute,
    title: 'page.accountingClosures.msg.execute.title',
    textLegend: IntlMessages('page.accountingClosures.msg.execute.legend')
  }

  const propsToConfirmDelete = {
    open: openConfirmDelete,
    setOpen: setOpenConfirmDelete,
    fnOnOk: fnDelete,
    title: 'page.accountingClosures.msg.delete.title'
  }

  return {
    table, propsToHeader, propsToModalSettings, propsToModalIncomeStatement, propsToModalViewEntry,
    propsToConfirmExecute, propsToConfirmDelete
  }
}
