// Reglas de campos de Factores de conversión. Son las mismas que valida el back (ConversionFactorDTO): el back es quien
// decide (además comprueba que las unidades existan y que el par no esté repetido), y esto solo evita una llamada que ya se
// sabe rechazada. Los números y casos son los de modules/inventory/conversionFactors/__tests__/ConversionFactorDTO.test.js.

export const MAX_UNIT_CODE = 5;
export const MAX_INT_DIGITS = 15;
export const MAX_DECIMALS = 5;
// 15 enteros + punto + 5 decimales: tope de caracteres del campo (decimal(20,5) en la DB).
export const MAX_FACTOR_LENGTH = MAX_INT_DIGITS + 1 + MAX_DECIMALS;

export const isValidFactor = (value) => {
  const text = String(value ?? '').trim();
  if (!/^\d+(\.\d+)?$/.test(text)) return false;
  const [integer, decimals = ''] = text.split('.');
  if (integer.replace(/^0+(?=\d)/, '').length > MAX_INT_DIGITS) return false;
  if (decimals.replace(/0+$/, '').length > MAX_DECIMALS) return false;
  return Number(text) > 0;
};

// Errores por campo (ids de traducción). Un objeto vacío significa que se puede enviar.
export const validateFactor = (form) => {
  const errors = {};
  const inputUnitCode = String(form?.inputUnitCode ?? '').trim();
  const outputUnitCode = String(form?.outputUnitCode ?? '').trim();

  if (!inputUnitCode) errors.inputUnitCode = 'msg.required.select.inputUnit';
  else if (inputUnitCode.length > MAX_UNIT_CODE) errors.inputUnitCode = 'page.conversionFactors.error.unitCodeMax';

  if (!outputUnitCode) errors.outputUnitCode = 'msg.required.select.outputUnit';
  else if (outputUnitCode.length > MAX_UNIT_CODE) errors.outputUnitCode = 'page.conversionFactors.error.unitCodeMax';

  const factor = String(form?.valueFactor ?? '').trim();
  if (!factor) errors.valueFactor = 'msg.required.input.valueFactor';
  else if (!isValidFactor(factor)) errors.valueFactor = 'page.conversionFactors.error.valueFactor';

  return errors;
};

// Cuerpo que se envía al back: solo los campos que acepta el DTO (los nombres de las unidades los resuelve el back).
export const buildFactorPayload = (form) => {
  const payload = {
    inputUnitCode: String(form?.inputUnitCode ?? '').trim(),
    outputUnitCode: String(form?.outputUnitCode ?? '').trim(),
    valueFactor: Number(String(form?.valueFactor ?? '').trim())
  };
  if (form?.status !== undefined) payload.status = form.status;
  return payload;
};
