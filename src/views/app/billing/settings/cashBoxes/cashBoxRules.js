// Reglas de campos de Cajas de cobro (revisión de pantalla, 2026-11-17). Son las mismas que valida el back (FacSetCashDTO y FacSetCashService): el back es quien decide, y
// esto solo evita una llamada que ya se sabe rechazada. Los números y casos son los de dtos/__tests__/FacSetCashDTO.test.js del back.

export const MIN_NAME = 5; // fac_cajas.sc2: menos de 5 caracteres es error
export const MAX_NAME = 40; // fac_cajas.nombre varchar(40)
export const MAX_ACCOUNT = 20;

export const INITIAL_CASH_BOX_FORM = Object.freeze({
  id: 0,
  name: '',
  cashCtaCode: '',
  depositCtaCode: '',
  billingAreaId: 0,
  status: true
});

const text = (value) => String(value ?? '').trim();

/** Errores por campo (ids de traducción). Un objeto vacío significa que se puede enviar. El área es opcional (0 = sin área). */
export const validateCashBox = (form = {}) => {
  const errors = {};
  const name = text(form.name);

  if (name.length < MIN_NAME) errors.name = 'page.cashBoxes.error.name';
  else if (name.length > MAX_NAME) errors.name = 'page.cashBoxes.error.nameMax';

  if (text(form.cashCtaCode) === '') errors.cashCtaCode = 'msg.required.input.cashAccount';
  else if (text(form.cashCtaCode).length > MAX_ACCOUNT) errors.cashCtaCode = 'page.cashBoxes.error.accountMax';

  if (text(form.depositCtaCode) === '') errors.depositCtaCode = 'msg.required.input.depositAccount';
  else if (text(form.depositCtaCode).length > MAX_ACCOUNT) errors.depositCtaCode = 'page.cashBoxes.error.accountMax';

  return errors;
};

// Cuerpo que se envía al back: solo los campos del formulario. Un área vacía o 0 viaja como 0 ("sin área").
export const buildCashBoxPayload = (form = {}) => ({
  name: text(form.name),
  cashCtaCode: text(form.cashCtaCode),
  depositCtaCode: text(form.depositCtaCode),
  billingAreaId: Number(form.billingAreaId) > 0 ? Number(form.billingAreaId) : 0,
  status: !!form.status
});

// Fila del back (`GET /billing/settings/cashRegisters`) al formulario: nulos a valor inicial y `status` booleano real.
export const mapCashBoxToForm = (item = {}) => {
  const form = { ...INITIAL_CASH_BOX_FORM };
  Object.keys(INITIAL_CASH_BOX_FORM).forEach((key) => {
    const value = item?.[key];
    if (value === undefined || value === null) return;
    form[key] = value;
  });
  form.status = form.status === true || !!Number(form.status);
  form.billingAreaId = Number(form.billingAreaId) || 0;
  return form;
};
