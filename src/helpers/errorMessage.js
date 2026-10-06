import esLang from '../lang/locales/es_ES';

// Códigos HTTP cuyo `description` es un mensaje pensado para el usuario: el 400 de un error de
// negocio (ResponseHelper.error con un ValidError) y los 401/403 de permisos. En un 500 la
// description puede traer el texto de una falla interna, así que nunca se muestra.
const USER_FACING_STATUS = [400, 401, 403];

// description que el back pone en un 400 genérico (ResponseHelper.badRequest); no dice nada útil.
const GENERIC_DESCRIPTIONS = ['Invalid request parameters'];

/**
 * Resuelve qué mostrar cuando el back responde con error.
 *
 * 1. `error.<name>` si existe esa traducción (el idioma lo resuelve IntlMessages al renderizar);
 * 2. si no, la `description` del back (solo en 400/401/403, nunca en un 500);
 * 3. si no, `fallbackKey` (el mensaje genérico de siempre).
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

  const description = typeof first.description === 'string' ? first.description.trim() : '';
  const userFacing = USER_FACING_STATUS.includes(err.statusCode);
  const hasFieldErrors = Array.isArray(err.errors) && err.errors.length > 0;
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
