// Reglas de Asignación de Activos (SPEC v2-142-sr). Mismas reglas y casos que AssignDTO y AssignService.finishAssignment del back; el back es quien decide
// (activo, responsable y área activos, asignación vigente única, fecha no anterior al ingreso del activo). Devuelven ids de traducción por campo.
import { isAmount, isRealDate, localToday } from '../register/registerRules';

export const MAX_TEXT = 2000;
const text = (value) => String(value ?? '').trim();
const dateText = (value) => text(value).slice(0, 10);
const isId = (value) => /^\d+$/.test(text(value)) && Number(value) > 0;

export const validateAssign = (form, today = localToday()) => {
  const errors = {};
  if (!isRealDate(form.date) || dateText(form.date) > today) errors.date = 'msg.required.select.date';
  if (!isId(form.assetId)) errors.assetId = 'page.fixedAssets.msg.assetRequired';
  if (!isAmount(form.assetValue)) errors.assetValue = 'page.fixedAssets.msg.assetValueRequired';
  if (!isId(form.responsibleId)) errors.responsibleId = 'page.fixedAssets.msg.responsibleRequired';
  if (!isId(form.areaId)) errors.areaId = 'page.fixedAssets.msg.areaRequired';
  if (text(form.others).length > MAX_TEXT) errors.others = 'page.fixedAssets.msg.tooLong';
  if (text(form.notes).length > MAX_TEXT) errors.notes = 'page.fixedAssets.msg.tooLong';
  return errors;
};

// Cierre ("Desasignar"): fecha real, no futura y no anterior a la fecha de la asignación.
export const validateFinish = ({ dateEnd, notesEnd }, assignDate, today = localToday()) => {
  const errors = {};
  if (!isRealDate(dateEnd) || dateText(dateEnd) > today) errors.dateEnd = 'page.fixedAssets.msg.finishDate';
  else if (assignDate && dateText(dateEnd) < dateText(assignDate)) errors.dateEnd = 'page.fixedAssets.msg.finishBeforeAssign';
  if (text(notesEnd).length > MAX_TEXT) errors.notesEnd = 'page.fixedAssets.msg.tooLong';
  return errors;
};

// Qué botones aplican según el estado del documento (el back vuelve a decidir).
export const assignState = (form) => {
  const saved = Number(form.id) > 0;
  const applied = Number(form.isApplied) === 1;
  const finished = !!text(form.dateEnd) && dateText(form.dateEnd) !== '1900-01-01';
  return { saved, applied, finished, locked: applied, canApply: saved && !applied, canFinish: saved && applied && !finished, canDelete: saved && !applied };
};

// Lo que viaja al back: solo campos que acepta (el estado y el cierre los decide el back).
export const buildAssignPayload = (form) => ({
  date: dateText(form.date),
  assetId: Number(form.assetId),
  assetValue: Number(form.assetValue),
  responsibleId: Number(form.responsibleId),
  areaId: Number(form.areaId),
  others: text(form.others),
  notes: text(form.notes)
});
