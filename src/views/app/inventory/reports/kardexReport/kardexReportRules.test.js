import { describe, expect, test } from 'vitest';
import { buildKardexRequest, validateKardexReport, KARDEX_REPORT_URL } from './kardexReportRules';

const form = { typeId: 1, storeId: 2, dateEnd: '2026-08-31', valueFilterId: 3 };

describe('kardexReportRules', () => {
  test('usa la URL del Kardex y los parámetros de Existencias (en params, no en la URL)', () => {
    const r = buildKardexRequest(form, 'xlsx');
    expect(r.url).toBe(KARDEX_REPORT_URL);
    expect(r.url).not.toContain('?');
    expect(r.params).toEqual({ type: 'stock', dateEnd: '2026-08-31', valueFilter: 'all', format: 'xlsx', storeId: 2 });
    expect(r.fileName).toBe('Reporte de Existencias.xlsx');
  });
  test('el general no manda almacén', () => { expect(buildKardexRequest({ ...form, typeId: 2, storeId: 0 }, 'pdf').params).not.toHaveProperty('storeId'); });
  test('valida igual que Existencias', () => {
    expect(validateKardexReport(form)).toEqual({});
    expect(validateKardexReport({ ...form, storeId: 0 })).toEqual({ storeId: 'msg.required.select' });
    expect(validateKardexReport({ ...form, dateEnd: '' }).dateEnd).toBe('msg.required.input.date');
  });
});
