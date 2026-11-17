// Reglas de campos de Áreas de facturación (revisión de pantalla, 2026-11-17). Son las mismas que valida el back (AdminAreasDTO y AdminAreasService): el back es
// quien decide, y esto solo evita una llamada que ya se sabe rechazada. Los números y casos son los de dtos/__tests__/AdminAreasDTO.test.js y
// services/__tests__/AdminAreasService.test.js del back.

export const MIN_NAME = 5; // fac_areas.sc2: menos de 5 caracteres es error
export const MAX_NAME = 50;
export const MAX_DOCUMENT = 3;
export const MAX_ACCOUNT = 20;
export const PRICE_TYPES = [1, 2, 3]; // 1 mínimo, 2 medio, 3 máximo

export const ACCOUNT_FIELDS = [
  'incomeCtaCode', 'discountCtaCode', 'taxCtaCode', 'receivableCtaCode', 'shortageCtaCode',
  'severanceCtaCode', 'noticeCtaCode', 'vacationCtaCode', 'thirteenthCtaCode', 'fourteenthCtaCode',
  'depreciationCtaCode', 'depreciationCostCtaCode'
];

export const INITIAL_AREA_FORM = Object.freeze({
  id: 0,
  name: '',
  incomeCtaCode: '',
  discountCtaCode: '',
  taxCtaCode: '',
  receivableCtaCode: '',
  shortageCtaCode: '',
  severanceCtaCode: '',
  noticeCtaCode: '',
  vacationCtaCode: '',
  thirteenthCtaCode: '',
  fourteenthCtaCode: '',
  depreciationCtaCode: '',
  depreciationCostCtaCode: '',
  storeId: 0,
  codeDocument: '',
  localPriceType: 0,
  outsiderPriceType: 0,
  useBilling: true,
  useRrhh: false,
  useFixedAsset: false,
  isHospital: false,
  isDefault: false,
  status: true
});

const text = (value) => String(value ?? '').trim();
const isPositiveInt = (value) => Number.isInteger(Number(value)) && Number(value) > 0 && text(value) !== '';

/**
 * Errores por campo (ids de traducción). Un objeto vacío significa que se puede enviar. `accountingActive`: la cuenta de ingreso es obligatoria solo si la empresa
 * tiene Contabilidad activa (decisión del usuario; el back lo decide con mw_setting.cont_menu).
 */
export const validateArea = (form = {}, { accountingActive = true } = {}) => {
  const errors = {};
  const name = text(form.name);

  if (name.length < MIN_NAME) errors.name = 'page.billingAreas.error.name';
  else if (name.length > MAX_NAME) errors.name = 'page.billingAreas.error.nameMax';

  if (!isPositiveInt(form.storeId)) errors.storeId = 'msg.required.input.idStore';

  const document = text(form.codeDocument);
  if (document === '') errors.codeDocument = 'msg.required.input.codeDocument';
  else if (document.length > MAX_DOCUMENT) errors.codeDocument = 'page.billingAreas.error.documentMax';

  if (!PRICE_TYPES.includes(Number(form.localPriceType))) errors.localPriceType = 'msg.required.input.localPriceType';
  if (!PRICE_TYPES.includes(Number(form.outsiderPriceType))) errors.outsiderPriceType = 'msg.required.input.localPriceType';

  if (accountingActive && text(form.incomeCtaCode) === '') errors.incomeCtaCode = 'page.billingAreas.error.incomeAccount';

  ACCOUNT_FIELDS.forEach((field) => {
    if (text(form[field]).length > MAX_ACCOUNT && !errors[field]) errors[field] = 'page.billingAreas.error.accountMax';
  });

  return errors;
};

// Cuerpo que se envía al back: solo los campos del formulario (la fila de la tabla trae también cuentas incluidas, `accountIng`, `invStore`, `isRemoved`, ...).
export const buildAreaPayload = (form = {}) => {
  const payload = {
    name: text(form.name),
    storeId: Number(form.storeId),
    codeDocument: text(form.codeDocument),
    localPriceType: Number(form.localPriceType),
    outsiderPriceType: Number(form.outsiderPriceType),
    useBilling: !!form.useBilling,
    useRrhh: !!form.useRrhh,
    useFixedAsset: !!form.useFixedAsset,
    isHospital: !!form.isHospital,
    isDefault: !!form.isDefault,
    status: !!form.status
  };
  ACCOUNT_FIELDS.forEach((field) => { payload[field] = text(form[field]); });
  return payload;
};

// Fila del back (`GET /admin/areas`) al formulario: nulos a valor inicial (el back puede devolver null o ausentes) y booleanos reales.
export const mapAreaToForm = (item = {}) => {
  const form = { ...INITIAL_AREA_FORM };
  Object.keys(INITIAL_AREA_FORM).forEach((key) => {
    const value = item?.[key];
    if (value === undefined || value === null) return;
    form[key] = value;
  });
  ['useBilling', 'useRrhh', 'useFixedAsset', 'isHospital', 'isDefault', 'status'].forEach((key) => { form[key] = form[key] === true || !!Number(form[key]); });
  form.storeId = Number(form.storeId) || 0;
  form.localPriceType = Number(form.localPriceType) || 0;
  form.outsiderPriceType = Number(form.outsiderPriceType) || 0;
  return form;
};
