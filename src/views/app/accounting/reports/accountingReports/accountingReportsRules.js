import { isRealDate } from '../cxcShared/cxcReportsRules';

// Reglas de los Reportes Contables (SPEC v2-134-sr), las mismas del back (`modules/accounting/accountingReports/accountingReportRules.js`): ruta, validación de filtros, nombres de archivo y lectura segura de
// las respuestas. El back decide y calcula (agrupación por nivel, saldos y totales); aquí se evita el viaje y se explica el error antes de pedir.
export const BASE_PATH = 'accounting/reports/accountingReports';
export const KINDS = ['income', 'expenses'];
export const MODES = ['monthly', 'annual', 'range'];
export const MIN_YEAR = 1990;
export const MAX_YEAR = 2100;

// Id de traducción del primer problema del filtro, o vacío si está bien.
export const validateFilter = ({ kind, mode, year, dateStart, dateEnd, level }) => {
  if (!KINDS.includes(kind) || !MODES.includes(mode)) return 'page.accountingReports.msg.kindRequired';
  if (!(Number(level) > 0)) return 'page.accountingReports.msg.levelRequired';
  if (mode === 'range') {
    if (!String(dateStart ?? '').trim() || !String(dateEnd ?? '').trim()) return 'page.accountingReports.msg.rangeRequired';
    if (!isRealDate(dateStart) || !isRealDate(dateEnd)) return 'page.accountingReports.msg.dateInvalid';
    if (dateStart > dateEnd) return 'page.accountingReports.msg.rangeInverted';
    return '';
  }
  const text = String(year ?? '').trim();
  const value = /^\d{4}$/.test(text) ? Number(text) : 0;
  return value >= MIN_YEAR && value <= MAX_YEAR ? '' : 'page.accountingReports.msg.yearInvalid';
};

// Consulta/cuerpo: por fechas manda las fechas; mensual y anual mandan el año.
export const buildQuery = ({ kind, mode, year, dateStart, dateEnd, level }) => (mode === 'range'
  ? { kind, mode, level: Number(level), dateStart, dateEnd }
  : { kind, mode, level: Number(level), year: Number(year) });

// Nombre del archivo, igual que el que arma el back.
export const fileNameOf = ({ kind, mode }) => `Reporte${kind === 'income' ? 'Ingresos' : 'CostosGastos'}${{ monthly: 'Mensual', annual: 'ResumenAnual', range: 'PorFechas' }[mode]}.xlsx`;

const zeroNotice = { count: 0, debit: 0, credit: 0 };
export const normalizeReport = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: { total: 0, ...(data?.totals || {}) },
  notices: {
    noAccount: { ...zeroNotice, ...(data?.notices?.noAccount || {}) },
    notInCatalog: { ...zeroNotice, ...(data?.notices?.notInCatalog || {}) },
    unknownType: { ...zeroNotice, ...(data?.notices?.unknownType || {}) },
    excludedClosing: { ...zeroNotice, ...(data?.notices?.excludedClosing || {}) }
  }
});

// Avisos que tienen algo que mostrar, en orden fijo.
export const activeNotices = (notices) => ['noAccount', 'notInCatalog', 'unknownType', 'excludedClosing'].filter((key) => Number(notices?.[key]?.count) > 0).map((key) => ({ key, ...notices[key] }));

export const monthLabels = (locale = 'es') => Array.from({ length: 12 }, (_, i) => new Date(2000, i, 1).toLocaleString(locale, { month: 'short' }));
