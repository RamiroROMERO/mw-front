// Ventas mensuales por cliente (SPEC v2-105-sr / v2-106-sr). El back decide (`validateMonthlySalesCustomerQuery`): un año de 4 dígitos entre 2000 y 2100, cliente, moneda, valor con
// o sin impuesto y formato (json, pdf o xlsx). Esto solo evita una llamada que ya se sabe rechazada y arma la petición. Los casos son los del back.
import { normalizeSettings, effectiveForm, CURRENCY_LEMPIRAS, CURRENCY_DOLLARS } from '@Views/app/billing/reports/summaryByProduct/summaryByProductRules';

export { normalizeSettings, effectiveForm, CURRENCY_LEMPIRAS, CURRENCY_DOLLARS };

export const REPORT_URL = 'billing/reports/monthlySalesCustomer';
export const SETTINGS_URL = `${REPORT_URL}/settings`;
export const REPORT_TITLE = 'Reporte de Ventas por Cliente Mensual';
export const MIN_YEAR = 2000;
export const MAX_YEAR = 2100;
export const YEARS_BACK = 14;

// Años que ofrece el selector: del actual hacia atrás.
export const yearOptions = (now = new Date(), back = YEARS_BACK) => {
  const current = now.getFullYear();
  return Array.from({ length: back + 1 }, (_, i) => ({ value: current - i, label: String(current - i) }));
};

export const defaultYear = (now = new Date()) => now.getFullYear();

// El año es obligatorio en pantalla (el back usaría el actual): vacío o fuera de rango se marca y no llama al back. Devuelve `{}` si es válido.
export const validateYear = (year) => {
  const text = String(year ?? '').trim();
  if (!/^\d{4}$/.test(text) || Number(text) < MIN_YEAR || Number(text) > MAX_YEAR) return { year: 'msg.required.input.noYear' };
  return {};
};

const text = (value) => String(value ?? '').trim();
const idParam = (value) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? String(n) : null;
};

/**
 * Arma la petición. `request.GET` (json) o `request.GETPdf` (pdf o xlsx): GETPdf agrega `?` + `params` a la URL en un GET, así que los parámetros van en `params` y no
 * escritos en la URL (lección de la v2-12-sr). Con impuesto, en Lempiras y para todos los clientes no viajan (son lo que el back toma por defecto).
 */
export const buildMonthlyRequest = (form = {}, format = 'json') => {
  const params = { year: text(form.year) };
  const customer = idParam(form.customerId);
  if (customer) params.customerId = customer;
  if (Number(form.withoutTax) === 1) params.withTax = '0';
  if (Number(form.currency) === CURRENCY_DOLLARS) params.currency = String(CURRENCY_DOLLARS);
  if (format === 'pdf' || format === 'xlsx') params.format = format;
  return { url: REPORT_URL, params };
};

export const reportFileName = (format) => `${REPORT_TITLE}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;

// Columnas de la tabla en pantalla (las mismas del back: monthlySalesCustomerDefinitions). `label` es una clave de traducción.
const num = (field, label) => ({ field, label, isNumber: true });
export const COLUMNS = [
  { field: 'customerName', label: 'table.column.customer' },
  ...Array.from({ length: 12 }, (_, i) => num(`month_${i + 1}`, `table.column.month${i + 1}`)),
  num('total', 'table.column.total'),
  num('percent', 'table.column.percent')
];

// La respuesta json del back: { rows, totals }. Cualquier forma rara se normaliza a vacío para que la pantalla nunca reviente.
export const normalizeMonthly = (data) => ({
  rows: Array.isArray(data?.rows) ? data.rows : [],
  totals: data?.totals && typeof data.totals === 'object' ? data.totals : {}
});
