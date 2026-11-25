// Reglas de los catálogos de Ajustes de Hospital (SPEC v2-147-sr): las mismas del DTO del back (`modules/hospital/settings`). El back decide siempre; esto evita llamarlo con datos inválidos.
export const MIN_NAME = 3; // Ana, Eli, Mia
export const MAX_NAME = { specialties: 100, areas: 45, reasons: 45, rooms: 50 };
export const MAX_ROOM_CODE = 10;
export const MAX_PRICE = 9999999999.99;

export const isValidName = (value, max) => {
  const text = String(value ?? '').trim();
  return text.length >= MIN_NAME && text.length <= max;
};

export const isValidRoomCode = (value) => {
  const text = String(value ?? '').trim();
  return text.length >= 1 && text.length <= MAX_ROOM_CODE;
};

// Vacío vale 0; si viene, un monto >= 0 con máximo 2 decimales.
export const isValidPrice = (value) => {
  const text = String(value ?? '').trim();
  if (text === '') return true;
  return /^\d+(\.\d{1,2})?$/.test(text) && Number(text) <= MAX_PRICE;
};

// Especialistas (SPEC v2-148-sr). El DNI es opcional (máximo 20); los porcentajes van de 0 a 100 con 2 decimales y su suma no pasa de 100.
export const MAX_SPECIALIST = { name: 50, dni: 20, licenceNumber: 30, phone: 30, email: 150, hour: 20 };

export const isValidSpecialistDni = (value) => String(value ?? '').trim().length <= MAX_SPECIALIST.dni;

export const isValidPercent = (value) => {
  const text = String(value ?? '').trim();
  return text === '' || (/^\d+(\.\d{1,2})?$/.test(text) && Number(text) <= 100);
};

export const isValidPercentSum = (hospitalPercent, specialistPercent) => (Number(hospitalPercent) || 0) + (Number(specialistPercent) || 0) <= 100;
