// Reglas puras de "Regenerar partidas de cheques por rango" (SPEC v2-28, front). El back decide siempre (vista previa,
// omisiones y privilegios); esto arma lo que el back espera y evita llamadas inútiles.
import { MAX_KEYS_PER_CALL } from './entryBalancingRules';

export const MAX_CHECKS_PER_CALL = MAX_KEYS_PER_CALL; // 200, igual que el back

export const SKIP_REASONS = ['VOIDED', 'NO_DETAIL', 'UNBALANCED', 'GLOBAL_CLOSE', 'PERIOD_CLOSED', 'CONCILIATED', 'ALREADY_OK'];

export const skipReasonLabelKey = (reason) => `page.entryBalancing.checkRange.reason.${reason}`;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// Clave de traducción del primer problema del rango, o null si se puede pedir la vista previa.
export const validateRange = ({ dateStart, dateEnd } = {}) => {
  const start = String(dateStart || '').trim();
  const end = String(dateEnd || '').trim();
  if (!start || !end) return 'page.entryBalancing.checkRange.msg.rangeRequired';
  if (!DATE.test(start) || !DATE.test(end) || start > end) return 'page.entryBalancing.checkRange.msg.rangeInvalid';
  return null;
};

// Cuerpo de la vista previa (sin banco vacío).
export const buildPreviewBody = ({ dateStart, dateEnd, bankCode } = {}) => {
  const body = { dateStart: String(dateStart).trim(), dateEnd: String(dateEnd).trim() };
  if (String(bankCode || '').trim()) body.bankCode = String(bankCode).trim();
  return body;
};

// Solo los cheques que la vista previa dejó listos se pueden regenerar.
export const isSelectable = (item) => Boolean(item) && item.status === 'READY';
export const selectableIds = (items = []) => items.filter(isSelectable).map((item) => item.checkId);

// Parte los ids en lotes de máximo 200.
export const chunkIds = (ids = [], size = MAX_CHECKS_PER_CALL) => {
  const out = [];
  for (let i = 0; i < ids.length; i += size) out.push(ids.slice(i, i + size));
  return out;
};

// Une los `results` de varias respuestas de /checkRange/repair.
export const mergeRepairResults = (responses = []) => responses.flatMap((r) => (r && r.data && r.data.results) || []);

export const countRepairResults = (results = []) => results.reduce((acc, r) => {
  acc[r.status] = (acc[r.status] || 0) + 1;
  return acc;
}, { repaired: 0, skipped: 0, error: 0 });

// Regenerar exige 11.01.015; el período cerrado lo resuelve el back con 11.01.019 (la vista previa ya lo refleja).
export const canRegenerate = (privileges = {}, selectedCount = 0) => Boolean(privileges.repair) && selectedCount > 0;
