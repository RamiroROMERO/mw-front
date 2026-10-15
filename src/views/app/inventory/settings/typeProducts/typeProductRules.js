// Reglas de campos de Tipos de producto. Son las mismas que valida el back (TypeProductDTO): el back es quien decide (además
// comprueba que el código interno no esté repetido y que las cuentas existan), y esto solo evita una llamada que ya se sabe
// rechazada. Los números y casos son los de modules/inventory/typeProducts/__tests__/TypeProductDTO.test.js.

export const MAX_NAME = 50;
export const MAX_CODE_INIT = 4;
export const MAX_DESCRIPTION = 500;
export const CODE_SEQ_PATTERN = /^\d{5}$/;
export const DEFAULT_CODE_SEQ = '00000';
export const ACCOUNT_FIELDS = ['invCtaCode', 'costCtaCode', 'expenseCtaCode', 'incomeCtaCode'];

// Errores por campo (ids de traducción). Un objeto vacío significa que se puede enviar.
export const validateType = (form) => {
  const errors = {};
  const name = String(form?.name ?? '').trim();
  const codeInit = String(form?.codeInit ?? '').trim();
  const codeSeq = String(form?.codeSeq ?? '').trim();

  if (!name) errors.name = 'msg.required.input.name';
  else if (name.length > MAX_NAME) errors.name = 'page.typeProducts.error.nameMax';

  if (!codeInit) errors.codeInit = 'msg.required.input.codeInit';
  else if (codeInit.length > MAX_CODE_INIT) errors.codeInit = 'page.typeProducts.error.codeInitMax';

  // Vacío = valor por defecto ('00000'); con valor debe ser de exactamente 5 dígitos.
  if (codeSeq && !CODE_SEQ_PATTERN.test(codeSeq)) errors.codeSeq = 'page.typeProducts.error.codeSeqFormat';

  if (String(form?.description ?? '').length > MAX_DESCRIPTION) errors.description = 'page.typeProducts.error.descriptionMax';

  return errors;
};

// Cuerpo que se envía al back: nombre e inicial en mayúsculas y recortados (el back los normaliza igual; el legacy los forzaba con
// Format "!"). Al editar no se envían `codeInit` ni `codeSeq`: son inmutables (el legacy los deshabilita) y el back rechaza un valor
// distinto del guardado. Solo viajan los campos que acepta el DTO (sin id, isRemoved ni los nombres viejos de las cuentas).
export const buildTypePayload = (form, { isEdit = false } = {}) => {
  const payload = {
    name: String(form?.name ?? '').trim().toUpperCase(),
    description: String(form?.description ?? ''),
    status: form?.status
  };
  ACCOUNT_FIELDS.forEach((field) => { payload[field] = String(form?.[field] ?? '').trim(); });
  if (!isEdit) {
    payload.codeInit = String(form?.codeInit ?? '').trim().toUpperCase();
    payload.codeSeq = String(form?.codeSeq ?? '').trim() || DEFAULT_CODE_SEQ;
  }
  return payload;
};
