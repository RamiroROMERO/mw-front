// Reglas de Eventos y Hospitalizaciones (SPEC v2-151-sr): las mismas del back (`EventDTO` y `EventService`). El back decide siempre; esto evita llamarlo con datos inválidos.
export const EVENT_TYPES = [1, 2, 3]; // 1 Privado, 2 Aseguradora privada, 3 Seguro social
export const MAX = { notes: 120, responsibleName: 100, responsiblePhone: 30, contractor: 50, poliza: 30, certificate: 30 };
export const INSURANCE_FIELDS = ['insuranceId', 'termsId', 'secureTypeId', 'coverVal', 'contractor', 'poliza', 'certificate', 'valDeduc'];

const text = (value) => String(value ?? '').trim();
const isId = (value) => /^\d+$/.test(text(value)) && Number(value) > 0;
const isMoney = (value) => text(value) === '' || (/^\d+(\.\d{1,2})?$/.test(text(value)) && Number(value) <= 999999.99);

export const isCalendarDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(value));
  if (!match) return false;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

// Devuelve { campo: claveDeTraducción } con los problemas del formulario del evento (vacío = válido).
export const validateEvent = (form, today) => {
  const errors = {};
  if (!isId(form.fatherId)) errors.fatherId = 'msg.required.select.patient';
  if (!(isCalendarDate(form.date) && text(form.date) <= today)) errors.date = 'page.events.msg.dateInvalid';
  if (!isId(form.areaId)) errors.areaId = 'msg.required.select.hall';
  if (!isId(form.attendingSpecialistId)) errors.attendingSpecialistId = 'msg.required.select.specialistId';
  if (Number(form.eventType) === 2) {
    if (!isId(form.insuranceId)) errors.insuranceId = 'page.events.msg.insuranceRequired';
    if (!isId(form.termsId)) errors.termsId = 'page.events.msg.termsRequired';
    if (!isId(form.secureTypeId)) errors.secureTypeId = 'page.events.msg.secureTypeRequired';
  }
  ['coverVal', 'valDeduc'].forEach((field) => { if (!isMoney(form[field])) errors[field] = 'page.events.msg.moneyInvalid'; });
  return errors;
};

// Cuerpo del alta o la edición: solo los campos que el back acepta (el estado, el tipo y la factura cambian con sus acciones). Con tipo 1 o 3 no se mandan datos de aseguradora.
export const buildEventPayload = (form) => {
  const payload = {
    fatherId: Number(form.fatherId), date: form.date, areaId: Number(form.areaId), attendingSpecialistId: Number(form.attendingSpecialistId),
    responsibleName: text(form.responsibleName), responsiblePhone: text(form.responsiblePhone), notes: text(form.notes), eventType: Number(form.eventType) || 1
  };
  if (payload.eventType === 2) {
    payload.insuranceId = Number(form.insuranceId);
    payload.termsId = Number(form.termsId);
    payload.secureTypeId = Number(form.secureTypeId);
    payload.coverVal = Number(form.coverVal) || 0;
    payload.valDeduc = Number(form.valDeduc) || 0;
    payload.contractor = text(form.contractor);
    payload.poliza = text(form.poliza);
    payload.certificate = text(form.certificate);
  }
  return payload;
};

// Pasar a hospitalización: fecha de ingreso (no futura, no anterior a la del evento), los dos médicos y la habitación. La razón es opcional.
export const validateHospitalization = (form, { today, eventDate }) => {
  const errors = {};
  const dateIn = text(form.dateIn);
  if (!isCalendarDate(dateIn) || dateIn > today) errors.dateIn = 'page.hospitalizations.msg.dateInInvalid';
  else if (eventDate && dateIn < text(eventDate).slice(0, 10)) errors.dateIn = 'page.hospitalizations.msg.dateInBeforeEvent';
  if (!isId(form.admissionSpecialistId)) errors.admissionSpecialistId = 'msg.required.select.specialistId';
  if (!isId(form.responsibleSpecialistId)) errors.responsibleSpecialistId = 'msg.required.select.specialistId';
  if (!isId(form.roomId)) errors.roomId = 'msg.required.select.room';
  return errors;
};

export const buildHospitalizePayload = (form) => ({
  dateIn: form.dateIn, admissionSpecialistId: Number(form.admissionSpecialistId), responsibleSpecialistId: Number(form.responsibleSpecialistId),
  reasonId: Number(form.reasonId) || 0, roomId: Number(form.roomId)
});

// Días de estancia: del ingreso (`dateIn`; las hospitalizaciones anteriores a la spec lo traen igual a su fecha) a hoy, nunca negativo.
export const daysStay = (item, today) => {
  const from = text(item?.dateIn || item?.date).slice(0, 10);
  if (!isCalendarDate(from) || !isCalendarDate(today)) return 0;
  const diff = Math.round((Date.UTC(...today.split('-').map((v, i) => Number(v) - (i === 1 ? 1 : 0))) - Date.UTC(...from.split('-').map((v, i) => Number(v) - (i === 1 ? 1 : 0)))) / 86400000);
  return Math.max(0, diff);
};

// Avisos que el back devuelve al hospitalizar o cambiar de habitación: claves de traducción.
export const warningMessages = (warnings = []) => warnings.map((w) => (w.code === 'room.occupied' ? 'page.hospitalizations.msg.roomOccupied' : null)).filter(Boolean);
