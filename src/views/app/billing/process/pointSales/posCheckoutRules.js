// Cuerpo del checkout del POS (SPEC v2-79-sr): el cajero solo manda lo que digita. Caja, cajero, fecha, área, almacén, documento y todos los montos calculados los
// pone el servidor (sesión de caja); los totales en pantalla son informativos.
const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const buildCheckoutPayload = ({ sessionId, header, details, payments, receivedValue }) => ({
  sessionId: Number(sessionId),
  customerId: Number(header.customerId) || 0,
  customerName: header.customerName ?? '',
  customerDNI: header.customerDNI ?? '',
  saleType: Number(header.documentType),
  sellerId: Number(header.sellerId) || 0,
  notes: header.notes ?? '',
  receivedValue: receivedValue === undefined || receivedValue === null || receivedValue === '' ? '' : String(receivedValue),
  details: details.map((line) => ({
    productCode: line.productCode,
    unitName: line.unitedOut,
    qty: toNumber(line.qty),
    price: toNumber(line.price),
    discountPercent: toNumber(line.discountPercent),
    isBonus: Boolean(line.isBonus),
    lotCode: line.lotCode || '',
    expirationDate: line.expirationDate || null
  })),
  payments: (payments || []).filter((item) => toNumber(item.value) > 0).map((item) => ({ paymentTypeDetailId: item.id, amount: toNumber(item.value), reference: item.reference || '' }))
});

// La sesión de caja guardada al abrir; una apertura anterior a la v2-78-sr no trae `sessionId` y obliga a abrir la caja de nuevo.
export const hasSession = (dataCashBox) => Number(dataCashBox?.sessionId) > 0;
