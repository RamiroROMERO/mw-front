import esLang from '../lang/locales/es_ES';

// Códigos HTTP cuyo `description` es un mensaje pensado para el usuario: el 400 de un error de
// negocio (ResponseHelper.error con un ValidError) y los 401/403 de permisos. En un 500 la
// description puede traer el texto de una falla interna, así que nunca se muestra.
const USER_FACING_STATUS = [400, 401, 403];

// description que el back pone en un 400 genérico (ResponseHelper.badRequest); no dice nada útil.
const GENERIC_DESCRIPTIONS = ['Invalid request parameters'];

// Máximo de líneas del aviso de validación de campos (SPEC v2-36): con más mensajes se muestran
// MAX_FIELD_LINES - 1 y una línea "… y N más".
const MAX_FIELD_LINES = 5;

// Texto del detalle campo por campo de un 400 `validation.error`: un `message` por línea (BaseDTO ya lo arma
// con la etiqueta legible; `field` es un nombre técnico y no se muestra), en el orden del DTO, sin repetidos y
// sin los que no son string o están vacíos. Devuelve '' si no queda ninguno.
const buildFieldErrorsText = (errors) => {
  const lines = [];
  errors.forEach((item) => {
    const message = item && typeof item.message === 'string' ? item.message.trim() : '';
    if (message && !lines.includes(message)) lines.push(message);
  });
  if (lines.length <= MAX_FIELD_LINES) return lines.join('\n');
  const shown = lines.slice(0, MAX_FIELD_LINES - 1);
  return [...shown, `… y ${lines.length - shown.length} más`].join('\n');
};

/**
 * Resuelve qué mostrar cuando el back responde con error.
 *
 * 1. `error.<name>` si existe esa traducción (el idioma lo resuelve IntlMessages al renderizar);
 * 2. un 400 `validation.error` con `errors`: una línea por mensaje de campo (tope de 5 líneas);
 * 3. si no, la `description` del back (solo en 400/401/403, nunca en un 500);
 * 4. si no, `fallbackKey` (el mensaje genérico de siempre).
 *
 * @param {object} err cuerpo de la respuesta (con `statusCode` si lo puso parseResponse)
 * @param {string} fallbackKey clave genérica, p. ej. 'msg.save.record.error'
 * @param {object} messages catálogo de traducciones (se inyecta en los tests)
 * @returns {{ id: string } | { text: string }}
 */
const getErrorMessage = (err, fallbackKey, messages = esLang) => {
  const fallback = { id: fallbackKey };
  if (!err || typeof err !== 'object') return fallback;

  const first = Array.isArray(err.messages) ? err.messages[0] : undefined;
  if (!first || typeof first !== 'object') return fallback;

  const name = typeof first.message === 'string' ? first.message : '';
  if (name && Object.prototype.hasOwnProperty.call(messages, `error.${name}`)) {
    return { id: `error.${name}` };
  }

  const hasFieldErrors = Array.isArray(err.errors) && err.errors.length > 0;
  if (hasFieldErrors && err.statusCode === 400 && name === 'validation.error') {
    const text = buildFieldErrorsText(err.errors);
    if (text) return { text };
  }

  const description = typeof first.description === 'string' ? first.description.trim() : '';
  const userFacing = USER_FACING_STATUS.includes(err.statusCode);
  if (description && userFacing && !hasFieldErrors && !GENERIC_DESCRIPTIONS.includes(description)) {
    return { text: description };
  }

  return fallback;
};

/**
 * Código de un error de negocio (el `name` del ValidError del back), o undefined si el error no lo es.
 *
 * Los handlers que muestran un mensaje propio por código (`msg.error.creditNote.<code>`, 'invoice.hasPayments', ...)
 * lo usan para decidir. Solo hay código en un 400 de negocio: un 500, un 401/403 de permisos o un 400 de validación
 * de campos (`errors`) no tienen, así que esos handlers caen a su mensaje genérico.
 *
 * Dos formas de respuesta:
 *  - actual (SPEC v2-20): `messages[0].message` es el código y `description` es texto;
 *  - anterior: `messages[0].description` era el objeto `{ name, description }` del ValidError.
 */
export const getErrorCode = (err) => {
  const first = err && Array.isArray(err.messages) ? err.messages[0] : undefined;
  if (!first || typeof first !== 'object') return undefined;

  const legacy = first.description;
  if (legacy && typeof legacy === 'object' && typeof legacy.name === 'string' && legacy.name) return legacy.name;

  const description = typeof first.description === 'string' ? first.description.trim() : '';
  const businessError = err.statusCode === 400
    && !(Array.isArray(err.errors) && err.errors.length > 0)
    && !GENERIC_DESCRIPTIONS.includes(description);
  return businessError && typeof first.message === 'string' && first.message ? first.message : undefined;
};

export default getErrorMessage;
