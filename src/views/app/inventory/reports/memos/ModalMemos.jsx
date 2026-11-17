import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { ModalSearchContent } from '@Components/modalSearch';
import { formatDate, formatNumber } from '@Helpers/Utils';

// Memorándums ya creados (SPEC v2-59-sr), con búsqueda y paginación en el servidor (número, Para, De y asunto). El modo decide la acción de cada fila:
// 'add' elige el memorándum al que se agregan los documentos marcados, 'print' imprime (PDF o Excel) y 'delete' elimina (libera sus documentos).
const ModalMemos = ({ setOpen, data }) => {
  const { url, mode, onChoose, onPrint, onDelete } = data;
  const intl = useIntl();

  const columns = useMemo(() => [
    { text: intl.formatMessage({ id: 'table.column.no' }), dataField: 'number', headerStyle: { width: '10%' } },
    { text: intl.formatMessage({ id: 'table.column.date' }), dataField: 'date', headerStyle: { width: '15%' }, cell: ({ row }) => formatDate(row.original.date) },
    { text: intl.formatMessage({ id: 'table.column.nameFor' }), dataField: 'for1', headerStyle: { width: '20%' } },
    { text: intl.formatMessage({ id: 'table.column.nameFrom' }), dataField: 'from1', headerStyle: { width: '20%' }, classes: 'd-md-none-table-cell', headerClasses: 'd-md-none-table-cell' },
    { text: intl.formatMessage({ id: 'input.subject' }), dataField: 'subject', headerStyle: { width: '20%' }, classes: 'd-sm-none-table-cell', headerClasses: 'd-sm-none-table-cell' },
    { text: intl.formatMessage({ id: 'page.memos.column.documents' }), dataField: 'documents', headerStyle: { width: '7%' }, style: { textAlign: 'right' } },
    { text: intl.formatMessage({ id: 'table.column.total' }), dataField: 'total', headerStyle: { width: '10%' }, style: { textAlign: 'right' }, cell: ({ row }) => formatNumber(row.original.total, '', 2) }
  ], [intl.locale]);

  const actions = useMemo(() => {
    if (mode === 'add') return [{ color: 'primary', icon: 'check2', toolTip: intl.formatMessage({ id: 'page.memos.action.choose' }), onClick: onChoose }];
    if (mode === 'delete') return [{ color: 'danger', icon: 'trash', toolTip: intl.formatMessage({ id: 'button.delete' }), onClick: onDelete }];
    return [
      { color: 'info', icon: 'printer', toolTip: 'PDF', onClick: (row) => onPrint(row, 'pdf') },
      { color: 'secondary', icon: 'file-earmark-excel', toolTip: 'Excel', onClick: (row) => onPrint(row, 'xlsx') }
    ];
  }, [mode, onChoose, onPrint, onDelete, intl.locale]);

  const config = useMemo(() => ({ url, columns, actions }), [url, columns, actions]);
  return <ModalSearchContent data={config} setOpen={setOpen} />;
};

export default ModalMemos;
