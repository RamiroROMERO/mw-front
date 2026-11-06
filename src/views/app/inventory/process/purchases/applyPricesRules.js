// Reglas puras de "Aplicar a inventario" (SPEC v2-27-sr). Mismas reglas que el back (modules/inventory/purchases/purchaseApplyRules.js):
// el back es quien calcula el costo, valida las distribuciones y espeja el precio de la distribución por defecto a inv_prod
// (preplmi/me/ma); esto solo arma lo que se envía (únicamente los precios nuevos) y muestra qué se va a copiar.

export const PRICE_KEYS = Object.freeze([1, 2, 3]);

const num = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

// Un precio nuevo distinto de 0 reemplaza al actual; 0 (o vacío) significa conservarlo, igual que en el back.
export const hasNewPrice = (row) => PRICE_KEYS.some((n) => num(row && row[`newPrice${n}`]) !== 0);

// Precio final de una fila para el precio `n`: el nuevo si se digitó, si no el actual.
export const finalPrice = (row, n) => (num(row[`newPrice${n}`]) !== 0 ? num(row[`newPrice${n}`]) : num(row[`oldPrice${n}`]));

// Cuerpo de POST applyInventory. Del cliente el back solo toma distId y newPrice1..3: el costo, el producto y el resto los recalcula.
// Se envían solo las filas con algún precio nuevo; sin ninguna, el cuerpo lleva una lista vacía (la compra se aplica igual).
export const buildApplyPayload = (rows) => ({
  priceRows: (Array.isArray(rows) ? rows : []).filter(hasNewPrice).map((row) => ({
    distId: row.distId,
    newPrice1: num(row.newPrice1),
    newPrice2: num(row.newPrice2),
    newPrice3: num(row.newPrice3)
  }))
});

// Qué se copia a inv_prod desde una fila: null si la fila no es la distribución que se espeja (copiesToProduct del back).
export const rowMirror = (row) => {
  if (!row || row.copiesToProduct !== true) return null;
  const current = PRICE_KEYS.map((n) => num(row[`productPrice${n}`]));
  const final = PRICE_KEYS.map((n) => finalPrice(row, n));
  return { current, final, changed: current.some((value, i) => value !== final[i]) };
};

// Resumen para el modal: productos cuyos precios se copian y productos sin distribución por defecto activa (no se copia nada).
export const mirrorSummary = (rows) => {
  const list = Array.isArray(rows) ? rows : [];
  const copies = [];
  list.forEach((row) => {
    const mirror = rowMirror(row);
    if (mirror && !copies.some((item) => item.productCode === row.productCode)) {
      copies.push({ productCode: row.productCode, productName: row.productName, distId: row.distId, ...mirror });
    }
  });
  const withoutDefault = [];
  list.forEach((row) => {
    if (copies.some((item) => item.productCode === row.productCode)) return;
    if (!withoutDefault.includes(row.productCode)) withoutDefault.push(row.productCode);
  });
  return { copies, withoutDefault };
};
