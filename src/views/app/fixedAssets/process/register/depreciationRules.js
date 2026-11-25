// Reglas del Cálculo de depreciación (SPEC v2-144-sr). Mismas reglas y casos que DepreciationDTO y DepreciationService._compute del back; el back es quien decide y arma el cronograma.
// Devuelven ids de traducción por campo.
import { isRealDate } from './registerRules';

export const MAX_USE_LIFE = 99;
const text = (value) => String(value ?? '').trim();
const dateText = (value) => text(value).slice(0, 10);

export const validateDepreciation = ({ dateCalc, useLife, percent }, dateIn) => {
  const errors = {};
  if (!isRealDate(dateCalc)) errors.dateCalc = 'page.fixedAssets.msg.dateCalcInvalid';
  else if (dateIn && dateText(dateCalc) < dateText(dateIn)) errors.dateCalc = 'page.fixedAssets.msg.dateCalcBeforeEntry';
  if (!/^\d+$/.test(text(useLife)) || Number(useLife) < 1 || Number(useLife) > MAX_USE_LIFE) errors.useLife = 'page.fixedAssets.msg.useLifeInvalid';
  const p = Number(percent);
  if (text(percent) === '' || !Number.isFinite(p) || p < 0 || p > 100 || Math.round(p * 100) / 100 !== p) errors.percent = 'page.fixedAssets.msg.percentInvalid';
  return errors;
};

// Lo que viaja al back para calcular y para guardar: solo los tres parámetros (el cronograma lo arma el back).
export const buildDepreciationPayload = ({ dateCalc, useLife, percent }) => ({ dateCalc: dateText(dateCalc), useLife: Number(useLife), percent: Number(percent) });
