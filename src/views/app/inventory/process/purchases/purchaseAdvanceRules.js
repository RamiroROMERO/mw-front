// Reglas puras de la distribución de anticipos a una compra (SPEC v2-24-sr). Mismas reglas y mismos casos que el back
// (modules/inventory/purchases/purchaseAdvanceRules.js): el back sigue siendo quien decide; esto solo evita llamarlo con algo
// que ya se sabe inválido. Todo se compara en centavos enteros, nunca con decimales de coma flotante.

export const MAX_ITEMS = 50;

// Códigos de problema = nombres de los errores del back (purchase.advance.*).
export const CODES = Object.freeze({
  ITEMS: 'purchase.advance.items.required',
  AMOUNT: 'purchase.advance.amount.invalid',
  BALANCE: 'purchase.advance.balance.exceeded',
  CXP: 'purchase.advance.cxp.exceeded'
});

// Centavos enteros desplazando el punto decimal sobre el texto del número (mitades hacia arriba), igual que utils/RoundMoney del back.
export const toCents = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  const match = /^(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i.exec(String(Math.abs(number)));
  if (!match) return 0;

  const digits = match[1] + (match[2] || '');
  const pointPos = match[1].length + Number(match[3] || 0) + 2;
  let intPart;
  let fracPart;
  if (pointPos <= 0) {
    intPart = '0';
    fracPart = '0'.repeat(-pointPos) + digits;
  } else if (pointPos >= digits.length) {
    intPart = digits + '0'.repeat(pointPos - digits.length);
    fracPart = '';
  } else {
    intPart = digits.slice(0, pointPos);
    fracPart = digits.slice(pointPos);
  }
  let cents = BigInt(intPart);
  if (fracPart.length > 0 && fracPart[0] >= '5') cents += 1n;
  const result = Number(cents);
  return number < 0 && result !== 0 ? -result : result;
};

export const fromCents = (cents) => Number(cents) / 100;

// Un monto es un número (o un string numérico) mayor que 0 con como máximo 2 decimales. Devuelve centavos o null.
export const parseAmount = (amount) => {
  if (typeof amount === 'string' ? amount.trim() === '' : typeof amount !== 'number') return null;
  const number = Number(amount);
  if (!Number.isFinite(number) || number <= 0) return null;
  const cents = toCents(number);
  return cents > 0 && cents / 100 === number ? cents : null;
};

const isBlank = (value) => value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

// ¿Se puede distribuir con esta compra? 'ok' | 'notSaved' (sin guardar) | 'notPosted' (sin contabilizar).
export const distributionStatus = (purchase) => {
  if (!purchase || !(Number(purchase.id) > 0)) return 'notSaved';
  return Number(purchase.pdaNumber) > 0 ? 'ok' : 'notPosted';
};

// Ítems del POST a partir de las filas de la pantalla: [{ advanceId, assigned }]. Una fila sin monto (vacío) no se distribuye.
export const toItems = (rows) => (rows || [])
  .filter((row) => !isBlank(row.assigned))
  .map((row) => ({ advanceId: row.advanceId, amount: row.assigned }));

// Valida lo digitado con las mismas reglas y el mismo orden del back: forma de la lista (items.required), cada monto
// (amount.invalid), cada monto contra su saldo (balance.exceeded) y la suma contra la CxP (cxp.exceeded). Cada etapa corta la
// siguiente. `rows`: [{ advanceId, balance, assigned }] (todas las filas de la pantalla); `cxpBalance`: saldo de la CxP.
// Devuelve { problems: [{ code, advanceId?, amount?, limit? }], items: [{ advanceId, amount, cents }], totalCents }.
export const validateDistribution = ({ rows, cxpBalance }) => {
  const selected = (rows || []).filter((row) => !isBlank(row.assigned));
  const result = (problems, items = [], totalCents = 0) => ({ problems, items, totalCents });

  const ids = selected.map((row) => Number(row.advanceId));
  const shapeInvalid = selected.length === 0 || selected.length > MAX_ITEMS
    || ids.some((id, index) => !Number.isInteger(id) || id <= 0 || ids.indexOf(id) !== index);
  if (shapeInvalid) return result([{ code: CODES.ITEMS }]);

  const amountProblems = [];
  const items = [];
  selected.forEach((row) => {
    const cents = parseAmount(row.assigned);
    if (cents === null) amountProblems.push({ code: CODES.AMOUNT, advanceId: Number(row.advanceId) });
    else items.push({ advanceId: Number(row.advanceId), amount: fromCents(cents), cents, balanceCents: toCents(row.balance) });
  });
  if (amountProblems.length > 0) return result(amountProblems);

  const balanceProblems = items
    .filter((item) => item.cents > item.balanceCents)
    .map((item) => ({ code: CODES.BALANCE, advanceId: item.advanceId, amount: item.amount, limit: fromCents(item.balanceCents) }));
  if (balanceProblems.length > 0) return result(balanceProblems);

  const totalCents = items.reduce((sum, item) => sum + item.cents, 0);
  const cxpCents = toCents(cxpBalance);
  if (totalCents > cxpCents) return result([{ code: CODES.CXP, amount: fromCents(totalCents), limit: fromCents(cxpCents) }]);

  return result([], items.map(({ advanceId, amount, cents }) => ({ advanceId, amount, cents })), totalCents);
};

// Cuerpo del POST: solo advanceId y amount.
export const buildPayload = (items) => ({ items: items.map(({ advanceId, amount }) => ({ advanceId, amount })) });

// Total ya distribuido a la compra (centavos -> número), de la lista `applied` del GET.
export const distributedTotal = (applied) => fromCents((applied || []).reduce((sum, item) => sum + toCents(item.amount), 0));

// Datos que el modal arma a partir del GET: { purchase, available, applied }. `assigned` arranca vacío en cada anticipo.
export const rowsFromPreview = (preview) => ((preview && preview.available) || []).map((item) => ({
  advanceId: item.advanceId,
  date: item.date,
  description: item.description,
  originalValue: item.originalValue,
  balance: item.balance,
  assigned: ''
}));

// ¿Hay algo que ofrecer tras contabilizar? Solo si el proveedor tiene anticipos con saldo.
export const shouldOffer = (preview) => Boolean(preview && Array.isArray(preview.available) && preview.available.some((item) => Number(item.balance) > 0));
