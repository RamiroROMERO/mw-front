// Movimiento por Productos (SPEC v2-45-sr): detalle o resumen del movimiento de todos los productos de un tipo (o de todos) en un rango de
// fechas, en PDF o Excel. El back decide (`validateMovementQuery`); esto solo evita una llamada que ya se sabe rechazada y arma la petición.
// Los casos son los de stockMovementRules.test.js del back, más "sin fechas futuras", que solo pide la pantalla.
import { isValidCalendarDate, todayText } from './kardexRules';

export const MOVEMENT_URL = 'inventory/process/stocks/movements';
export const FILE_BASE = 'Movimiento de Productos';
export const ALL_TYPES_VALUE = 0;

// `id` lo usa el RadioGroup (números); `mode` es el del back.
export const MOVEMENT_MODES = [
  { id: 1, mode: 'detail', label: 'page.stock.modal.printMovements.radio.detail' },
  { id: 2, mode: 'summary', label: 'page.stock.modal.printMovements.radio.summary' }
];

const text = (value) => String(value ?? '').trim();
export const modeOf = (modeId) => MOVEMENT_MODES.find((item) => item.id === Number(modeId)) || null;

// Rango inicial del modal: del primer día del mes en curso a hoy (calendario local).
export const defaultMovementForm = (today = todayText()) => ({
  productTypeId: ALL_TYPES_VALUE, dateStart: `${today.slice(0, 7)}-01`, dateEnd: today, modeId: 1, excludeAdjustments: false
});

// Opciones del combo: "Todos" (valor 0, el texto lo pone la pantalla) más los tipos activos que devuelve `productsClassifications/getSL`.
export const buildTypeOptions = (rows = [], allLabel = 'Todos') => [
  { value: ALL_TYPES_VALUE, label: allLabel },
  ...rows.filter((row) => row && Number(row.id) > 0).map((row) => ({ value: Number(row.id), label: text(row.name) }))
];

/**
 * Valida el filtro. Devuelve { dateStart?, dateEnd?, modeId? } con el id de traducción de cada error ({} = válido). Mismo orden que el back:
 * cada fecha (obligatoria, válida, no futura), después el rango y el modo.
 */
export const validateMovement = (form = {}, { today = todayText() } = {}) => {
  const errors = {};
  const check = (field, value) => {
    const date = text(value);
    if (date === '') errors[field] = 'msg.required.input.date';
    else if (!isValidCalendarDate(date)) errors[field] = 'page.stock.report.error.dateInvalid';
    else if (date > today) errors[field] = 'page.stock.movement.error.dateFuture';
  };
  check('dateStart', form.dateStart);
  check('dateEnd', form.dateEnd);
  if (!errors.dateStart && !errors.dateEnd && text(form.dateStart) > text(form.dateEnd)) errors.dateEnd = 'page.stock.movement.error.range';
  if (!modeOf(form.modeId)) errors.modeId = 'msg.required.select';
  return errors;
};

// Petición para `request.GETPdf(url, params, fileName, ...)`. GETPdf agrega `?` + `params` a la URL en un GET, así que los parámetros van
// en `params` y no escritos en la URL (lección de la v2-12-sr). Cualquier formato distinto de xlsx es pdf, igual que el botón.
export const buildMovementRequest = (form = {}, format = 'pdf') => {
  const finalFormat = format === 'xlsx' ? 'xlsx' : 'pdf';
  const params = {
    productTypeId: Number(form.productTypeId) > 0 ? Number(form.productTypeId) : ALL_TYPES_VALUE,
    dateStart: text(form.dateStart),
    dateEnd: text(form.dateEnd),
    mode: (modeOf(form.modeId) || MOVEMENT_MODES[0]).mode,
    excludeAdjustments: Boolean(form.excludeAdjustments),
    format: finalFormat
  };
  return { url: MOVEMENT_URL, params, fileName: `${FILE_BASE}.${finalFormat}` };
};
