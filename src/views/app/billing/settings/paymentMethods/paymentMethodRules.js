// Reglas de campos de Formas de pago (revisión de pantalla, 2026-11-17). Son las mismas que valida el back (AdminPaymentTypeDTO, PaymentTypeDetailsDTO y PaymentTypeDetailsService):
// el back es quien decide, y esto solo evita una llamada que ya se sabe rechazada. Los números y casos son los de sus tests del back.

// Ruta que monta el back (AppRoutes.js). El front llamaba a `paymentMethodsDetail`, que no existe: el modal de cuentas daba 404.
export const DETAIL_PATH = 'billing/settings/paymentTypeDetails';

export const MAX_NAME = 40; // fac_formaspag.nombre
export const MAX_DESCRIPTION = 50; // fac_formaspagctas.descrip
export const MAX_ACCOUNT = 10; // fac_formaspagctas.numcta y numcta1

export const INITIAL_PAYMENT_METHOD_FORM = Object.freeze({ id: 0, name: '', usageCriteria: 0, usageType: 0, isDefault: false, status: true });

export const INITIAL_DETAIL_FORM = Object.freeze({
  id: 0,
  paymentTypeId: 0,
  description: '',
  paymentCtaCode: '',
  percentComiss: 0,
  commissionCtaCode: '',
  isReceivable: false,
  customerId: 0,
  status: true
});

const text = (value) => String(value ?? '').trim();
const int = (value) => (Number.isInteger(Number(value)) ? Number(value) : 0);

/** Cabecera: nombre obligatorio (40), criterio de uso 1 a 6 y tipo de uso 1 a 3. Devuelve ids de traducción por campo. */
export const validatePaymentMethod = (form = {}) => {
  const errors = {};
  if (text(form.name) === '') errors.name = 'msg.required.input.name';
  else if (text(form.name).length > MAX_NAME) errors.name = 'page.paymentMethods.error.nameMax';
  const criteria = int(form.usageCriteria);
  if (criteria < 1 || criteria > 6) errors.usageCriteria = 'msg.required.input.critUsageType';
  const type = int(form.usageType);
  if (type < 1 || type > 3) errors.usageType = 'msg.required.input.useType';
  return errors;
};

/** Cuerpo de la cabecera: solo lo que el back acepta (la predeterminada viaja como 0 o 1 y `isRemoved` nunca). */
export const buildPaymentMethodPayload = (form = {}) => ({
  name: text(form.name),
  usageCriteria: int(form.usageCriteria),
  usageType: int(form.usageType),
  isDefault: form.isDefault === true || Number(form.isDefault) === 1 ? 1 : 0,
  status: form.status !== false && Number(form.status) !== 0
});

export const mapPaymentMethodToForm = (item = {}) => ({
  ...INITIAL_PAYMENT_METHOD_FORM,
  id: item.id ?? 0,
  name: item.name ?? '',
  usageCriteria: int(item.usageCriteria),
  usageType: int(item.usageType),
  isDefault: Number(item.isDefault) === 1 || item.isDefault === true,
  status: item.status === undefined ? true : item.status === true || Number(item.status) === 1
});

/** Cuentas: descripción y cuenta contable obligatorias, porcentaje de 0 a 100, comisión con porcentaje y "genera CxC" con cliente (reglas de PaymentTypeDetailsService). */
export const validateDetail = (form = {}) => {
  const errors = {};
  if (text(form.description) === '') errors.description = 'msg.required.input.description';
  else if (text(form.description).length > MAX_DESCRIPTION) errors.description = 'page.paymentMethods.error.descriptionMax';
  if (text(form.paymentCtaCode) === '') errors.paymentCtaCode = 'msg.required.select.contAccount';
  const percent = text(form.percentComiss) === '' ? 0 : Number(form.percentComiss);
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) errors.percentComiss = 'page.paymentMethods.error.percent';
  else if (text(form.commissionCtaCode) !== '' && !(percent > 0)) errors.percentComiss = 'page.paymentMethods.error.percentRequired';
  const receivable = form.isReceivable === true || Number(form.isReceivable) === 1;
  if (receivable && !(int(form.customerId) > 0)) errors.customerId = 'page.paymentMethods.error.customerRequired';
  return errors;
};

export const buildDetailPayload = (form = {}, paymentTypeId) => {
  const receivable = form.isReceivable === true || Number(form.isReceivable) === 1;
  return {
    paymentTypeId: int(paymentTypeId),
    description: text(form.description),
    paymentCtaCode: text(form.paymentCtaCode),
    percentComiss: text(form.percentComiss) === '' ? 0 : Number(form.percentComiss),
    commissionCtaCode: text(form.commissionCtaCode),
    isReceivable: receivable ? 1 : 0,
    // Sin "genera CxC" el cliente no aplica (el back lo ignora igual): se envía 0.
    customerId: receivable ? int(form.customerId) : 0,
    status: form.status !== false && Number(form.status) !== 0
  };
};

export const mapDetailToForm = (item = {}) => ({
  ...INITIAL_DETAIL_FORM,
  id: item.id ?? 0,
  paymentTypeId: item.paymentTypeId ?? 0,
  description: item.description ?? '',
  paymentCtaCode: item.paymentCtaCode ?? '',
  percentComiss: Number(item.percentComiss) || 0,
  commissionCtaCode: item.commissionCtaCode ?? '',
  isReceivable: Number(item.isReceivable) === 1 || item.isReceivable === true,
  customerId: int(item.customerId),
  status: item.status === undefined ? true : item.status === true || Number(item.status) === 1
});
