// Recibo de honorarios del POS hospitalario (SPEC v2-156-sr). El recibo es la factura del médico por un evento: se guarda y se contabiliza al crearlo (a crédito, sin impuesto); la retención
// se hace al pagar, con el Comprobante de retención, y no se captura aquí. Aritmética en centavos sobre el texto.

export const HONORARIUMS_PATH = 'billing/process/pointSales/honorariums';
export const HONORARIUM_EVENTS_PATH = `${HONORARIUMS_PATH}/events`;
export const HONORARIUM_PROVIDERS_PATH = `${HONORARIUMS_PATH}/providers`;
export const MAX_INVOICE = 20;
export const MAX_DESCRIPTION = 250;
export const MAX_REASON = 200;

const text = (value) => String(value ?? '').trim();
const isMoney = (value) => /^\d+(\.\d{1,2})?$/.test(text(value)) && Number(text(value)) > 0;

// Error de pantalla (clave de traducción) o null; el back repite todas estas reglas.
export const validateReceipt = ({ eventId, providerId, invoiceNumber, description, expenseCtaCode, paymentTypeId, typeTax, total }) => {
  if (!(Number(eventId) > 0)) return 'page.pointSales.honorarium.msg.eventRequired';
  if (!(Number(providerId) > 0)) return 'page.pointSales.honorarium.msg.providerRequired';
  if (text(invoiceNumber) === '') return 'page.pointSales.honorarium.msg.invoiceRequired';
  if (text(invoiceNumber).length > MAX_INVOICE) return 'page.pointSales.honorarium.msg.invoiceTooLong';
  if (text(description) === '') return 'page.pointSales.honorarium.msg.descriptionRequired';
  if (text(description).length > MAX_DESCRIPTION) return 'page.pointSales.honorarium.msg.descriptionTooLong';
  if (!(Number(typeTax) > 0)) return 'page.pointSales.honorarium.msg.typeTaxRequired';
  if (text(expenseCtaCode) === '' || text(expenseCtaCode) === '0') return 'page.pointSales.honorarium.msg.accountRequired';
  if (!(Number(paymentTypeId) > 0)) return 'page.pointSales.honorarium.msg.paymentRequired';
  if (!isMoney(total)) return 'page.pointSales.honorarium.msg.totalInvalid';
  return null;
};

// Cuerpo para el servidor: solo lo que digita el cajero y la sesión; documento, fecha, retención y cuentas del médico los pone el servidor.
export const buildReceiptPayload = ({ sessionId, form }) => ({
  sessionId: Number(sessionId),
  eventId: Number(form.eventId),
  providerId: Number(form.providerId),
  invoiceNumber: text(form.invoiceNumber),
  description: text(form.description),
  expenseCtaCode: text(form.expenseCtaCode),
  paymentTypeId: Number(form.paymentTypeId),
  typeTax: Number(form.typeTax),
  total: text(form.total)
});

export const validateVoidReason = (reason) => {
  const value = text(reason);
  if (value === '') return 'msg.required.input.voidReason';
  return value.length > MAX_REASON ? 'page.pointSales.honorarium.msg.reasonTooLong' : null;
};

export const voidParams = (reason) => ({ reason: text(reason).slice(0, MAX_REASON) });
export const listParams = (eventId) => ({ eventId: Number(eventId), limit: 200 });

export const providerOptions = (providers = []) => (Array.isArray(providers) ? providers : []).map((item) => ({
  value: Number(item.id),
  label: item.dni ? `${item.dni} - ${item.name}` : String(item.name || '')
}));

// Tipo de documento fiscal por defecto: el que se llama "Honorarios" (en cum_clinic "Recibos por Honoraarios", con ese error de tipeo): se busca por la raíz.
export const defaultTypeTax = (list = []) => {
  const found = list.find((item) => /honora/i.test(String(item.label || '')));
  return found ? Number(found.value) : 0;
};

export const emptyForm = (eventId = 0, typeTax = 0) => ({ eventId, providerId: 0, invoiceNumber: '', description: '', expenseCtaCode: '', paymentTypeId: 0, typeTax, total: '' });

// Un recibo se puede anular mientras esté activo.
export const canVoid = (receipt) => Number(receipt?.status) === 1;
