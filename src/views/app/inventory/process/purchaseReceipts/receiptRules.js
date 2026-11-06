// Reglas puras de la validación de ingresos de una compra (SPEC v2-26-sr). Mismas reglas y mismos casos que el back
// (modules/inventory/purchases/purchaseReceiptRules.js): el back sigue siendo quien decide; esto solo evita llamarlo con algo que ya
// se sabe inválido y arma lo que se envía. Cantidades a 5 decimales con las mitades hacia arriba (sin toFixed).

export const MAX_LINES = 200;
export const EMPTY_DATE = '1900-01-01';

// Códigos de problema = nombres de los errores del back (purchase.receipt.*).
export const CODES = Object.freeze({
  LINES: 'purchase.receipt.lines.required',
  QTY: 'purchase.receipt.qty.invalid',
  DATE: 'purchase.receipt.date.invalid'
});

const isBlank = (value) => value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

// Redondeo a `decimals` decimales con las mitades hacia arriba (en valor absoluto), desplazando el punto sobre el texto del número.
export const roundTo = (value, decimals) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  const text = String(Math.abs(number));
  if (/e/i.test(text)) return Number(Math.abs(number).toFixed(decimals)) * (number < 0 ? -1 : 1);
  const [intPart, fracPart = ''] = text.split('.');
  const kept = intPart + fracPart.slice(0, decimals).padEnd(decimals, '0');
  let scaled = BigInt(kept);
  if (fracPart.length > decimals && fracPart[decimals] >= '5') scaled += 1n;
  const result = Number(scaled) / (10 ** decimals);
  return number < 0 && result !== 0 ? -result : result;
};
export const round5 = (value) => roundTo(value, 5);

// Cantidad: número (o string numérico) >= 0 con como máximo 5 decimales. Devuelve el número o null.
export const parseQty = (value) => {
  if (typeof value === 'string' ? value.trim() === '' : typeof value !== 'number') return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return null;
  return round5(number) === number ? number : null;
};

// Vencimiento: vacío o YYYY-MM-DD de calendario válido. Devuelve el texto, null si viene vacío o undefined si es inválido.
export const parseDate = (value) => {
  if (isBlank(value)) return null;
  if (typeof value !== 'string') return undefined;
  const text = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) return undefined;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  const valid = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return valid ? text : undefined;
};

// Filas de la pantalla a partir de la respuesta de GET receipts: lo digitado (`received`, `expiration`) arranca con el valor actual
// del kardex, no con 0 como el legacy, así una compra ya validada se ve como quedó.
export const rowsFromPreview = (preview) => (preview?.rows || []).map((row) => ({
  ...row,
  received: row.receivedQty,
  expiration: row.expirationDate || ''
}));

// Una fila cambió si lo digitado difiere de lo que tiene el kardex. Una cantidad que no se puede leer cuenta como cambio para que
// la validación la marque.
export const isChanged = (row) => {
  const qty = parseQty(row.received);
  if (qty === null || qty !== round5(row.receivedQty)) return true;
  const date = parseDate(row.expiration);
  if (date === undefined) return true;
  return date !== (row.expirationDate || null);
};

// Estado de color de la fila (legacy): rojo si la recibida es 0, amarillo si difiere de lo comprado, normal en otro caso.
export const rowStatus = (row) => {
  const qty = parseQty(row.received);
  if (qty === null) return 'invalid';
  if (qty === 0) return 'zero';
  if (row.purchasedQty !== null && row.purchasedQty !== undefined && qty !== round5(row.purchasedQty)) return 'differs';
  return 'ok';
};

// Valida las filas que cambiaron, con el mismo orden de errores del back (lista, cantidad, vencimiento). Devuelve
// { problems: [{ code, kardexId, field }], lines: [{ kardexId, receivedQty, expirationDate }] } sin tocar la red. Las filas sin cambios no se
// envían (el back no toca lo que no recibe).
export const validateRows = (rows) => {
  const changed = (rows || []).filter(isChanged);
  if (changed.length === 0 || changed.length > MAX_LINES) {
    return { problems: [{ code: CODES.LINES, kardexId: null, field: null }], lines: [] };
  }
  const problems = [];
  const lines = [];
  changed.forEach((row) => {
    const receivedQty = parseQty(row.received);
    if (receivedQty === null) {
      problems.push({ code: CODES.QTY, kardexId: row.kardexId, field: 'received' });
      return;
    }
    const expirationDate = parseDate(row.expiration);
    if (expirationDate === undefined) {
      problems.push({ code: CODES.DATE, kardexId: row.kardexId, field: 'expiration' });
      return;
    }
    lines.push({ kardexId: row.kardexId, receivedQty, expirationDate });
  });
  return { problems, lines: problems.length > 0 ? [] : lines };
};

// Cuerpo del PUT: solo { kardexId, receivedQty, expirationDate } (el vencimiento vacío va como cadena vacía).
export const buildPayload = (lines) => ({
  lines: lines.map((line) => ({ kardexId: line.kardexId, receivedQty: line.receivedQty, expirationDate: line.expirationDate || '' }))
});
