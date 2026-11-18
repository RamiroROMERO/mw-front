// Reglas de campos de Descuentos (revisión de pantalla, 2026-11-17). Son las mismas que valida el back (AdminDiscountDTO y AdminDiscountService): el back es quien decide, y esto
// solo evita una llamada que ya se sabe rechazada. Los números y casos son los de dtos/__tests__/AdminDiscountDTO.test.js del back.

export const MIN_NAME = 5; // fac_desc.sc2: menos de 5 caracteres es error
export const MAX_NAME = 50; // fac_desc.nombre varchar(50)
export const MAX_ACCOUNT = 20;
export const MAX_PERCENT = 100;

export const INITIAL_DISCOUNT_FORM = Object.freeze({ id: 0, name: '', percentValue: '', discountCtaCode: '', status: true });

const text = (value) => String(value ?? '').trim();

/** Porcentaje de 0.01 a 100 con hasta 2 decimales (columna decimal(7,2)); sin notación científica ni signos. */
export const isValidPercent = (value) => {
  const t = text(value);
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return false;
  const number = Number(t);
  return number > 0 && number <= MAX_PERCENT;
};

/**
 * Errores por campo (ids de traducción); un objeto vacío significa que se puede enviar. La cuenta contable es obligatoria solo con Contabilidad activa (fac_desc.sc2:
 * `If contMenu == 1`); `accountingActive` se asume verdadero mientras no se conoce (el back decide).
 */
export const validateDiscount = (form = {}, { accountingActive = true } = {}) => {
  const errors = {};
  const name = text(form.name);
  if (name === '') errors.name = 'msg.required.input.description';
  else if (name.length < MIN_NAME) errors.name = 'page.discounts.error.name';
  else if (name.length > MAX_NAME) errors.name = 'page.discounts.error.nameMax';

  if (text(form.percentValue) === '') errors.percentValue = 'msg.required.input.amount';
  else if (!isValidPercent(form.percentValue)) errors.percentValue = 'page.discounts.error.percent';

  const account = text(form.discountCtaCode);
  if (account === '' && accountingActive) errors.discountCtaCode = 'msg.required.select.contAccount';
  else if (account.length > MAX_ACCOUNT) errors.discountCtaCode = 'page.discounts.error.accountMax';
  return errors;
};

/** Cuerpo que se envía al back: solo los campos del formulario (el porcentaje como número; `isRemoved` nunca). */
export const buildDiscountPayload = (form = {}) => ({
  name: text(form.name),
  percentValue: Number(text(form.percentValue)),
  discountCtaCode: text(form.discountCtaCode),
  status: form.status !== false && Number(form.status) !== 0
});

/** Carga una fila del back al formulario (el porcentaje llega como texto de MySQL: `15.00`). */
export const mapDiscountToForm = (item = {}) => ({
  ...INITIAL_DISCOUNT_FORM,
  id: item.id ?? 0,
  name: item.name ?? '',
  percentValue: item.percentValue === undefined || item.percentValue === null ? '' : String(Number(item.percentValue)),
  discountCtaCode: item.discountCtaCode ?? '',
  status: item.status === undefined ? true : item.status === true || Number(item.status) === 1
});
