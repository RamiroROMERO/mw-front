import { describe, test, expect } from 'vitest';
import { resolveCodeLock } from './bankAccountRules';

describe('resolveCodeLock', () => {
  test('una cuenta nueva nunca bloquea el código', () => {
    expect(resolveCodeLock({ isExisting: false, inUse: undefined })).toBe(false);
    expect(resolveCodeLock({ isExisting: false, inUse: true })).toBe(false);
  });

  test('una cuenta existente con uso bloquea el código', () => {
    expect(resolveCodeLock({ isExisting: true, inUse: true })).toBe(true);
  });

  test('una cuenta existente sin uso deja editar el código', () => {
    expect(resolveCodeLock({ isExisting: true, inUse: false })).toBe(false);
  });

  test('mientras no se conoce el uso (consulta pendiente o fallida) bloquea', () => {
    expect(resolveCodeLock({ isExisting: true, inUse: undefined })).toBe(true);
    expect(resolveCodeLock({ isExisting: true, inUse: null })).toBe(true);
  });
});
