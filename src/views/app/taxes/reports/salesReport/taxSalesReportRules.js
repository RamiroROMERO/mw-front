// SPEC v2-115-sr — Reporte de Ventas de Impuestos. El back decide (validateTaxSalesReportQuery); esto solo evita una llamada que ya se sabe rechazada
// (mismas reglas de fechas y rango que Compras) y arma la petición `GET tax/reports/salesReport/:type`.
import { validateReportRange } from '@Views/app/inventory/reports/purchaseReport/purchaseReportRules';

export { validateReportRange };
export const REPORT_BASE_URL = 'tax/reports/salesReport';

export const REPORT_TITLES = {
  sales: 'Reporte de Ventas para Declaración Fiscal',
  declarationBook: 'Registro de Ventas',
  salesBook: 'Libro de Ventas'
};

const text = (value) => String(value ?? '').trim();

// `format`: json (por defecto), pdf o xlsx. Los parámetros viajan en `params` (GETPdf agrega `?` + params a la URL). El CAI vacío no viaja.
export const buildReportRequest = (type, { dateStart, dateEnd, cai } = {}, format = 'json') => {
  const params = { dateStart: text(dateStart), dateEnd: text(dateEnd) };
  if (text(cai) !== '') params.cai = text(cai);
  if (format === 'pdf' || format === 'xlsx') params.format = format;
  return { url: `${REPORT_BASE_URL}/${type}`, params };
};

export const reportFileName = (type, format) => `${REPORT_TITLES[type]}.${format === 'xlsx' ? 'xlsx' : 'pdf'}`;

// Respuesta `json` del back: filas planas y totales (con cero si no llegan).
export const normalizeReport = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: { total: 0, exempt: 0, exonerated: 0, taxed: 0, tax: 0, ...(data?.totals || {}) }
});

// Texto que busca el filtro de pantalla (fecha, cliente, RTN y número).
export const matchesSearch = (row, value) => {
  if (!value) return true;
  return `${row.date || ''}${row.clientName || ''}${row.clientRtn || ''}${row.number || ''}`.toUpperCase().includes(String(value).toUpperCase());
};
