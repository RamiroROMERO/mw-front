// Modos de impresión del cheque físico (SPEC v2-21): el valor del radio del modal → el `mode` que espera el back
// (GET banks/process/checks/:id/print/format). Fuera de 1 a 3 no hay modo (el modal arranca sin selección).
const MODE_BY_OPTION = { 1: 'regular', 2: 'notNegotiable', 3: 'markedNotNegotiable' };

export const resolveCheckPrintMode = (option) => MODE_BY_OPTION[Number(option)] || null;

// Query de la impresión: el modo y, si se escribió, la ciudad (el cheque no la guarda).
export const buildCheckPrintQuery = (option, city) => {
  const mode = resolveCheckPrintMode(option);
  if (!mode) return null;
  return { mode, city: String(city || '').trim() };
};
