// Reglas de campos del Cambio de código (SPEC v2-55-sr). Son las mismas que aplica el back (productCodeChangeRules y ProductCodeChangeDTO de
// modules/inventory/productCodeChange): el back es quien decide; esto solo evita una llamada que ya se sabe rechazada.
export const MAX_CODE = 20;
export const MAX_NAME = 120;
export const MAX_DESCRIPTION = 120;
export const CHANGE_PATH = 'inventory/process/changeCode';
export const PREVIEW_PATH = `${CHANGE_PATH}/preview`;

const text = (value) => (typeof value === 'string' ? value.trim() : '');

// Recortado y a mayúsculas (el back hace lo mismo): lo que se muestra y se envía.
export const normalizeCode = (value) => text(value).toUpperCase();

// ¿Cambia el código? Un código igual al actual (o vacío) no es un cambio de código: solo se actualizan nombre y descripción.
export const isCodeChange = (form = {}, current = {}) => normalizeCode(form.newCode) !== '' && normalizeCode(form.newCode) !== normalizeCode(current.code);

// Sin ningún cambio no hay nada que guardar (ni código, ni nombre, ni descripción).
export const isUnchanged = (form = {}, current = {}) => !isCodeChange(form, current)
  && text(form.name) === text(current.name) && text(form.description) === text(current.description);

/**
 * Valida el formulario. Devuelve { campo: idDeTraducción } con solo los campos inválidos ({} = válido).
 * `current` es el producto elegido ({ id, code, name, description }); sin producto no se puede cambiar nada.
 */
export const validateChange = (form = {}, current = {}) => {
  const errors = {};
  if (!current || !current.id) errors.product = 'page.changeCode.error.product';
  // Un código nuevo vacío significa "mantener el código actual" (solo se cambian nombre y descripción).
  const code = normalizeCode(form.newCode);
  if (code.length > MAX_CODE) errors.newCode = 'page.changeCode.error.codeTooLong';
  else if (/\s/.test(code)) errors.newCode = 'page.changeCode.error.codeSpaces';
  const name = text(form.name);
  if (!name) errors.name = 'msg.required.input.name';
  else if (name.length > MAX_NAME) errors.name = 'page.changeCode.error.nameTooLong';
  if (text(form.description).length > MAX_DESCRIPTION) errors.description = 'page.changeCode.error.descriptionTooLong';
  return errors;
};

// Cuerpo del PUT: solo los tres campos que el back acepta, con el código ya normalizado. Sin código nuevo se envía el actual (el back
// lo trata como cambio solo de nombre y descripción).
export const buildChangePayload = (form = {}, current = {}) => ({
  newCode: normalizeCode(form.newCode) || normalizeCode(current.code), name: text(form.name), description: text(form.description)
});

// Parámetros de la vista previa (GET): el código actual y el nuevo normalizado.
export const buildPreviewParams = (form = {}, current = {}) => ({ code: current.code, newCode: normalizeCode(form.newCode) });

// Formulario inicial al elegir un producto: el nuevo código arranca vacío y nombre y descripción con los actuales.
export const formFromProduct = (product = {}) => ({ newCode: '', name: product.name || '', description: product.description || '' });

// Opciones del selector de producto: la etiqueta es "código - nombre".
export const productOption = (product) => (product ? { value: product.code, label: `${product.code} - ${product.name}` } : null);

// Resumen del resultado del PUT: total de filas, tablas tocadas y si quedaron filas con el código viejo (para marcarlas en rojo).
export const summarizeResult = (result = {}) => {
  const updated = Array.isArray(result.updated) ? result.updated : [];
  const remaining = Array.isArray(result.remaining) ? result.remaining : [];
  return {
    rows: updated.reduce((sum, item) => sum + Number(item.rows || 0), 0),
    tables: updated.length,
    updated,
    remaining,
    hasRemaining: remaining.length > 0
  };
};

// Texto de las filas que aún conservan el código viejo, para el aviso: "inv_kardex.codprod (2), ...".
export const remainingText = (remaining = []) => remaining.map((item) => `${item.table}.${item.column} (${item.rows})`).join(', ');
