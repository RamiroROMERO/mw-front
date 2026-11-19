import { describe, expect, test } from 'vitest';
import { isValidValue, typesFor, needsAccount, validateMovement, buildPayload, canEdit, canVoid, buildListQuery, MOVEMENT_IN, MOVEMENT_OUT } from './cashMovementRules';

const types = [
  { id: 1, name: 'Gastos', movementType: 2, hasAccount: true },
  { id: 2, name: 'Otros ingresos', movementType: 1, hasAccount: false }
];
const ok = { documentCode: 'REC', beneficName: 'Juan Perez', beneficDNI: '', description: 'Compra de agua', typeId: 1, value: '10', outCtaCode: '' };

describe('cashMovementRules', () => {
  test('valor: hasta 2 decimales y mayor que 0', () => {
    ['10', '0.01', '1200.50'].forEach((v) => expect(isValidValue(v)).toBe(true));
    ['0', '-1', '1.234', 'abc', '', null].forEach((v) => expect(isValidValue(v)).toBe(false));
  });

  test('tipos por movimiento y cuenta obligatoria solo si el tipo no la tiene', () => {
    expect(typesFor(types, MOVEMENT_OUT).map((t) => t.id)).toEqual([1]);
    expect(typesFor(types, MOVEMENT_IN).map((t) => t.id)).toEqual([2]);
    expect(needsAccount(types, 1)).toBe(false);
    expect(needsAccount(types, 2)).toBe(true);
    expect(needsAccount(types, 99)).toBe(false);
  });

  test('validación por campo con los mismos casos del back', () => {
    expect(validateMovement(ok, { types })).toEqual({});
    expect(validateMovement({ ...ok, documentCode: '' }, { types }).documentCode).toBeTruthy();
    expect(validateMovement({ ...ok, beneficName: 'ab', beneficDNI: '1234' }, { types }).beneficName).toBeTruthy();
    expect(validateMovement({ ...ok, beneficName: 'ab', beneficDNI: '0801199900123' }, { types })).toEqual({});
    expect(validateMovement({ ...ok, description: 'abc' }, { types }).description).toBeTruthy();
    expect(validateMovement({ ...ok, typeId: 0 }, { types }).typeId).toBeTruthy();
    expect(validateMovement({ ...ok, value: '1.234' }, { types }).value).toBeTruthy();
    expect(validateMovement({ ...ok, typeId: 2 }, { types }).outCtaCode).toBeTruthy();
    expect(validateMovement({ ...ok, typeId: 2, outCtaCode: '6010' }, { types })).toEqual({});
  });

  test('el cuerpo del alta no lleva caja, cajero ni empresa; la edición no cambia documento ni tipo de movimiento', () => {
    const created = buildPayload({ ...ok, movementType: 2, date: '2026-11-18', cashId: 9, cashierId: 9, companyId: 9 });
    expect(Object.keys(created).sort()).toEqual(['beneficDNI', 'beneficName', 'date', 'description', 'documentCode', 'movementType', 'typeId', 'value']);
    const edited = buildPayload({ ...ok, movementType: 2, date: '2026-11-18', outCtaCode: '6010' }, { isNew: false });
    expect(edited.movementType).toBeUndefined();
    expect(edited.documentCode).toBeUndefined();
    expect(edited.outCtaCode).toBe('6010');
  });

  test('editar y anular según el estado', () => {
    expect(canEdit({ isVoided: false, isClosed: false, isLegacyType: false })).toBe(true);
    expect(canEdit({ isVoided: true })).toBe(false);
    expect(canEdit({ isClosed: true })).toBe(false);
    expect(canEdit({ isLegacyType: true })).toBe(false);
    expect(canVoid({ isVoided: false, isClosed: false }, true)).toBe(true);
    expect(canVoid({ isVoided: false, isClosed: false }, false)).toBe(false);
    expect(canVoid({ isClosed: true }, true)).toBe(false);
  });

  test('consulta de la lista', () => {
    expect(buildListQuery({ sessionId: 5, date: '2026-11-18' })).toEqual({ sessionId: 5, dateStart: '2026-11-18', dateEnd: '2026-11-18', limit: 50, offset: 0 });
    expect(buildListQuery({ sessionId: 5, all: true })).toEqual({ sessionId: 5, all: 'true', limit: 50, offset: 0 });
  });
});
