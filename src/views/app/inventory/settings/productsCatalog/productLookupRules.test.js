import { describe, it, expect } from 'vitest';
import { shouldLookupByCode, canApplyLookup } from './productLookupRules';

describe('shouldLookupByCode', () => {
  it('producto nuevo con código: consulta', () => {
    expect(shouldLookupByCode({ id: 0, code: 'HPL-00500' })).toBe(true);
  });

  it('el id puede llegar como string "0"', () => {
    expect(shouldLookupByCode({ id: '0', code: 'HPL-00500' })).toBe(true);
  });

  it.each([[5], ['5'], [1441]])('producto ya cargado (id %s): no consulta', (id) => {
    expect(shouldLookupByCode({ id, code: 'HPL-00500' })).toBe(false);
  });

  it.each([[''], ['   '], [undefined], [null]])('código vacío (%s): no consulta', (code) => {
    expect(shouldLookupByCode({ id: 0, code })).toBe(false);
  });
});

describe('canApplyLookup', () => {
  it('mismo código (aunque cambien los espacios) y producto aún nuevo: se aplica', () => {
    expect(canApplyLookup({ requestedCode: 'A-1', currentCode: ' A-1 ', currentId: 0 })).toBe(true);
  });

  it('el usuario cambió el código mientras tanto: no se aplica', () => {
    expect(canApplyLookup({ requestedCode: 'A-1', currentCode: 'A-2', currentId: 0 })).toBe(false);
  });

  it('ya se cargó otro producto (id > 0): no se aplica', () => {
    expect(canApplyLookup({ requestedCode: 'A-1', currentCode: 'A-1', currentId: 9 })).toBe(false);
  });
});
