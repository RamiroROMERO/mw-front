import { describe, test, expect } from 'vitest';
import { mapAccountToForm, shouldAutofill, decideAutofill, accountOptions, createLoadGuard } from './providerBankFill';

const ACCOUNT = {
  id: 5, bankName: 'BAC CREDOMATIC', accountType: 'Cuenta de Cheques', bankAccount: '750928271',
  beneficiaryAccountName: 'IRON RENTALS S DE RL DE CV', beneficiaryRtn: '05019023524039', beneficiaryEmail: ''
};

describe('mapAccountToForm', () => {
  test('copia los seis campos', () => {
    expect(mapAccountToForm(ACCOUNT)).toEqual({
      bankName: 'BAC CREDOMATIC', accountType: 'Cuenta de Cheques', bankAccount: '750928271',
      beneficiaryAccountName: 'IRON RENTALS S DE RL DE CV', beneficiaryRtn: '05019023524039', beneficiaryEmail: ''
    });
  });

  test('un tipo de cuenta que no está en el combo se deja vacío', () => {
    expect(mapAccountToForm({ ...ACCOUNT, accountType: 'Cuenta Rara' }).accountType).toBe('');
    expect(mapAccountToForm({ ...ACCOUNT, accountType: undefined }).accountType).toBe('');
  });

  test('los campos ausentes quedan como texto vacío', () => {
    expect(mapAccountToForm({ id: 1 })).toEqual({
      bankName: '', accountType: '', bankAccount: '', beneficiaryAccountName: '', beneficiaryRtn: '', beneficiaryEmail: ''
    });
  });
});

describe('shouldAutofill', () => {
  test.each([
    [{ requestId: 0, typeId: 3, providerId: 152 }, true],
    [{ requestId: 0, typeId: 4, providerId: '152' }, true],
    [{ requestId: 12, typeId: 3, providerId: 152 }, false],
    [{ requestId: 0, typeId: 1, providerId: 152 }, false],
    [{ requestId: 0, typeId: 3, providerId: '' }, false],
    [{ requestId: 0, typeId: 3, providerId: 0 }, false]
  ])('%j -> %p', (input, expected) => expect(shouldAutofill(input)).toBe(expected));
});

describe('decideAutofill', () => {
  test('sin cuentas no toca nada', () => {
    expect(decideAutofill([])).toEqual({ mode: 'none', fill: null });
    expect(decideAutofill(undefined)).toEqual({ mode: 'none', fill: null });
  });

  test('una cuenta rellena directo', () => {
    const decision = decideAutofill([ACCOUNT]);
    expect(decision.mode).toBe('single');
    expect(decision.fill.bankAccount).toBe('750928271');
  });

  test('varias cuentas piden elegir y no rellenan', () => {
    expect(decideAutofill([ACCOUNT, { ...ACCOUNT, id: 6 }])).toEqual({ mode: 'multiple', fill: null });
  });
});

describe('accountOptions', () => {
  test('arma las opciones con banco y cuenta, empezando por una vacía', () => {
    expect(accountOptions([ACCOUNT, { id: 6, bankName: 'FICOHSA', bankAccount: '' }])).toEqual([
      { value: '', label: '' },
      { value: '5', label: 'BAC CREDOMATIC - 750928271' },
      { value: '6', label: 'FICOHSA' }
    ]);
  });
});

describe('createLoadGuard', () => {
  test('sin carga previa no bloquea', () => {
    expect(createLoadGuard().consume()).toBe(false);
  });

  test('tras cargar una solicitud la primera actualización se salta y la siguiente ya no', () => {
    const guard = createLoadGuard();
    guard.markLoaded();
    expect(guard.consume()).toBe(true);
    expect(guard.consume()).toBe(false);
  });
});
