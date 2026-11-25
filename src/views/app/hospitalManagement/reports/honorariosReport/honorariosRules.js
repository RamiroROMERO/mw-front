// Reglas del Reporte de Honorarios de Hospital (SPEC v2-149-sr): las mismas del back (`validateHonorariosReportQuery`). El back decide siempre; esto evita llamarlo con datos inválidos.
export const TYPES = ['lines', 'receipts', 'summary'];
export const MAX_RANGE_DAYS = 366;

const toUtc = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? '').trim());
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const time = Date.UTC(y, m - 1, d);
  const check = new Date(time);
  return check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d ? time : null;
};

// Devuelve la clave de traducción del primer problema o '' si la consulta es válida. Los textos reutilizan los de otras pantallas con rango de fechas.
export const validateRange = ({ dateStart, dateEnd }) => {
  const start = toUtc(dateStart);
  const end = toUtc(dateEnd);
  if (start === null || end === null) return 'page.honorariosReport.msg.dateRequired';
  if (start > end) return 'page.honorariosReport.msg.rangeInverted';
  if ((end - start) / 86400000 > MAX_RANGE_DAYS) return 'page.honorariosReport.msg.rangeTooLarge';
  return '';
};

// Parámetros del GET (en `data`, no en la URL: `GETPdf` los agrega) para ver, imprimir (`pdf`) o exportar (`xlsx`).
export const buildRequest = ({ type, dateStart, dateEnd }, format = 'json') => {
  if (!TYPES.includes(type)) throw new Error(`Tipo de reporte inválido: ${type}`);
  return { url: `hospital/reports/honorarios/${type}`, params: { dateStart, dateEnd, ...(format === 'json' ? {} : { format }) } };
};

export const toTotal = (response) => Number(response?.totals?.total) || 0;
