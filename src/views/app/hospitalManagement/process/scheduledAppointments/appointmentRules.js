// Citas programadas (SPEC v2-153-sr): las mismas reglas del back (`AppointmentDTO` y `AppointmentService`). El back decide siempre; esto evita llamarlo con datos inválidos.
export const TYPE_FREE = 1; // persona sin expediente (nombre libre)
export const TYPE_PATIENT = 2; // paciente con expediente
export const STATUS_CANCELLED = 2;
export const MIN_FREE_NAME = 5;

const text = (v) => String(v ?? '').trim();
const isId = (v) => /^\d+$/.test(text(v)) && Number(v) > 0;

export const isCalendarDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(value));
  if (!match) return false;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

export const isValidTime = (value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(text(value));

// Hora para el calendario: `HH:mm` si ya lo es; el texto libre del legacy ("3.00 PM") se interpreta en lo posible y si no se entiende queda en 00:00.
export const toCalendarTime = (value) => {
  const raw = text(value);
  if (isValidTime(raw)) return raw;
  const m = /^(\d{1,2})[:.](\d{2})\s*([ap])\.?\s*m?\.?$/i.exec(raw);
  if (m) {
    let h = Number(m[1]) % 12;
    if (m[3].toLowerCase() === 'p') h += 12;
    return `${String(h).padStart(2, '0')}:${m[2]}`;
  }
  return '00:00';
};

// Devuelve { campo: claveDeTraducción }: vacío = válido. La fecha de una cita nueva no es anterior a hoy.
export const validateAppointment = (form, today) => {
  const errors = {};
  if (Number(form.typeId) === TYPE_PATIENT) {
    if (!isId(form.patientId)) errors.patientId = 'msg.required.select.patient';
  } else if (text(form.name).length < MIN_FREE_NAME) errors.name = 'page.appointments.msg.nameShort';
  if (!isId(form.specialistId)) errors.specialistId = 'msg.required.select.specialistId';
  if (!isCalendarDate(form.date) || text(form.date) < today) errors.date = 'page.appointments.msg.datePast';
  if (!isValidTime(form.time)) errors.time = 'page.appointments.msg.timeInvalid';
  return errors;
};

export const buildCreatePayload = (form) => {
  const payload = {
    typeId: Number(form.typeId), date: form.date, time: form.time, specialistId: Number(form.specialistId), phone: text(form.phone), notes: text(form.notes)
  };
  if (Number(form.typeId) === TYPE_PATIENT) payload.patientId = Number(form.patientId);
  else payload.name = text(form.name);
  if (isId(form.specialtyId)) payload.specialtyId = Number(form.specialtyId);
  return payload;
};

// Edición: solo nombre (tipo 1), teléfono y notas; la fecha y la hora cambian reprogramando.
export const buildUpdatePayload = (form) => {
  const payload = { phone: text(form.phone), notes: text(form.notes) };
  if (Number(form.typeId) === TYPE_FREE) payload.name = text(form.name);
  return payload;
};

export const validateReschedule = (form, today) => {
  const errors = {};
  if (!isCalendarDate(form.date) || text(form.date) < today) errors.date = 'page.appointments.msg.datePast';
  if (!isValidTime(form.time)) errors.time = 'page.appointments.msg.timeInvalid';
  return errors;
};

export const buildReschedulePayload = (form) => ({ date: form.date, time: form.time });

// Evento del calendario (FullCalendar). Una cita cancelada no se muestra (el back solo trae las programadas).
export const toCalendarEvent = (item) => ({
  id: String(item.id),
  // El calendario ya muestra la hora del evento: el título lleva solo el paciente y el médico.
  title: `${text(item.name)} - ${text(item.specialistName)}`.trim(),
  start: `${String(item.date).slice(0, 10)}T${toCalendarTime(item.time)}`,
  extendedProps: item
});

// Rango de fechas que pide el calendario según lo visible (FullCalendar entrega `end` exclusivo).
export const visibleRange = ({ start, end }) => {
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const last = new Date(end.getTime());
  last.setDate(last.getDate() - 1);
  return { dateStart: ymd(start), dateEnd: ymd(last) };
};

export const printParams = ({ date, specialistId }) => {
  const params = { date };
  if (isId(specialistId)) params.specialistId = String(Number(specialistId));
  return params;
};
