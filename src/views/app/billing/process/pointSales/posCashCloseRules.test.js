import { describe, expect, test } from 'vitest';
import { isValidAmount, validateCashClose, buildPayload, buildPreviewQuery, isInitialEditable, differenceKind, canApply, canVoid, canDelete } from './posCashCloseRules';

describe('posCashCloseRules', () => {
  test('monto: 0 es válido, hasta 2 decimales, sin negativos', () => {
    ['0', '10', '24670.50'].forEach((v) => expect(isValidAmount(v)).toBe(true));
    ['-1', '1.234', 'abc', ''].forEach((v) => expect(isValidAmount(v)).toBe(false));
  });

  test('el efectivo contado es obligatorio (0 vale); depósito y fondo solo si se digitan', () => {
    expect(validateCashClose({ cashValue: '0' })).toEqual({});
    expect(validateCashClose({ cashValue: '' }).cashValue).toBeTruthy();
    expect(validateCashClose({ cashValue: '-5' }).cashValue).toBeTruthy();
    expect(validateCashClose({ cashValue: '10', depositValue: 'x' }).depositValue).toBeTruthy();
    expect(validateCashClose({ cashValue: '10', depositValue: '' })).toEqual({});
    expect(validateCashClose({ cashValue: '10', initialValue: 'x', editableInitial: true }).initialValue).toBeTruthy();
    expect(validateCashClose({ cashValue: '10', initialValue: 'x', editableInitial: false })).toEqual({});
  });

  test('el cuerpo no lleva cifras, estado ni caja; el fondo solo cuando se digita', () => {
    const body = buildPayload({ cashValue: '10', date: '2026-11-18', allCashiers: false, total: 5, status: 1, isClose: 1, cashId: 9 });
    expect(Object.keys(body).sort()).toEqual(['allCashiers', 'cashValue', 'cashierId', 'date', 'depositNumber', 'depositValue']);
    expect(buildPayload({ cashValue: '10', initialValue: '25' }, { isNew: false, editableInitial: true })).toMatchObject({ initialValue: '25' });
    expect(buildPayload({ cashValue: '10' }, { isNew: false }).date).toBeUndefined();
  });

  test('consulta de cifras: por cierre guardado o por fecha y lo digitado', () => {
    expect(buildPreviewQuery({ sessionId: 5, closeId: 30 })).toEqual({ sessionId: 5, closeId: 30 });
    expect(buildPreviewQuery({ sessionId: 5, closeId: 0, date: '2026-11-18', cashierId: 7, allCashiers: true, cashValue: 'x', initialValue: '' })).toEqual({ sessionId: 5, date: '2026-11-18', cashierId: 7, allCashiers: 'true', cashValue: undefined, initialValue: undefined });
  });

  test('el fondo se digita solo si no sale de la apertura', () => {
    const base = { sessionDate: '2026-11-18', sessionCashierId: 7 };
    expect(isInitialEditable({ ...base, date: '2026-11-18', cashierId: 7, allCashiers: false })).toBe(false);
    expect(isInitialEditable({ ...base, date: '2026-11-10', cashierId: 7, allCashiers: false })).toBe(true);
    expect(isInitialEditable({ ...base, date: '2026-11-18', cashierId: 8, allCashiers: false })).toBe(true);
    expect(isInitialEditable({ ...base, date: '2026-11-18', cashierId: 7, allCashiers: true })).toBe(true);
  });

  test('faltante, sobrante y acciones según el estado', () => {
    expect(differenceKind(-10)).toBe('shortage');
    expect(differenceKind(5)).toBe('excess');
    expect(differenceKind(0)).toBe('exact');
    expect(canApply({ id: 3, isApplied: false })).toBe(true);
    expect(canApply({ id: 3, isApplied: true })).toBe(false);
    expect(canVoid({ id: 3, isApplied: true }, true)).toBe(true);
    expect(canVoid({ id: 3, isApplied: true }, false)).toBe(false);
    expect(canVoid({ id: 3, isApplied: false }, true)).toBe(false);
    expect(canDelete({ id: 3, isApplied: false })).toBe(true);
    expect(canDelete({ id: 3, isApplied: true })).toBe(false);
  });
});
