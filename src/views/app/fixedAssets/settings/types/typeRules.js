// Reglas de Tipos de Activo (SPEC v2-140-sr). Mismas reglas y casos que TypeDTO del back (af_types.sc2); el back es quien decide. Devuelven ids de traducción por campo.
export const MAX_CODE = 4;
export const MAX_NAME = 50;
export const MIN_NAME = 5;
export const MAX_USER_LIFE = 99;
export const STRAIGHT_LINE = 1; // única depreciación con cálculo: "Unidades producidas" no existe en ninguna parte.

const isPositiveInt = (value) => /^\d+$/.test(String(value ?? '').trim()) && Number(value) > 0;
const text = (value) => String(value ?? '').trim();

export const validateType = (form) => {
  const errors = {};
  if (text(form.code).length === 0 || text(form.code).length > MAX_CODE) errors.code = 'page.fixedAssets.validation.code';
  if (text(form.name).length < MIN_NAME || text(form.name).length > MAX_NAME) errors.name = 'page.fixedAssets.validation.name';
  if (!isPositiveInt(form.userLife) || Number(form.userLife) > MAX_USER_LIFE) errors.userLife = 'page.fixedAssets.validation.userLife';
  if (!isPositiveInt(form.residualValue) || Number(form.residualValue) > 100) errors.residualValue = 'page.fixedAssets.validation.residualValuePercent';
  if (Number(form.depreciationTypeId) !== STRAIGHT_LINE) errors.depreciationTypeId = 'page.fixedAssets.validation.depreciationTypeId';
  if (text(form.depreciationCtaCode) === '') errors.depreciationCtaCode = 'page.fixedAssets.validation.depreciationCtaCode';
  if (text(form.costCtaCode) === '') errors.costCtaCode = 'page.fixedAssets.validation.costCtaCode';
  return errors;
};

// Lo que viaja al back: solo campos que el back acepta (el correlativo y el texto de la depreciación los asigna el back). El código no se manda al editar: no cambia.
export const buildTypePayload = (form) => {
  const isNew = !Number(form.id);
  const payload = {
    name: text(form.name),
    userLife: Number(form.userLife),
    residualValue: Number(form.residualValue),
    depreciationTypeId: STRAIGHT_LINE,
    depreciationCtaCode: text(form.depreciationCtaCode),
    costCtaCode: text(form.costCtaCode),
    status: form.status === true || Number(form.status) === 1 ? 1 : 0
  };
  if (isNew) payload.code = text(form.code).toUpperCase();
  return payload;
};
