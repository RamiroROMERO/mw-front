// Configuración de cuentas (cont_ctas_set): mismas reglas que `validateFormatConfig` del back (accountRules.js), para avisar antes de llamar al back.
const MASK = /^[#.-]+$/;
const text = (value) => String(value ?? '').trim();
const digitsOf = (mask) => text(mask).replace(/[^#]/g, '').length;
const MAX_CODE = 25;

export const LEVEL_FIELDS = ['level1', 'level2', 'level3', 'level4', 'level5', 'level6'];

// Devuelve 'format' (formato inválido), 'levels' (niveles inválidos) o null.
export const validateFormatConfig = (form) => {
  const format = text(form?.format);
  if (!MASK.test(format) || digitsOf(format) < 3 || digitsOf(format) > MAX_CODE) return 'format';
  const masks = LEVEL_FIELDS.map((field) => text(form?.[field]));
  const defined = masks.filter((mask) => mask !== '');
  if (defined.length === 0) return 'levels';
  if (masks.slice(0, defined.length).some((mask) => mask === '')) return 'levels';
  if (defined.some((mask) => !MASK.test(mask))) return 'levels';
  const lengths = defined.map(digitsOf);
  if (lengths.some((n, i) => n < 1 || (i > 0 && n <= lengths[i - 1]))) return 'levels';
  if (lengths[lengths.length - 1] !== digitsOf(format)) return 'levels';
  return null;
};

export const buildFormatPayload = (form) => {
  const payload = { format: text(form.format) };
  LEVEL_FIELDS.forEach((field) => { payload[field] = text(form[field]); });
  return payload;
};

export const mapFormatToForm = (data) => {
  const form = { format: text(data?.format) };
  LEVEL_FIELDS.forEach((field) => { form[field] = text(data?.masks?.[field]); });
  return form;
};
