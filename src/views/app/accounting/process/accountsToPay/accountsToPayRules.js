// Reglas de la pantalla Cuentas por Pagar (SPEC v2-124-sr), las mismas del back (`modules/accounting/accountsPayable/accountsPayableRules.js`): fecha de corte, reportes y comentarios. El back
// es quien decide; aquí se evita el viaje y se explica el motivo.
export const PRIVILEGE_SCREEN = '03.02.001';
export const ADMIN_DELETE_PRIVILEGE = '99.20.004'; // Eliminar/Anular de Documentos
export const MAX_DOCUMENT_COMMENT = 1000;
export const MAX_PROVIDER_COMMENT = 2000;

export const BASE_PATH = 'accounting/process/accountsPayable';
export const SUMMARY_PATH = `${BASE_PATH}/summary`;
export const DETAIL_PATH = `${BASE_PATH}/detailByProvider`;
export const ADVANCES_PATH = `${BASE_PATH}/pendingAdvances`;

// Tramos que devuelve el back (`aging`), con la etiqueta que ya tenía la pantalla.
export const AGING_BUCKETS = [
  { field: 'current', label: 'page.accountsToPay.table.current' },
  { field: 'd1to30', label: 'page.accountsToPay.table.days30' },
  { field: 'd31to60', label: 'page.accountsToPay.table.days60' },
  { field: 'd61to90', label: 'page.accountsToPay.table.days90' },
  { field: 'd91to120', label: 'page.accountsToPay.table.days120' },
  { field: 'over120', label: 'page.accountsToPay.table.daysMore' }
];

// Fecha de calendario `AAAA-MM-DD` real (también bisiestos).
export const isValidDate = (text) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text ?? '').trim());
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const check = new Date(Date.UTC(y, m - 1, d));
  return check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d;
};

// Errores por campo de la fecha de corte (id de traducción); vacío si está bien.
export const validateQuery = ({ date }) => {
  const errors = {};
  if (!String(date ?? '').trim()) errors.date = 'page.accountsToPay.error.date.required';
  else if (!isValidDate(date)) errors.date = 'page.accountsToPay.error.date.invalid';
  return errors;
};

// Reporte "Detallado / Hasta la Fecha / Saldos Vencidos": los modos 2 y 3 exigen una fecha de corte real; el 1 no usa fecha.
export const validateReport = ({ mode, date }) => {
  const errors = {};
  if (!['1', '2', '3'].includes(String(mode))) errors.mode = 'page.accountsToPay.error.mode.invalid';
  else if (String(mode) !== '1') Object.assign(errors, validateQuery({ date }));
  return errors;
};

export const buildReportBody = ({ mode, date }) => (String(mode) === '1' ? { mode: Number(mode) } : { mode: Number(mode), date });

// Estado del documento como el legacy: id de traducción y valores.
export const statusMessage = (status) => {
  if (status?.code === 'toDue') return { id: 'page.accountsToPay.status.toDue', values: { days: status.days } };
  if (status?.code === 'overdue') return { id: 'page.accountsToPay.status.overdue', values: { days: status.days } };
  return { id: 'page.accountsToPay.status.noDue', values: {} };
};

// Detalle del back con valores seguros para pintar (cualquier forma rara cuenta como vacío).
export const normalizeDetail = (data) => ({
  provider: data?.provider && typeof data.provider === 'object' ? data.provider : {},
  providerComment: typeof data?.providerComment === 'string' ? data.providerComment : '',
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: data?.totals && typeof data.totals === 'object' ? data.totals : {},
  aging: data?.aging && typeof data.aging === 'object' ? data.aging : {}
});

// Comentarios: editar exige `fn_update` de la pantalla; eliminar `fn_delete` más el privilegio de administrador.
export const canEditComment = (privileges) => privileges?.update === true;
export const canDeleteDocument = (row, privileges) => Boolean(row) && privileges?.delete === true && privileges?.admin === true;

export const validateComment = (text, max) => {
  if (String(text ?? '').trim().length > max) return 'page.accountsToPay.error.comment.tooLong';
  return '';
};

// Solo lo que cambió respecto a lo guardado.
export const commentChanged = (text, original) => String(text ?? '').trim() !== String(original ?? '').trim();
