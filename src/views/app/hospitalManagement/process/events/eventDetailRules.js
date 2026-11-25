// Consumos del evento y honorarios (SPEC v2-152-sr): las mismas reglas del back. El back calcula y decide; aquí solo se arma lo que se manda y se previsualizan los valores.
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const cents = (v) => Math.round(num(v) * 100 + (num(v) >= 0 ? 1e-9 : -1e-9));
const money = (v) => cents(v) / 100;
const twoDecimals = (v) => Math.abs(num(v) * 100 - Math.round(num(v) * 100)) < 1e-7;

export const MAX_LINES = 100;
export const PRODUCT = 1;
export const SERVICE = 2;

// Un evento (typeId 1) y una hospitalización (typeId 2) usan la misma pantalla de consumos con su propia ruta y privilegio.
export const detailPath = (event) => (Number(event?.typeId) === 2 ? 'hospital/process/hospitalizationDetails' : 'hospital/process/eventDetails');
export const isClosed = (event) => Number(event?.status) === 2;

// Vista previa de una línea (el back guarda la suya): descuento e impuesto sobre el subtotal ya descontado, a centavos.
export const previewLine = ({ quantity, price, discPercent = 0, taxPercent = 0 }) => {
  const subtotal = money(num(quantity) * num(price));
  const discount = money(subtotal * num(discPercent) / 100);
  const taxValue = money((subtotal - discount) * num(taxPercent) / 100);
  return { subtotal, discount, taxValue, total: (cents(subtotal) - cents(discount) + cents(taxValue)) / 100 };
};

export const isValidQuantity = (v) => num(v) > 0 && twoDecimals(v);

// Cuerpo del alta por lote: solo producto y cantidad por línea; precio, impuesto, unidad, costo y totales los calcula el back.
export const buildCreatePayload = ({ event, kind, areaId, storeId, rows, date }) => {
  const payload = {
    eventId: Number(event.id), kind: Number(kind), areaId: Number(areaId), storeId: Number(kind) === PRODUCT ? Number(storeId) : 0,
    lines: rows.filter((row) => num(row.qty) > 0).map((row) => ({ productCode: row.productCode, quantity: num(row.qty) }))
  };
  if (date) payload.date = date;
  return payload;
};

// Devuelve { campo: claveDeTraducción }: vacío = válido.
export const validateCreate = ({ kind, areaId, storeId, rows }) => {
  const errors = {};
  if (!(Number(areaId) > 0)) errors.areaId = 'msg.required.select.areaId';
  if (Number(kind) === PRODUCT && !(Number(storeId) > 0)) errors.storeId = 'msg.required.select.storeId';
  const lines = rows.filter((row) => num(row.qty) > 0);
  if (!lines.length) errors.lines = 'page.events.msg.linesRequired';
  else if (lines.length > MAX_LINES) errors.lines = 'page.events.msg.linesTooMany';
  else if (lines.some((row) => !isValidQuantity(row.qty))) errors.lines = 'page.events.msg.quantityInvalid';
  return errors;
};

// Edición de una línea de producto: la cantidad siempre; precio y descuento solo con permiso.
export const buildUpdatePayload = (form, canEditPrice) => {
  const payload = { quantity: num(form.quantity) };
  if (canEditPrice) { payload.price = num(form.price); payload.discPercent = num(form.discPercent); }
  return payload;
};

export const validateUpdate = (form, canEditPrice) => {
  const errors = {};
  if (!isValidQuantity(form.quantity)) errors.quantity = 'page.events.msg.quantityInvalid';
  if (canEditPrice) {
    if (num(form.price) < 0 || !twoDecimals(form.price)) errors.price = 'page.events.msg.priceInvalid';
    if (num(form.discPercent) < 0 || num(form.discPercent) > 100) errors.discPercent = 'page.events.msg.discountInvalid';
  }
  return errors;
};

// Reparto de un proveedor: se da el valor del hospital y el del proveedor es el resto (hospital + proveedor = total al centavo).
export const splitProvider = ({ quantity, price, hospValue }) => {
  const total = money(num(quantity) * num(price));
  const hospital = money(hospValue);
  const provider = (cents(total) - cents(hospital)) / 100;
  return { total, hospValue: hospital, provValue: provider, hospPercent: total > 0 ? money((hospital / total) * 100) : 0 };
};

export const sumTotals = (providers) => providers.reduce((acc, p) => acc + cents(splitProvider(p).total), 0) / 100;

// Honorarios del servicio: la suma de los totales debe ser el valor de la línea (cantidad x precio); una lista vacía los quita.
export const validateProviders = (providers, line) => {
  if (!providers.length) return null;
  if (providers.some((p) => !(num(p.providerId) > 0))) return 'msg.required.select.provider';
  if (new Set(providers.map((p) => Number(p.providerId))).size !== providers.length) return 'page.events.msg.providerRepeated';
  if (providers.some((p) => { const s = splitProvider(p); return s.hospValue < 0 || s.provValue < 0; })) return 'page.events.msg.providerSplitInvalid';
  if (sumTotals(providers) !== money(num(line.quantity) * num(line.price))) return 'page.events.msg.providerTotalMismatch';
  return null;
};

export const buildProvidersPayload = (providers) => ({
  providers: providers.map((p) => ({ providerId: Number(p.providerId), quantity: num(p.quantity), price: num(p.price), hospValue: money(p.hospValue) }))
});

// Avisos del back al guardar (existencia insuficiente): claves de traducción con el producto.
export const warningTexts = (warnings = []) => warnings.filter((w) => w.code === 'line.stock.insufficient').map((w) => ({ id: 'page.events.msg.stockInsufficient', productCode: w.productCode, available: w.available }));
