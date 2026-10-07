// Reglas puras del Cuadre de Asientos (SPEC v2-25, front): qué acciones ofrece una selección, cómo se arman los
// `params` de /preview y /repair, cómo se parten los lotes y las etiquetas/colores. El back decide siempre; esto solo
// evita llamadas inútiles y arma lo que el back espera.

export const MAX_KEYS_PER_CALL = 200;
export const MIN_IGNORE_REASON = 3;

export const PRIVILEGE_SCREEN = '03.01.044';
export const PRIVILEGE_REPAIR = '11.01.015';
export const PRIVILEGE_CLOSED_PERIOD = '11.01.019';

export const CATEGORY_META = {
  HEADER_ZERO: { labelKey: 'page.entryBalancing.category.HEADER_ZERO', color: 'info' },
  UNBALANCED: { labelKey: 'page.entryBalancing.category.UNBALANCED', color: 'danger' },
  ZERO_ENTRY: { labelKey: 'page.entryBalancing.category.ZERO_ENTRY', color: 'warning' },
  NO_LINES: { labelKey: 'page.entryBalancing.category.NO_LINES', color: 'dark' },
  BLANK_ACCOUNT: { labelKey: 'page.entryBalancing.category.BLANK_ACCOUNT', color: 'secondary' },
  CHECK_NO_ENTRY: { labelKey: 'page.entryBalancing.category.CHECK_NO_ENTRY', color: 'primary' },
  DEPOSIT_DIFF_ON_BANK: { labelKey: 'page.entryBalancing.category.DEPOSIT_DIFF_ON_BANK', color: 'success' }
};
export const CATEGORIES = Object.keys(CATEGORY_META);

export const STATUS_META = {
  pending: { labelKey: 'page.entryBalancing.status.pending', color: 'warning' },
  repaired: { labelKey: 'page.entryBalancing.status.repaired', color: 'success' },
  ignored: { labelKey: 'page.entryBalancing.status.ignored', color: 'secondary' }
};

export const RESULT_META = {
  ready: { labelKey: 'page.entryBalancing.result.ready', color: 'info' },
  repaired: { labelKey: 'page.entryBalancing.result.repaired', color: 'success' },
  unchanged: { labelKey: 'page.entryBalancing.result.unchanged', color: 'secondary' },
  error: { labelKey: 'page.entryBalancing.result.error', color: 'danger' }
};

const neutral = (labelKey) => ({ labelKey: labelKey || '', color: 'secondary' });
export const categoryMeta = (category) => CATEGORY_META[category] || neutral(category);
export const statusMeta = (status) => STATUS_META[status] || neutral(status);
export const resultMeta = (status) => RESULT_META[status] || neutral(status);
export const actionLabelKey = (action) => `page.entryBalancing.action.${action}`;
export const subcategoryLabelKey = (subcategory) => (subcategory ? `page.entryBalancing.subcategory.${subcategory}` : '');

// Una selección es válida para acciones en lote solo si todos son de la misma categoría y subcategoría.
export const isHomogeneous = (items = []) => items.length > 0
  && items.every((it) => it.category === items[0].category && (it.subcategory || '') === (items[0].subcategory || ''));

// Acciones comunes a lo seleccionado (intersección, en el orden de la primera). Mezcla = ninguna.
export const commonActions = (items = []) => {
  if (!isHomogeneous(items)) return [];
  const [first, ...rest] = items;
  return (first.actions || []).filter((action) => rest.every((it) => (it.actions || []).includes(action)));
};

// Qué pide cada acción como parámetros.
export const ACTION_REQUIREMENTS = {
  FIX_HEADER: {},
  REVERSE_CHECK_LINES: {},
  REGENERATE_CHECK_ENTRY: {},
  ADD_CREDIT_NOTE_LINE: { account: 'optional' },
  ADD_DIFFERENCE_LINE: { account: 'optional' },
  RECLASSIFY_DEPOSIT: { account: 'optional', date: true },
  ASSIGN_ACCOUNTS: { assignments: true },
  BALANCE_WITH_ACCOUNT: { account: 'required' },
  IGNORE: {}
};
export const requirementsOf = (action) => ACTION_REQUIREMENTS[action] || {};

