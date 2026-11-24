import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { IntlMessages, formatNumber, formatDate } from '@Helpers/Utils';
import { useForm, useExportExcel } from '@Hooks';
import { request, notifyError } from '@Helpers/core';
import createNotification from '@Containers/ui/Notifications';
import ModalViewEntry from './ModalViewEntry';
import {
  BASE_PATH, currentMonthRange, validateQuery, buildQuery, totalPages, rangeSummary, normalizeResponse
} from './diaryBookRules';

// Libro Diario (cont_ldiario.sc2, SPEC v2-126-sr). El rango por defecto es el mes en curso (consulta corta). La pantalla se pagina y se busca en el servidor y los totales (Debe, Haber y
// diferencia) vienen del back para TODO el conjunto filtrado. Solo hay Excel (sin PDF): lo escribe el back por flujo con el mismo rango, cuenta y búsqueda de la pantalla.
export const useDiaryBook = ({ setLoading }) => {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const { fnExport } = useExportExcel(setLoading);
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ count: 0, debit: 0, credit: 0, diff: 0 });
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPageState] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [listAccounts, setListAccounts] = useState([]);
  const [sendForm, setSendForm] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewEntryData, setViewEntryData] = useState(null);
  // Filtro que se aplicó en la última consulta: paginar, buscar y exportar usan ESTE, no lo que se esté digitando.
  const applied = useRef(null);
  const requestId = useRef(0);

  const { formState, onInputChange } = useForm({ ...currentMonthRange(), accountCode: '' });
  const { dateStart, dateEnd, accountCode } = formState;
  const errors = useMemo(() => validateQuery({ dateStart, dateEnd }), [dateStart, dateEnd]);

  const fnViewEntry = (row) => {
    request.GET(`${BASE_PATH}/entry/${row.fatherId}`, (resp) => {
      setViewEntryData(resp.data);
      setOpenViewModal(true);
    }, () => { });
  };

  // Una página; una respuesta vieja nunca pisa a una más nueva.
  const load = (page, search) => {
    if (!applied.current) return;
    const id = requestId.current + 1;
    requestId.current = id;
    setLoading(true);
    request.POST(BASE_PATH, buildQuery(applied.current, { page, search }), (resp) => {
      if (id !== requestId.current) return;
      const data = normalizeResponse(resp.data);
      setRows(data.rows);
      setTotals(data.totals);
      setTotalRecords(data.totalRecords);
      setLoading(false);
    }, (err) => {
      if (id !== requestId.current) return;
      setLoading(false);
      notifyError(err, 'page.diaryBook.msg.searchError');
    }, false);
  };

  // "Actualizar": valida el rango (un filtro inválido se marca y NO llama al back), lo fija y vuelve a la primera página.
  const fnSearchReport = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) {
      createNotification('warning', Object.values(errors)[0], 'alert.warning.title');
      return;
    }
    applied.current = { dateStart, dateEnd, accountCode };
    setCurrentPageState(1);
    load(1, searchText);
  };

  const setCurrentPage = (page) => {
    if (page === currentPage) return; // la tabla también lo invoca al montarse
    setCurrentPageState(page);
    load(page, searchText);
  };

  const setSearch = (text) => {
    // La tabla avisa también al montarse y al repintar: una búsqueda sin cambios no vuelve a consultar.
    if (String(text ?? '') === searchText) return;
    setSearchText(text);
    setCurrentPageState(1);
    load(1, text);
  };

  const fnExportXlsx = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) {
      createNotification('warning', Object.values(errors)[0], 'alert.warning.title');
      return;
    }
    fnExport(`${BASE_PATH}/exportXLSX`, buildQuery({ dateStart, dateEnd, accountCode }, { search: searchText }), 'LibroDiario.xlsx');
  };

  const table = {
    title: IntlMessages('page.diaryBook.table.title'),
    columns: [
      { text: IntlMessages('page.diaryBook.table.numberPDA'), dataField: 'numberPDA', headerStyle: { width: '10%' } },
      { text: IntlMessages('table.column.description'), dataField: 'description', headerStyle: { width: '30%' } },
      { text: IntlMessages('page.diaryBook.table.debit'), dataField: 'debit', type: 'number', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.diaryBook.table.credit'), dataField: 'credit', type: 'number', headerStyle: { width: '10%' } },
      { text: IntlMessages('table.column.date'), dataField: 'date', type: 'date', headerStyle: { width: '9%' } },
      { text: IntlMessages('page.diaryBook.table.accountNumber'), dataField: 'accountNumber', headerStyle: { width: '11%' } },
      { text: IntlMessages('page.diaryBook.table.accountName'), dataField: 'accountName', headerStyle: { width: '18%' } },
      {
        text: '',
        dataField: 'actions',
        headerStyle: { width: '2%' },
        cell: ({ row }) => (
          <i
            className="bi bi-eye-fill cursor-pointer"
            title={IntlMessages('page.diaryBook.button.viewEntry')}
            onClick={() => fnViewEntry(row.original)}
          />
        )
      }
    ],
    data: rows,
    options: {
      typePagination: 2,
      currentPage,
      totalPages: totalPages(totalRecords),
      setCurrentPage,
      setSearch,
      searchDebounceMs: 400,
      paginationSummary: rangeSummary(currentPage, totalRecords)
    }
  };

  useEffect(() => {
    request.GET('accounting/settings/accountants/getSL', (resp) => {
      setListAccounts(resp.data.map((item) => ({ label: `${item.cta} - ${item.nombre}`, value: item.cta })));
    }, () => { });
    // Primera consulta: el mes en curso.
    applied.current = { dateStart, dateEnd, accountCode: '' };
    load(1, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const propsToHeaderReport = {
    dateStart,
    dateEnd,
    accountCode,
    listAccounts,
    errors,
    sendForm,
    onInputChange,
    fnSearchReport,
    fnExportXlsx
  };

  const propsToTotals = {
    count: String(totals.count),
    debit: formatNumber(totals.debit),
    credit: formatNumber(totals.credit),
    diff: formatNumber(totals.diff),
    unbalanced: totals.diff !== 0,
    unbalancedLabel: t('page.diaryBook.msg.unbalanced')
  };

  const propsToModalViewEntry = {
    ModalContent: ModalViewEntry,
    title: 'page.diaryBook.modal.viewEntry.title',
    open: openViewModal,
    setOpen: setOpenViewModal,
    maxWidth: 'lg',
    data: { entry: viewEntryData, formatNumber, formatDate }
  };

  return {
    table,
    propsToHeaderReport,
    propsToTotals,
    propsToModalViewEntry
  };
};
