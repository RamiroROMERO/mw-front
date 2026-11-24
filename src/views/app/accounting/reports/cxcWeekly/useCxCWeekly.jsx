import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { IntlMessages } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request, buildUrl, notifyError } from '@Helpers/core';
import { NotificationManager } from '@Components/common/react-notifications';
import ModalDetail from '../../process/accountsReceivable/ModalDetail';
import { DETAIL_PATH, buildQuery as buildDetailQuery, normalizeDetail } from '../../process/accountsReceivable/accountsReceivableRules';
import { BASE_PATH, WEEK_FIELDS, buildAsOfQuery, effectiveCurrency, normalizeSettings, normalizeWeekly, validateAsOfDate } from '../cxcShared/cxcReportsRules';
import { useCxcSettings } from '../cxcShared/useCxcCustomers';

const WEEK_LABELS = {
  week1: 'page.cxcWeekly.table.week1', week2: 'page.cxcWeekly.table.week2', week3: 'page.cxcWeekly.table.week3', week4: 'page.cxcWeekly.table.week4', week5: 'page.cxcWeekly.table.week5',
  week6: 'page.cxcWeekly.table.week6', week7: 'page.cxcWeekly.table.week7', week8: 'page.cxcWeekly.table.week8', weekLater: 'page.cxcWeekly.table.weekLater', weekTotal: 'table.column.total'
};

// Cuentas por Cobrar semanal (cont_cxc_week.sc2, SPEC v2-132-sr): el saldo es el de la FECHA DE CORTE. La semana 1 es lo vencido y lo que vence hasta la fecha, las semanas 2 a 8 son de 7 días y "Posterior"
// completa el total (las columnas siempre suman). El back arma las filas y los totales; el detalle por cliente es el mismo de la pantalla de Cuentas por Cobrar (misma fecha y moneda).
export const useCxCWeekly = ({ setLoading }) => {
  const intl = useIntl();
  const { fnExport } = useExportExcel(setLoading);
  const settings = useCxcSettings(normalizeSettings);
  const { formState, onInputChange } = useForm({ date: DateHelper.format(DateHelper.now()), currency: 1 });
  const { date, currency } = formState;

  const [data, setData] = useState(normalizeWeekly(undefined));
  const [openDetail, setOpenDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const currentCurrency = effectiveCurrency(currency, settings);

  const isValid = () => {
    const error = validateAsOfDate(date);
    if (error) NotificationManager.warning(intl.formatMessage({ id: error }), '', 4000, null, null, '');
    return !error;
  };

  const fnSearch = () => {
    if (!isValid()) return;
    setLoading(true);
    request.GET(buildUrl(`${BASE_PATH}/weekly`, buildAsOfQuery({ date, currency }, settings)), (resp) => {
      setData(normalizeWeekly(resp.data));
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const detailBody = (d) => buildDetailQuery({ date: d.date, customerTypeId: 0, currency: d.currency }, { hasDualCurrency: true }, { customerId: d.customerId });

  const fnOpenDetail = (row) => {
    if (!isValid()) return;
    setLoading(true);
    request.GET(buildUrl(DETAIL_PATH, buildDetailQuery({ date, customerTypeId: 0, currency }, settings, { customerId: row.customerId })), (resp) => {
      const detail = normalizeDetail(resp.data);
      setDetailData({ ...detail, customerId: row.customerId, customerName: detail.customer.name || row.customerName, date, currency: currentCurrency });
      setOpenDetail(true);
      setLoading(false);
    }, () => { setLoading(false); });
  };

  const fnPrintDetail = () => {
    if (!detailData) return;
    setLoading(true);
    request.GETPdf(`${DETAIL_PATH}/exportPDF`, detailBody(detailData), 'DetalleCuentaPorCobrar.pdf', (err) => { setLoading(false); notifyError(err, 'msg.export.record.error'); }, 'POST', () => setLoading(false));
  };
  const fnExportDetailXlsx = () => { if (detailData) fnExport(`${DETAIL_PATH}/exportXLSX`, detailBody(detailData), 'DetalleCuentaPorCobrar.xlsx'); };
  const fnExportXlsx = () => { if (isValid()) fnExport(`${BASE_PATH}/weekly/exportXLSX`, buildAsOfQuery({ date, currency }, settings), 'CuentasPorCobrarSemanal.xlsx'); };

  const table = {
    title: IntlMessages('page.cxcWeekly.table.title'),
    columns: [
      { text: IntlMessages('page.cxcWeekly.table.customer'), dataField: 'customerName', headerStyle: { width: '22%' } },
      ...WEEK_FIELDS.map((f) => ({ text: IntlMessages(WEEK_LABELS[f]), dataField: f, type: 'number' })),
      {
        text: '', dataField: 'actions', headerStyle: { width: '3%' },
        cell: ({ row }) => (<i className="bi bi-eye-fill cursor-pointer" title={IntlMessages('page.cxcWeekly.table.viewDetail')} onClick={() => fnOpenDetail(row.original)} />)
      }
    ],
    data: data.rows,
    options: { pageSize: 10, pageSizeOptions: [10, 20, 50] }
  };

  const totalsTable = {
    columns: WEEK_FIELDS.map((f) => ({ text: IntlMessages(WEEK_LABELS[f]), dataField: f, type: 'number' })),
    data: [data.totals],
    options: { pageSize: 1 }
  };

  useEffect(() => {
    fnSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const propsToHeader = { date, currency, hasDualCurrency: settings.hasDualCurrency, onInputChange, fnSearch, fnExportXlsx };

  const propsToModalDetail = {
    ModalContent: ModalDetail,
    title: 'page.accountsReceivable.modal.detail.title',
    open: openDetail,
    setOpen: setOpenDetail,
    maxWidth: 'xl',
    data: {
      detail: detailData, privileges: { canEdit: false, canDelete: false }, editing: false, editForm: {}, editErrors: {},
      onEditChange: () => { }, fnStartEdit: () => { }, fnCancelEdit: () => { }, fnSaveEdit: () => { }, fnAskDelete: () => { },
      fnPrint: fnPrintDetail, fnExportXlsx: fnExportDetailXlsx
    }
  };

  return { table, totalsTable, propsToHeader, propsToModalDetail };
};
