import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { IntlMessages, getPrivilegeData } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl, notifyError } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import ModalDetail from './ModalDetail';
import {
  PRIVILEGE_SCREEN, ADMIN_DELETE_PRIVILEGE, SUMMARY_PATH, DETAIL_PATH, SETTINGS_PATH, CURRENCY_LEMPIRAS, INITIAL_EDIT_FORM,
  buildQuery, buildEditPayload, canDeleteRow, canEditRow, currencyLabel, effectiveCurrency, mapRowToEditForm, normalizeDetail, normalizeSettings, validateEditForm, validateQuery
} from './accountsReceivableRules';

const CXC_PATH = 'accounting/process/cxc';
const SUMMARY_FILE = 'CuentasPorCobrar';
const DETAIL_FILE = 'DetalleCuentaPorCobrar';

// Cuentas por Cobrar (cont_cxc.sc2 y cont_cxcdeta.sc2, SPEC v2-123-sr). El saldo es el de la FECHA DE CORTE: los pagos y las notas cuentan solo hasta esa fecha. La moneda Dólares solo se ofrece si
// la empresa factura en Lempiras y Dólares (`GET cxc/settings`). El detalle trae del back abono, notas, acumulado, estado, tramos y datos de cobro. La cartera manual (tipo 5) sin cobros se puede
// editar (`fn_update`) y eliminar (`fn_delete` y el privilegio de administrador 99.20.004); el back vuelve a validar todo. Imprimir y exportar descargan lo que arma el back (en memoria).
export const useAccountsReceivable = ({ setLoading }) => {
  const intl = useIntl();
  const t = (id, values) => intl.formatMessage({ id }, values);
  const { fnExport } = useExportExcel(setLoading);
  const { formState, onInputChange } = useForm({ date: DateHelper.format(DateHelper.now()), customerTypeId: 0, search: '', currency: CURRENCY_LEMPIRAS });
  const { date, customerTypeId, search, currency } = formState;

  const [settings, setSettings] = useState(() => normalizeSettings());
  const [allRows, setAllRows] = useState([]);
  const [listCustomerTypes, setListCustomerTypes] = useState([]);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [sendForm, setSendForm] = useState(false);
  const [editForm, setEditForm] = useState({ ...INITIAL_EDIT_FORM });
  const [editing, setEditing] = useState(false);
  const [sendEdit, setSendEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteRow, setDeleteRow] = useState(null);

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
  const editErrors = useMemo(() => validateEditForm(editForm, DateHelper.format(DateHelper.now())), [editForm]);
  const currentCurrency = effectiveCurrency(currency, settings);
  const baseQuery = () => buildQuery({ date, customerTypeId, currency }, settings);
  const detailQuery = (customerId) => buildQuery({ date, customerTypeId: 0, currency }, settings, { customerId });

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
    request.GET(buildUrl(SUMMARY_PATH, baseQuery()), (resp) => {
      setAllRows(resp.data);
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const fnFilterData = (rows, value) => {
    if (!value) return rows;
    const upperValue = value.toUpperCase();
    return rows.filter((r) => `${r.customerId}${r.customerName || ''}${r.rtn || ''}`.toUpperCase().includes(upperValue));
  };

  const onSearchChange = (e) => onInputChange(e);

  const loadDetail = (customer) => {
    setLoading(true);
    request.GET(buildUrl(DETAIL_PATH, detailQuery(customer.customerId)), (resp) => {
      const detail = normalizeDetail(resp.data);
      setDetailData({ ...detail, customerId: customer.customerId, customerName: detail.customer.name || customer.customerName, date, currency: currentCurrency });
      setOpenDetail(true);
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const fnOpenDetail = (row) => {
    if (!isQueryValid()) return;
    setEditing(false);
    loadDetail(row);
  };

  const table = {
    title: IntlMessages('page.accountsReceivable.table.title'),
    columns: [
      { text: IntlMessages('table.column.code'), dataField: 'customerId', headerStyle: { width: '10%' } },
      { text: IntlMessages('page.accountsReceivable.table.customer'), dataField: 'customerName', headerStyle: { width: '55%' } },
      { text: IntlMessages('page.accountsReceivable.table.rtn'), dataField: 'rtn', headerStyle: { width: '20%' } },
      { text: `${IntlMessages('page.accountsReceivable.table.total')} (${IntlMessages(currencyLabel(currentCurrency))})`, dataField: 'balance', type: 'number', headerStyle: { width: '15%' } },
      {
        text: '',
        dataField: 'actions',
        headerStyle: { width: '5%' },
        cell: ({ row }) => (
          <i
            className="bi bi-eye-fill cursor-pointer"
            title={IntlMessages('page.accountsReceivable.table.viewDetail')}
            onClick={() => fnOpenDetail(row.original)}
          />
        )
      }
    ],
    data: fnFilterData(allRows, search)
  };

  // Descargas: las arma el back en memoria con la misma fecha, moneda y filtros de la pantalla. GETPdf no notifica por sí mismo: el error se avisa aquí con el mensaje real del back.
  const fnDownloadPdf = (path, data, fileName) => {
    setLoading(true);
    request.GETPdf(path, data, fileName, (err) => { setLoading(false); notifyError(err, 'msg.export.record.error'); }, 'POST', () => setLoading(false));
  };
  const detailBody = () => buildQuery({ date: detailData.date, customerTypeId: 0, currency: detailData.currency }, { hasDualCurrency: true }, { customerId: detailData.customerId });

  const fnPrintSummary = () => { if (isQueryValid()) fnDownloadPdf(`${SUMMARY_PATH}/exportPDF`, baseQuery(), `${SUMMARY_FILE}.pdf`); };
  const fnExportSummaryXlsx = () => { if (isQueryValid()) fnExport(`${SUMMARY_PATH}/exportXLSX`, baseQuery(), `${SUMMARY_FILE}.xlsx`); };
  const fnPrintDetail = () => { if (detailData) fnDownloadPdf(`${DETAIL_PATH}/exportPDF`, detailBody(), `${DETAIL_FILE}.pdf`); };
  const fnExportDetailXlsx = () => { if (detailData) fnExport(`${DETAIL_PATH}/exportXLSX`, detailBody(), `${DETAIL_FILE}.xlsx`); };

  // Editar / eliminar la cartera manual desde el detalle. Después de guardar se recarga el detalle y el resumen (el saldo cambió).
  const refreshAfterChange = () => {
    fnSearch();
    if (detailData) loadDetail({ customerId: detailData.customerId, customerName: detailData.customerName });
  };

  const fnStartEdit = (row) => {
    if (!canEditRow(row, privileges)) return;
    setEditForm(mapRowToEditForm(row));
    setSendEdit(false);
    setEditing(true);
  };
  const fnCancelEdit = () => { setEditing(false); setSendEdit(false); };
  const onEditChange = (e) => setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const fnSaveEdit = () => {
    setSendEdit(true);
    if (Object.keys(editErrors).length > 0) return;
    const original = detailData.rows.find((r) => r.id === editForm.id);
    const payload = buildEditPayload(editForm, original || {});
    if (Object.keys(payload).length === 0) { fnCancelEdit(); return; }
    setLoading(true);
    request.PUT(`${CXC_PATH}/${editForm.id}`, payload, () => {
      setEditing(false);
      setSendEdit(false);
      refreshAfterChange();
    }, () => setLoading(false));
  };

  const fnAskDelete = (row) => {
    if (!canDeleteRow(row, privileges)) return;
    setDeleteRow(row);
    setOpenDelete(true);
  };
  const fnDeleteOk = () => {
    setOpenDelete(false);
    setLoading(true);
    request.DELETE(`${CXC_PATH}/${deleteRow.id}`, () => refreshAfterChange(), () => setLoading(false));
  };

  useEffect(() => {
    request.GET('admin/customerTypes/getForCustomers', (resp) => {
      setListCustomerTypes(resp.data.map((item) => ({ label: item.name, value: item.id })));
    }, () => { });
    request.GET(SETTINGS_PATH, (resp) => setSettings(normalizeSettings(resp.data)), () => setSettings(normalizeSettings()));
    fnSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const propsToHeader = {
    date,
    customerTypeId,
    search,
    currency: currentCurrency,
    hasDualCurrency: settings.hasDualCurrency,
    listCustomerTypes,
    errors: queryErrors,
    sendForm,
    onInputChange,
    onSearchChange,
    fnSearch,
    fnPrint: fnPrintSummary,
    fnExportXlsx: fnExportSummaryXlsx
  };

  const propsToModalDetail = {
    ModalContent: ModalDetail,
    title: 'page.accountsReceivable.modal.detail.title',
    open: openDetail,
    setOpen: setOpenDetail,
    maxWidth: 'xl',
    data: {
      detail: detailData,
      privileges,
      editing,
      editForm,
      editErrors: sendEdit ? editErrors : {},
      onEditChange,
      fnStartEdit,
      fnCancelEdit,
      fnSaveEdit,
      fnAskDelete,
      fnPrint: fnPrintDetail,
      fnExportXlsx: fnExportDetailXlsx
    }
  };

  const propsToMsgDelete = {
    open: openDelete,
    setOpen: setOpenDelete,
    fnOnOk: fnDeleteOk,
    title: 'page.accountsReceivable.msg.deleteConfirm'
  };

  return { table, propsToHeader, propsToModalDetail, propsToMsgDelete, fnOpenDetail };
};
