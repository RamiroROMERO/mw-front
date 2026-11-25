import { describe, expect, test } from 'vitest';
import { validateRange, buildRequest, toTotal, MAX_RANGE_DAYS } from './honorariosRules';

describe('validateRange', () => {
  test('un rango válido no tiene problema', () => {
    expect(validateRange({ dateStart: '2026-04-01', dateEnd: '2026-04-30' })).toBe('');
    expect(validateRange({ dateStart: '2026-04-01', dateEnd: '2026-04-01' })).toBe('');
  });
  test('fechas vacías, inexistentes o invertidas', () => {
    expect(validateRange({ dateStart: '', dateEnd: '2026-04-30' })).toBe('page.honorariosReport.msg.dateRequired');
    expect(validateRange({ dateStart: '2026-02-30', dateEnd: '2026-03-01' })).toBe('page.honorariosReport.msg.dateRequired');
    expect(validateRange({ dateStart: '2026-05-01', dateEnd: '2026-04-01' })).toBe('page.honorariosReport.msg.rangeInverted');
  });
  test(`máximo ${MAX_RANGE_DAYS} días`, () => {
    expect(validateRange({ dateStart: '2025-04-01', dateEnd: '2026-04-02' })).toBe('');
    expect(validateRange({ dateStart: '2025-04-01', dateEnd: '2026-04-03' })).toBe('page.honorariosReport.msg.rangeTooLarge');
  });
});

describe('buildRequest', () => {
  test('el JSON no manda formato; PDF y Excel sí, y la ruta es la del tipo', () => {
    expect(buildRequest({ type: 'lines', dateStart: '2026-04-01', dateEnd: '2026-04-30' })).toEqual({ url: 'hospital/reports/honorarios/lines', params: { dateStart: '2026-04-01', dateEnd: '2026-04-30' } });
    expect(buildRequest({ type: 'receipts', dateStart: 'a', dateEnd: 'b' }, 'xlsx').params).toEqual({ dateStart: 'a', dateEnd: 'b', format: 'xlsx' });
    expect(buildRequest({ type: 'summary', dateStart: 'a', dateEnd: 'b' }, 'pdf').url).toBe('hospital/reports/honorarios/summary');
  });
  test('un tipo desconocido se rechaza', () => {
    expect(() => buildRequest({ type: 'x', dateStart: 'a', dateEnd: 'b' })).toThrow();
  });
});

test('toTotal lee el total del reporte', () => {
  expect(toTotal({ totals: { total: 1750.5 } })).toBe(1750.5);
  expect(toTotal(undefined)).toBe(0);
});
