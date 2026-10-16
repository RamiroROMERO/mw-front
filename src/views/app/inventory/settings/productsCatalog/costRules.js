// Reglas del modal de Costos del Catálogo de productos (SPEC v2-10-sr). Son las mismas que valida el back (ProductCostsDTO y
// ProductService.updateCosts): el back es quien decide, y esto solo evita una llamada que ya se sabe rechazada. Mismos casos que
// ProductCostsDTO.test.js y ProductService.costs.test.js del back.
//
// Nombres de la API: `costValue` (costo promedio), `lastCostValue` (último costo de compra) y `maxCostValue` (costo máximo).
// El tipo del producto: 1 = Producto, 2 = Servicio (solo un servicio puede tener un costo en 0).

export const COST_FIELDS = ['costValue', 'lastCostValue', 'maxCostValue'];
export const TYPE_SERVICE = 2;
export const MAX_COST = Number('99999999999.99999'); // DECIMAL(17,5); como texto: el literal numérico pierde precisión

const isBlank = (v) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
const toNumber = (v) => (isBlank(v) || typeof v === 'boolean' ? NaN : Number(v));

// Privilegio "Editar Costos Promedio" (usu_accniv): `active` en `mw_current_userModules`. El back vuelve a exigirlo.
export const COSTS_PRIVILEGE_CODE = '11.01.003';
export const hasCostsPrivilege = (privilege) => Boolean(privilege && privilege.active);

export const isService = (type) => Number(type) === TYPE_SERVICE;

// Costos actuales del producto -> formulario del modal. Todo en texto para los campos; un valor ausente o nulo queda en ''.
export const mapCostsToForm = (product) => Object.fromEntries(
  COST_FIELDS.map((field) => [field, isBlank(product?.[field]) ? '' : String(product[field])])
);

// Devuelve { campo: idDeTraducción } con los errores; vacío si todo es válido.
export const validateCosts = (form, type) => {
  const errors = {};
  COST_FIELDS.forEach((field) => {
    const value = toNumber(form?.[field]);
    if (isBlank(form?.[field])) errors[field] = 'page.productsCatalog.error.costs.required';
    else if (!Number.isFinite(value) || value < 0 || value > MAX_COST) errors[field] = 'page.productsCatalog.error.costs.invalid';
    else if (!isService(type) && value === 0) errors[field] = 'page.productsCatalog.error.costs.zero';
  });
  return errors;
};

// Cuerpo de PUT products/:id/costs: solo los tres montos, como número.
export const buildCostsPayload = (form) => Object.fromEntries(COST_FIELDS.map((field) => [field, Number(form[field])]));

// Lo que queda en la ficha del producto tras guardar: los tres montos y `purchaseCostValue` (el back lo iguala al último costo).
export const costsAfterSave = (payload) => ({ ...payload, purchaseCostValue: payload.lastCostValue });
