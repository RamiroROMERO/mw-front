// Reglas del Expediente de paciente (SPEC v2-150-sr): las mismas del DTO del back (`modules/hospital/expedients/PatientDTO`). El back decide siempre; esto evita llamarlo con datos inválidos.
export const MIN_BIRTH_DATE = '1910-01-01';
const MIN_DNI = 13;
const MAX_DNI = 20;
const FORBIDDEN_DNI_CHARS = /[-:,.\s]/;
const PHONE_PATTERN = /^\+?\d{7,15}$/;

const text = (value) => String(value ?? '').trim();
const cleanPhone = (value) => text(value).replace(/[ ()-]/g, '');

export const isCalendarDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(value));
  if (!match) return false;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

export const isValidDni = (value) => {
  const dni = text(value);
  return dni.length >= MIN_DNI && dni.length <= MAX_DNI && !FORBIDDEN_DNI_CHARS.test(dni);
};

export const isValidBirthDate = (value, today) => {
  const date = text(value);
  return isCalendarDate(date) && date >= MIN_BIRTH_DATE && date <= today;
};

// Al menos un teléfono (`phone` o `phone2`) y todos los que vengan de 7 a 15 dígitos. Devuelve '' si está bien o la clave de traducción del problema.
export const validatePhones = ({ phone, phone2 }) => {
  const phones = [phone, phone2].map(cleanPhone).filter(Boolean);
  if (phones.length === 0) return 'msg.required.input.phone';
  if (phones.some((p) => !PHONE_PATTERN.test(p))) return 'msg.invalid.input.phone';
  return '';
};

// El nombre completo lo arma el back; esto solo lo muestra igual (sin espacios dobles).
export const fullName = ({ firstName, secondName, lastName, secondLastName }) => [firstName, secondName, lastName, secondLastName].map(text).filter(Boolean).join(' ');

// Parámetros de la impresión del paciente y de un evento (GET, en memoria): `printDocument` arma la URL.
export const printFileOptions = (id) => ({ path: 'hospital/process/expedients', id, fileName: 'Expediente de Paciente.pdf' });
export const printEventOptions = (patientId, eventId) => ({ path: `hospital/process/expedients/${patientId}/events`, id: eventId, fileName: 'Registro de Atencion.pdf' });
