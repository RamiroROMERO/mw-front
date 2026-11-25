import { describe, expect, test } from 'vitest';
import { buildResponsiblePayload, validateResponsible } from './responsibleRules';

const valid = { id: 0, name: 'Michell Recarte', areaId: 2, status: 1 };

describe('validateResponsible (mismos casos que ResponsibleDTO del back)', () => {
  test('un responsable válido no tiene errores', () => {
    expect(validateResponsible(valid)).toEqual({});
  });
  test('nombre de 10 a 50 caracteres', () => {
    expect(validateResponsible({ ...valid, name: 'a'.repeat(9) }).name).toBeDefined();
    expect(validateResponsible({ ...valid, name: 'a'.repeat(10) }).name).toBeUndefined();
    expect(validateResponsible({ ...valid, name: 'a'.repeat(51) }).name).toBeDefined();
  });
  test.each(['', 0, '0', null, 'x'])('área %p inválida', (areaId) => {
    expect(validateResponsible({ ...valid, areaId }).areaId).toBeDefined();
  });
});

describe('buildResponsiblePayload', () => {
  test('solo manda lo que el back acepta, con números y estado normalizados', () => {
    expect(buildResponsiblePayload({ ...valid, id: 5, areaId: '2', status: false, areaName: 'x' })).toEqual({ name: 'Michell Recarte', areaId: 2, status: 0 });
  });
});
