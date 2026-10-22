// Reglas de campos de Proveedores. Son las mismas que valida el back (ProviderDTO, ProviderService, ProviderBillingDataDTO y
// ProviderBankDTO): el back es quien decide, y esto solo evita una llamada que ya se sabe rechazada. Los números y casos son los de
// modules/inventory/providers/__tests__ y providerBanks/__tests__. Tabla de campos obligatorios en
// specs/migration-review/inv_process_providers_specs_list.md del back.

export const DNI_MIN = 13;
export const DNI_MAX = 20;
export const MAX_NAME = 120;
export const MAX_PHONE = 50;
export const MAX_EMAIL = 50;
export const MAX_CONTACT = 50;
export const MAX_CONTACT_PHONE = 20;
export const MAX_PERCENT = 100;

export const CAI_MIN = 32;
export const CAI_MAX = 50;
export const RANGE_MAX = 99999999;

export const BANK_MAX = 50;
export const ACCOUNT_NUMBER_MAX = 50;
export const BENEFICIARY_MAX = 80;
export const BENEFICIARY_DNI_MAX = 20;
export const BENEFICIARY_EMAIL_MAX = 50;

// Listas del legacy (inv_provcb.sc2): el tipo de cuenta se guarda como texto y la clasificación como CA/CC.
export const ACCOUNT_TYPES = ['Cuenta de Ahorro', 'Cuenta de Cheques', 'Cuenta de Ahorro en Dolares', 'Cuenta de Cheques en Dolares'];
export const CLASSIFICATIONS = ['CA', 'CC'];
// Opciones para SimpleSelect (por defecto lee id y name): el valor ES el texto.
export const ACCOUNT_TYPE_OPTIONS = ACCOUNT_TYPES.map((name) => ({ id: name, name }));
export const CLASSIFICATION_OPTIONS = CLASSIFICATIONS.map((name) => ({ id: name, name }));

const ACCOUNT_FIELDS = ['payableCtaCode', 'discountCtaCode', 'taxCtaCode', 'freightCtaCode', 'bonusCtaCode', 'otherCtaCode'];
const REQUIRED_ACCOUNTS = ['payableCtaCode', 'discountCtaCode', 'taxCtaCode'];
const CONTACT_FIELDS = ['contactManager', 'contactContab', 'contactSales', 'contactLogistic'];
const CONTACT_PHONE_FIELDS = ['contactManagerPhone', 'contactContabPhone', 'contactSalesPhone', 'contactLogisticPhone'];

const text = (value) => String(value ?? '').trim();
const isEmptySelect = (value) => text(value) === '' || text(value) === '0';

const isNonNegativeInteger = (value) => {
  if (value === '' || value === null || value === undefined) return true;
  const number = Number(value);
  return Number.isInteger(number) && number >= 0;
};
const isPercent = (value) => {
  if (value === '' || value === null || value === undefined) return true;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= MAX_PERCENT;
};

// Las cuentas por pagar, de descuento y de IVA solo se exigen con Contabilidad activa (mw_setting.cont_menu).
export const isAccountRequired = ({ field, accountingActive }) => !!accountingActive && REQUIRED_ACCOUNTS.includes(field);

// Errores por campo (ids de traducción). Un objeto vacío significa que se puede enviar.
export const validateProvider = (form, { accountingActive = true } = {}) => {
  const errors = {};
  const dni = text(form?.dni);
  const name = text(form?.name);
  const phone = text(form?.phone);
  const email = text(form?.email);

  if (isEmptySelect(form?.providerTypeId) || !(Number(form?.providerTypeId) > 0)) errors.providerTypeId = 'msg.required.select.typeProvider';

  if (!dni) errors.dni = 'msg.required.input.dni';
  else if (dni.length > DNI_MAX) errors.dni = 'page.providers.error.dniMax';
  else if (!form?.isInternational && dni.length < DNI_MIN) errors.dni = 'page.providers.error.dniMin';

  if (!name) errors.name = 'msg.required.input.name';
  else if (name.length > MAX_NAME) errors.name = 'page.providers.error.nameMax';

  if (!phone) errors.phone = 'msg.required.input.phone';
  else if (phone.length > MAX_PHONE) errors.phone = 'page.providers.error.phoneMax';

  if (!email) errors.email = 'msg.required.input.email';
  else if (email.length > MAX_EMAIL) errors.email = 'page.providers.error.emailMax';

  if (accountingActive) {
    REQUIRED_ACCOUNTS.forEach((field) => { if (!text(form?.[field]) || text(form?.[field]) === '0') errors[field] = 'msg.required.select.accounts'; });
  }

  ['creditDays', 'shipDays'].forEach((field) => { if (!isNonNegativeInteger(form?.[field])) errors[field] = 'page.providers.error.days'; });
  ['percHosp', 'percProv'].forEach((field) => { if (!isPercent(form?.[field])) errors[field] = 'page.providers.error.percent'; });

  CONTACT_FIELDS.forEach((field) => { if (text(form?.[field]).length > MAX_CONTACT) errors[field] = 'page.providers.error.contactMax'; });
  CONTACT_PHONE_FIELDS.forEach((field) => { if (text(form?.[field]).length > MAX_CONTACT_PHONE) errors[field] = 'page.providers.error.contactPhoneMax'; });

  return errors;
};

