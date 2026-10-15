// Reglas de campos de Almacenes (SPEC v2-03-sr). Son las mismas que valida el back (StoreDTO y StoreService): el
// back es quien decide, y esto solo evita una llamada que ya se sabe rechazada. Los números y casos son los de
// modules/inventory/store/__tests__/StoreDTO.required.test.js y StoreService.rules.test.js.
//
// Tipo: 1 Almacén, 2 Centro de Destino, 3 Ambos. Sin valor por defecto: la pantalla arranca en 0 ("Seleccione").

export const MAX_NAME = 50;
export const MAX_DESCRIPTION = 500;
export const MAX_ACCOUNT = 20;
export const TYPE_CENTER = 2;
export const STORE_TYPES = [1, 2, 3];

const ACCOUNT_FIELDS = ['invCtaCode', 'costCtaCode', 'expenseCtaCode'];

export const isValidType = (type) => STORE_TYPES.includes(Number(type));

// La cuenta de almacén es obligatoria si el tipo no es Centro de Destino y la empresa tiene Contabilidad activa.
export const isStoreAccountRequired = ({ type, accountingActive }) => !!accountingActive && Number(type) !== TYPE_CENTER;

// Errores por campo (ids de traducción). Un objeto vacío significa que se puede enviar.
export const validateStore = (form, { accountingActive = true } = {}) => {
  const errors = {};
  const name = String(form?.name ?? '').trim();

  if (!name) errors.name = 'msg.required.input.name';
  else if (name.length > MAX_NAME) errors.name = 'page.store.error.nameMax';

  if (!isValidType(form?.type)) errors.type = 'page.store.error.type';

  if (String(form?.description ?? '').length > MAX_DESCRIPTION) errors.description = 'page.store.error.descriptionMax';

  if (isStoreAccountRequired({ type: form?.type, accountingActive }) && !String(form?.invCtaCode ?? '').trim()) {
    errors.invCtaCode = 'page.store.error.storeAccount';
  }

  ACCOUNT_FIELDS.forEach((field) => {
    if (String(form?.[field] ?? '').trim().length > MAX_ACCOUNT && !errors[field]) errors[field] = 'page.store.error.accountMax';
  });

  return errors;
};

// Cuerpo que se envía al back: sin las tres cuentas si Contabilidad no está activa y sin `fertilizerCredit` si la
// empresa no tiene café (el back rechaza `true` sin café; un almacén heredado con el valor viejo seguiría editándose).
// Se descartan los campos que solo existen en la tabla (typeName, isRemoved).
export const buildStorePayload = (form, { accountingActive = true, coffeeActive = false } = {}) => {
  const payload = { ...(form || {}) };
  delete payload.typeName;
  delete payload.isRemoved;
  if (!accountingActive) ACCOUNT_FIELDS.forEach((field) => { delete payload[field]; });
  if (!coffeeActive) delete payload.fertilizerCredit;
  if (typeof payload.name === 'string') payload.name = payload.name.trim();
  return payload;
};
