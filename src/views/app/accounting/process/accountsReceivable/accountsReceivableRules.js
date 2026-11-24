// Reglas de la pantalla Cuentas por Cobrar (SPEC v2-123-sr), las mismas del back (`modules/accounting/accountsReceivable/accountsReceivableRules.js`): fecha de corte, moneda, edición de la
// cartera manual y qué botones se ofrecen. El back es quien decide; aquí se evita el viaje y se explica el motivo.
export const PRIVILEGE_SCREEN = '03.02.002';
export const ADMIN_DELETE_PRIVILEGE = '99.20.004'; // Eliminar/Anular de Documentos (el `nUserAdmin` del legacy)
export const CURRENCY_LEMPIRAS = 1;
export const CURRENCY_DOLLARS = 2;
export const MAX_VALUE = 999999999999.99;

// Tramos de antigüedad que devuelve el back (`aging`), con la etiqueta que ya tenía la pantalla.
export const AGING_BUCKETS = [
  { field: 'current', label: 'page.accountsReceivable.table.current' },
  { field: 'd1to30', label: 'page.accountsReceivable.table.days30' },
  { field: 'd31to60', label: 'page.accountsReceivable.table.days60' },
  { field: 'd61to90', label: 'page.accountsReceivable.table.days90' },
  { field: 'd91to120', label: 'page.accountsReceivable.table.days120' },
  { field: 'over120', label: 'page.accountsReceivable.table.daysMore' }
];

// Fecha de calendario `AAAA-MM-DD` real (también bisiestos).
export const isValidDate = (text) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text ?? '').trim());
  if (!match) return false;
  const [, y, m, d] = match.map(Number);
  const check = new Date(Date.UTC(y, m - 1, d));
  return check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d;
};

// La moneda Dólares solo se ofrece si la empresa factura en Lempiras y Dólares (`dual_curr`): lo dice `GET cxc/settings`. Cualquier forma rara cuenta como "no".
export const normalizeSettings = (data) => ({ hasDualCurrency: data?.hasDualCurrency === true });
export const effectiveCurrency = (currency, settings) => (settings?.hasDualCurrency === true && Number(currency) === CURRENCY_DOLLARS ? CURRENCY_DOLLARS : CURRENCY_LEMPIRAS);
export const currencyLabel = (currency) => (Number(currency) === CURRENCY_DOLLARS ? 'page.accountsReceivable.currency.dollars' : 'page.accountsReceivable.currency.lempiras');

// Errores por campo de la consulta (id de traducción); vacío si está bien.
export const validateQuery = ({ date }) => {
  const errors = {};
  if (!String(date ?? '').trim()) errors.date = 'page.accountsReceivable.error.date.required';
  else if (!isValidDate(date)) errors.date = 'page.accountsReceivable.error.date.invalid';
  return errors;
};

// Parámetros de la consulta: el tipo de cliente en 0 (o vacío) no se manda; la moneda siempre es válida para la empresa.
export const buildQuery = ({ date, customerTypeId, currency }, settings, extra = {}) => {
  const query = { date, currency: effectiveCurrency(currency, settings), ...extra };
  if (Number(customerTypeId) > 0) query.customerTypeId = Number(customerTypeId);
  return query;
};

export const SUMMARY_PATH = 'accounting/process/cxc/summary';
export const DETAIL_PATH = 'accounting/process/cxc/detailByCustomer';
export const SETTINGS_PATH = 'accounting/process/cxc/settings';

// Estado del documento como el legacy: id de traducción y valores ("N Días Para Vencer", "N Días Vencida", "Sin Vencimiento").
export const statusMessage = (status) => {
  if (status?.code === 'toDue') return { id: 'page.accountsReceivable.status.toDue', values: { days: status.days } };
  if (status?.code === 'overdue') return { id: 'page.accountsReceivable.status.overdue', values: { days: status.days } };
  return { id: 'page.accountsReceivable.status.noDue', values: {} };
};

// Detalle del back con valores seguros para pintar (cualquier forma rara cuenta como vacío).
export const normalizeDetail = (data) => ({
  customer: data?.customer && typeof data.customer === 'object' ? data.customer : {},
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: data?.totals && typeof data.totals === 'object' ? data.totals : {},
  aging: data?.aging && typeof data.aging === 'object' ? data.aging : {}
});

// Solo la cartera manual (tipo 5) se edita o elimina desde esta pantalla; editar exige `fn_update` y eliminar `fn_delete` más el privilegio de administrador.
export const canEditRow = (row, privileges) => row?.isManual === true && privileges?.update === true;
export const canDeleteRow = (row, privileges) => row?.isManual === true && privileges?.delete === true && privileges?.admin === true;

export const INITIAL_EDIT_FORM = { id: 0, date: '', dueDate: '', value: '' };
export const mapRowToEditForm = (row) => ({ id: row.id, date: row.date || '', dueDate: row.dueDate || '', value: String(row.originalValue ?? '') });

// Mismas reglas del back: fecha válida y no futura, vencimiento válido y no anterior a la fecha (vacío = sin vencimiento), valor mayor que cero con máximo 2 decimales.
export const validateEditForm = (form, today) => {
  const errors = {};
  if (!isValidDate(form.date)) errors.date = 'page.accountsReceivable.error.manual.date';
  else if (today && form.date > today) errors.date = 'page.accountsReceivable.error.manual.dateFuture';
  if (String(form.dueDate ?? '').trim()) {
    if (!isValidDate(form.dueDate)) errors.dueDate = 'page.accountsReceivable.error.manual.dueDate';
    else if (isValidDate(form.date) && form.dueDate < form.date) errors.dueDate = 'page.accountsReceivable.error.manual.dueBeforeDate';
  }
  const text = String(form.value ?? '').trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text) || Number(text) <= 0 || Number(text) > MAX_VALUE) errors.value = 'page.accountsReceivable.error.manual.value';
  return errors;
};

// Solo lo que cambió respecto a la fila original (el back acepta campos opcionales y exige al menos uno).
export const buildEditPayload = (form, original) => {
  const payload = {};
  if (form.date !== (original.date || '')) payload.date = form.date;
  if (String(form.dueDate ?? '') !== (original.dueDate || '') && String(form.dueDate ?? '').trim()) payload.dateOut = form.dueDate;
  if (Number(form.value) !== Number(original.originalValue)) payload.value = Number(form.value);
  return payload;
};
