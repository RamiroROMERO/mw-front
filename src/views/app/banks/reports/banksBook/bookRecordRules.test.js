import { describe, it, expect } from 'vitest';
import {
  hasEntry, isReconciled, canEditAmounts, formDateNull, getEditStatus, getDeleteStatus, buildChanges, validateEditForm, filterBookLines
} from './bookRecordRules';

const POSTED = {
  id: 1, description: 'PAGO', reference: 'REF', valueDebit: '0.0000', valueCredit: '1500.0000', exchangeRate: '1.0000',
  dateNull: '1900-01-01', pdaNumber: 500, annulled: 0, isConBank: 0, isConBook: 0
};
const LOOSE = { ...POSTED, pdaNumber: 0 };
const formOf = (row, extra = {}) => ({
  description: row.description, reference: row.reference, dateNull: formDateNull(row),
  valueDebit: row.valueDebit, valueCredit: row.valueCredit, exchangeRate: row.exchangeRate, ...extra
});

describe('estado de la fila', () => {
  it('con partida y conciliada (0/1, true/false)', () => {
    expect(hasEntry(POSTED)).toBe(true);
    expect(hasEntry(LOOSE)).toBe(false);
    expect(isReconciled({ isConBank: 1 })).toBe(true);
    expect(isReconciled({ isConBook: true })).toBe(true);
    expect(isReconciled(POSTED)).toBe(false);
  });
  it('los montos solo se editan en una fila suelta y sin conciliar', () => {
    expect(canEditAmounts(POSTED)).toBe(false);
    expect(canEditAmounts(LOOSE)).toBe(true);
    expect(canEditAmounts({ ...LOOSE, isConBank: 1 })).toBe(false);
  });
  it('el centinela de fecha de anulación se muestra vacío', () => {
    expect(formDateNull(POSTED)).toBe('');
    expect(formDateNull({ dateNull: '2026-09-01T00:00:00.000Z' })).toBe('2026-09-01');
  });
});

describe('getEditStatus', () => {
  it('sin fn_update: noPermission; fila con partida sin 11.01.015: noPostedPermission; si no, ok', () => {
    expect(getEditStatus(POSTED, { update: false, editPosted: true })).toBe('noPermission');
    expect(getEditStatus(POSTED, { update: true, editPosted: false })).toBe('noPostedPermission');
    expect(getEditStatus(POSTED, { update: true, editPosted: true })).toBe('ok');
    expect(getEditStatus(LOOSE, { update: true, editPosted: false })).toBe('ok');
    expect(getEditStatus(LOOSE, undefined)).toBe('noPermission');
  });
});

describe('getDeleteStatus', () => {
  const all = { delete: true, deleteDocument: true };
  it('exige fn_delete y 11.01.022', () => {
    expect(getDeleteStatus(LOOSE, { delete: true, deleteDocument: false })).toBe('noPermission');
    expect(getDeleteStatus(LOOSE, { delete: false, deleteDocument: true })).toBe('noPermission');
    expect(getDeleteStatus(LOOSE, all)).toBe('ok');
  });
  it.each([
    ['anulada o reverso', { ...LOOSE, annulled: 1 }, 'reversal'],
    ['con partida', POSTED, 'posted'],
    ['conciliada', { ...LOOSE, isConBook: 1 }, 'reconciled']
  ])('fila %s: %s', (_label, row, status) => expect(getDeleteStatus(row, all)).toBe(status));
});

describe('buildChanges', () => {
  it('sin cambios: vacío', () => expect(buildChanges(POSTED, formOf(POSTED))).toEqual({}));
  it('solo manda lo que cambió y recorta espacios', () => {
    expect(buildChanges(POSTED, formOf(POSTED, { description: '  NUEVA ', dateNull: '2026-09-01' }))).toEqual({ description: 'NUEVA', dateNull: '2026-09-01' });
  });
  it('borrar la fecha de anulación manda vacío', () => {
    const row = { ...POSTED, dateNull: '2026-09-01' };
    expect(buildChanges(row, formOf(row, { dateNull: '' }))).toEqual({ dateNull: '' });
  });
  it('fila con partida: los montos del formulario se ignoran aunque cambien', () => {
    expect(buildChanges(POSTED, formOf(POSTED, { valueCredit: 1, exchangeRate: 99 }))).toEqual({});
  });
  it('fila suelta: manda montos y tipo de cambio cambiados (en centavos / diezmilésimas)', () => {
    expect(buildChanges(LOOSE, formOf(LOOSE, { valueCredit: '1600.50', exchangeRate: '26.4686' }))).toEqual({ valueCredit: 1600.5, exchangeRate: 26.4686 });
    expect(buildChanges(LOOSE, formOf(LOOSE, { valueCredit: 1500.004 }))).toEqual({});
  });
});

describe('validateEditForm', () => {
  it('descripción vacía', () => expect(validateEditForm(POSTED, formOf(POSTED, { description: ' ' }))).toBe('page.banksBook.msg.descriptionRequired'));
  it('sin cambios', () => expect(validateEditForm(POSTED, formOf(POSTED))).toBe('page.banksBook.msg.noChanges'));
  it('cambio válido: null', () => expect(validateEditForm(POSTED, formOf(POSTED, { reference: 'OTRA' }))).toBeNull());
  it('fila suelta: ambos montos en 0, monto negativo y tipo de cambio 0', () => {
    expect(validateEditForm(LOOSE, formOf(LOOSE, { valueCredit: 0, valueDebit: 0 }))).toBe('page.banksBook.msg.amountsRequired');
    expect(validateEditForm(LOOSE, formOf(LOOSE, { valueCredit: -5 }))).toBe('page.banksBook.msg.amountsRequired');
    expect(validateEditForm(LOOSE, formOf(LOOSE, { exchangeRate: 0 }))).toBe('page.banksBook.msg.rateInvalid');
    expect(validateEditForm(LOOSE, formOf(LOOSE, { valueCredit: 10, valueDebit: 0 }))).toBeNull();
  });
});

describe('filterBookLines', () => {
  const lines = [
    { id: 1, documentCode: 'CH', benefName: 'Proveedor Uno', description: 'Pago luz', reference: 'A1' },
    { id: 2, documentCode: 'TRB', benefName: 'Banco', description: 'Traslado', reference: 'B2' },
    { id: 3, documentCode: 'CH', benefName: null, description: null, reference: undefined }
  ];

  it('sin texto devuelve todas las líneas', () => {
    expect(filterBookLines(lines, '')).toBe(lines);
    expect(filterBookLines(lines, '   ')).toBe(lines);
    expect(filterBookLines(lines)).toBe(lines);
  });
  it('busca sin distinguir mayúsculas en documento, beneficiario, descripción y referencia', () => {
    expect(filterBookLines(lines, 'pago').map((l) => l.id)).toEqual([1]);
    expect(filterBookLines(lines, 'trb').map((l) => l.id)).toEqual([2]);
    expect(filterBookLines(lines, 'b2').map((l) => l.id)).toEqual([2]);
    expect(filterBookLines(lines, 'ch').map((l) => l.id)).toEqual([1, 3]);
  });
  it('tolera campos nulos y sin coincidencias', () => {
    expect(filterBookLines(lines, 'zzz')).toEqual([]);
  });
});
