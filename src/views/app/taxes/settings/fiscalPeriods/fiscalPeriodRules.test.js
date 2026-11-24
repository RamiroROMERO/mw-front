import { describe, expect, test } from 'vitest';
import { buildPeriodPayload, isCalendarDate, validatePeriod } from './fiscalPeriodRules';

const valid = { period: '2026-01', dateIn: '2026-01-01', dateOut: '2026-01-31', status: true, active: false };

describe('validatePeriod (mismos casos del DTO del back)', () => {
  test('un período válido no tiene errores', () => {
    expect(validatePeriod(valid)).toEqual({});
    expect(validatePeriod({ ...valid, dateOut: '2026-01-01' })).toEqual({});
  });
  test('período, fecha de inicio y fecha final son obligatorios', () => {
    expect(validatePeriod({ ...valid, period: '  ' }).period).toBe('msg.required.input.period');
    expect(validatePeriod({ ...valid, dateIn: '' }).dateIn).toBe('msg.required.input.dateIn');
    expect(validatePeriod({ ...valid, dateOut: '' }).dateOut).toBe('msg.required.input.dateOut');
  });
  test('el período admite 10 caracteres y no 11', () => {
    expect(validatePeriod({ ...valid, period: 'a'.repeat(10) })).toEqual({});
    expect(validatePeriod({ ...valid, period: 'a'.repeat(11) }).period).toBe('page.fiscalPeriods.error.periodMax');
  });
  test('las fechas deben ser días reales y la final no puede ser menor que la inicial', () => {
    expect(validatePeriod({ ...valid, dateIn: '2026-02-30' }).dateIn).toBe('page.fiscalPeriods.error.dateInvalid');
    expect(validatePeriod({ ...valid, dateOut: '2026-13-01' }).dateOut).toBe('page.fiscalPeriods.error.dateInvalid');
    expect(validatePeriod({ ...valid, dateIn: '2026-02-01', dateOut: '2026-01-31' }).dateOut).toBe('page.fiscalPeriods.error.range');
  });
  test('un período activo exige estado vigente', () => {
    expect(validatePeriod({ ...valid, status: false, active: true }).active).toBe('page.fiscalPeriods.error.activeInactive');
    expect(validatePeriod({ ...valid, status: true, active: true })).toEqual({});
  });
  test('isCalendarDate acepta el día de una fecha con hora y rechaza bisiestos falsos', () => {
    expect(isCalendarDate('2028-02-29T06:00:00.000Z')).toBe(true);
    expect(isCalendarDate('2026-02-29')).toBe(false);
  });
});

describe('buildPeriodPayload', () => {
  test('recorta, deja la fecha como día y convierte las banderas a 0/1; no envía id', () => {
    expect(buildPeriodPayload({ ...valid, id: 4, period: ' 2026-01 ', dateIn: '2026-01-01T06:00:00.000Z', active: true, extra: 1 }))
      .toEqual({ period: '2026-01', dateIn: '2026-01-01', dateOut: '2026-01-31', status: 1, active: 1 });
  });
});
