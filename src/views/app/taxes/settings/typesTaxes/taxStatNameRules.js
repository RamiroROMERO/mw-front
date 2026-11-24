// SPEC v2-117-sr — Nombres de estadísticas (tax_stat_names). El back decide (TaxStatNameDTO y TaxStatNameService: nombre único y código fiscal de un documento fiscal);
// esto solo evita una llamada que ya se sabe rechazada (mismos casos del DTO) y arma el cuerpo. Cada error es un id de traducción por campo ({} = válido).
export const MAX_NAME = 50;
export const MAX_FISCAL_CODE = 5;
export const MAX_KIND = 99;

// Banderas de uso del documento, en el orden en que se muestran.
export const USE_FLAGS = ['shopping', 'invoice', 'ncCustomer', 'ndCustomer', 'ncProvider', 'ndProvider', 'ret1', 'ret125', 'retSalary', 'useCai'];

const text = (value) => String(value ?? '').trim();
const flag = (value) => (value === true || value === 1 || value === '1' ? 1 : 0);

export const validateStatName = ({ name, kind, isFiscal, fiscalCode } = {}) => {
  const errors = {};
  if (text(name) === '') errors.name = 'msg.required.input.name';
  else if (text(name).length > MAX_NAME) errors.name = 'page.typesTaxes.error.nameMax';
  if (text(kind) !== '' && (!/^\d+$/.test(text(kind)) || Number(kind) > MAX_KIND)) errors.kind = 'page.typesTaxes.error.kind';
  if (text(fiscalCode).length > MAX_FISCAL_CODE) errors.fiscalCode = 'page.typesTaxes.error.fiscalCodeMax';
  else if (flag(isFiscal) === 1 && text(fiscalCode) === '') errors.fiscalCode = 'page.typesTaxes.error.fiscalCode';
  return errors;
};

// Cuerpo del alta o la edición: solo lo que acepta el back (id, empresa y fechas no viajan). El código vacío es 0.
export const buildStatNamePayload = (form = {}) => ({
  name: text(form.name),
  kind: text(form.kind) === '' ? 0 : Number(form.kind),
  fiscalCode: text(form.fiscalCode),
  isFiscal: flag(form.isFiscal),
  status: flag(form.status),
  ...Object.fromEntries(USE_FLAGS.map((key) => [key, flag(form[key])]))
});
