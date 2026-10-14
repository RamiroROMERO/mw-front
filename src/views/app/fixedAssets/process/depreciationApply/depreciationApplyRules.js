// Reglas de "Aplicar Depreciación" que comparten el hook y la pantalla (SPEC v2-34).
//
// El back (DepreciationApplyService) es quien decide: aplica TODO lo pendiente hasta el último día del mes elegido, en una
// sola partida, y rechaza con un mensaje real (período cerrado, cuenta bloqueada, activo sin cuenta, mes sin pendientes).
// Aquí solo se decide qué mostrar y qué botones habilitar. Los `error.depreciation.*` no se traducen a propósito
// (llevan activos y montos): la pantalla muestra la `description` del back.

export const PRIVILEGE_SCREEN = '06.02.004'; // Proceso -> Aplicar Depreciación
export const PRIVILEGE_UNAPPLY = '11.01.015'; // desaplicar (editar un documento contabilizado)

const MONTH_REGEX = /^(\d{4})-(0[1-9]|1[0-2])$/;
export const MONTHS_BACK = 36; // meses que ofrece el selector hacia atrás (el mes en curso incluido)

const pad = (n) => String(n).padStart(2, '0');

// 'YYYY-MM' del mes en curso (fecha local, igual que el back).
export const currentMonth = (now = new Date()) => `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

export const isValidMonth = (month) => MONTH_REGEX.test(String(month || '').trim());

// El back rechaza un mes futuro (depreciation.month.future): el selector nunca lo ofrece.
export const isFutureMonth = (month, now = new Date()) => isValidMonth(month) && String(month).trim() > currentMonth(now);

// Meses ofrecidos, del más reciente al más antiguo: [{ value: '2026-10', year: 2026, month: 10 }, ...].
export const monthOptions = (now = new Date(), count = MONTHS_BACK) => {
  const options = [];
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  for (let i = 0; i < count; i += 1) {
    options.push({ value: `${year}-${pad(month)}`, year, month });
    month -= 1;
    if (month === 0) { month = 12; year -= 1; }
  }
  return options;
};

// Etiqueta "Octubre 2026" con los nombres de mes del idioma activo (monthNames: 12 textos, enero primero).
export const formatMonth = (value, monthNames) => {
  const match = MONTH_REGEX.exec(String(value || '').trim());
  if (!match) return String(value || '');
  return `${(monthNames && monthNames[Number(match[2]) - 1]) || match[2]} ${match[1]}`;
};

// Consulta de la vista previa y cuerpos de aplicar y desaplicar.
export const buildPreviewQuery = (month) => ({ month: String(month || '').trim() });
export const buildApplyBody = (month) => ({ month: String(month || '').trim() });
export const buildUnapplyBody = (batch) => ({ applyId: Number(batch && batch.id) });

// Líneas pendientes de la vista previa: las que llevan asiento y las de valor 0 (se aplican sin asiento).
export const pendingCount = (preview) => {
  if (!preview) return 0;
  return (preview.lines || []).length + (preview.zeroValueLines || []).length;
};

// "Aplicar" solo se habilita con una vista previa que tenga algo pendiente y sin una operación en curso.
export const canApply = (preview, busy = false) => !busy && pendingCount(preview) > 0;

// Resumen para el encabezado de la vista previa. El total sale del back (centavos exactos); aquí solo se cuentan.
export const previewSummary = (preview) => {
  const lines = (preview && preview.lines) || [];
  return {
    month: preview ? preview.month : '',
    dateApply: preview ? preview.dateApply : '',
    total: preview ? Number(preview.total) || 0 : 0,
    linesCount: lines.length,
    zeroCount: ((preview && preview.zeroValueLines) || []).length,
    assetsCount: new Set(lines.map((l) => l.assetId)).size,
    warningsCount: ((preview && preview.warnings) || []).length
  };
};

// Una fila por activo (suma en centavos para no arrastrar ruido de coma flotante), en orden de aparición.
export const groupByAsset = (lines = []) => {
  const groups = new Map();
  lines.forEach((l) => {
    const current = groups.get(l.assetId) || {
      assetId: l.assetId, assetCode: l.assetCode, assetName: l.assetName, areaName: l.areaName || '',
      debitAccount: l.debitAccount, creditAccount: l.creditAccount, count: 0, cents: 0
    };
    current.count += 1;
    current.cents += Math.round((Number(l.value) || 0) * 100);
    groups.set(l.assetId, current);
  });
  return [...groups.values()].map(({ cents, ...rest }) => ({ ...rest, value: cents / 100 }));
};

// Avisos del back (asset.noAssignment) como textos, sin repetir.
export const warningTexts = (warnings) => [...new Set((warnings || []).map((w) => w && w.message).filter(Boolean))];

// Qué hace "Desaplicar" según el privilegio 11.01.015 del usuario (`active` en `mw_current_userModules`):
//   'confirm'   -> con permiso: confirmar que se borrará la partida y las líneas volverán a Pendiente
//   'forbidden' -> sin permiso: avisar sin llamar al back (que respondería 403 user.forbidden.editPosted)
//   'none'      -> no hay lote seleccionado
export const resolveUnapplyAction = (batch, canEditPosted) => {
  if (!(Number(batch && batch.id) > 0)) return 'none';
  return canEditPosted ? 'confirm' : 'forbidden';
};

// Lote del historial listo para mostrar: números y partida (0 = el lote solo tuvo líneas en cero y no generó partida).
export const batchRow = (batch) => ({
  id: Number(batch.id),
  periodMonth: batch.periodMonth,
  dateApply: batch.dateApply,
  pdaNumber: Number(batch.pdaNumber) || 0,
  hasEntry: Number(batch.pdaNumber) > 0,
  total: Number(batch.total) || 0,
  linesCount: Number(batch.linesCount) || 0
});