// Cuerpo que se envía al back: sin las cuentas si Contabilidad no está activa, sin los campos que solo existen en la tabla o que
// se guardan por otra vía (baja, "Info Fact."), con los textos recortados.
export const buildProviderPayload = (form, { accountingActive = true } = {}) => {
  const payload = { ...(form || {}) };
  ['isRemoved', 'cai', 'rangeIn', 'rangeOut', 'dateLimit', 'typeName', 'providerTypeData'].forEach((field) => { delete payload[field]; });
  if (!accountingActive) ACCOUNT_FIELDS.forEach((field) => { delete payload[field]; });
  ['dni', 'name', 'phone', 'email'].forEach((field) => { if (typeof payload[field] === 'string') payload[field] = payload[field].trim(); });
  return payload;
};

// Fecha local YYYY-MM-DD (no UTC: después de las 18:00 en Honduras UTC ya es "mañana").
export const localToday = (now = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const toRange = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
};

// "Info Fact." (inv_prov_factdata.sc2): CAI de al menos 32 caracteres, rango inicial y final mayores a 0 con el final mayor, y
// fecha límite obligatoria que no sea anterior a hoy.
export const validateBillingData = (form, { today = localToday() } = {}) => {
  const errors = {};
  const cai = text(form?.cai);
  if (cai.length < CAI_MIN || cai.length > CAI_MAX) errors.cai = 'page.providers.error.cai';

  const rangeIn = toRange(form?.rangeIn);
  const rangeOut = toRange(form?.rangeOut);
  if (rangeIn === null || rangeIn <= 0 || rangeIn > RANGE_MAX) errors.rangeIn = 'msg.required.input.range';
  if (rangeOut === null || rangeOut <= 0 || rangeOut > RANGE_MAX) errors.rangeOut = 'msg.required.input.range';
  if (!errors.rangeIn && !errors.rangeOut && rangeOut <= rangeIn) errors.rangeOut = 'page.providers.error.rangeOrder';

  const dateLimit = String(form?.dateLimit ?? '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateLimit)) errors.dateLimit = 'msg.required.input.deadline';
  else if (dateLimit < today) errors.dateLimit = 'page.providers.error.deadlinePast';

  return errors;
};

export const buildBillingPayload = (form) => ({
  cai: text(form?.cai),
  rangeIn: Number(form?.rangeIn),
  rangeOut: Number(form?.rangeOut),
  dateLimit: String(form?.dateLimit).slice(0, 10)
});

// Cuenta bancaria del proveedor (inv_provcb.sc2).
export const validateBankAccount = (form) => {
  const errors = {};
  if (!ACCOUNT_TYPES.includes(text(form?.typeCtaName))) errors.typeCtaName = 'msg.required.select.typeAccount';
  if (!CLASSIFICATIONS.includes(text(form?.classificCta))) errors.classificCta = 'page.providers.error.classification';

  const bankName = text(form?.bankName);
  if (!bankName) errors.bankName = 'msg.required.select.bank';
  else if (bankName.length > BANK_MAX) errors.bankName = 'page.providers.error.bankMax';

  const number = text(form?.bankCtaCode);
  if (!number) errors.bankCtaCode = 'msg.required.input.accountNum';
  else if (number.length > ACCOUNT_NUMBER_MAX) errors.bankCtaCode = 'page.providers.error.accountMax';

  const beneficiary = text(form?.beneficName);
  if (!beneficiary) errors.beneficName = 'msg.required.input.beneficiary';
  else if (beneficiary.length > BENEFICIARY_MAX) errors.beneficName = 'page.providers.error.beneficiaryMax';

  if (text(form?.beneficDni).length > BENEFICIARY_DNI_MAX) errors.beneficDni = 'page.providers.error.beneficiaryDniMax';
  if (text(form?.beneficEmail).length > BENEFICIARY_EMAIL_MAX) errors.beneficEmail = 'page.providers.error.beneficiaryEmailMax';
  return errors;
};

export const buildBankAccountPayload = (form, providerId) => ({
  providerId,
  classificCta: text(form?.classificCta),
  typeCtaName: text(form?.typeCtaName),
  bankName: text(form?.bankName),
  bankCtaCode: text(form?.bankCtaCode),
  beneficName: text(form?.beneficName),
  beneficDni: text(form?.beneficDni),
  beneficEmail: text(form?.beneficEmail),
  isExterior: form?.isExterior ? 1 : 0,
  status: form?.status
});
