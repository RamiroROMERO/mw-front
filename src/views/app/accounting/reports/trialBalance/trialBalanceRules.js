import { isRealDate } from '../cxcShared/cxcReportsRules';

// Reglas de la Balanza de Comprobación (SPEC v2-137-sr), las mismas del back (`modules/accounting/trialBalance/trialBalanceRules.js`): ruta, validación de filtros y lectura segura de la respuesta.
// El back decide y calcula (acumulado, rango, saldos, control y avisos); aquí se explica el error antes de pedir.
export const BASE_PATH = 'accounting/reports/trialBalance';

// Id de traducción del primer problema del filtro, o vacío si está bien.
export const validateFilter = ({ dateStart, dateEnd, level }) => {
  if (!String(dateStart ?? '').trim() || !String(dateEnd ?? '').trim()) return 'page.trialBalance.msg.rangeRequired';
  if (!isRealDate(dateStart) || !isRealDate(dateEnd)) return 'page.trialBalance.msg.dateInvalid';
  if (dateStart > dateEnd) return 'page.trialBalance.msg.rangeInverted';
  if (!(Number(level) > 0)) return 'page.trialBalance.msg.levelRequired';
  return '';
};

export const buildQuery = ({ dateStart, dateEnd, level }) => ({ dateStart, dateEnd, level: Number(level) });

// La balanza anual integrada usa el año de "Desde".
export const validateAnnual = ({ dateStart, level }) => {
  if (!String(dateStart ?? '').trim()) return 'page.trialBalance.msg.rangeRequired';
  if (!isRealDate(dateStart)) return 'page.trialBalance.msg.dateInvalid';
  if (!(Number(level) > 0)) return 'page.trialBalance.msg.levelRequired';
  return '';
};
export const buildAnnualQuery = ({ dateStart, level }) => ({ year: Number(String(dateStart).slice(0, 4)), level: Number(level) });

const zero = { count: 0, lines: 0, debit: 0, credit: 0 };
export const normalizeBalance = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: data?.totals || null,
  notices: {
    noAccount: { ...zero, ...(data?.notices?.noAccount || {}) },
    otherTypes: { ...zero, types: [], ...(data?.notices?.otherTypes || {}) }
  }
});

// Avisos con algo que mostrar, en orden fijo.
export const activeNotices = (notices) => {
  const list = [];
  if (Number(notices?.noAccount?.count) > 0) list.push({ key: 'noAccount', ...notices.noAccount });
  if (Number(notices?.otherTypes?.count) > 0) list.push({ key: 'otherTypes', ...notices.otherTypes });
  return list;
};

// Un control cuadra solo con diferencia 0 al centavo.
export const isBalanced = (difference) => Math.abs(Number(difference)) < 0.005;

// Nivel inicial: el último que ofrece el back (la cuenta de detalle); si ya hay uno elegido se respeta.
export const defaultLevel = (levels, current) => (Number(current) > 0 || !Array.isArray(levels) || levels.length === 0 ? Number(current) || 0 : Number(levels[levels.length - 1].value));
