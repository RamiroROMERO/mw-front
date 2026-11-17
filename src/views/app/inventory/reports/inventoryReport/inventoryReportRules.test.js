import { describe, expect, test } from 'vitest';
import { REPORT_TYPES, typeOf, usesStore, usesField, usesDates, validateInventoryReport, buildInventoryRequest, normalizeReport } from './inventoryReportRules';

const f = { dateStart: '2026-08-01', dateEnd: '2026-08-31', storeId: 3 };

describe('tipos', () => {
  test('los 8 reportes del legacy, con tipo, título, etiqueta y columnas', () => {
    expect(REPORT_TYPES.map((t) => t.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(REPORT_TYPES.map((t) => t.type)).toEqual(['detailByDestination', 'summaryByDestination', 'monthlyDetail', 'monthlySummary', 'byProductAndDestination', 'generalProducts', 'generalDocuments', 'incomesAndReintegros']);
    REPORT_TYPES.forEach((t) => { expect(t.title && t.label).toBeTruthy(); t.columns.forEach((c) => expect(c.field && c.label).toBeTruthy()); });
  });
  test('el gasto mensual tiene las 12 columnas de meses', () => {
    [3, 4].forEach((id) => expect(typeOf(id).columns.filter((c) => /^m\d+$/.test(c.field))).toHaveLength(12));
  });
  test('almacén obligatorio en 1 a 5, opcional en 7 y 8, y ninguno en el de productos; el de productos no usa fechas', () => {
    [1, 2, 3, 4, 5].forEach((id) => expect(usesStore(id)).toBe(true));
    [7, 8].forEach((id) => { expect(usesStore(id)).toBe(true); expect(typeOf(id).needsStore).toBe(false); });
    expect(usesStore(6)).toBe(false);
    expect(usesDates(6)).toBe(false);
    [1, 2, 3, 4, 5, 7, 8].forEach((id) => expect(usesDates(id)).toBe(true));
  });
  test('destino y producto solo donde el back los admite', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8].filter((id) => usesField(id, 'destination'))).toEqual([1, 2, 4, 5]);
    expect([1, 2, 3, 4, 5, 6, 7, 8].filter((id) => usesField(id, 'product'))).toEqual([1, 3, 5]);
  });
});

describe('validateInventoryReport (mismos casos del back)', () => {
  test('filtro válido', () => { expect(validateInventoryReport(1, f)).toEqual({}); });
  test('tipo desconocido', () => { expect(validateInventoryReport(99, f)).toEqual({ typeId: 'msg.required.select' }); });
  test('fechas obligatorias, válidas, en orden y de hasta 366 días', () => {
    expect(validateInventoryReport(1, { ...f, dateStart: '', dateEnd: '' })).toMatchObject({ dateStart: 'msg.required.input.date', dateEnd: 'msg.required.input.date' });
    expect(validateInventoryReport(1, { ...f, dateStart: '2026-02-30' }).dateStart).toBe('page.fuelPurchases.report.error.dateInvalid');
    expect(validateInventoryReport(1, { ...f, dateStart: '2026-09-01' }).dateEnd).toBe('page.fuelPurchases.report.error.range');
    expect(validateInventoryReport(1, { ...f, dateStart: '2026-01-01', dateEnd: '2027-01-02' })).toEqual({});
    expect(validateInventoryReport(1, { ...f, dateStart: '2026-01-01', dateEnd: '2027-01-03' }).dateEnd).toBe('page.purchaseReport.report.error.tooLarge');
  });
  test.each([1, 2, 3, 4, 5])('el tipo %s exige almacén', (id) => {
    ['', 0, '0', undefined].forEach((storeId) => expect(validateInventoryReport(id, { ...f, storeId }).storeId).toBe('msg.required.select.warehouse'));
  });
  test('los de almacén opcional y el de productos no lo exigen; el de productos tampoco pide fechas', () => {
    expect(validateInventoryReport(7, { ...f, storeId: 0 })).toEqual({});
    expect(validateInventoryReport(8, { ...f, storeId: '' })).toEqual({});
    expect(validateInventoryReport(6, {})).toEqual({});
  });
});

describe('buildInventoryRequest', () => {
  test('json: URL por tipo y solo los filtros que el reporte usa y que tienen valor', () => {
    expect(buildInventoryRequest(1, { ...f, destinationId: 4, productCode: ' P1 ' })).toEqual({
      url: 'inventory/reports/inventoryReports/detailByDestination', params: { dateStart: '2026-08-01', dateEnd: '2026-08-31', storeId: '3', destinationId: '4', productCode: 'P1' }, fileName: 'Reporte Detallado por Centro de Destino.pdf'
    });
  });
  test('un filtro que el tipo no admite no viaja (el resumido no filtra por producto)', () => {
    expect(buildInventoryRequest(2, { ...f, destinationId: 4, productCode: 'P1' }).params).toEqual({ dateStart: '2026-08-01', dateEnd: '2026-08-31', storeId: '3', destinationId: '4' });
    expect(buildInventoryRequest(3, { ...f, destinationId: 4 }).params).not.toHaveProperty('destinationId');
  });
  test('0, vacío y no numérico no viajan', () => {
    expect(buildInventoryRequest(7, { ...f, storeId: 0 }).params).toEqual({ dateStart: '2026-08-01', dateEnd: '2026-08-31' });
    expect(buildInventoryRequest(1, { ...f, destinationId: 'abc', productCode: 0 }).params).not.toHaveProperty('destinationId');
    expect(buildInventoryRequest(1, { ...f, productCode: 0 }).params).not.toHaveProperty('productCode');
  });
  test('el listado de productos no manda fechas ni almacén', () => { expect(buildInventoryRequest(6, { ...f }).params).toEqual({}); });
  test('pdf y xlsx agregan el formato en params (no en la URL) y el nombre del archivo', () => {
    const x = buildInventoryRequest(5, f, 'xlsx');
    expect(x.params.format).toBe('xlsx');
    expect(x.url).not.toContain('?');
    expect(x.fileName).toBe('Salidas por Almacén, Resumido por Producto.xlsx');
    expect(buildInventoryRequest(5, f, 'pdf').fileName.endsWith('.pdf')).toBe(true);
    expect(buildInventoryRequest(5, f, 'csv').params).not.toHaveProperty('format');
  });
});

describe('normalizeReport', () => {
  test('toma filas y totales; cualquier forma rara es vacío', () => {
    expect(normalizeReport({ rows: [{ a: 1 }], totals: { value: 5 } })).toEqual({ rows: [{ a: 1 }], totals: { value: 5 } });
    [undefined, null, {}, { rows: 'x', totals: 5 }].forEach((d) => expect(normalizeReport(d)).toEqual({ rows: [], totals: {} }));
  });
});
