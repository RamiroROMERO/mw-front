// Reglas puras de la apertura de caja del POS (SPEC v2-78-sr). Mismas reglas que el back (`posSessionRules`): el back decide, esto evita ir con datos inválidos.
export const PRINT_FORMATS = [1, 2, 3];

// Monto de hasta 2 decimales; vacío vale 0; null si no es válido.
export const parseCents = (value) => {
  const text = String(value ?? '').trim();
  if (text === '') return 0;
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
};

export const localToday = (date = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// Devuelve el mapa de errores por campo (ids de traducción); vacío si todo está bien.
export const validateOpening = (form, today = localToday()) => {
  const errors = {};
  if (!(Number(form.cashBox) > 0)) errors.cashBox = 'msg.required.select.cashBox';
  if (!String(form.email ?? '').trim()) errors.email = 'msg.required.cashierEmail';
  if (!String(form.cashierPass ?? '')) errors.cashierPass = 'msg.required.cashierPass';
  const date = String(form.dateCashOpen ?? '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.dateCashOpen = 'msg.required.date';
  else if (date > today) errors.dateCashOpen = 'msg.error.pos.dateFuture';
  if (parseCents(form.initialValue) === null) errors.initialValue = 'msg.error.pos.initialValue';
  if (!PRINT_FORMATS.includes(Number(form.typePrint))) errors.typePrint = 'msg.required.select.invoiceFormat';
  return errors;
};

export const buildOpenRequest = (form, confirmDate = false) => ({
  registerId: Number(form.cashBox),
  email: String(form.email).trim(),
  password: form.cashierPass,
  date: String(form.dateCashOpen).slice(0, 10),
  initialValue: String(form.initialValue ?? '').trim(),
  printFormat: Number(form.typePrint),
  confirmDate
});

// El día no es hoy: la pantalla pide confirmar antes de enviar con confirmDate.
export const needsDateConfirm = (form, today = localToday()) => String(form.dateCashOpen ?? '').slice(0, 10) !== today;

// Lo que el resto del POS guarda en localStorage (`dataCashBox_current`), armado con la respuesta del servidor y no con lo digitado.
export const buildStoredSession = (data) => ({
  sessionId: data.session.id,
  cashId: data.register.id,
  cashierId: data.session.cashierId,
  areaId: data.area.id,
  storeId: data.store.id,
  typePrice: data.priceTypes.local,
  documentCode: data.document.code,
  dateInProcess: data.session.date,
  printType: data.session.printFormat,
  initialValue: data.session.initialValue,
  permissions: data.cashier,
  settings: data.settings
});
