// Formas de pago y cambio del POS (SPEC v2-81-sr). Mismas reglas que el back: suma exacta en centavos (sobre el texto, sin coma flotante), recibido no menor que el
// total y cambio que solo sale de la forma en efectivo (la predeterminada). El servidor decide; esto evita ir con datos inválidos.
import { toCents, validatePayments, buildPayments } from '../invoicing/invoicePaymentRules';

export const PAYMENT_METHODS_PATH = 'billing/process/pointSales/paymentMethods';

// Filas de las formas de pago a partir de la lista del servidor: la predeterminada (efectivo) sale prellenada con el total.
export const buildPosRows = (methods = [], total = 0) => methods.map((method) => ({
  id: method.id,
  name: method.description ?? '',
  isDefault: Boolean(method.isDefault),
  value: method.isDefault ? String(total ?? 0) : '',
  reference: ''
}));

// Lo recibido vacío vale el total. Devuelve centavos recibidos y de cambio (nunca negativo), o null si lo recibido no es un monto válido.
export const receivedAndChange = (receivedValue, total) => {
  const totalCents = toCents(total);
  const text = String(receivedValue ?? '').trim();
  const receivedCents = text === '' ? totalCents : toCents(text);
  if (receivedCents === null || totalCents === null) return null;
  return { receivedCents, changeCents: Math.max(0, receivedCents - totalCents) };
};

export const formatCents = (cents) => (Math.max(0, Number(cents) || 0) / 100).toFixed(2);

// Error de pantalla (clave de traducción) o null. Orden: formas (monto y suma), recibido y cambio desde efectivo.
export const validatePosPayment = ({ rows, total, receivedValue }) => {
  const paymentError = validatePayments(rows, total);
  if (paymentError) return paymentError;
  const amounts = receivedAndChange(receivedValue, total);
  if (!amounts) return 'page.invoicing.msg.payments.invalidAmount';
  if (amounts.receivedCents < toCents(total)) return 'msg.error.pos.receivedLess';
  if (amounts.changeCents > 0) {
    const cashCents = rows.filter((row) => row.isDefault).reduce((sum, row) => sum + (toCents(row.value) || 0), 0);
    if (amounts.changeCents > cashCents) return 'msg.error.pos.changeNotCash';
  }
  return null;
};

export { buildPayments };
