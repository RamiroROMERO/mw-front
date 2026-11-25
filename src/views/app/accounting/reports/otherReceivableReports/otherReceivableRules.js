import { buildAsOfQuery, effectiveCurrency, validateAsOfDate } from '../cxcShared/cxcReportsRules';

// Reglas de Otros Reportes de CxC (SPEC v2-139-sr), las mismas del back (`modules/accounting/otherReceivableReports/otherReceivableRules.js`): ruta, filtros y lectura segura de la respuesta.
// El back calcula el saldo a la fecha de corte, el estado de cada documento y los subtotales; aquí se explica el error antes de pedir.
export const BASE_PATH = 'accounting/reports/otherReceivableReports';

export const EXPIRY_OPTIONS = [
  { id: 'all', label: 'page.otherReceivableReports.expiry.all' },
  { id: 'noDue', label: 'page.otherReceivableReports.expiry.noDue' },
  { id: 'current', label: 'page.otherReceivableReports.expiry.current' },
  { id: 'd1to30', label: 'page.otherReceivableReports.expiry.d1to30' },
  { id: 'd31to60', label: 'page.otherReceivableReports.expiry.d31to60' },
  { id: 'd61to90', label: 'page.otherReceivableReports.expiry.d61to90' },
  { id: 'over90', label: 'page.otherReceivableReports.expiry.over90' }
];

// Id de traducción del primer problema del filtro, o vacío si está bien.
export const validateFilter = ({ date, expiry }) => {
  const dateError = validateAsOfDate(date);
  if (dateError) return dateError;
  if (!EXPIRY_OPTIONS.some((o) => o.id === expiry)) return 'page.otherReceivableReports.msg.expiryInvalid';
  return '';
};

// Consulta: fecha de corte, moneda (dólares solo si la empresa factura en ambas), cliente y tipo opcionales y vencimiento.
export const buildQuery = ({ date, currency, customerId, customerTypeId, expiry }, settings) => ({ ...buildAsOfQuery({ date, currency, customerId, customerTypeId }, settings), expiry });

export const normalizeStatement = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: { originalValue: 0, payments: 0, creditNotes: 0, debitNotes: 0, balance: 0, ...(data?.totals || {}) },
  counts: { customers: 0, documents: 0, ...(data?.counts || {}) }
});

export { effectiveCurrency };
