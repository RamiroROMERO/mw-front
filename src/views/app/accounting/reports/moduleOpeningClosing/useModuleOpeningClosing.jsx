import { useState } from 'react';
import { IntlMessages } from '@Helpers/Utils';
import { useForm } from '@Hooks';
import { request } from '@Helpers/core';
import ModalEditStatus from './ModalEditStatus';

// Equivalente a cont_io_modules.sc2 ("Abrir y Cerrar Modulos Contables"). Los nombres de
// mes son DATOS, no etiquetas de UI — `cont_io_modules.name_io` guarda el nombre literal
// en español ("Septiembre", etc., confirmado contra 39 períodos reales ya existentes) y
// el backend busca/compara por ese string exacto, así que NO se traducen vía IntlMessages
// aunque cambie el idioma de la app — se mantienen fijos en español, igual que el legacy.
const MONTHS = [
  { index: 1, name: 'Enero' }, { index: 2, name: 'Febrero' }, { index: 3, name: 'Marzo' },
  { index: 4, name: 'Abril' }, { index: 5, name: 'Mayo' }, { index: 6, name: 'Junio' },
  { index: 7, name: 'Julio' }, { index: 8, name: 'Agosto' }, { index: 9, name: 'Septiembre' },
  { index: 10, name: 'Octubre' }, { index: 11, name: 'Noviembre' }, { index: 12, name: 'Diciembre' }
];

const openLabel = 'page.moduleOpeningClosing.status.open';
const closedLabel = 'page.moduleOpeningClosing.status.closed';

export const useModuleOpeningClosing = ({ setLoading }) => {
  const today = new Date();
  const { formState, onInputChange } = useForm({ monthIndex: today.getMonth() + 1, year: today.getFullYear() });
  const { monthIndex, year } = formState;

  const [headerId, setHeaderId] = useState(0);
  const [rows, setRows] = useState([]);
  const [openConfirmAll, setOpenConfirmAll] = useState(false);
  const [confirmAllStatus, setConfirmAllStatus] = useState(1);
  const [openEdit, setOpenEdit] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const openText = IntlMessages(openLabel);
  const closedText = IntlMessages(closedLabel);

  const fnGenerate = () => {
    const month = MONTHS.find((m) => m.index === Number(monthIndex));
    if (!month || !year) return;

    setLoading(true);
    request.POST('accounting/reports/moduleOpeningClosing', { monthName: month.name, monthIndex: month.index, year }, (resp) => {
      setHeaderId(resp.data.headerId);
      setRows(resp.data.rows);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const fnOpenEdit = (row) => {
    setEditRow(row);
    setOpenEdit(true);
  }

  const fnSaveEdit = (status) => {
    if (!editRow) return;
    setLoading(true);
    request.PUT(`accounting/reports/moduleOpeningClosing/toggle/${editRow.id}`, { status }, () => {
      setOpenEdit(false);
      fnGenerate();
    }, () => { setLoading(false); });
  }

  const fnAskBulk = (status) => {
    setConfirmAllStatus(status);
    setOpenConfirmAll(true);
  }

  const fnConfirmBulk = () => {
    setOpenConfirmAll(false);
    setLoading(true);
    request.PUT('accounting/reports/moduleOpeningClosing/bulk', { headerId, status: confirmAllStatus }, (resp) => {
      setRows(resp.data.rows);
      setLoading(false);
    }, () => { setLoading(false); });
  }

  const table = {
    title: IntlMessages('page.moduleOpeningClosing.table.title'),
    columns: [
      { text: IntlMessages('page.moduleOpeningClosing.table.module'), dataField: 'moduleName', headerStyle: { width: '55%' } },
      {
        text: IntlMessages('page.moduleOpeningClosing.table.status'),
        dataField: 'status',
        headerStyle: { width: '30%' },
        cell: ({ row }) => (
          <span className={row.original.status === 1 ? 'text-success' : 'text-danger'}>
            {row.original.status === 1 ? openText : closedText}
          </span>
        )
      },
      {
        text: '',
        dataField: 'actions',
        headerStyle: { width: '15%' },
        cell: ({ row }) => (
          <i
            className="bi bi-pencil-fill cursor-pointer"
            title={IntlMessages('button.edit')}
            onClick={() => fnOpenEdit(row.original)}
          />
        )
      }
    ],
    data: rows,
    options: { pageSize: 12 }
  };

  const propsToHeader = {
    monthIndex,
    year,
    months: MONTHS,
    onInputChange,
    fnGenerate,
    fnOpenAll: () => fnAskBulk(1),
    fnCloseAll: () => fnAskBulk(0),
    hasHeader: headerId > 0
  }

  const propsToConfirmAll = {
    open: openConfirmAll,
    setOpen: setOpenConfirmAll,
    fnOnOk: fnConfirmBulk,
    title: confirmAllStatus === 1 ? 'page.moduleOpeningClosing.msg.openAll.title' : 'page.moduleOpeningClosing.msg.closeAll.title'
  }

  const propsToModalEdit = {
    ModalContent: ModalEditStatus,
    title: 'page.moduleOpeningClosing.modal.edit.title',
    open: openEdit,
    setOpen: setOpenEdit,
    maxWidth: 'sm',
    data: { row: editRow, fnSave: fnSaveEdit }
  }

  return { table, propsToHeader, propsToConfirmAll, propsToModalEdit, fnGenerate };
}
