// Captura y listado del POS (SPEC v2-80-sr). Puro, sin DB ni React.
export const PRODUCTS_PATH = 'billing/process/pointSales/products';
export const INVOICES_PATH = 'billing/process/pointSales/invoices';

// El buscador del servidor devuelve una fila por distribución (unidad de venta) con los precios ya sin el ISV incluido. El formulario del POS conserva los nombres
// anteriores de la fila: se adaptan aquí para no reescribir toda la captura. El costo NO se toma del cliente (el back lo calcula al cobrar).
export const fromSearchRow = (row) => ({
  productCode: row.code,
  productName: row.name,
  undoutName: row.unitName,
  undoutId: row.unitId,
  taxPercent: row.taxPercent,
  min: row.minPrice,
  med: row.midPrice,
  max: row.maxPrice,
  costValue: 0,
  valChange: row.unitFactor,
  paymentComiss: row.hasCommission ? 1 : 0,
  typeId: row.kind,
  stock: row.stock,
  suggestedPrice: row.suggestedPrice
});

// Aviso de existencias en pantalla ("No puede facturar más de: X"): solo con control de existencias y para productos (los servicios no tienen). El bloqueo real es del back.
export const stockWarning = ({ controlStock, kind, stock, qty, unitFactor = 1 }) => {
  if (!controlStock || Number(kind) === 2) return null;
  const needed = Number(qty) * (Number(unitFactor) || 1);
  return needed > Number(stock) ? { available: Math.max(0, Number(stock)) } : null;
};

// Estado de una factura del listado: anulada, cerrada (en un cierre de caja) o emitida.
export const invoiceState = (row) => {
  if (row.isVoided) return 'voided';
  if (row.isClosed) return 'closed';
  return 'issued';
};

// Parámetros del listado: el servidor decide el día por defecto y el alcance del cajero; el supervisor puede filtrar por cajero.
export const buildInvoiceParams = ({ sessionId, dateStart, dateEnd, cashierId }) => {
  const params = { sessionId };
  if (dateStart) params.dateStart = dateStart;
  if (dateEnd) params.dateEnd = dateEnd;
  if (Number(cashierId) > 0) params.cashierId = Number(cashierId);
  return params;
};
