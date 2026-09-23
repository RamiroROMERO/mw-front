import { useState } from 'react';
import { IntlMessages } from '@Helpers/Utils';
import DateHelper from '@Helpers/DateHelper';
import { useForm, useExportExcel } from '@Hooks';
import { request } from '@Helpers/core';
import ModalByType from './ModalByType';

export const WEEK_FIELDS = ['week1', 'week2', 'week3', 'week4', 'week5', 'week6', 'week7', 'week8', 'weekTotal'];
export const AGING_FIELDS = ['valCurr', 'val30', 'val60', 'val90', 'val120', 'val150', 'valMore', 'agingTotal'];
export const FIELD_LABELS = {
  week1: 'page.cashFlow.table.week1', week2: 'page.cashFlow.table.week2', week3: 'page.cashFlow.table.week3',
  week4: 'page.cashFlow.table.week4', week5: 'page.cashFlow.table.week5', week6: 'page.cashFlow.table.week6',
  week7: 'page.cashFlow.table.week7', week8: 'page.cashFlow.table.week8', weekTotal: 'table.column.total',
  valCurr: 'page.cashFlow.table.current', val30: 'page.cashFlow.table.days30', val60: 'page.cashFlow.table.days60',
  val90: 'page.cashFlow.table.days90', val120: 'page.cashFlow.table.days120', val150: 'page.cashFlow.table.days150',
  valMore: 'page.cashFlow.table.daysMore', agingTotal: 'table.column.total'
};

const emptyByType = { open: false, title: '', rows: [], fields: WEEK_FIELDS };

export const useCashFlow = ({ setLoading }) => {
  const { fnExport } = useExportExcel(setLoading);
  const { formState, onInputChange } = useForm({ date: DateHelper.format(DateHelper.now()) });
  const { date } = formState;

  const [activeTab, setActiveTab] = useState('1');
  const [summary, setSummary] = useState(null);
  const [payableRows, setPayableRows] = useState([]);
  const [receivableRows, setReceivableRows] = useState([]);
  const [byType, setByType] = useState(emptyByType);

  const fnSearch = () => {
    setLoading(true);
    Promise.all([
      new Promise((resolve) => request.POST('accounting/process/cashFlow', { date }, (resp) => resolve(resp.data), () => resolve(null))),
      new Promise((resolve) => request.POST('accounting/process/cashFlow/payable', { date }, (resp) => resolve(resp.data), () => resolve([]))),
      new Promise((resolve) => request.POST('accounting/process/cashFlow/receivable', { date }, (resp) => resolve(resp.data), () => resolve([])))
    ]).then(([summaryData, payableData, receivableData]) => {
      setSummary(summaryData);
      setPayableRows(payableData || []);
      setReceivableRows(receivableData || []);
      setLoading(false);
    });
  }

  const fnOpenByType = (rows, fields, title) => {
    const grouped = {};
    rows.forEach((row) => {
      const key = row.typeName || '';
      if (!grouped[key]) {
        grouped[key] = { typeName: key };
        fields.forEach((f) => { grouped[key][f] = 0; });
      }
      fields.forEach((f) => { grouped[key][f] += Number(row[f] || 0); });
    });
    setByType({ open: true, title, rows: Object.values(grouped), fields });
  }

  const setByTypeOpen = (open) => setByType((prev) => ({ ...prev, open }));

  const fnPrintPayable = () => {
    setLoading(true);
    request.GETPdf('accounting/process/cashFlow/payable/exportPDF', { date }, 'FlujoEfectivoDetalle.pdf', () => setLoading(false));
    setLoading(false);
  }
  const fnExportPayableXlsx = () => fnExport('accounting/process/cashFlow/payable/exportXLSX', { date }, 'CuentaPorPagar.xlsx');

  const fnPrintReceivable = () => {
    setLoading(true);
    request.GETPdf('accounting/process/cashFlow/receivable/exportPDF', { date }, 'FlujoEfectivoDetalle.pdf', () => setLoading(false));
    setLoading(false);
  }
  const fnExportReceivableXlsx = () => fnExport('accounting/process/cashFlow/receivable/exportXLSX', { date }, 'CuentaPorCobrar.xlsx');

  const fnPrintSummary = () => {
    setLoading(true);
    request.GETPdf('accounting/process/cashFlow/exportPDF', { date }, 'FlujoEfectivo.pdf', () => setLoading(false));
    setLoading(false);
  }
  const fnExportSummaryXlsx = () => fnExport('accounting/process/cashFlow/exportXLSX', { date }, 'FlujoEfectivo.xlsx');

  const propsToHeader = {
    date,
    onInputChange,
    fnSearch,
    fnPrintSummary,
    fnExportSummaryXlsx
  }

  const propsToResumenTab = {
    summary,
    weekFields: WEEK_FIELDS,
    agingFields: AGING_FIELDS
  }

  const propsToPayableTab = {
    rows: payableRows,
    nameField: 'providerName',
    nameLabel: IntlMessages('page.cashFlow.table.provider'),
    fnOpenByType,
    fnPrint: fnPrintPayable,
    fnExportXlsx: fnExportPayableXlsx
  }

  const propsToReceivableTab = {
    rows: receivableRows,
    nameField: 'customerName',
    nameLabel: IntlMessages('page.cashFlow.table.customer'),
    fnOpenByType,
    fnPrint: fnPrintReceivable,
    fnExportXlsx: fnExportReceivableXlsx
  }

  const propsToModalByType = {
    ModalContent: ModalByType,
    title: byType.title,
    open: byType.open,
    setOpen: setByTypeOpen,
    maxWidth: 'lg',
    data: { rows: byType.rows, fields: byType.fields }
  }

  return {
    activeTab,
    setActiveTab,
    propsToHeader,
    propsToResumenTab,
    propsToPayableTab,
    propsToReceivableTab,
    propsToModalByType
  }
}
