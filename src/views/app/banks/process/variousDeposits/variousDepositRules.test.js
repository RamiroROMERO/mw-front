import { describe, it, expect } from 'vitest';
import { isPostedDeposit, needsEditPostedConfirmation, resolveSaveAction } from './variousDepositRules';

describe('isPostedDeposit', () => {
  it.each([
    [{ pdaNumber: 100028207 }, true],
    [{ pdaNumber: '100028207' }, true],
    [{ pdaNumber: 1 }, true],
    [{ pdaNumber: 0 }, false],
    [{ pdaNumber: '0' }, false],
    [{ pdaNumber: '' }, false],
    [{ pdaNumber: null }, false],
    [{ pdaNumber: undefined }, false],
    [{ pdaNumber: -5 }, false],
    [{ pdaNumber: 'abc' }, false],
    [{}, false],
    [null, false],
    [undefined, false]
  ])('%j → %p', (header, expected) => {
    expect(isPostedDeposit(header)).toBe(expected);
  });

  it('el nombre viejo numberPDA del formulario no cuenta: el back devuelve pdaNumber', () => {
    expect(isPostedDeposit({ numberPDA: 100028207 })).toBe(false);
  });
});

describe('needsEditPostedConfirmation', () => {
  it('un depósito guardado y contabilizado pide confirmación', () => {
    expect(needsEditPostedConfirmation({ id: 597, pdaNumber: 100028207 })).toBe(true);
  });

  it('un depósito guardado sin contabilizar no la pide', () => {
    expect(needsEditPostedConfirmation({ id: 597, pdaNumber: 0 })).toBe(false);
  });

  it('un depósito nuevo (id 0) no la pide aunque traiga partida', () => {
    expect(needsEditPostedConfirmation({ id: 0, pdaNumber: 100028207 })).toBe(false);
  });

  it('sin datos no la pide', () => {
    expect(needsEditPostedConfirmation(null)).toBe(false);
    expect(needsEditPostedConfirmation({})).toBe(false);
  });
});

describe('resolveSaveAction', () => {
  const posted = { id: 597, pdaNumber: 100028207 };
  const unposted = { id: 597, pdaNumber: 0 };

  it('contabilizado y con permiso: confirmar', () => {
    expect(resolveSaveAction(posted, true)).toBe('confirm');
  });

  it('contabilizado y sin permiso: avisar sin llamar al back', () => {
    expect(resolveSaveAction(posted, false)).toBe('forbidden');
    expect(resolveSaveAction(posted, undefined)).toBe('forbidden');
  });

  it('sin contabilizar guarda directo, con o sin permiso', () => {
    expect(resolveSaveAction(unposted, false)).toBe('save');
    expect(resolveSaveAction(unposted, true)).toBe('save');
  });

  it('un depósito nuevo guarda directo aunque no tenga permiso', () => {
    expect(resolveSaveAction({ id: 0, pdaNumber: 0 }, false)).toBe('save');
    expect(resolveSaveAction({ id: 0, pdaNumber: 100028207 }, false)).toBe('save');
  });
});
