import { isRealDate } from '../cxcShared/cxcReportsRules';

// Reglas del Estado de Resultado (SPEC v2-135-sr), las mismas del back (`modules/accounting/incomeStatementReport/incomeStatementRules.js`): ruta, validación de filtros y lectura segura de la respuesta. El back decide y
// calcula (grupos, detalle por nivel, totales y avisos); aquí se evita el viaje y se explica el error antes de pedir.
export const BASE_PATH = 'accounting/reports/incomeStatementReport';

// Id de traducción del primer problema del filtro, o vacío si está bien.
export const validateFilter = ({ dateStart, dateEnd, level }) => {
  if (!String(dateStart ?? '').trim() || !String(dateEnd ?? '').trim()) return 'page.incomeStatementReport.msg.rangeRequired';
  if (!isRealDate(dateStart) || !isRealDate(dateEnd)) return 'page.incomeStatementReport.msg.dateInvalid';
  if (dateStart > dateEnd) return 'page.incomeStatementReport.msg.rangeInverted';
  if (!(Number(level) > 0)) return 'page.incomeStatementReport.msg.levelRequired';
  return '';
};

export const buildQuery = ({ dateStart, dateEnd, level }) => ({ dateStart, dateEnd, level: Number(level) });

const zeroNotice = { count: 0, debit: 0, credit: 0 };
export const normalizeStatement = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: data?.totals || null,
  notices: {
    nonResultAccounts: { ...zeroNotice, lines: 0, ...(data?.notices?.nonResultAccounts || {}) },
    excludedClosing: { ...zeroNotice, ...(data?.notices?.excludedClosing || {}) }
  }
});

// Avisos que tienen algo que mostrar: cuentas contadas de un tipo que no es de resultados y líneas de cierre excluidas.
export const activeNotices = (notices) => ['nonResultAccounts', 'excludedClosing'].filter((key) => Number(notices?.[key]?.count) > 0).map((key) => ({ key, ...notices[key] }));

// Niveles del combo: solo los que el back ofrece; el primero queda elegido si todavía no hay uno.
export const defaultLevel = (levels, current) => (Number(current) > 0 || !Array.isArray(levels) || levels.length === 0 ? Number(current) || 0 : Number(levels[0].value));
