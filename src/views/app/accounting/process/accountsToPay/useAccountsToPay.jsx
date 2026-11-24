import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { IntlMessages, getPrivilegeData } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl, notifyError } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import ModalDetail from './ModalDetail';
import ModalReports from './ModalReports';
import {
  PRIVILEGE_SCREEN, ADMIN_DELETE_PRIVILEGE, BASE_PATH, SUMMARY_PATH, DETAIL_PATH, ADVANCES_PATH, MAX_DOCUMENT_COMMENT, MAX_PROVIDER_COMMENT,
  buildReportBody, commentChanged, normalizeDetail, validateComment, validateQuery, validateReport
} from './accountsToPayRules';

// Cuentas por Pagar (cont_cxp.sc2 y cont_cxpdeta.sc2, SPEC v2-124-sr). El saldo es el de la FECHA DE CORTE: los pagos y las notas cuentan solo hasta esa fecha. El detalle trae del back abono, notas,
// acumulado, estado, tramos y datos del proveedor. Se puede editar el comentario de la factura y del proveedor (`fn_update`) y eliminar una cuenta por pagar sin pagos (`fn_delete` y el privilegio
// de administrador 99.20.004); el back vuelve a validar todo. Imprimir y exportar descargan lo que arma el back (en memoria).
export const useAccountsToPay = ({ setLoading }) => {
  const intl = useIntl();
  const t = (id, values) => intl.formatMessage({ id }, values);
  const { fnExport } = useExportExcel(setLoading);
  const { formState, onInputChange } = useForm({ date: DateHelper.format(DateHelper.now()), search: '' });
  const { date, search } = formState;

  const [allRows, setAllRows] = useState([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [openReports, setOpenReports] = useState(false);
  const [sendForm, setSendForm] = useState(false);
  const [sendReport, setSendReport] = useState(false);
  const [providerComment, setProviderComment] = useState('');
  const [editing, setEditing] = useState({ id: 0, text: '' });
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null);
  const { formState: reportForm, onInputChange: onReportInputChange } = useForm({ mode: '1', date: DateHelper.format(DateHelper.now()) });
  const { mode: reportMode, date: reportDate } = reportForm;

  const privileges = useMemo(() => {
    try {
      const screen = getPrivilegeData(PRIVILEGE_SCREEN);
      const admin = getPrivilegeData(ADMIN_DELETE_PRIVILEGE);
      return { update: Boolean(screen.fnUpdate), delete: Boolean(screen.fnDelete), admin: Boolean(admin.active) };
    } catch {
      return { update: false, delete: false, admin: false };
    }
  }, []);

  const queryErrors = useMemo(() => validateQuery({ date }), [date]);
  const reportErrors = useMemo(() => validateReport({ mode: reportMode, date: reportDate }), [reportMode, reportDate]);

  // Un filtro inválido se marca y NO llama al back.
  const isQueryValid = () => {
    setSendForm(true);
    if (Object.keys(queryErrors).length > 0) {
      NotificationManager.warning(t(Object.values(queryErrors)[0]), '', 4000, null, null, '');
      return false;
    }
    return true;
  };

  const fnSearch = () => {
    if (!isQueryValid()) return;
    setLoading(true);
    request.GET(buildUrl(SUMMARY_PATH, { date }), (resp) => {
      setAllRows(resp.data);
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const fnFilterData = (rows, value) => {
    if (!value) return rows;
    const upperValue = value.toUpperCase();
    return rows.filter((r) => `${r.providerId}${r.providerName || ''}${r.rtn || ''}`.toUpperCase().includes(upperValue));
  };

  const onSearchChange = (e) => onInputChange(e);

  const loadDetail = (provider) => {
    setLoading(true);
    const get = (path, query) => new Promise((resolve) => request.GET(buildUrl(path, query), (resp) => resolve(resp.data), () => resolve(null)));
    Promise.all([get(DETAIL_PATH, { providerId: provider.providerId, date }), get(ADVANCES_PATH, { providerId: provider.providerId })]).then(([detailResp, advances]) => {
      if (!detailResp) { setLoading(false); return; }
      const detail = normalizeDetail(detailResp);
      setDetailData({ ...detail, providerId: provider.providerId, providerName: detail.provider.name || provider.providerName, date, advances: advances || [] });
      setProviderComment(detail.providerComment);
      setOpenDetail(true);
      setLoading(false);
    });
  };

  const fnOpenDetail = (row) => {
    if (!isQueryValid()) return;
    setEditing({ id: 0, text: '' });
    loadDetail(row);
  };

  const table = {
    title: IntlMessages('page.accountsToPay.table.title'),
    columns: [
      { text: IntlMessages('table.column.code'), dataField: 'providerId', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.accountsToPay.table.provider'), dataField: 'providerName', headerStyle: { width: '55%' } },
      { text: IntlMessages('page.accountsToPay.table.rtn'), dataField: 'rtn', headerStyle: { width: '20%' } },
      { text: IntlMessages('page.accountsToPay.table.total'), dataField: 'balance', type: 'number', headerStyle: { width: '15%' } },
      {
        text: '',
        dataField: 'actions',
        headerStyle: { width: '5%' },
        cell: ({ row }) => (
          <i
            className="bi bi-eye-fill cursor-pointer"
            title={IntlMessages('page.accountsToPay.table.viewDetail')}
            onClick={() => fnOpenDetail(row.original)}
          />
        )
      }
    ],
    data: fnFilterData(allRows, search)
  };

  // Descargas: las arma el back en memoria con la misma fecha y proveedor de la pantalla. GETPdf no notifica por sí mismo: el error se avisa aquí con el mensaje real del back.
  const fnDownloadPdf = (path, data, fileName) => {
    setLoading(true);
    request.GETPdf(path, data, fileName, (err) => { setLoading(false); notifyError(err, 'msg.export.record.error'); }, 'POST', () => setLoading(false));
  };
  const detailBody = () => ({ providerId: detailData.providerId, date: detailData.date });

  const fnPrintSummary = () => { if (isQueryValid()) fnDownloadPdf(`${SUMMARY_PATH}/exportPDF`, { date }, 'CuentasPorPagar.pdf'); };
  const fnExportSummaryXlsx = () => { if (isQueryValid()) fnExport(`${SUMMARY_PATH}/exportXLSX`, { date }, 'CuentasPorPagar.xlsx'); };
  const fnPrintDetail = () => { if (detailData) fnDownloadPdf(`${DETAIL_PATH}/exportPDF`, detailBody(), 'DetalleCuentaPorPagar.pdf'); };
  const fnExportDetailXlsx = () => { if (detailData) fnExport(`${DETAIL_PATH}/exportXLSX`, detailBody(), 'DetalleCuentaPorPagar.xlsx'); };

  // Botón "Reportes" (Controlpanelbtn5 de cont_cxp.sc2 -> Do form 'cont_cxp_print'): el legacy cierra el picker antes de correr el reporte. Los modos 2 y 3 exigen fecha de corte.
  const fnOpenReports = () => { setSendReport(false); setOpenReports(true); };
  const isReportValid = () => {
    setSendReport(true);
    return Object.keys(reportErrors).length === 0;
  };
  const fnPrintReport = () => {
    if (!isReportValid()) return;
    setOpenReports(false);
    fnDownloadPdf(`${BASE_PATH}/detailReport/exportPDF`, buildReportBody({ mode: reportMode, date: reportDate }), 'DetalleCuentasPorPagar.pdf');
  };
  const fnExportReportXlsx = () => {
    if (!isReportValid()) return;
    setOpenReports(false);
    fnExport(`${BASE_PATH}/detailReport/exportXLSX`, buildReportBody({ mode: reportMode, date: reportDate }), 'DetalleCuentasPorPagar.xlsx');
  };

  const refreshAfterChange = () => {
    fnSearch();
    if (detailData) loadDetail({ providerId: detailData.providerId, providerName: detailData.providerName });
  };

  // Comentario de la factura (doble clic del legacy): se edita en la fila y se guarda con `PUT /:id/comment`.
  const fnStartEdit = (row) => { if (privileges.update) setEditing({ id: row.id, text: row.description || '' }); };
  const fnCancelEdit = () => setEditing({ id: 0, text: '' });
  const onEditText = (e) => setEditing((prev) => ({ ...prev, text: e.target.value }));
  const editError = editing.id ? validateComment(editing.text, MAX_DOCUMENT_COMMENT) : '';
  const fnSaveEdit = () => {
    const original = detailData.rows.find((r) => r.id === editing.id);
    if (editError) { NotificationManager.warning(t(editError), '', 4000, null, null, ''); return; }
    if (!commentChanged(editing.text, original?.description)) { fnCancelEdit(); return; }
    setLoading(true);
    request.PUT(`${BASE_PATH}/${editing.id}/comment`, { description: editing.text }, () => { fnCancelEdit(); refreshAfterChange(); }, () => setLoading(false));
  };

  // Comentario del proveedor (`cont_cxp_comment`).
  const providerCommentError = validateComment(providerComment, MAX_PROVIDER_COMMENT);
  const fnSaveProviderComment = () => {
    if (!detailData || !privileges.update) return;
    if (providerCommentError) { NotificationManager.warning(t(providerCommentError), '', 4000, null, null, ''); return; }
    if (!commentChanged(providerComment, detailData.providerComment)) return;
    setLoading(true);
    request.PUT(`${BASE_PATH}/providerComment/${detailData.providerId}`, { comment: providerComment }, () => {
      setDetailData((prev) => ({ ...prev, providerComment: providerComment.trim() }));
      setLoading(false);
    }, () => setLoading(false));
  };

  // Eliminar una cuenta por pagar sin pagos (solo con `fn_delete` y el privilegio de administrador).
  const fnAskDelete = (row) => { setDeleteRow(row); setOpenDelete(true); };
  const fnDeleteOk = () => {
    setOpenDelete(false);
    setLoading(true);
    request.DELETE(`${BASE_PATH}/${deleteRow.id}`, () => refreshAfterChange(), () => setLoading(false));
  };

  useEffect(() => {
    fnSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const propsToHeader = {
    date,
    search,
    errors: queryErrors,
    sendForm,
    onInputChange,
    onSearchChange,
    fnSearch,
    fnPrint: fnPrintSummary,
    fnExportXlsx: fnExportSummaryXlsx,
    fnOpenReports
  };

  const propsToModalDetail = {
    ModalContent: ModalDetail,
    title: 'page.accountsToPay.modal.detail.title',
    open: openDetail,
    setOpen: setOpenDetail,
    maxWidth: 'xl',
    data: {
      detail: detailData,
      privileges,
      editing,
      editError,
      onEditText,
      fnStartEdit,
      fnCancelEdit,
      fnSaveEdit,
      providerComment,
      setProviderComment,
      providerCommentError,
      fnSaveProviderComment,
      fnAskDelete,
      fnPrint: fnPrintDetail,
      fnExportXlsx: fnExportDetailXlsx
    }
  };

  const propsToModalReports = {
    ModalContent: ModalReports,
    title: 'page.accountsToPay.modal.reports.title',
    open: openReports,
    setOpen: setOpenReports,
    maxWidth: 'sm',
    data: {
      mode: reportMode,
      date: reportDate,
      errors: sendReport ? reportErrors : {},
      onInputChange: onReportInputChange,
      fnPrint: fnPrintReport,
      fnExportXlsx: fnExportReportXlsx
    }
  };

  const propsToMsgDelete = {
    open: openDelete,
    setOpen: setOpenDelete,
    fnOnOk: fnDeleteOk,
    title: 'page.accountsToPay.msg.deleteConfirm'
  };

  return { table, propsToHeader, propsToModalDetail, propsToModalReports, propsToMsgDelete, fnOpenDetail };
};
