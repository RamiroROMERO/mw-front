// Factura de un evento hospitalario en el POS (SPEC v2-154-sr). El cajero elige el evento y, si hace falta, la aseguradora y los datos que digita (gastos no elegibles, deducible y
// % de descuento); el copago, la parte de la aseguradora y los totales los calcula el servidor (vista previa) y esta pantalla solo los muestra. Aritmética en centavos sobre el texto.
import { toCents } from '../invoicing/invoicePaymentRules';
import { validatePosPayment } from './posPaymentRules';

export const HOSPITAL_PATH = 'billing/process/pointSales/hospital';
export const EVENTS_PATH = `${HOSPITAL_PATH}/events`;
export const INSURERS_PATH = `${HOSPITAL_PATH}/insurers`;
export const SETTINGS_PATH = `${HOSPITAL_PATH}/settings`;
export const CHECKOUT_PATH = `${HOSPITAL_PATH}/checkout`;
export const previewPath = (eventId) => `${HOSPITAL_PATH}/events/${eventId}/preview`;
export const PREVIEW_DEBOUNCE_MS = 400;

const SALE_CASH = 1;
const text = (value) => String(value ?? '').trim();

// El botón "Facturar evento" solo existe con el módulo hospitalario activo (`is_hospital`, que informa `GET .../hospital/settings` con el privilegio del POS); mientras no se conoce, no se ofrece (el back también lo valida).
export const isHospitalEnabled = (settings) => Boolean(settings?.enabled);

// Parámetros de la vista previa: solo lo que el cajero digitó.
export const buildPreviewParams = ({ insuranceId, gne, deductible, discountPercent, sessionId }) => {
  const params = {};
  if (Number(insuranceId) > 0) params.insuranceId = Number(insuranceId);
  if (text(gne) !== '') params.gne = text(gne);
  if (text(deductible) !== '') params.deductible = text(deductible);
  if (text(discountPercent) !== '') params.discountPercent = text(discountPercent);
  if (Number(sessionId) > 0) params.sessionId = Number(sessionId);
  return params;
};

// Gastos no elegibles, deducible y descuento: montos >= 0 de hasta 2 decimales (vacío = 0) y descuento entre 0 y 100. Devuelve la clave de traducción o null.
export const validateExtras = ({ gne, deductible, discountPercent }) => {
  if (toCents(gne) === null) return 'page.pointSales.hospital.msg.gneInvalid';
  if (toCents(deductible) === null) return 'page.pointSales.hospital.msg.deductibleInvalid';
  const percent = text(discountPercent) === '' ? 0 : Number(text(discountPercent));
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) return 'page.pointSales.hospital.msg.discountInvalid';
  return null;
};

// Formas de pago: la predeterminada (efectivo) sale prellenada con el copago (lo que paga el paciente) y las demás vacías.
export const buildHospitalRows = (rows = [], copayment = 0) => rows.map((row) => ({ ...row, value: row.isDefault ? String(copayment ?? 0) : '' }));

// Error de pantalla (clave de traducción) o null. Contado: el paciente paga exactamente el copago (con copago 0 no hay formas de pago); Crédito: sin formas de pago.
export const validateHospitalCheckout = ({ event, form, preview, rows }) => {
  if (!(Number(event?.id) > 0)) return 'page.pointSales.hospital.msg.eventRequired';
  const extrasError = validateExtras(form);
  if (extrasError) return extrasError;
  if (!preview) return 'page.pointSales.hospital.msg.previewPending';
  if (Number(form.saleType) !== SALE_CASH) return null;
  const copayCents = toCents(preview.copayment);
  if (copayCents === 0) return rows.some((row) => (toCents(row.value) || 0) > 0) ? 'msg.required.input.totalPayMethod' : null;
  return validatePosPayment({ rows, total: preview.copayment, receivedValue: form.receivedValue });
};

// Cuerpo para el servidor: solo el evento, los datos digitados, el tipo de venta, las formas con monto y lo recibido. Líneas, paciente, copago y totales los pone el servidor.
export const buildHospitalCheckoutPayload = ({ sessionId, event, form, rows }) => ({
  sessionId: Number(sessionId),
  eventId: Number(event.id),
  insuranceId: Number(form.insuranceId) > 0 ? Number(form.insuranceId) : 0,
  gne: text(form.gne),
  deductible: text(form.deductible),
  discountPercent: text(form.discountPercent),
  saleType: Number(form.saleType),
  notes: text(form.notes),
  receivedValue: text(form.receivedValue),
  payments: Number(form.saleType) === SALE_CASH
    ? (rows || []).filter((row) => (toCents(row.value) || 0) > 0).map((row) => ({ paymentTypeDetailId: row.id, amount: Number(row.value), reference: row.reference || '' }))
    : []
});

// Formatos hospitalarios de la factura (SPEC v2-158-sr): 2 = aseguradora agrupada por tipo, 3 = consulta médica y 4 = resumida. El formato 1 es la impresión común del POS.
export const HOSPITAL_PRINT_FORMATS = [2, 3, 4];
export const hospitalPrintRequest = ({ id, format }) => ({ url: `${HOSPITAL_PATH}/invoices/${id}/print`, params: { format: Number(format) } });
export const canPrintHospital = (id, format) => Number(id) > 0 && HOSPITAL_PRINT_FORMATS.includes(Number(format));
