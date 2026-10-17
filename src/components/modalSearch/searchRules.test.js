import { describe, expect, test } from 'vitest';
import { buildPageParams, countPages, describeRange, isLatestRequest, parsePage } from './searchRules';

describe('buildPageParams', () => {
  test('primera página sin texto: no manda search', () => {
    expect(buildPageParams({})).toEqual({ limit: 50, offset: 0 });
  });
  test('página 3 de 20 con texto recortado y filtros fijos', () => {
    expect(buildPageParams({ search: ' ab ', page: 3, pageSize: 20, extraParams: { status: 1 } }))
      .toEqual({ status: 1, limit: 20, offset: 40, search: 'ab' });
  });
  test('texto en blanco no se manda; página inválida cae a offset 0; nombre del parámetro configurable', () => {
    expect(buildPageParams({ search: '   ', page: 0 })).toEqual({ limit: 50, offset: 0 });
    expect(buildPageParams({ search: 'x', searchParam: 'q' })).toEqual({ limit: 50, offset: 0, q: 'x' });
  });
});

describe('parsePage / countPages / describeRange', () => {
  test('respuesta vacía no rompe', () => {
    expect(parsePage(undefined)).toEqual({ rows: [], pagination: { totalRecords: 0, limit: 50, offset: 0 } });
  });
  test('toma data y pagination del back', () => {
    const res = { data: [{ id: 1 }], pagination: { totalRecords: 321, limit: 50, offset: 50 } };
    expect(parsePage(res)).toEqual({ rows: [{ id: 1 }], pagination: res.pagination });
  });
  test('páginas: 321/50 = 7, mínimo 1', () => {
    expect(countPages({ totalRecords: 321, limit: 50 })).toBe(7);
    expect(countPages({ totalRecords: 0, limit: 50 })).toBe(1);
    expect(countPages(undefined)).toBe(1);
  });
  test('rango', () => {
    expect(describeRange({ totalRecords: 321, offset: 50 }, 50)).toBe('51-100 / 321');
    expect(describeRange({ totalRecords: 0, offset: 0 }, 0)).toBe('0-0 / 0');
  });
  test('solo la última solicitud aplica', () => {
    expect(isLatestRequest(2, 2)).toBe(true);
    expect(isLatestRequest(1, 2)).toBe(false);
  });
});
