// Reglas de Cuentas Bancarias (SPEC v2-19). El código de una cuenta con uso (documentos que la referencian por código)
// no se puede cambiar. Mientras se consulta el uso de una cuenta existente el código queda bloqueado: si la consulta
// falla se queda así (lado seguro; el back igual lo rechaza).
// Helper puro, sin dependencias, con tests.

export const resolveCodeLock = ({ isExisting, inUse }) => {
  if (!isExisting) return false;
  return inUse !== false;
};
