// Listado "Facturas de Combustible" por rango de fechas (SPEC v2-35-sr). El back decide (`validateReportQuery`: fechas obligatorias y
// válidas, `range.invalid` y `format.invalid`); esto solo evita una llamada que ya se sabe rechazada y arma la petición. Los casos
// son los de validateReportQuery.test.js del back, más "sin fechas futuras", que solo pide la pantalla.
import { localToday } from './fuelPurchaseRules';

export const REPORT_URL = 'inventory/process/purchaseGas/report';
export const REPORT_FORMATS = ['pdf', 'xlsx'];
export const REPORT_FILE_NAMES = { pdf: 'Facturas de Combustible.pdf', xlsx: 'Facturas de Combustible.xlsx' };

const text = (value) => String(value ?? '').trim();

// true solo si es `YYYY-MM-DD` y el día existe en ese mes (2026-02-30 no).
export const isValidCalendarDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(value));
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
};

// Rango inicial del modal: del primer día del mes en curso a hoy (calendario local).
export const defaultRange = (today = localToday()) => ({ dateStart: `${today.slice(0, 7)}-01`, dateEnd: today });

/**
 * Valida el rango. Devuelve { dateStart?, dateEnd? } con el id de traducción de cada error ({} = válido). Mismo orden que el
 * back: primero cada fecha (obligatoria, válida, no futura) y después el rango.
 */
export const validateReportRange = ({ dateStart, dateEnd } = {}, { today = localToday() } = {}) => {
  const errors = {};
  const check = (field, value) => {
    const date = text(value);
    if (date === '') errors[field] = 'msg.required.input.date';
    else if (!isValidCalendarDate(date)) errors[field] = 'page.fuelPurchases.report.error.dateInvalid';
    else if (date > today) errors[field] = 'page.fuelPurchases.report.error.dateFuture';
  };
  check('dateStart', dateStart);
  check('dateEnd', dateEnd);
  if (!errors.dateStart && !errors.dateEnd && text(dateStart) > text(dateEnd)) errors.dateEnd = 'page.fuelPurchases.report.error.range';
  return errors;
};

// Arma la petición para `request.GETPdf(url, params, fileName, ...)`. GETPdf agrega `?` + `params` a la URL en un GET, así que
// los parámetros van en `params` y no escritos en la URL (con ambos quedaría `...=pdf?` y el back lo leería mal, lección de la
// v2-12-sr). Cualquier formato distinto de xlsx es pdf, igual que el botón.
export const buildReportRequest = ({ dateStart, dateEnd } = {}, format = 'pdf') => {
  const finalFormat = format === 'xlsx' ? 'xlsx' : 'pdf';
  return {
    url: REPORT_URL,
    params: { dateStart: text(dateStart), dateEnd: text(dateEnd), format: finalFormat },
    fileName: REPORT_FILE_NAMES[finalFormat]
  };
};
