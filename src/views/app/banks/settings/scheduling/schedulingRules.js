// Reglas de Calendarización (SPEC v2-19). `status` del período: 0 = abierto, 1 = cerrado (semántica del legacy,
// bco_conciliacion_calendar.sc2). Un período cerrado no se edita ni se elimina; cerrar y reabrir son acciones aparte.
// Helper puro, sin dependencias, con tests.

export const isClosed = (item) => Number(item?.status) === 1 || item?.status === true;

// Editar y eliminar solo se permiten en períodos abiertos.
export const canModify = (item) => !isClosed(item);

// Siguiente valor de `status` de la acción "Cerrar / Reabrir".
export const nextStatus = (item) => (isClosed(item) ? 0 : 1);

// Meses que faltan para generar un año completo; siempre nacen abiertos (status 0).
export const buildYearMonths = (year, existingMonths, getMonthLetter) => {
  const months = [];
  for (let m = 0; m < 12; m++) {
    const dateIn = `${year}-${String(m + 1).padStart(2, '0')}-01`;
    const month = getMonthLetter(dateIn);
    if (existingMonths.includes(month)) continue;
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    const dateOut = `${year}-${String(m + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
    months.push({ month, dateIn, dateOut, status: 0 });
  }
  return months;
};
