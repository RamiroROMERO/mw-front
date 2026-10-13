import { describe, it, expect } from 'vitest';
import {
  isActive, rangeKind, formDate, validateLockForm, buildLockBody, buildUpdateBody, lockableAccounts, NO_START, NO_END, STATUS_FILTERS
} from './lockedAccountRules';

describe('isActive y rangeKind', () => {
  it('vigente solo con status 1', () => {
    expect(isActive({ status: 1 })).toBe(true);
    expect(isActive({ status: '1' })).toBe(true);
    expect(isActive({ status: 0 })).toBe(false);
    expect(isActive({})).toBe(false);
  });

  it.each([
    [{ dateStart: NO_START, dateEnd: NO_END }, 'always'],
    [{}, 'always'],
    [{ dateStart: '2026-09-01', dateEnd: NO_END }, 'from'],
    [{ dateStart: NO_START, dateEnd: '2026-09-30' }, 'until'],
    [{ dateStart: '2026-09-01', dateEnd: '2026-09-30' }, 'range'],
    [{ dateStart: '2026-09-01T00:00:00.000Z', dateEnd: '2999-12-31T00:00:00.000Z' }, 'from']
  ])('%j: %s', (row, kind) => expect(rangeKind(row)).toBe(kind));
});

describe('validateLockForm', () => {
  const ok = { accountCode: '6010', reason: 'Cuenta cerrada' };

  it('un formulario completo es válido (sin fechas = siempre)', () => expect(validateLockForm(ok)).toBeNull());
  it('exige la cuenta al crear, no al editar', () => {
    expect(validateLockForm({ ...ok, accountCode: ' ' })).toBe('page.lockedAccounts.msg.accountRequired');
    expect(validateLockForm({ reason: 'Cuenta cerrada' }, { creating: false })).toBeNull();
  });
  it.each(['', 'ab', '  a '])('motivo %p: reasonRequired', (reason) => {
    expect(validateLockForm({ ...ok, reason })).toBe('page.lockedAccounts.msg.reasonRequired');
  });
  it.each([
    [{ dateStart: '2026-09-30', dateEnd: '2026-09-01' }],
    [{ dateStart: '30/09/2026' }],
    [{ dateEnd: 'mañana' }]
  ])('rango %j: rangeInvalid', (range) => expect(validateLockForm({ ...ok, ...range })).toBe('page.lockedAccounts.msg.rangeInvalid'));
  it('un solo extremo es válido', () => {
    expect(validateLockForm({ ...ok, dateStart: '2026-09-01' })).toBeNull();
    expect(validateLockForm({ ...ok, dateEnd: '2026-09-30' })).toBeNull();
  });
});

describe('buildLockBody', () => {
  it('sin fechas no las manda', () => expect(buildLockBody({ accountCode: ' 6010 ', reason: ' Cerrada ', dateStart: '', dateEnd: '' })).toEqual({ accountCode: '6010', reason: 'Cerrada' }));
  it('con fechas las manda', () => {
    expect(buildLockBody({ accountCode: '6010', reason: 'abc', dateStart: '2026-09-01', dateEnd: '2026-09-30' })).toEqual({
      accountCode: '6010', reason: 'abc', dateStart: '2026-09-01', dateEnd: '2026-09-30'
    });
  });
});

describe('buildUpdateBody', () => {
  const row = { reason: 'ANTES', dateStart: NO_START, dateEnd: NO_END };
  const form = { reason: 'ANTES', dateStart: '', dateEnd: '' };

  it('sin cambios: vacío', () => expect(buildUpdateBody(row, form)).toEqual({}));
  it('solo manda lo que cambió', () => {
    expect(buildUpdateBody(row, { ...form, reason: 'DESPUES' })).toEqual({ reason: 'DESPUES' });
    expect(buildUpdateBody(row, { ...form, dateEnd: '2026-12-31' })).toEqual({ dateEnd: '2026-12-31' });
  });
  it('vaciar una fecha vuelve al siempre', () => {
    const limited = { reason: 'x', dateStart: '2026-09-01', dateEnd: '2026-09-30' };
    expect(buildUpdateBody(limited, { reason: 'x', dateStart: '', dateEnd: '2026-09-30' })).toEqual({ dateStart: NO_START });
  });
  it('formDate muestra el centinela vacío', () => {
    expect(formDate(NO_START, NO_START)).toBe('');
    expect(formDate('2026-09-01', NO_START)).toBe('2026-09-01');
  });
});

describe('lockableAccounts y filtros', () => {
  it('quita las ya bloqueadas', () => {
    expect(lockableAccounts([{ cta: '1', blocked: true }, { cta: '2', blocked: false }, { cta: '3' }]).map((a) => a.cta)).toEqual(['2', '3']);
  });
  it('filtros de estado', () => expect(STATUS_FILTERS).toEqual(['1', '0', 'all']));
});
