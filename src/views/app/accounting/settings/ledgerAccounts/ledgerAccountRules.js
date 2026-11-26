// Reglas del catálogo de cuentas contables (SPEC v2-119-sr). Son las mismas de AccountDTO/accountRules del back (el back decide: esto solo evita llamarlo con un cuerpo que sabemos que
// rechaza). El nivel sale del largo de cada nivel de `GET accounting/settings/accountants/format` (cont_ctas_set), no de un `switch` fijo.
export const MAX_CODE = 25;
export const MAX_NAME = 120;

export const INITIAL_ACCOUNT_FORM = {
  id: 0,
  code: '',
  name: '',
  accountTypeId: 0,
  expenseTypeId: 0,
  currencyId: 0,
  opera: false,
  detailAux: false,
  postIn: false,
  useForeignCurrency: false,
  lastDate: '',
  status: true
};

const text = (value) => String(value ?? '').trim();

// Quita los separadores de la máscara (`.`, `-` y espacios): el catálogo guarda solo dígitos.
export const normalizeCode = (value) => text(value).replace(/[.\-\s]/g, '');

// Nivel (1 a 6) según el largo del código; 0 si no coincide con ningún nivel.
export const levelOf = (code, levels = []) => {
  const index = levels.indexOf(normalizeCode(code).length);
  return index === -1 ? 0 : index + 1;
};

// Errores por campo (ids de traducción), como `validateDiscount`. `levels` es el largo de cada nivel; sin él no se valida el nivel. Al editar el código no se valida (no cambia).
export const validateAccount = (form, { levels = [], isEdit = false } = {}) => {
  const errors = {};
  const code = normalizeCode(form.code);
  if (!isEdit) {
    if (code === '') errors.code = 'msg.required.input.code';
    else if (!/^\d+$/.test(code) || code.length > MAX_CODE) errors.code = 'page.ledgerAccounts.error.code.digits';
    else if (levels.length > 0 && levelOf(code, levels) === 0) errors.code = 'page.ledgerAccounts.error.code.level';
  }
  if (text(form.name) === '') errors.name = 'msg.required.input.name';
  else if (text(form.name).length > MAX_NAME) errors.name = 'page.ledgerAccounts.error.name.max';
  if (!(Number(form.accountTypeId) > 0)) errors.accountTypeId = 'msg.required.select.typeAccount';
  if (!(Number(form.expenseTypeId) > 0)) errors.expenseTypeId = 'msg.required.select.typeSpent';
  if (form.useForeignCurrency && !(Number(form.currencyId) > 0)) errors.currencyId = 'page.ledgerAccounts.error.currency.required';
  return errors;
};

// Cuerpo del alta o la edición: solo lo que el back acepta (nivel, eliminada y los textos de tipo y moneda los fija él). Al editar no se manda el código.
export const buildAccountPayload = (form, { isEdit = false } = {}) => {
  const payload = {
    name: text(form.name),
    accountTypeId: Number(form.accountTypeId) || 0,
    expenseTypeId: Number(form.expenseTypeId) || 0,
    currencyId: Number(form.currencyId) || 0,
    opera: Boolean(form.opera),
    detailAux: Boolean(form.detailAux),
    postIn: Boolean(form.postIn),
    useForeignCurrency: Boolean(form.useForeignCurrency),
    lastDate: form.lastDate ? form.lastDate : '1900-01-01',
    status: Boolean(form.status)
  };
  if (!isEdit) payload.code = normalizeCode(form.code);
  return payload;
};

// De una fila del back al formulario (una fecha de cierre 1900-01-01 es "sin fecha").
export const mapAccountToForm = (item) => ({
  ...INITIAL_ACCOUNT_FORM,
  id: item.id,
  code: text(item.code),
  name: text(item.name),
  accountTypeId: Number(item.accountTypeId) || 0,
  expenseTypeId: Number(item.expenseTypeId) || 0,
  currencyId: Number(item.currencyId) || 0,
  opera: Boolean(item.opera),
  detailAux: Boolean(item.detailAux),
  postIn: Boolean(item.postIn),
  useForeignCurrency: Boolean(item.useForeignCurrency),
  lastDate: !item.lastDate || String(item.lastDate).startsWith('1900-01-01') ? '' : String(item.lastDate).slice(0, 10),
  status: Boolean(item.status)
});

// Muestra un código con el formato de cuentas (cont_ctas_set.format, por ejemplo '#####-##-###'): cada '#' toma un dígito y los separadores solo se ponen si aún quedan dígitos, así un código
// de 3 dígitos sale '101', uno de 7 '10101-01' y uno de 10 '10101-01-001'. Sin formato (o con dígitos de sobra) devuelve el código tal cual / agrega el resto al final.
export const formatAccountCode = (code, format = '') => {
  const digits = normalizeCode(code);
  const mask = text(format);
  if (!digits || !mask) return text(code);
  let out = '';
  let index = 0;
  for (const char of mask) {
    if (index >= digits.length) break;
    if (char === '#') {
      out += digits[index];
      index += 1;
    } else {
      out += char;
    }
  }
  return index < digits.length ? out + digits.slice(index) : out;
};
