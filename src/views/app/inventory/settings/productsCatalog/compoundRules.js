// Reglas del modal de Componentes del producto compuesto del Catálogo de productos (SPEC v2-11-sr). Son las mismas que valida el
// back (ComponentDTO, componentRules.validateQty y ComponentService): el back es quien decide, y esto solo evita una llamada que
// ya se sabe rechazada. Mismos casos que ComponentDTO.test.js, componentRules.test.js y ComponentService.create.test.js del back.
//
// Nombres de la API (`products/:id/components`): `productCode` (componente), `unitedOut` (CÓDIGO de la unidad de salida, no el
// id), `qty` (mayor a 0, máximo 2 decimales), y en la lista `id`, `productName`.

import { round2 } from './priceRules';

const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
const toNumber = (v) => (isBlank(v) || typeof v === 'boolean' ? NaN : Number(v));

export const MAX_CODE_LENGTH = 20; // inv_prod_deta.codprod y und_out son varchar(20)
export const TYPE_SERVICE = 2; // un servicio no puede ser componente

const COMP = 'page.productsCatalog.error.comp';

export const emptyComponentForm = () => ({ id: 0, productCode: '', unitedOut: '', qty: '' });

// Fila de la API -> formulario de edición.
export const mapComponentToForm = (row) => ({
  id: row.id,
  productCode: row.productCode ?? '',
  unitedOut: row.unitedOut ?? '',
  qty: isBlank(row.qty) ? '' : String(row.qty)
});

// La cantidad es un número mayor a 0 con como máximo 2 decimales (round2 desplaza el punto sobre el texto, sin toFixed:
// 1.005 y 0.1 + 0.2 no son cantidades válidas, igual que en el back).
export const isValidQty = (value) => {
  const n = toNumber(value);
  return Number.isFinite(n) && n > 0 && round2(n) === n;
};

// El botón "Compuesto" solo se activa con "Producto compuesto" marcado y un producto guardado (SPEC v2-11-sr, paso 12).
export const canOpenComponents = (product) => {
  const compound = product?.isCompound === true || Number(product?.isCompound) === 1;
  return compound && Number(product?.id) > 0;
};

// Productos que se pueden elegir como componente: no el propio padre, no los que ya son componentes y no los servicios.
// Acepta opciones de combo (`value` = código) o filas de la API (`code`). Un producto sin `type` en la lista no se excluye por
// tipo (el back lo decide).
export const componentOptions = (products, { fatherCode, existingCodes = [] } = {}) => {
  const taken = new Set([fatherCode, ...existingCodes]);
  return (products || []).filter((p) => !taken.has(p.code ?? p.value) && Number(p.type) !== TYPE_SERVICE);
};

// Distribuciones del componente (GET productsDistributions?productCode=) -> opciones del combo de unidad. Solo las activas
// (status 1) y sin repetir; el valor es el CÓDIGO de la unidad (lo que guarda `und_out`), que llega en `undOutData.code`.
export const unitOptions = (distributions) => {
  const seen = new Set();
  const options = [];
  (distributions || []).forEach((row) => {
    const active = row?.status === true || Number(row?.status) === 1;
    const code = row?.undOutData?.code;
    if (!active || isBlank(code) || seen.has(code)) return;
    seen.add(code);
    options.push({ id: code, name: row.undOutName || row.undOutData?.name || code });
  });
  return options;
};

// Devuelve { campo: idDeTraducción } con los errores; vacío si todo es válido. En edición el producto no cambia: no se valida.
export const validateComponent = (form, { fatherCode, isEdit = false } = {}) => {
  const errors = {};

  if (!isEdit) {
    const code = String(form?.productCode ?? '').trim();
    if (isBlank(form?.productCode)) errors.productCode = `${COMP}.productCode`;
    else if (code.length > MAX_CODE_LENGTH) errors.productCode = `${COMP}.productCodeMax`;
    else if (code === String(fatherCode ?? '').trim()) errors.productCode = `${COMP}.self`;
  }

  if (isBlank(form?.unitedOut)) errors.unitedOut = `${COMP}.unit`;
  else if (String(form.unitedOut).trim().length > MAX_CODE_LENGTH) errors.unitedOut = `${COMP}.unitMax`;

  if (isBlank(form?.qty)) errors.qty = `${COMP}.qtyRequired`;
  else if (!isValidQty(form.qty)) errors.qty = `${COMP}.qty`;

  return errors;
};

// Cuerpo de POST (producto, unidad y cantidad) o de PUT (solo unidad y cantidad; el producto componente no cambia).
export const buildComponentPayload = (form, { isEdit = false } = {}) => {
  const payload = { unitedOut: String(form.unitedOut).trim(), qty: Number(form.qty) };
  return isEdit ? payload : { productCode: String(form.productCode).trim(), ...payload };
};
