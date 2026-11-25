// Reglas de Responsables de activos (SPEC v2-140-sr). Mismas reglas y casos que ResponsibleDTO del back (af_responsables.sc2); el back es quien decide.
export const MAX_NAME = 50;
export const MIN_NAME = 10;

const text = (value) => String(value ?? '').trim();

export const validateResponsible = (form) => {
  const errors = {};
  if (text(form.name).length < MIN_NAME || text(form.name).length > MAX_NAME) errors.name = 'page.fixedAssets.validation.responsibleName';
  if (!/^\d+$/.test(text(form.areaId)) || Number(form.areaId) <= 0) errors.areaId = 'page.validation.areaId';
  return errors;
};

export const buildResponsiblePayload = (form) => ({
  name: text(form.name),
  areaId: Number(form.areaId),
  status: form.status === true || Number(form.status) === 1 ? 1 : 0
});
