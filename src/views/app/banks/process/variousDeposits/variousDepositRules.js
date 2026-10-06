// Reglas de Depósitos Varios que comparten el hook y la pantalla (SPEC v2-24).
//
// El back (DepositService.saveDocument) exige el privilegio 11.01.015 para editar un depósito YA contabilizado y,
// con él, regenera el asiento y el libro de bancos reutilizando el número de partida. La pantalla no conoce los
// privilegios del usuario: avisa y pide confirmación antes de guardar, y es el back quien decide (403
// `user.forbidden.editPosted`, que `request.PUT` ya muestra traducido).

// Un depósito está contabilizado cuando tiene número de partida (`pdaNumber` en el back; es lo que devuelve GET).
export const isPostedDeposit = (header) => {
  const pdaNumber = Number(header && header.pdaNumber);
  return Number.isFinite(pdaNumber) && pdaNumber > 0;
};

// Guardar un depósito ya guardado (id > 0) y contabilizado regenera la partida: hay que confirmarlo.
export const needsEditPostedConfirmation = (header) => Number(header && header.id) > 0 && isPostedDeposit(header);

// Qué hace "Guardar" según el documento y el privilegio 11.01.015 del usuario (`active` en `mw_current_userModules`):
//   'save'      -> guardar directo (depósito nuevo o sin contabilizar)
//   'confirm'   -> contabilizado y con permiso: confirmar que se regenerará la partida
//   'forbidden' -> contabilizado y sin permiso: avisar sin llamar al back (que respondería 403)
export const resolveSaveAction = (header, canEditPosted) => {
  if (!needsEditPostedConfirmation(header)) return 'save';
  return canEditPosted ? 'confirm' : 'forbidden';
};