const clean = (v) => String(v === undefined || v === null ? '' : v).trim();

// Arma `params` para /preview y /repair. `form`: { accountNumber, date, assignments: { [lineId]: cuenta } }.
export const buildParams = (action, form = {}, { confirmClosedPeriod = false } = {}) => {
  const req = requirementsOf(action);
  const params = {};
  if (req.account && clean(form.accountNumber)) params.accountNumber = clean(form.accountNumber);
  if (req.date && clean(form.date)) params.date = clean(form.date);
  if (req.assignments) {
    const source = form.assignments || {};
    params.assignments = Object.keys(source)
      .filter((lineId) => clean(source[lineId]))
      .map((lineId) => ({ lineId: Number(lineId), accountNumber: clean(source[lineId]) }));
  }
  if (confirmClosedPeriod) params.confirmClosedPeriod = true;
  return params;
};

// Clave de traducción del primer dato que falta, o null si se puede pedir la vista previa.
export const validateParams = (action, form = {}) => {
  const req = requirementsOf(action);
  if (req.account === 'required' && !clean(form.accountNumber)) return 'page.entryBalancing.msg.accountRequired';
  if (req.date && !/^\d{4}-\d{2}-\d{2}$/.test(clean(form.date))) return 'page.entryBalancing.msg.dateRequired';
  if (req.assignments) {
    const filled = Object.values(form.assignments || {}).filter((v) => clean(v));
    if (filled.length === 0) return 'page.entryBalancing.msg.assignmentsRequired';
  }
  return null;
};

export const isIgnoreReasonValid = (reason) => clean(reason).length >= MIN_IGNORE_REASON;

// Parte las llaves en lotes de máximo `size`.
export const chunkKeys = (keys = [], size = MAX_KEYS_PER_CALL) => {
  const out = [];
  for (let i = 0; i < keys.length; i += size) out.push(keys.slice(i, i + size));
  return out;
};

// ¿Algún elemento (item de la lista o resultado de vista previa) es de período cerrado?
export const needsClosedConfirmation = (entries = []) => entries.some((e) => Boolean(e && (e.periodClosed || (e.item && e.item.periodClosed))));

// Une los `results` de varias respuestas de /preview o /repair.
export const mergeResults = (responses = []) => responses.flatMap((r) => (r && r.data && r.data.results) || []);

export const countByResult = (results = []) => results.reduce((acc, r) => {
  acc[r.status] = (acc[r.status] || 0) + 1;
  return acc;
}, {});

// Llaves que la vista previa dejó listas (las únicas que tiene sentido confirmar).
export const readyKeys = (results = []) => results.filter((r) => r.status === 'ready').map((r) => r.key);

// Sin 11.01.015 no repara ni ignora; confirmar un período cerrado exige además 11.01.019.
export const canRepair = (privileges = {}) => Boolean(privileges.repair);
export const canConfirmClosed = (privileges = {}) => Boolean(privileges.repair && privileges.closedPeriod);

export const summaryTotals = (summary = []) => summary.reduce((acc, s) => ({
  pending: acc.pending + Number(s.pending || 0),
  repaired: acc.repaired + Number(s.repaired || 0),
  ignored: acc.ignored + Number(s.ignored || 0),
  total: acc.total + Number(s.total || 0)
}), { pending: 0, repaired: 0, ignored: 0, total: 0 });

// Filtros -> query (sin vacíos).
export const buildQuery = (filters = {}, extra = {}) => {
  const q = { ...filters, ...extra };
  const out = {};
  Object.keys(q).forEach((k) => {
    const v = q[k];
    if (v === undefined || v === null || String(v).trim() === '') return;
    out[k] = v;
  });
  return out;
};
