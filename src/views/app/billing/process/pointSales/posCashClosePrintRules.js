// Impresión del cierre de caja del POS (SPEC v2-88-sr): siete reportes por GET, del cierre guardado o de la vista previa. Nada de cifras ni de usuario se manda: el servidor las lee.
export const CASH_CLOSE_PRINT_TYPES = [
  { id: 'summary', label: 'page.pointSales.modal.printCashClose.summary', thermal: true },
  { id: 'detail', label: 'page.pointSales.modal.printCashClose.detailed', thermal: true },
  { id: 'area', label: 'page.pointSales.modal.printCashClose.billingArea', thermal: false },
  { id: 'paymentMethod', label: 'page.pointSales.modal.printCashClose.paymentMethod', thermal: false },
  { id: 'daily', label: 'page.pointSales.modal.printCashClose.totalDailyClosings', thermal: false, supervisorOnly: true },
  { id: 'cashMovements', label: 'page.pointSales.modal.printCashClose.detailExpenses', thermal: true },
  { id: 'cancellations', label: 'page.pointSales.modal.printCashClose.cancellations', thermal: false }
];

const FILE_NAMES = {
  summary: 'Cierre de Caja Resumido.pdf', detail: 'Cierre de Caja Detallado.pdf', area: 'Cierre de Caja por Area.pdf', paymentMethod: 'Cierre de Caja por Forma de Pago.pdf',
  daily: 'Total de Cierres del Dia.pdf', cashMovements: 'Entradas y Salidas de Efectivo.pdf', cancellations: 'Cancelaciones de Clientes.pdf'
};

// Tipos que ofrece la pantalla: el global del día solo al supervisor.
export const availableTypes = (isSupervisor) => CASH_CLOSE_PRINT_TYPES.filter((type) => !type.supervisorOnly || isSupervisor);

// La hoja térmica solo existe en el resumen, el detallado y las entradas y salidas (como el legacy).
export const sheetAllowed = (type, sheet) => sheet !== 'thermal' || Boolean(CASH_CLOSE_PRINT_TYPES.find((item) => item.id === type)?.thermal);
export const normalizeSheet = (type, sheet) => (sheetAllowed(type, sheet) ? sheet : 'letter');

// Petición de la descarga: cierre guardado (`/:id/print`) o vista previa (`/preview/print`, con lo digitado). Sin cifras ni `userName`.
export const buildPrintRequest = ({ path, id, sessionId, type, sheet, date, cashierId, allCashiers, cashValue }) => {
  const common = { sessionId, type, sheet: normalizeSheet(type, sheet) };
  const fileName = FILE_NAMES[type];
  if (Number(id) > 0) return { url: `${path}/${id}/print`, params: common, fileName };
  const clean = Object.fromEntries(Object.entries({ date, cashierId, allCashiers: allCashiers ? 'true' : undefined, cashValue }).filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== ''));
  return { url: `${path}/preview/print`, params: { ...common, ...clean }, fileName };
};
