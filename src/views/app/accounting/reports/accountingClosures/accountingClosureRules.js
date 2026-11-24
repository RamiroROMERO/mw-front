// Reglas de la pantalla Cierres Contables (SPEC v2-131-sr), las mismas del back (`modules/accounting/accountingClosures/accountingClosureRules.js`):
// la fecha real y no futura, qué cierre se puede eliminar y los avisos de la vista previa. El back decide y valida; aquí se evita el viaje.
const pad = (n) => String(n).padStart(2, '0');
export const localToday = (now = new Date()) => `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

const isRealDate = (text) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text ?? '').trim());
  if (!m) return false;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.getUTCFullYear() === Number(m[1]) && d.getUTCMonth() === Number(m[2]) - 1 && d.getUTCDate() === Number(m[3]);
};

// Id de traducción del error de la fecha, o vacío si está bien.
export const validateCloseDate = (date, now = new Date()) => {
  const text = String(date ?? '').trim();
  if (!isRealDate(text)) return 'page.accountingClosures.msg.dateInvalid';
  if (text > localToday(now)) return 'page.accountingClosures.msg.dateFuture';
  return '';
};

// Solo se puede eliminar el último cierre (los posteriores se calcularon sobre él).
export const canDeleteRow = (row, rows) => {
  if (!row || !Array.isArray(rows) || rows.length === 0) return false;
  const last = [...rows].sort((a, b) => (String(a.date) === String(b.date) ? Number(a.id) - Number(b.id) : String(a.date).localeCompare(String(b.date)))).pop();
  return Number(last.id) === Number(row.id);
};

// Avisos de la vista previa: el cierre usa el resultado por saldos; si difiere del de la estructura del Estado de Resultado o hay cuentas con tipo desconocido, se muestran.
export const closingWarnings = (closing) => {
  const out = [];
  if (!closing) return out;
  if (Math.abs(Number(closing.difference || 0)) >= 0.005) out.push('difference');
  if (Array.isArray(closing.unknownTypeAccounts) && closing.unknownTypeAccounts.length > 0) out.push('unknownTypes');
  return out;
};
