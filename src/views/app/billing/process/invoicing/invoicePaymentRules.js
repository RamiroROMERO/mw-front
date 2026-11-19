// Formas de pago de una factura de Contado al generar el documento fiscal (SPEC v2-76-sr, como `fnGenPayment` del legacy). Mismas reglas que el back: montos de hasta 2
// decimales y no negativos, al menos uno con monto y suma igual al total en centavos. Aritmética en centavos enteros sobre el texto (sin coma flotante).
export const SALE_CASH = 1;

export const PAYMENTS_PATH = 'billing/settings/paymentTypeDetails?status=1';

// Solo una venta de Contado registra formas de pago; a Crédito todo va contra la CxC del cliente.
export const needsPayments = (documentType) => Number(documentType) === SALE_CASH;

const MONEY = /^\d+(\.\d{1,2})?$/;

// Centavos de un monto escrito (número o texto). Devuelve null si no es un monto válido de hasta 2 decimales; vacío vale 0.
export const toCents = (value) => {
  const text = String(value ?? '').trim().replace(/,/g, '');
  if (text === '') return 0;
  if (!MONEY.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
};

// Filas iniciales: una por forma de pago activa; la primera lleva el total (lo más común es un solo pago).
export const buildRows = (options = [], total = 0) => options.map((option, index) => ({
  id: option.id,
  name: option.description ?? option.name ?? '',
  value: index === 0 ? String(total ?? 0) : '',
  reference: ''
}));

// Error de la lista de formas (clave de traducción) o null si es válida.
export const validatePayments = (rows = [], total = 0) => {
  const cents = rows.map((row) => toCents(row.value));
  if (cents.some((value) => value === null)) return 'page.invoicing.msg.payments.invalidAmount';
  const sum = cents.reduce((acc, value) => acc + value, 0);
  if (sum === 0) return 'page.invoicing.msg.payments.required';
  const totalCents = toCents(total);
  if (totalCents === null || sum !== totalCents) return 'msg.required.input.totalPayMethod';
  return null;
};

// Cuerpo para el back: solo las formas con monto (el servidor ignora el resto y recalcula todo).
export const buildPayments = (rows = []) => rows
  .filter((row) => (toCents(row.value) || 0) > 0)
  .map((row) => ({ paymentTypeDetailId: row.id, amount: Number((toCents(row.value) / 100).toFixed(2)), reference: String(row.reference ?? '').trim() }));
