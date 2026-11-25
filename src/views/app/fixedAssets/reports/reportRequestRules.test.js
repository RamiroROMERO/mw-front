import { describe, expect, test } from 'vitest';
import { buildReportRequest } from './reportRequestRules';

describe('buildReportRequest', () => {
  test('por tipo manda solo el filtro de tipo y omite los vacíos', () => {
    expect(buildReportRequest({ category: 'assets', reportType: 1, typeId: 3, responsibleId: 9, areaId: 4 }, 'xlsx'))
      .toEqual({ url: 'fixedAssets/reports/search', params: { reportType: 1, format: 'xlsx', typeId: '3' }, fileName: 'Reporte de Activos.xlsx' });
    expect(buildReportRequest({ category: 'assets', reportType: 1, typeId: '' }, 'pdf').params).toEqual({ reportType: 1, format: 'pdf' });
    expect(buildReportRequest({ category: 'assets', reportType: 1, typeId: 0 }, 'pdf').params).toEqual({ reportType: 1, format: 'pdf' });
  });
  test('por asignación y por área usan su propio filtro; historial y valor total no llevan filtro', () => {
    expect(buildReportRequest({ category: 'assets', reportType: '2', responsibleId: 5, typeId: 3 }, 'pdf').params).toEqual({ reportType: 2, format: 'pdf', responsibleId: '5' });
    expect(buildReportRequest({ category: 'assets', reportType: 3, areaId: 4 }, 'pdf').params).toEqual({ reportType: 3, format: 'pdf', areaId: '4' });
    expect(buildReportRequest({ category: 'assets', reportType: 4, typeId: 3, areaId: 4 }, 'xlsx').params).toEqual({ reportType: 4, format: 'xlsx' });
    expect(buildReportRequest({ category: 'assets', reportType: 5 }, 'xlsx').params).toEqual({ reportType: 5, format: 'xlsx' });
  });
  test('depreciaciones: otra ruta, otro nombre de archivo, sin filtros', () => {
    expect(buildReportRequest({ category: 'depreciation', reportType: 3, areaId: 4 }, 'pdf')).toEqual({ url: 'fixedAssets/reports/depreciationSummary', params: { format: 'pdf' }, fileName: 'Reporte de Depreciaciones.pdf' });
  });
  test('un formato que no sea pdf o xlsx se rechaza', () => {
    expect(() => buildReportRequest({ category: 'assets', reportType: 1 }, 'csv')).toThrow();
  });
});
