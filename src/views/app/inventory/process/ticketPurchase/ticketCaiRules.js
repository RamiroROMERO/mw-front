// Reglas puras de "Gen CAI" y de su relación con Contabilizar en Boleta de Compras (SPEC v2-38-sr). Sin React ni red: deciden qué hace el botón
// según el estado del formulario, para no llamar al back cuando el resultado ya se conoce. El back sigue siendo quien valida.
import { isProcessed } from './ticketPurchaseRules';

// La boleta ya tiene número fiscal (`numcai`): Gen CAI no se vuelve a generar y contabilizar lo exige.
export const hasCai = (form = {}) => String(form?.numberCAI ?? '').trim() !== '';

// 'saveFirst' (sin boleta guardada), 'alreadyGenerated' (ya tiene número fiscal) o 'confirm' (pide confirmación y llama al back).
export const genCaiAction = (form = {}) => {
  if (!(Number(form?.id) > 0)) return 'saveFirst';
  if (hasCai(form)) return 'alreadyGenerated';
  return 'confirm';
};

// 'saveFirst', 'processed' (ya contabilizada), 'genCaiFirst' (sin número fiscal: el back respondería ticketPurchase.cai.required) o 'confirm'.
export const accountAction = (form = {}) => {
  if (!(Number(form?.id) > 0)) return 'saveFirst';
  if (isProcessed(form)) return 'processed';
  if (!hasCai(form)) return 'genCaiFirst';
  return 'confirm';
};

// Respuesta de POST /:id/generateCai -> campos del formulario que se actualizan (el número visible es `documentId`).
export const caiFormPatch = (data = {}) => ({
  documentId: Number(data?.documentId) || 0,
  numberCAI: String(data?.numberCAI ?? '')
});
