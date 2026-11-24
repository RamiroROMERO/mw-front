import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { IntlMessages, formatNumber } from '@Helpers/Utils';
import { useForm, useExportExcel } from '@Hooks';
import { request, notifyError } from '@Helpers/core';
import createNotification from '@Containers/ui/Notifications';
import ModalPdaDetail from './ModalPdaDetail';
import {
  BASE_PATH, STATUS_LABELS, STATUS_CLASS, defaultRange, validateQuery, buildQuery, buildSummaryQuery, totalPages, rangeSummary, normalizeResponse, normalizeSummary, normalizePdaDetail
} from './moduleAuditRules';

// Auditoría de Módulos (cont_auditoria.sc2, SPEC v2-129-sr). Compara el valor que cada módulo guardó de su documento con el de su partida. La pantalla se pagina y se busca en el servidor; el estado de cada
// documento, los totales y los contadores vienen del back para TODO el rango. "Resumen" (pestaña sin código en el legacy) muestra un renglón por módulo. Solo hay Excel (sin PDF).
export const useModuleAudit = ({ setLoading }) => {
  const intl = useIntl();
  const t = (id) => intl.formatMessage({ id });
  const { fnExport } = useExportExcel(setLoading);
  const { formState, onInputChange } = useForm({ moduleId: 1, ...defaultRange() });
  const { moduleId, dateStart, dateEnd } = formState;
  const errors = useMemo(() => validateQuery({ moduleId, dateStart, dateEnd }), [moduleId, dateStart, dateEnd]);

  const [modules, setModules] = useState([]);
  const [activeTab, setActiveTab] = useState('1');
  const [sendForm, setSendForm] = useState(false);
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ count: 0, value: 0, accountingValue: 0, difference: 0 });
  const [counts, setCounts] = useState({ all: 0, noPda: 0, missingPda: 0, mismatch: 0, ok: 0, issues: 0 });
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPageState] = useState(1);
  const [statusFilter, setStatusFilterState] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [summary, setSummary] = useState([]);
  const [openPdaDetail, setOpenPdaDetail] = useState(false);
  const [pdaDetailData, setPdaDetailData] = useState(null);
  // Filtro de la última consulta: paginar, buscar y filtrar usan ESTE, no lo que se esté digitando. Una respuesta vieja nunca pisa a una nueva.
  const applied = useRef(null);
  const requestId = useRef(0);

  const loadDetail = (page, search, status) => {
    if (!applied.current) return;
    const id = requestId.current + 1;
    requestId.current = id;
    setLoading(true);
    request.POST(BASE_PATH, buildQuery(applied.current, { page, search, status }), (resp) => {
      if (id !== requestId.current) return;
      const data = normalizeResponse(resp.data);
      setRows(data.rows);
      setTotals(data.totals);
      setCounts(data.counts);
      setTotalRecords(data.totalRecords);
      setLoading(false);
    }, (err) => {
      if (id !== requestId.current) return;
      setLoading(false);
      notifyError(err, 'page.moduleAudit.msg.searchError');
    }, false);
  };

  const loadSummary = (filter) => {
    request.POST(`${BASE_PATH}/summary`, buildSummaryQuery(filter), (resp) => setSummary(normalizeSummary(resp.data)), (err) => notifyError(err, 'page.moduleAudit.msg.searchError'), false);
  };

  const validate = () => {
    setSendForm(true);
    if (Object.keys(errors).length > 0) {
      createNotification('warning', Object.values(errors)[0], 'alert.warning.title');
      return false;
    }
    return true;
  };

  const run = (filter, status, search) => {
    applied.current = { ...filter };
    setCurrentPageState(1);
    loadDetail(1, search, status);
    loadSummary(filter);
  };

  const fnSearch = () => {
    if (!validate()) return;
    run({ moduleId, dateStart, dateEnd }, statusFilter, searchText);
  };

  const setCurrentPage = (page) => {
    if (page === currentPage) return; // la tabla también lo invoca al montarse
    setCurrentPageState(page);
    loadDetail(page, searchText, statusFilter);
  };

  const setSearch = (text) => {
    if (String(text ?? '') === searchText) return;
    setSearchText(text);
    setCurrentPageState(1);
    loadDetail(1, text, statusFilter);
  };

  const setStatusFilter = (status) => {
    if (status === statusFilter) return;
    setStatusFilterState(status);
    setCurrentPageState(1);
    loadDetail(1, searchText, status);
  };

  // Un renglón del resumen abre el detalle de ese módulo (con el mismo rango).
  const fnPickModule = (id) => {
    onInputChange({ target: { name: 'moduleId', value: id } });
    setActiveTab('1');
    run({ moduleId: id, dateStart, dateEnd }, statusFilter, searchText);
  };

  const fnExportXlsx = () => {
    if (!validate()) return;
    fnExport(`${BASE_PATH}/exportXLSX`, buildQuery({ moduleId, dateStart, dateEnd }, { search: searchText, status: statusFilter }), 'AuditoriaDeModulos.xlsx');
  };

  const fnOpenPdaDetail = (row) => {
    if (!row.pdaNumber) return;
    setLoading(true);
    request.GET(`${BASE_PATH}/pdaDetail/${row.pdaNumber}`, (resp) => {
      setPdaDetailData(normalizePdaDetail(resp.data, row.pdaNumber));
      setOpenPdaDetail(true);
      setLoading(false);
    }, (err) => {
      setLoading(false);
      notifyError(err, 'page.moduleAudit.msg.pdaError');
    });
  };

  useEffect(() => {
    request.GET(`${BASE_PATH}/modules`, (resp) => setModules(Array.isArray(resp.data) ? resp.data : []), () => { });
    run({ moduleId, dateStart, dateEnd }, 'all', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusCell = ({ row }) => <span className={STATUS_CLASS[row.original.status]}>{t(STATUS_LABELS[row.original.status])}</span>;

  const table = {
    title: IntlMessages('page.moduleAudit.table.title'),
    columns: [
      { text: IntlMessages('table.column.date'), dataField: 'date', type: 'date', headerStyle: { width: '8%' } },
      { text: IntlMessages('page.moduleAudit.table.document'), dataField: 'documentName', headerStyle: { width: '12%' } },
      { text: IntlMessages('page.moduleAudit.table.description'), dataField: 'description', headerStyle: { width: '24%' } },
      { text: IntlMessages('page.moduleAudit.table.documentNumber'), dataField: 'documentNumber', headerStyle: { width: '11%' } },
      { text: IntlMessages('page.moduleAudit.table.value'), dataField: 'value', type: 'number', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.moduleAudit.table.accountingValue'), dataField: 'accountingValue', type: 'number', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.moduleAudit.table.difference'), dataField: 'difference', type: 'number', headerStyle: { width: '9%' } },
      { text: IntlMessages('page.moduleAudit.table.status'), dataField: 'status', headerStyle: { width: '11%' }, cell: statusCell },
      {
        text: '',
        dataField: 'actions',
        headerStyle: { width: '4%' },
        cell: ({ row }) => (row.original.pdaNumber ? (
          <i className="bi bi-eye-fill cursor-pointer" title={t('page.moduleAudit.table.viewPda')} onClick={() => fnOpenPdaDetail(row.original)} />
        ) : null)
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

  const summaryTable = {
    title: IntlMessages('page.moduleAudit.tab.summary'),
    columns: [
      { text: IntlMessages('page.moduleAudit.input.module'), dataField: 'moduleName', headerStyle: { width: '20%' } },
      { text: IntlMessages('page.moduleAudit.summary.documents'), dataField: 'count', headerStyle: { width: '8%' }, cell: ({ row }) => String(row.original.count) },
      { text: IntlMessages('page.moduleAudit.table.value'), dataField: 'value', type: 'number', headerStyle: { width: '12%' } },
      { text: IntlMessages('page.moduleAudit.table.accountingValue'), dataField: 'accountingValue', type: 'number', headerStyle: { width: '12%' } },
      { text: IntlMessages('page.moduleAudit.table.difference'), dataField: 'difference', type: 'number', headerStyle: { width: '11%' } },
      { text: IntlMessages('page.moduleAudit.table.status.noPda'), dataField: 'noPda', headerStyle: { width: '8%' }, cell: ({ row }) => String(row.original.noPda) },
      { text: IntlMessages('page.moduleAudit.table.status.missingPda'), dataField: 'missingPda', headerStyle: { width: '9%' }, cell: ({ row }) => String(row.original.missingPda) },
      { text: IntlMessages('page.moduleAudit.table.status.mismatch'), dataField: 'mismatch', headerStyle: { width: '8%' }, cell: ({ row }) => String(row.original.mismatch) },
      {
        text: '',
        dataField: 'actions',
        headerStyle: { width: '4%' },
        cell: ({ row }) => (row.original.count > 0 ? (
          <i className="bi bi-eye-fill cursor-pointer" title={t('page.moduleAudit.summary.view')} onClick={() => fnPickModule(row.original.moduleId)} />
        ) : null)
      }
    ],
    data: summary.map((r) => ({ ...r, noPda: r.counts.noPda, missingPda: r.counts.missingPda, mismatch: r.counts.mismatch })),
    options: { pageSize: 10 }
  };

  const propsToHeader = { moduleId, dateStart, dateEnd, modules, errors, sendForm, onInputChange, fnSearch, fnExportXlsx };

  const propsToTotals = {
    count: String(totals.count),
    value: formatNumber(totals.value),
    accountingValue: formatNumber(totals.accountingValue),
    difference: formatNumber(totals.difference),
    statusFilter,
    setStatusFilter,
    allLabel: `${t('page.moduleAudit.filter.all')} (${counts.all})`,
    issuesLabel: `${t('page.moduleAudit.filter.issues')} (${counts.issues})`
  };

  const propsToModalPdaDetail = {
    ModalContent: ModalPdaDetail,
    title: 'page.moduleAudit.modal.pdaDetail.title',
    open: openPdaDetail,
    setOpen: setOpenPdaDetail,
    maxWidth: 'md',
    data: { detail: pdaDetailData, formatNumber }
  };

  return { activeTab, setActiveTab, table, summaryTable, propsToHeader, propsToTotals, propsToModalPdaDetail };
};
