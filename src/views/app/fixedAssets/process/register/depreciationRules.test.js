import { describe, expect, test } from 'vitest';
import { buildDepreciationPayload, validateDepreciation } from './depreciationRules';

const valid = { dateCalc: '2026-08-10', useLife: 5, percent: 10 };

describe('validateDepreciation (mismos casos que DepreciationDTO del back)', () => {
  test('parámetros válidos y bordes del porcentaje', () => {
    expect(validateDepreciation(valid, '2026-08-10')).toEqual({});
    expect(validateDepreciation({ ...valid, percent: 0 })).toEqual({});
    expect(validateDepreciation({ ...valid, percent: '100' })).toEqual({});
  });
  test.each(['dateCalc', 'useLife', 'percent'])('%s es obligatorio', (field) => {
    expect(validateDepreciation({ ...valid, [field]: '' })[field]).toBeDefined();
  });
  test('la fecha debe ser real y no anterior al ingreso del activo', () => {
    expect(validateDepreciation({ ...valid, dateCalc: '2026-02-30' }).dateCalc).toBe('page.fixedAssets.msg.dateCalcInvalid');
    expect(validateDepreciation({ ...valid, dateCalc: '2026-08-09' }, '2026-08-10').dateCalc).toBe('page.fixedAssets.msg.dateCalcBeforeEntry');
  });
  test.each([0, -1, 100, 1.5, 'x'])('vida útil %p inválida', (useLife) => {
    expect(validateDepreciation({ ...valid, useLife }).useLife).toBeDefined();
  });
  test.each([-1, 100.01, 'x', 10.555])('porcentaje %p inválido', (percent) => {
    expect(validateDepreciation({ ...valid, percent }).percent).toBeDefined();
  });
});

describe('buildDepreciationPayload', () => {
  test('solo los tres parámetros, normalizados', () => {
    expect(buildDepreciationPayload({ ...valid, useLife: '5', percent: '10.5', lines: [1], residualValue: 5 })).toEqual({ dateCalc: '2026-08-10', useLife: 5, percent: 10.5 });
  });
});
