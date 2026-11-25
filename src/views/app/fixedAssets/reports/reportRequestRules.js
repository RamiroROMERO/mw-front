// Parámetros de la descarga de los Reportes de Activos Fijos (SPEC v2-146-sr). Solo viaja el filtro del tipo de reporte elegido (el back ignora los demás pero así la URL es clara)
// y los filtros vacíos se omiten. El formato es `pdf` o `xlsx`; sin él el back responde el JSON de la pantalla.
export const FORMATS = ['pdf', 'xlsx'];

const FILTER_BY_TYPE = { 1: 'typeId', 2: 'responsibleId', 3: 'areaId' };
const present = (value) => value !== undefined && value !== null && String(value).trim() !== '' && String(value).trim() !== '0';

// category: 'assets' | 'depreciation'
export const buildReportRequest = ({ category, reportType, typeId, responsibleId, areaId }, format) => {
  if (!FORMATS.includes(format)) throw new Error(`Formato de reporte inválido: ${format}`);
  if (category === 'depreciation') return { url: 'fixedAssets/reports/depreciationSummary', params: { format }, fileName: `Reporte de Depreciaciones.${format}` };
  const params = { reportType: Number(reportType) || 1, format };
  const filters = { typeId, responsibleId, areaId };
  const filter = FILTER_BY_TYPE[params.reportType];
  if (filter && present(filters[filter])) params[filter] = String(filters[filter]);
  return { url: 'fixedAssets/reports/search', params, fileName: `Reporte de Activos.${format}` };
};
