// Reglas de campos de Tipos de Retención (SPEC v2-112-sr). Son las mismas que valida el back (WithholdingTypeDTO): el back es quien decide (incluida la existencia de la cuenta y del
// tipo de reporte), y esto solo evita una llamada que ya se sabe rechazada. Los números y casos son los de WithholdingTypeDTO.test.js del back.

export const MAX_NAME = 80; // cont_retencionesdescrip.descrip varchar(80)
export const MAX_ACCOUNT = 20;
export const MAX_PERCENT = 100;
export const MAX_SAR_CODE = 2147483647;

export const INITIAL_WITHHOLDING_FORM = Object.freeze({ id: 0, name: '', percentValue: '', sarCode: '', withholdingCtaCode: '', reportTypeId: '', status: true });

const text = (value) => String(value ?? '').trim();

/** Porcentaje de 0.01 a 100 con hasta 2 decimales (columna decimal(6,2)); sin notación científica ni signos. */
export const isValidPercent = (value) => {
  const t = text(value);
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return false;
  const number = Number(t);
  return number > 0 && number <= MAX_PERCENT;
};

/** Código SAR: entero mayor que 0. */
export const isValidSarCode = (value) => /^\d+$/.test(text(value)) && Number(value) > 0 && Number(value) <= MAX_SAR_CODE;

/** Errores por campo (ids de traducción); un objeto vacío significa que se puede enviar. */
export const validateWithholdingType = (form = {}) => {
  const errors = {};
  const name = text(form.name);
  if (name === '') errors.name = 'msg.required.input.description';
  else if (name.length > MAX_NAME) errors.name = 'page.typesRetention.error.nameMax';

  if (text(form.percentValue) === '') errors.percentValue = 'msg.required.input.percent';
  else if (!isValidPercent(form.percentValue)) errors.percentValue = 'page.typesRetention.error.percent';

  if (text(form.sarCode) === '') errors.sarCode = 'msg.required.input.codeSar';
  else if (!isValidSarCode(form.sarCode)) errors.sarCode = 'page.typesRetention.error.sarCode';

  const account = text(form.withholdingCtaCode);
  if (account === '' || account === '0') errors.withholdingCtaCode = 'msg.required.input.IdCtaAccount';
  else if (account.length > MAX_ACCOUNT) errors.withholdingCtaCode = 'page.typesRetention.error.accountMax';
  return errors;
};

/** Cuerpo que se envía al back: solo los campos del formulario (el reporte vacío = 0, sin reporte). */
export const buildWithholdingPayload = (form = {}) => ({
  name: text(form.name),
  percentValue: Number(text(form.percentValue)),
  sarCode: Number(text(form.sarCode)),
  withholdingCtaCode: text(form.withholdingCtaCode),
  reportTypeId: text(form.reportTypeId) === '' ? 0 : Number(form.reportTypeId),
  status: form.status !== false && Number(form.status) !== 0
});

/** Carga una fila del back al formulario (el porcentaje llega como texto de MySQL: `12.50`; reporte 0 = sin reporte). */
export const mapWithholdingToForm = (item = {}) => ({
  ...INITIAL_WITHHOLDING_FORM,
  id: item.id ?? 0,
  name: item.name ?? '',
  percentValue: item.percentValue === undefined || item.percentValue === null ? '' : String(Number(item.percentValue)),
  sarCode: item.sarCode === undefined || item.sarCode === null ? '' : String(item.sarCode),
  withholdingCtaCode: text(item.withholdingCtaCode),
  reportTypeId: Number(item.reportTypeId) > 0 ? String(item.reportTypeId) : '',
  status: item.status === undefined ? true : item.status === true || Number(item.status) === 1
});
