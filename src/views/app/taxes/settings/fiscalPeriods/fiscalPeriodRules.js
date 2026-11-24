// SPEC v2-117-sr — Períodos fiscales. El back decide (FiscalPeriodDTO y FiscalPeriodService: nombre único, traslape y un solo período activo); esto solo evita
// una llamada que ya se sabe rechazada (mismos casos del DTO) y arma el cuerpo. Cada error es un id de traducción por campo ({} = válido).
export const MAX_PERIOD = 10;

const text = (value) => String(value ?? '').trim();

export const isCalendarDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text(value));
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (month < 1 || month > 12 || day < 1) return false;
  return day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
};

const day = (value) => text(value).slice(0, 10);

export const validatePeriod = ({ period, dateIn, dateOut, status, active } = {}) => {
  const errors = {};
  if (text(period) === '') errors.period = 'msg.required.input.period';
  else if (text(period).length > MAX_PERIOD) errors.period = 'page.fiscalPeriods.error.periodMax';
  if (text(dateIn) === '') errors.dateIn = 'msg.required.input.dateIn';
  else if (!isCalendarDate(dateIn)) errors.dateIn = 'page.fiscalPeriods.error.dateInvalid';
  if (text(dateOut) === '') errors.dateOut = 'msg.required.input.dateOut';
  else if (!isCalendarDate(dateOut)) errors.dateOut = 'page.fiscalPeriods.error.dateInvalid';
  if (!errors.dateIn && !errors.dateOut && day(dateOut) < day(dateIn)) errors.dateOut = 'page.fiscalPeriods.error.range';
  if (active && !status) errors.active = 'page.fiscalPeriods.error.activeInactive';
  return errors;
};

const flag = (value) => (value === true || value === 1 || value === '1' ? 1 : 0);

// Cuerpo del alta o la edición: solo lo que acepta el back (id, empresa y estados ajenos no viajan).
export const buildPeriodPayload = ({ period, dateIn, dateOut, status, active } = {}) => ({
  period: text(period), dateIn: day(dateIn), dateOut: day(dateOut), status: flag(status), active: flag(active)
});
