// SPEC v2-116-sr — Reporte de Retenciones de Impuestos. El back decide (validateTaxRetentionReportQuery); esto solo evita una llamada que ya se sabe
// rechazada (mismas reglas de fechas y rango que Compras y Ventas) y arma la petición `GET tax/reports/retentionReport/:type`.
import { validateReportRange } from '@Views/app/inventory/reports/purchaseReport/purchaseReportRules';

export { validateReportRange };
export const REPORT_BASE_URL = 'tax/reports/retentionReport';

export const REPORT_TITLES = {
  retentions: 'Reporte de Retenciones para Declaración Fiscal',
  declarationBook: 'Registro de Retenciones'
};

const text = (value) => String(value ?? '').trim();

// `format`: json (por defecto), pdf o xlsx. Los parámetros viajan en `params` (GETPdf agrega `?` + params a la URL).
export const buildReportRequest = (type, { dateStart, dateEnd } = {}, format = 'json') => {
  const params = { dateStart: text(dateStart), dateEnd: text(dateEnd) };
  if (format === 'pdf' || format === 'xlsx') params.format = format;
  return { url: `${REPORT_BASE_URL}/${type}`, params };
};

export const reportFileName = (type, format) => `${REPORT_TITLES[type]}.${format === 'xlsx' ? 'xlsx' : 'pdf'}`;

// Respuesta `json` del back: filas planas y totales (con cero si no llegan).
export const normalizeReport = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: { total: 0, ...(data?.totals || {}) }
});

// Texto que busca el filtro de pantalla (fecha, proveedor, RTN y número del comprobante).
export const matchesSearch = (row, value) => {
  if (!value) return true;
  return `${row.date || ''}${row.providerName || ''}${row.providerRtn || ''}${row.numberRetention || ''}`.toUpperCase().includes(String(value).toUpperCase());
};
