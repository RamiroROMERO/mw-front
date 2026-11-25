// Reglas de Presupuesto Ejecutado (SPEC v2-138-sr), las mismas del back (`modules/accounting/budgetExecution/budgetExecutionRules.js`): ruta, validación de filtros y lectura segura de la respuesta.
// El back decide y calcula (presupuesto, ejecutado, variación, porcentaje y avisos); aquí se explica el error antes de pedir.
export const BASE_PATH = 'accounting/reports/budgetExecution';

const monthOf = (value) => (/^\d+$/.test(String(value ?? '').trim()) ? Number(String(value).trim()) : 0);

// Id de traducción del primer problema del filtro, o vacío si está bien.
export const validateFilter = ({ mode, year, month, monthEnd }) => {
  const y = String(year ?? '').trim();
  if (!/^\d{4}$/.test(y) || Number(y) < 2000 || Number(y) > 2100) return 'page.budgetExecution.msg.yearInvalid';
  const start = monthOf(month);
  if (start < 1 || start > 12) return 'page.budgetExecution.msg.monthInvalid';
  if (mode === 'range') {
    const end = monthOf(monthEnd);
    if (end < 1 || end > 12) return 'page.budgetExecution.msg.monthInvalid';
    if (start > end) return 'page.budgetExecution.msg.rangeInverted';
  }
  return '';
};

// Parámetros de la consulta: el mes final solo se manda en modo rango.
export const buildQuery = ({ mode, year, month, monthEnd }) => (mode === 'range'
  ? { mode, year: Number(year), month: Number(month), monthEnd: Number(monthEnd) }
  : { mode, year: Number(year), month: Number(month) });

export const normalizeReport = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  notices: {
    missingAccounts: Array.isArray(data?.notices?.missingAccounts) ? data.notices.missingAccounts : [],
    otherTypeAccounts: Array.isArray(data?.notices?.otherTypeAccounts) ? data.notices.otherTypeAccounts : []
  }
});

// Avisos con algo que mostrar, en orden fijo.
export const activeNotices = (notices) => {
  const list = [];
  if (notices?.missingAccounts?.length) list.push({ key: 'missingAccounts', items: notices.missingAccounts });
  if (notices?.otherTypeAccounts?.length) list.push({ key: 'otherTypeAccounts', items: notices.otherTypeAccounts });
  return list;
};

// Texto de un elemento de aviso: la línea y la cuenta (y el tipo si lo hay).
export const noticeItemText = (item) => `${item.line}: ${item.accountNumber}${item.type ? ` (${item.type})` : ''}`;

// Texto del porcentaje; sin presupuesto no hay porcentaje.
export const percentText = (value, format) => (value === null || value === undefined ? '' : `${format(value)}%`);
