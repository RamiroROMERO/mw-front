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
