// Reglas de campos de Unidades de medida. Son las mismas que valida el back (MeasurementUnitDTO y MeasurementUnitsService): el
// back es quien decide, y esto solo evita una llamada que ya se sabe rechazada. Los números y casos son los de
// modules/inventory/measurementUnits/__tests__/MeasurementUnitDTO.test.js.
//
// `isPackaging` es el booleano de "Presentación de Empaque" (el back lo guarda como tipo 1 o 2); `baseConversion` es la
// "Conversión en base 1" (la columna `cant`).

export const MAX_CODE = 5;
export const MAX_NAME = 25;
export const MAX_DESCRIPTION = 500;

const isNonNegativeInteger = (value) => {
  if (value === '' || value === null || value === undefined) return true; // vacío = 0
  const number = Number(value);
  return Number.isInteger(number) && number >= 0;
};

// Errores por campo (ids de traducción). Un objeto vacío significa que se puede enviar.
export const validateUnit = (form) => {
  const errors = {};
  const code = String(form?.code ?? '').trim();
  const name = String(form?.name ?? '').trim();

  if (!code) errors.code = 'msg.required.input.code';
  else if (code.length > MAX_CODE) errors.code = 'page.measurementUnits.error.codeMax';

  if (!name) errors.name = 'msg.required.input.name';
  else if (name.length > MAX_NAME) errors.name = 'page.measurementUnits.error.nameMax';

  if (String(form?.description ?? '').length > MAX_DESCRIPTION) errors.description = 'page.measurementUnits.error.descriptionMax';

  if (!isNonNegativeInteger(form?.baseConversion)) errors.baseConversion = 'page.measurementUnits.error.baseConversion';

  return errors;
};

// Cuerpo que se envía al back: el código en mayúsculas y sin espacios (el back lo normaliza igual), `containerUse` solo si la
// empresa tiene control de contenedores (contenedores está fuera de alcance: sin él no se envía) y sin los campos que solo
// existen en la tabla.
export const buildUnitPayload = (form, { containerControl = false } = {}) => {
  const payload = { ...(form || {}) };
  delete payload.id;
  delete payload.type;
  delete payload.isRemoved;
  if (typeof payload.code === 'string') payload.code = payload.code.trim().toUpperCase();
  if (typeof payload.name === 'string') payload.name = payload.name.trim();
  payload.baseConversion = payload.baseConversion === '' || payload.baseConversion === null || payload.baseConversion === undefined ? 0 : Number(payload.baseConversion);
  payload.isPackaging = !!payload.isPackaging;
  if (!containerControl) delete payload.containerUse;
  return payload;
};
