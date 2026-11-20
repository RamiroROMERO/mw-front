// Reporte de Kardex (SPEC v2-60-sr). El back (`GET inventory/reports/kardexReport`) es el mismo de Existencias (`stocks/reports`): solo cambia la URL y
// el privilegio (`02.03.002`). Las reglas, los tipos y los parámetros son los de Existencias; aquí solo se reutilizan.
import { buildStockReportRequest, validateStockReport, needsStore, defaultReportForm, REPORT_TYPES, VALUE_FILTERS } from '../../process/stock/stockReportRules';

export const KARDEX_REPORT_URL = 'inventory/reports/kardexReport';
export { validateStockReport as validateKardexReport, needsStore, defaultReportForm, REPORT_TYPES, VALUE_FILTERS };

export const buildKardexRequest = (form, format) => ({ ...buildStockReportRequest(form, format), url: KARDEX_REPORT_URL });
