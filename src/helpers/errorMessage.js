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

export default getErrorMessage;
