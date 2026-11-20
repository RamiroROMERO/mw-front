// Memorándums de compras e inventario (SPEC v2-59-sr). El back decide (`validateHeader`, `validateItems`, documentos pendientes y número);
// esto solo evita una llamada que ya se sabe rechazada, mantiene la selección entre páginas y arma las peticiones. Los casos son los del back.
import { buildPageParams } from '@Components/modalSearch/searchRules';
import { localToday } from '../../process/fuelPurchases/fuelPurchaseRules';

export const MAX_ITEMS = 500;
export const MAX_NAME = 50;
export const MAX_SUBJECT = 200;
export const MAX_NOTES = 5000;
export const PAGE_SIZE = 50;

// Un tipo de memorándum: ruta del back, privilegio de su pantalla y columnas de los documentos pendientes (`label` es una clave de traducción).
const money = (field, label) => ({ field, label, isNumber: true });
export const MEMO_KINDS = {
  purchase: {
    basePath: 'inventory/reports/purchaseMemos',
    privilege: '02.03.003',
    titleKey: 'page.purchaseMemo.table.title',
    columns: [
      { field: 'date', label: 'table.column.date', isDate: true },
      { field: 'kind', label: 'page.memos.column.kind', isKind: true },
      { field: 'number', label: 'table.column.documentId' },
      { field: 'providerName', label: 'table.column.provider' },
      money('subtotal', 'table.column.subtotal'), money('discount', 'table.column.discount'), money('tax', 'table.column.tax'), money('total', 'table.column.total')
    ]
  },
  inventory: {
    basePath: 'inventory/reports/inventoryMemos',
    privilege: '02.03.004',
    titleKey: 'page.inventoryMemo.table.title',
    columns: [
      { field: 'date', label: 'table.column.date', isDate: true },
      { field: 'document', label: 'page.memos.column.docto' },
      { field: 'documentNumber', label: 'table.column.no' },
      { field: 'originName', label: 'page.memos.column.origin' },
      { field: 'destinationName', label: 'page.memos.column.destination' },
      money('total', 'table.column.total')
    ]
  }
};

const text = (value) => String(value ?? '').trim();

export const isValidCalendarDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(value));
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
};

export const INITIAL_FORM = { date: '', for1: '', department1: '', from1: '', department2: '', subject: '', createdBy: '', reviewedBy: '', notes: '' };

const REQUIRED = [['for1', MAX_NAME], ['department1', MAX_NAME], ['from1', MAX_NAME], ['department2', MAX_NAME], ['subject', MAX_SUBJECT]];
const OPTIONAL = [['createdBy', MAX_NAME], ['reviewedBy', MAX_NAME]];

/**
 * Valida el formulario del memorándum (mismas reglas del back). Devuelve { campo: idDeTraducción } ({} = válido): fecha obligatoria, válida y no
 * futura; Para, departamento, De, departamento y asunto obligatorios; máximos de longitud.
 */
export const validateMemoForm = (form = {}, { today = localToday() } = {}) => {
  const errors = {};
  const date = text(form.date);
  if (date === '') errors.date = 'msg.required.input.date';
  else if (!isValidCalendarDate(date)) errors.date = 'page.fuelPurchases.report.error.dateInvalid';
  else if (date > today) errors.date = 'page.fuelPurchases.report.error.dateFuture';
  REQUIRED.forEach(([key, max]) => {
    const value = text(form[key]);
    if (value === '') errors[key] = 'page.memos.error.required';
    else if (value.length > max) errors[key] = 'page.memos.error.tooLong';
  });
  OPTIONAL.forEach(([key, max]) => { if (text(form[key]).length > max) errors[key] = 'page.memos.error.tooLong'; });
  if (text(form.notes).length > MAX_NOTES) errors.notes = 'page.memos.error.tooLong';
  return errors;
};

// ---- Selección de documentos: se conserva entre páginas. Es un objeto { llave: fila } (inmutable: cada cambio devuelve uno nuevo).
export const rowKey = (row) => `${row.kind}:${row.id}`;

export const toggleRow = (selection, row) => {
  const next = { ...selection };
  const key = rowKey(row);
  if (next[key]) delete next[key]; else next[key] = row;
  return next;
};

// Marca (o desmarca) todas las filas de la página mostrada, sin tocar las de otras páginas.
export const setPageSelected = (selection, rows, selected) => {
  const next = { ...selection };
  rows.forEach((row) => { if (selected) next[rowKey(row)] = row; else delete next[rowKey(row)]; });
  return next;
};

export const selectedRows = (selection) => Object.values(selection);
export const isRowSelected = (selection, row) => Boolean(selection[rowKey(row)]);
export const isPageSelected = (selection, rows) => rows.length > 0 && rows.every((row) => isRowSelected(selection, row));

// Total de lo marcado en centavos enteros (solo para mostrar: el back calcula el total del memorándum).
export const selectedTotal = (selection) => selectedRows(selection).reduce((acc, row) => acc + Math.round((Number(row.total) || 0) * 100), 0) / 100;

// Lo que el back recibe de cada documento: solo el tipo y el id.
export const buildItems = (selection) => selectedRows(selection).map((row) => ({ kind: row.kind, id: row.id }));

// Cuerpo de `POST` (crear): la cabecera recortada y los documentos marcados.
export const buildCreateBody = (form, selection) => ({
  date: text(form.date), for1: text(form.for1), department1: text(form.department1), from1: text(form.from1), department2: text(form.department2),
  subject: text(form.subject), createdBy: text(form.createdBy), reviewedBy: text(form.reviewedBy), notes: text(form.notes), items: buildItems(selection)
});

// Reglas previas a llamar al back: devuelve el id de traducción del primer problema de la selección o null.
export const selectionProblem = (selection) => {
  const count = selectedRows(selection).length;
  if (count === 0) return 'page.memos.msg.selectItems';
  if (count > MAX_ITEMS) return 'page.memos.msg.tooMany';
  return null;
};

// Parámetros de la página de pendientes (`page` desde 1): fechas y búsqueda solo si tienen valor.
export const buildPendingParams = ({ dateStart, dateEnd, search }, page = 1) => {
  const params = buildPageParams({ search, page, pageSize: PAGE_SIZE });
  if (text(dateStart) !== '') params.dateStart = text(dateStart);
  if (text(dateEnd) !== '') params.dateEnd = text(dateEnd);
  return params;
};

export const memoFileName = (kind, memo, format) => `${kind === 'inventory' ? 'Memorandum de Inventario' : 'Memorandum de Compras'} ${memo.number}.${format === 'xlsx' ? 'xlsx' : 'pdf'}`;

// Rango de fechas de la búsqueda: si vienen las dos, la inicial no puede pasar de la final (el back responde `range.invalid`).
export const validateFilter = ({ dateStart, dateEnd } = {}) => {
  const errors = {};
  if (text(dateStart) !== '' && !isValidCalendarDate(dateStart)) errors.dateStart = 'page.fuelPurchases.report.error.dateInvalid';
  if (text(dateEnd) !== '' && !isValidCalendarDate(dateEnd)) errors.dateEnd = 'page.fuelPurchases.report.error.dateInvalid';
  if (!errors.dateStart && !errors.dateEnd && text(dateStart) !== '' && text(dateEnd) !== '' && text(dateStart) > text(dateEnd)) errors.dateEnd = 'page.fuelPurchases.report.error.range';
  return errors;
};
