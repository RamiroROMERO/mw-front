// Importar al POS una factura de Facturación (SPEC v2-90-sr). Puro, sin DB ni React. El servidor valida todo; aquí solo se arman las peticiones y se decide qué fila se puede abrir.
export const IMPORT_LIST_PATH = 'billing/process/pointSales/importable';
export const IMPORT_PATH = (id) => `billing/process/pointSales/import/${Number(id)}`;

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

// Una factura a Crédito sale deshabilitada (se cobra con un recibo de cancelación); el motivo viene del servidor.
export const canImportRow = (row) => Boolean(row) && row.importable === true;

export const importBlockedReason = (row) => (row && row.reason ? row.reason : 'pos.import.credit');

// Cuerpo de la importación: solo la sesión, las formas de pago y lo recibido. Caja, cajero, fecha y totales los pone el servidor.
export const buildImportPayload = ({ sessionId, payments, receivedValue }) => ({
  sessionId: Number(sessionId),
  receivedValue: receivedValue === undefined || receivedValue === null || receivedValue === '' ? '' : String(receivedValue),
  payments: (payments || []).filter((item) => toNumber(item.value) > 0).map((item) => ({ paymentTypeDetailId: item.id, amount: toNumber(item.value), reference: item.reference || '' }))
});

export const hasImportSession = (sessionId) => Number(sessionId) > 0;
