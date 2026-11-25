import { isRealDate } from '../cxcShared/cxcReportsRules';

// Reglas del Balance General (SPEC v2-136-sr), las mismas del back (`modules/accounting/balanceGeneral/balanceGeneralRules.js`): ruta, validación de filtros y lectura segura de la respuesta.
// El back decide y calcula (saldos al corte, utilidad, diferencia y avisos); aquí se explica el error antes de pedir.
export const BASE_PATH = 'accounting/reports/balanceGeneral';

// Id de traducción del primer problema del filtro, o vacío si está bien.
export const validateFilter = ({ date, level }) => {
  if (!String(date ?? '').trim()) return 'page.balanceGeneral.msg.dateRequired';
  if (!isRealDate(date)) return 'page.balanceGeneral.msg.dateInvalid';
  if (!(Number(level) > 0)) return 'page.balanceGeneral.msg.levelRequired';
  return '';
};

export const buildQuery = ({ date, level }) => ({ date, level: Number(level) });

const zero = { count: 0, lines: 0, debit: 0, credit: 0 };
export const normalizeBalance = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: data?.totals || null,
  resultsSince: data?.resultsSince || null,
  notices: {
    noAccount: { ...zero, ...(data?.notices?.noAccount || {}) },
    otherTypes: { ...zero, types: [], ...(data?.notices?.otherTypes || {}) },
    unbalancedEntries: { debit: 0, credit: 0, difference: 0, ...(data?.notices?.unbalancedEntries || {}) }
  }
});

// Avisos con algo que mostrar, en orden fijo.
export const activeNotices = (notices) => {
  const list = [];
  if (Number(notices?.noAccount?.count) > 0) list.push({ key: 'noAccount', ...notices.noAccount });
  if (Number(notices?.otherTypes?.count) > 0) list.push({ key: 'otherTypes', ...notices.otherTypes });
  if (Math.abs(Number(notices?.unbalancedEntries?.difference)) >= 0.005) list.push({ key: 'unbalancedEntries', ...notices.unbalancedEntries });
  return list;
};

// El balance cuadra solo si la diferencia es 0 al centavo.
export const isBalanced = (totals) => Math.abs(Number(totals?.difference)) < 0.005;

// Nivel inicial: el último que ofrece el back (la cuenta de detalle); si ya hay uno elegido se respeta.
export const defaultLevel = (levels, current) => (Number(current) > 0 || !Array.isArray(levels) || levels.length === 0 ? Number(current) || 0 : Number(levels[levels.length - 1].value));
