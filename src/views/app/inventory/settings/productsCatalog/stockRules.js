// Existencias por almacén del Catálogo de productos (SPEC v2-14-sr). El back calcula todo desde el kardex
// (GET products/getStock/:code → { applies, rows: [{ storeId, storeName, qty }], total }); aquí solo se normaliza la
// respuesta y se decide cuándo pedirla.
export const EMPTY_STOCK = Object.freeze({ applies: true, rows: [], total: 0 });

// Producto nuevo (id = 0) o respuesta ausente/rota: grid vacío y total en 0.
export const normalizeStock = (data) => {
  if (!data || typeof data !== 'object') return { applies: true, rows: [], total: 0 };
  // `applies` solo es false cuando el back lo dice (producto que no es tipo 1); lo demás cuenta como aplicable.
  if (data.applies === false) return { applies: false, rows: [], total: 0 };
  const rows = Array.isArray(data.rows)
    ? data.rows.map((r) => ({ storeId: r.storeId, storeName: r.storeName ?? '', qty: Number(r.qty) || 0 }))
    : [];
  return { applies: true, rows, total: Number(data.total) || 0 };
};

// Solo se piden las existencias de un producto ya guardado (id > 0) con código.
export const shouldFetchStock = ({ id, code }) => Number(id) > 0 && String(code ?? '').trim() !== '';

// Texto de una cantidad o del total: 2 decimales, y hasta 5 si el saldo los tiene (el kardex guarda 5).
export const formatQty = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0.00';
  const text = String(Math.round(n * 1e5) / 1e5);
  const decimals = text.includes('.') ? text.split('.')[1].length : 0;
  return n.toFixed(Math.min(5, Math.max(2, decimals)));
};

// "Actualizar existencias" reutiliza POST productsStore/refreshStock, que exige el privilegio de Almacenes y Productos
// (SPEC v2-14-sr / v2-15-sr): sin él no se muestra el botón.
export const STORE_PRIVILEGE_CODE = '01.05.006';
export const hasRefreshStockPrivilege = (privilege) => Boolean(privilege && privilege.active);
