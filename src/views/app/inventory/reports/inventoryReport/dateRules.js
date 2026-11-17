// Reglas de fechas de calendario (YYYY-MM-DD, sin Date de por medio: no dependen de TZ), las mismas del back (`reportQueryRules`).
export const MAX_RANGE_DAYS = 366;

export const isValidCalendarDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? '').trim());
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
};

export const daysBetween = (from, to) => {
  const parse = (v) => Date.UTC(Number(v.slice(0, 4)), Number(v.slice(5, 7)) - 1, Number(v.slice(8, 10)));
  return Math.round((parse(to) - parse(from)) / 86400000);
};
