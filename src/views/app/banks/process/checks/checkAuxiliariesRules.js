// Reglas de "Actualizar auxiliares" de Cheques (SPEC v2-27). El back regenera las CxC y CxP desde el detalle
// GUARDADO en DB, así que el botón solo corre con un cheque guardado, sin anular y sin cambios pendientes.

const num = (value) => Number(value) || 0;

// Huella de lo que el back lee para armar las cuentas: de la cabecera solo la fecha (los campos que la pantalla
// reescribe al cargar, como el beneficiario, no cuentan) y, por línea, cuenta, valores, cliente y proveedor.
// Compara lo cargado/guardado contra lo que está en pantalla.
export const buildDocumentSignature = (header = {}, lines = []) => JSON.stringify({
  h: [header.date],
  l: (lines || []).map((line) => [
    line.idCtaCont, line.description ?? '', num(line.valueDebit), num(line.valueCredit),
    num(line.customerId), num(line.providerId), line.referenceCode ?? ''
  ])
});

// 'ok' | 'saveFirst' (sin guardar) | 'voided' (anulado) | 'unsaved' (cambios sin guardar)
export const getAuxiliariesStatus = ({ id, isVoided, savedSignature, currentSignature }) => {
  if (!(Number(id) > 0)) return 'saveFirst';
  if (isVoided) return 'voided';
  if (savedSignature !== currentSignature) return 'unsaved';
  return 'ok';
};

export const AUXILIARIES_MESSAGES = {
  saveFirst: 'msg.checks.saveFirst',
  voided: 'msg.checks.auxiliaries.voided',
  unsaved: 'msg.checks.auxiliaries.unsaved'
};
