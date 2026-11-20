// Reglas de campos de Clientes (revisión de pantalla #5 de Facturación, 2026-11-18). Son las mismas que valida el back (FacProcessCustomerDTO y FacProcessCustomerService): el back es quien
// decide, y esto solo evita una llamada que ya se sabe rechazada. Los números y casos son los de dtos/__tests__/FacProcessCustomerDTO.test.js del back.

export const MIN_RTN = 13; // fac_clientes.sc2: menos de 13 caracteres es "DNI de RTN incorrecto" (salvo internacional)
export const MAX_RTN = 20;
export const MAX_NAME = 120;
export const FORBIDDEN_RTN_CHARS = /[-:,.]/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// fnValidatePhone del legacy: número de Honduras de 8 dígitos que empieza con 2, 3, 8 o 9 (sin espacios, guiones ni paréntesis ni el prefijo +504; aquí también se acepta 504).
const PHONE_PATTERN = /^[2389]\d{7}$/;
export const cleanPhone = (value) => String(value ?? '').trim().replace(/[ ()-]/g, '').replace(/^\+?504(?=\d{8}$)/, '');
/** Teléfono válido: vacío no se valida (es opcional) y un cliente internacional tampoco. */
export const isPhoneValid = (phone, isInternational = false) => String(phone ?? '').trim() === '' || (isInternational === true || isInternational === 1 || isInternational === '1') || PHONE_PATTERN.test(cleanPhone(phone));

export const CREDIT_YES = 1;
export const CREDIT_NO = 2;

const pad = (n) => String(n).padStart(2, '0');
/** Fecha local de hoy (`YYYY-MM-DD`): `toJSON()` usa UTC y adelantaría el día en la noche de Honduras. */
export const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export const buildInitialForm = () => ({
  id: 0,
  customerTypeId: 0,
  locationType: 1,
  rtn: '',
  nomcli: '',
  entryDate: localToday(),
  tel: '',
  phone2: '',
  direcc: '',
  deptoCode: '',
  municCode: '',
  sellerId: 0,
  creditRequest: CREDIT_NO,
  creditDays: 0,
  creditLimit: 0,
  paymentTerms: '',
  globalDiscount: 0,
  memberLimit: 0,
  exonerationNumber: '',
  weeklyPeriod: false,
  biweeklyPeriod: false,
  monthlyPeriod: false,
  quarterlyPeriod: false,
  isInternational: false,
  isPartner: false,
  paysTax: false,
  isDefaultPos: false,
  isProducer: false,
  isCertifiedProducer: false,
  isOutsourcingBill: false,
  status: true,
  kind: 1,
  isDefaultInsurer: false,
  purchaseContactName: '',
  purchaseContactPosition: '',
  purchaseContactPhone: '',
  purchaseContactMobile: '',
  purchaseContactEmail: '',
  paymentContactName: '',
  paymentContactPosition: '',
  paymentContactPhone: '',
  paymentContactMobile: '',
  paymentContactEmail: '',
  receivableCtaCode: '',
  discountCtaCode: '',
  taxCtaCode: '',
  freightCtaCode: '',
  bonusCtaCode: ''
});

const text = (value) => String(value ?? '').trim();
const num = (value) => Number(text(value) === '' ? 0 : value);
const truthy = (value) => value === true || value === 1 || value === '1';

/** El RTN cumple el formato (sin caracteres especiales y, salvo internacional, de 13 o más caracteres); vacío no cuenta como válido. */
export const isRtnValid = (rtn, isInternational = false) => {
  const value = text(rtn);
  if (value === '' || value.length > MAX_RTN) return false;
  if (FORBIDDEN_RTN_CHARS.test(value)) return false;
  return truthy(isInternational) || value.length >= MIN_RTN;
};

/** Solo un cliente nuevo con un RTN bien formado busca si ya existe (el legacy carga el existente al salir del campo). */
export const shouldLookupRtn = (form = {}) => Number(form.id) === 0 && isRtnValid(form.rtn, form.isInternational);

const isCalendarDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;

/**
 * Errores por campo (ids de traducción); un objeto vacío significa que se puede enviar. Obligatorios mínimos (decisión del usuario): tipo, RTN, nombre y fecha de ingreso; días y límite
 * solo si solicita crédito; las cuentas por cobrar, descuento e impuesto solo con Contabilidad activa (`accountingActive` se asume verdadero mientras no se conoce: el back decide).
 */
export const validateCustomer = (form = {}, { accountingActive = true, originalTel = null } = {}) => {
  const errors = {};
  if (!(num(form.customerTypeId) > 0)) errors.customerTypeId = 'msg.required.input.typeCustomer';

  if (text(form.rtn) === '') errors.rtn = 'msg.required.input.dni';
  else if (!isRtnValid(form.rtn, form.isInternational)) errors.rtn = 'page.customers.error.rtn';

  if (text(form.nomcli) === '') errors.nomcli = 'msg.required.input.name';
  else if (text(form.nomcli).length > MAX_NAME) errors.nomcli = 'page.customers.error.nameMax';

  const date = text(form.entryDate);
  if (date === '') errors.entryDate = 'msg.required.input.date';
  else if (!isCalendarDate(date) || date > localToday()) errors.entryDate = 'page.customers.error.entryDate';

  // Como el back: el teléfono solo se valida si cambió respecto del cliente cargado (un cliente histórico con varios números sigue editándose).
  if (text(form.tel) !== text(originalTel) && !isPhoneValid(form.tel, form.isInternational)) errors.tel = 'page.customers.error.phone';

  if (num(form.creditRequest) === CREDIT_YES) {
    if (!(num(form.creditDays) > 0)) errors.creditDays = 'msg.required.input.creditDays';
    if (!(num(form.creditLimit) > 0)) errors.creditLimit = 'msg.required.input.creditLimit';
  }

  if (accountingActive) {
    if (text(form.receivableCtaCode) === '') errors.receivableCtaCode = 'msg.required.select.receivable';
    if (text(form.discountCtaCode) === '') errors.discountCtaCode = 'msg.required.select.discountAccount';
    if (text(form.taxCtaCode) === '') errors.taxCtaCode = 'msg.required.select.taxAccount';
  }

  ['purchaseContactEmail', 'paymentContactEmail'].forEach((field) => {
    if (text(form[field]) !== '' && !EMAIL.test(text(form[field]))) errors[field] = 'page.customers.error.email';
  });

  const discount = text(form.globalDiscount);
  if (discount !== '' && !(/^\d+(\.\d{1,2})?$/.test(discount) && Number(discount) <= 100)) errors.globalDiscount = 'page.customers.error.globalDiscount';
  return errors;
};

