import { describe, test, expect } from 'vitest';
import { createValueSync } from './transferValueSync';

describe('createValueSync', () => {
  test('sin carga previa siempre sincroniza el valor con las líneas', () => {
    const sync = createValueSync();
    expect(sync.shouldSyncValue()).toBe(true);
    expect(sync.shouldSyncValue()).toBe(true);
  });

  test('tras cargar una transferencia la primera actualización de líneas no sincroniza', () => {
    const sync = createValueSync();
    sync.markLoaded();
    expect(sync.shouldSyncValue()).toBe(false);
  });

  test('cualquier cambio de líneas posterior a la carga vuelve a sincronizar', () => {
    const sync = createValueSync();
    sync.markLoaded();
    sync.shouldSyncValue();
    expect(sync.shouldSyncValue()).toBe(true);
  });

  test('cargar dos veces seguidas no deja la marca pegada', () => {
    const sync = createValueSync();
    sync.markLoaded();
    sync.markLoaded();
    expect(sync.shouldSyncValue()).toBe(false);
    expect(sync.shouldSyncValue()).toBe(true);
  });
});
