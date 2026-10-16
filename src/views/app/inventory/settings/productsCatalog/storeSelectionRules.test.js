import { describe, it, expect } from 'vitest';
import { toggleStore, buildStoreIds, shouldAssignStores } from './storeSelectionRules';

describe('toggleStore', () => {
  it('marca y desmarca sin mutar el objeto original', () => {
    const base = { 1: false };
    const on = toggleStore(base, 1, true);
    expect(on).toEqual({ 1: true });
    expect(base).toEqual({ 1: false });
    expect(toggleStore(on, 1, false)).toEqual({ 1: false });
  });

  it('agrega un almacén nuevo', () => {
    expect(toggleStore({ 1: true }, 5, true)).toEqual({ 1: true, 5: true });
  });
});

describe('buildStoreIds', () => {
  it('devuelve solo los marcados, como números', () => {
    expect(buildStoreIds({ 1: true, 11: false, 87: true })).toEqual([1, 87]);
  });

  it('sin nada marcado devuelve una lista vacía', () => {
    expect(buildStoreIds({ 1: false })).toEqual([]);
    expect(buildStoreIds({})).toEqual([]);
    expect(buildStoreIds()).toEqual([]);
  });

  it('descarta llaves que no son enteros positivos', () => {
    expect(buildStoreIds({ abc: true, 0: true, '-3': true, '2.5': true, 4: true })).toEqual([4]);
  });
});

describe('shouldAssignStores', () => {
  it('con producto y almacenes marcados: llama', () => {
    expect(shouldAssignStores('HPL-1', [1, 5])).toBe(true);
  });

  it('sin almacenes marcados: no llama', () => {
    expect(shouldAssignStores('HPL-1', [])).toBe(false);
  });

  it.each([[''], ['  '], [undefined]])('sin código de producto (%s): no llama', (code) => {
    expect(shouldAssignStores(code, [1])).toBe(false);
  });

  it('storeIds que no es un arreglo: no llama', () => {
    expect(shouldAssignStores('HPL-1', undefined)).toBe(false);
  });
});