const BOOLEANS = ['weeklyPeriod', 'biweeklyPeriod', 'monthlyPeriod', 'quarterlyPeriod', 'isInternational', 'isPartner', 'paysTax', 'isDefaultPos', 'isProducer', 'isCertifiedProducer',
  'isOutsourcingBill', 'status', 'isDefaultInsurer'];
const STRINGS = ['rtn', 'nomcli', 'tel', 'phone2', 'direcc', 'deptoCode', 'municCode', 'paymentTerms', 'exonerationNumber', 'purchaseContactName', 'purchaseContactPosition',
  'purchaseContactPhone', 'purchaseContactMobile', 'purchaseContactEmail', 'paymentContactName', 'paymentContactPosition', 'paymentContactPhone', 'paymentContactMobile',
  'paymentContactEmail', 'receivableCtaCode', 'discountCtaCode', 'taxCtaCode', 'freightCtaCode', 'bonusCtaCode'];

/**
 * Cuerpo que se envía al back: solo los campos del formulario (nunca `id`, `isRemoved` ni `companyId`). Los de hospital (`kind`, `isDefaultInsurer`, `memberLimit`) y los de productor
 * solo viajan si la empresa los usa; el back además los descarta si la empresa no es de hospital.
 */
export const buildCustomerPayload = (form = {}, { isHospital = false, isFarmControl = false } = {}) => {
  const payload = {
    customerTypeId: num(form.customerTypeId),
    locationType: num(form.locationType) || 1,
    entryDate: text(form.entryDate),
    sellerId: num(form.sellerId),
    creditRequest: num(form.creditRequest),
    creditDays: num(form.creditDays),
    creditLimit: num(form.creditLimit),
    globalDiscount: num(form.globalDiscount)
  };
  STRINGS.forEach((field) => { payload[field] = text(form[field]); });
  BOOLEANS.forEach((field) => { payload[field] = truthy(form[field]); });
  if (isHospital) {
    payload.kind = num(form.kind) || 1;
    payload.memberLimit = num(form.memberLimit);
  } else {
    delete payload.kind;
    delete payload.isDefaultInsurer;
  }
  if (!isFarmControl) {
    delete payload.isProducer;
    delete payload.isCertifiedProducer;
  }
  return payload;
};

/** Carga una fila del back al formulario: los nulos y ausentes toman el valor inicial (un `null` deja el campo sin controlar) y los enteros 0/1 pasan a booleano. */
export const mapCustomerToForm = (item = {}) => {
  const base = buildInitialForm();
  const form = { ...base };
  Object.keys(base).forEach((key) => {
    const value = item[key];
    if (value === undefined || value === null) return;
    if (typeof base[key] === 'boolean') form[key] = truthy(value);
    else if (typeof base[key] === 'number') form[key] = Number(value);
    else form[key] = String(value);
  });
  form.id = item.id ?? 0;
  if (!form.entryDate || form.entryDate === '1900-01-01') form.entryDate = '';
  form.entryDate = String(form.entryDate).slice(0, 10);
  form.creditLimit = Number(item.creditLimit ?? 0);
  form.globalDiscount = Number(item.globalDiscount ?? 0);
  return form;
};

/** Cuentas del tipo de cliente (nombres de `set_customer_types`) con los nombres del cliente; las vacías del tipo no pisan nada. */
export const accountsFromType = (type) => {
  if (!type) return null;
  return {
    receivableCtaCode: text(type.idCtaCxp),
    discountCtaCode: text(type.idCtaDesc),
    taxCtaCode: text(type.idCtaIva),
    freightCtaCode: text(type.idCtaFlete),
    bonusCtaCode: text(type.idCtaBon)
  };
};

/** Una cuenta guardada que ya no está en el catálogo (inexistente, inactiva o de no movimiento) no se carga: el combo la mostraría vacía y se enviaría igual. */
export const dropUnknownAccounts = (form, accountOptions = []) => {
  const known = new Set(accountOptions.map((option) => option.value));
  const next = { ...form };
  ['receivableCtaCode', 'discountCtaCode', 'taxCtaCode', 'freightCtaCode', 'bonusCtaCode'].forEach((field) => {
    if (next[field] && !known.has(next[field])) next[field] = '';
  });
  return next;
};

// Privilegio "Actualizar Cuentas" de los clientes (99.01.003, usu_accniv): `active` en `mw_current_userModules`. El back vuelve a exigirlo.
export const ACCOUNTS_PRIVILEGE_CODE = '99.01.003';
export const hasAccountsPrivilege = (privilege) => Boolean(privilege && privilege.active);
