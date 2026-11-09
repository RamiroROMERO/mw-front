// SPEC v2-29-sr: una compra ya procesada (contabilizada, aplicada a inventario o con cuenta por pagar) no admite cambios contables:
// su partida, su kardex y su CxP quedarían desfasados. El back es quien decide (`purchase.locked.processed`); la pantalla solo
// avisa y deshabilita lo que el back rechazaría, para que el usuario no pierda lo digitado. Reglas puras, sin DOM.

export const PROCESSING_REASONS = ['posted', 'applied', 'cxp'];

export const NOT_PROCESSED = Object.freeze({ isProcessed: false, reasons: Object.freeze([]) });

// Campos del formulario que el back rechaza cambiar en una compra procesada (mismos de `LOCKED_FIELDS` del back).
// Siguen editables: CAI, solicitante y los datos de exoneración e importación (modales).
export const LOCKED_FORM_FIELDS = ['providerId', 'invoiceNumber', 'storeId', 'paymentTypeId', 'date', 'dateOut', 'typeFp', 'purchaseOrderId'];

// Solo una compra ya guardada tiene estado que consultar.
export const shouldFetchProcessing = (id) => Number.isInteger(Number(id)) && Number(id) > 0;

// Respuesta de `GET .../:id/processing` -> { isProcessed, reasons }. Cualquier cosa rara cuenta como "no procesada": si no se
// puede saber, no se bloquea nada y decide el back al guardar.
export const normalizeProcessing = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return NOT_PROCESSED;
  const raw = Array.isArray(data.reasons) ? data.reasons : [];
  const reasons = PROCESSING_REASONS.filter((reason) => raw.includes(reason));
  return { isProcessed: data.isProcessed === true, reasons };
};

export const isFieldLocked = (processing, field) => Boolean(processing?.isProcessed) && LOCKED_FORM_FIELDS.includes(field);

// Ids de traducción de los motivos, en orden fijo.
export const reasonMessageIds = (reasons = []) => PROCESSING_REASONS
  .filter((reason) => reasons.includes(reason))
  .map((reason) => `page.purchases.processed.reason.${reason}`);
