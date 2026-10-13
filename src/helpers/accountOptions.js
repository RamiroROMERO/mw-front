// Opciones de los selectores de cuenta contable (SPEC v2-30). El catálogo `accounting/settings/accountants/getSL` marca cada
// cuenta con `blocked`: una cuenta bloqueada no se puede usar en una partida, así que el selector la muestra deshabilitada y con un
// candado (neutral en idioma). Con el privilegio 11.01.023 (la excepción) se puede elegir. El servidor rechaza igual al guardar.
import { getPrivilegeData } from '@Helpers/Utils';

export const BLOCKED_ACCOUNT_PRIVILEGE = '11.01.023';
export const LOCK_MARK = '🔒'; // candado

export const canUseBlockedAccounts = () => {
  try {
    return Boolean(getPrivilegeData(BLOCKED_ACCOUNT_PRIVILEGE).active);
  } catch {
    return false;
  }
};

/**
 * Opción de selector para una cuenta del catálogo ({ cta, nombre, blocked }). `allowed` permite elegir las bloqueadas (por
 * defecto, si el usuario tiene 11.01.023). `react-select` deshabilita sola la opción con `isDisabled`.
 */
export const buildAccountOption = (item, { allowed = canUseBlockedAccounts() } = {}) => {
  const blocked = Boolean(item.blocked);
  return {
    label: `${blocked ? `${LOCK_MARK} ` : ''}${item.cta} - ${item.nombre}`,
    value: item.cta,
    blocked,
    isDisabled: blocked && !allowed
  };
};
