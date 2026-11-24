// Reglas de la Estructura de Presupuesto (SPEC v2-120-sr). Son las mismas de BudgetLineDTO y budgetRules del back (el back decide y calcula los Total y Acumulado: esto solo evita llamarlo con
// un cuerpo que sabemos que rechaza). Los montos viajan como número con hasta 2 decimales; en el formulario son texto.
export const PRIVILEGE_SCREEN = '03.01.015';
export const MAX_NAME = 200;
export const MAX_AMOUNT = 9999999999.99;
export const TYPES = ['Titulo', 'Detalle', 'Total', 'Acumulado'];
export const ACTIONS = ['Suma', 'Resta'];
export const NO_ACTION = 'Ninguno';
export const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const monthKey = (month) => `month${month}`;

export const INITIAL_LINE_FORM = {
  id: 0,
  name: '',
  type: 'Detalle',
  action: 'Suma',
  ...MONTHS.reduce((acc, month) => ({ ...acc, [monthKey(month)]: '' }), {})
};

const text = (value) => String(value ?? '').trim();

// Solo una línea Detalle lleva monto capturado, acción y cuentas; Titulo, Total y Acumulado se calculan en el back.
export const isDetail = (type) => text(type) === 'Detalle';

// Monto válido: no negativo, hasta 2 decimales y dentro de decimal(12,2). Vacío cuenta como 0 (el back lo guarda así).
export const isValidAmount = (value) => {
  const raw = text(value);
  if (raw === '') return true;
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) return false;
  return Number(raw) <= MAX_AMOUNT;
};

// Errores por campo (ids de traducción). Los meses solo se validan en un Detalle.
export const validateLine = (form) => {
  const errors = {};
  if (text(form.name) === '') errors.name = 'page.budgetStructure.error.name.required';
  else if (text(form.name).length > MAX_NAME) errors.name = 'page.budgetStructure.error.name.max';
  if (!TYPES.includes(text(form.type))) errors.type = 'page.budgetStructure.error.type.required';
  if (isDetail(form.type)) {
    if (!ACTIONS.includes(text(form.action))) errors.action = 'page.budgetStructure.error.action.required';
    MONTHS.forEach((month) => {
      if (!isValidAmount(form[monthKey(month)])) errors[monthKey(month)] = 'page.budgetStructure.error.month.invalid';
    });
  }
  return errors;
};

// Cuerpo del alta o la edición: solo lo que el back acepta (el orden, el total y los meses de Titulo, Total y Acumulado los calcula él).
export const buildLinePayload = (form) => {
  const payload = { name: text(form.name), type: text(form.type), action: isDetail(form.type) ? text(form.action) : NO_ACTION };
  if (isDetail(form.type)) MONTHS.forEach((month) => { payload[monthKey(month)] = text(form[monthKey(month)]) === '' ? 0 : Number(form[monthKey(month)]); });
  return payload;
};

// De una fila del back al formulario (los montos en 0 se muestran como 0.00; una acción Ninguno no se elige).
export const mapLineToForm = (line) => ({
  ...INITIAL_LINE_FORM,
  id: line.id,
  name: text(line.name),
  type: text(line.type) || 'Detalle',
  action: ACTIONS.includes(text(line.action)) ? text(line.action) : 'Suma',
  ...MONTHS.reduce((acc, month) => ({ ...acc, [monthKey(month)]: line[monthKey(month)] === undefined || line[monthKey(month)] === null ? '' : String(Number(line[monthKey(month)]).toFixed(2)) }), {})
});

// Comodidad de captura del legacy: al salir del mes 1 de una línea NUEVA se copia a los meses que sigan vacíos o en 0.
export const spreadFirstMonth = (form) => {
  const first = text(form[monthKey(1)]);
  if (first === '' || !isValidAmount(first)) return form;
  const next = { ...form };
  MONTHS.slice(1).forEach((month) => {
    const current = text(next[monthKey(month)]);
    if (current === '' || Number(current) === 0) next[monthKey(month)] = first;
  });
  return next;
};

// Nuevo orden de ids al subir (-1) o bajar (+1) una línea; sin cambio en los extremos o si el id no está.
export const moveId = (ids, id, delta) => {
  const index = ids.findIndex((value) => Number(value) === Number(id));
  const target = index + delta;
  if (index === -1 || target < 0 || target >= ids.length) return ids;
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
};

export const canMove = (ids, id, delta) => moveId(ids, id, delta) !== ids;

// Texto de la acción para la tabla (Ninguno no se muestra).
export const actionText = (action) => (ACTIONS.includes(text(action)) ? text(action) : '');

// Monto con 2 decimales y separador de miles para mostrar.
export const formatAmount = (value) => (Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
