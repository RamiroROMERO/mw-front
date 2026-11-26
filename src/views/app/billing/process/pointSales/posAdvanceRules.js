// Adelantos (anticipos) de pacientes del POS (SPEC v2-155-sr). El valor del adelanto es la suma de las formas de pago; caja, cajero, fecha y partida los pone el servidor. Al facturar un evento
// se pueden aplicar adelantos pendientes del paciente: restan de lo que paga hoy. Aritmética en centavos sobre el texto.
import { toCents } from '../invoicing/invoicePaymentRules';

export const ADVANCES_PATH = 'billing/process/pointSales/advances';
export const ADVANCE_PATIENTS_PATH = `${ADVANCES_PATH}/patients`;
export const advancePrintPath = ADVANCES_PATH;
export const ADVANCE_PRINT_FILE = 'Adelanto de Paciente.pdf';
export const ADVANCE_HISTORY_FILE = 'Adelantos Disponibles.pdf';
export const MAX_REASON = 200;

const text = (value) => String(value ?? '').trim();
const fromCents = (cents) => (cents / 100).toFixed(2);

// Filas de formas de pago con monto > 0, listas para el servidor.
export const paymentsOf = (rows = []) => rows
  .filter((row) => (toCents(row.value) || 0) > 0)
  .map((row) => ({ paymentTypeDetailId: row.id, amount: Number(row.value), reference: row.reference || '' }));

export const rowsTotalCents = (rows = []) => rows.reduce((sum, row) => sum + (toCents(row.value) || 0), 0);

// Error de pantalla (clave de traducción) o null: paciente elegido, al menos una forma con monto y montos de hasta 2 decimales.
export const validateAdvance = ({ customerId, rows }) => {
  if (!(Number(customerId) > 0)) return 'page.pointSales.advance.msg.patientRequired';
  if (rows.some((row) => text(row.value) !== '' && toCents(row.value) === null)) return 'page.pointSales.advance.msg.amountInvalid';
  if (rowsTotalCents(rows) <= 0) return 'page.pointSales.advance.msg.paymentsRequired';
  return null;
};

export const buildAdvancePayload = ({ sessionId, customerId, rows }) => ({ sessionId: Number(sessionId), customerId: Number(customerId), payments: paymentsOf(rows) });

// Formas de pago sin montos (para empezar un adelanto nuevo).
export const emptyRows = (rows = []) => rows.map((row) => ({ ...row, value: '' }));

export const validateVoidReason = (reason) => {
  const value = text(reason);
  if (value === '') return 'msg.required.input.voidReason';
  return value.length > MAX_REASON ? 'page.pointSales.advance.msg.reasonTooLong' : null;
};

// Total (centavos) de los adelantos elegidos y lo que falta por cobrar: nunca más que el copago.
export const selectedTotalCents = (advances = [], selectedIds = []) => advances.filter((advance) => selectedIds.includes(advance.id)).reduce((sum, advance) => sum + (toCents(advance.value) || 0), 0);

export const applySummary = ({ copayment, advances, selectedIds }) => {
  const applied = selectedTotalCents(advances, selectedIds);
  const copayCents = toCents(copayment) || 0;
  return { appliedCents: applied, exceeds: applied > copayCents, toPay: fromCents(Math.max(copayCents - applied, 0)), applied: fromCents(applied) };
};

// Alterna un adelanto en la selección sin mutar.
export const toggleSelection = (selectedIds, id) => (selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);

// Parámetros de la vista previa del evento con adelantos: ids en una sola cadena, como los espera el servidor.
export const advanceParams = (selectedIds = []) => (selectedIds.length > 0 ? { advanceIds: selectedIds.join(',') } : {});

export const pendingParams = (customerId) => ({ customerId: Number(customerId) });
export const voidParams = (reason) => ({ reason: text(reason).slice(0, MAX_REASON) });
