import { describe, expect, test } from 'vitest';
import { IMPORT_LIST_PATH, IMPORT_PATH, buildImportPayload, canImportRow, hasImportSession, importBlockedReason } from './posImportRules';

describe('posImportRules', () => {
  test('rutas', () => {
    expect(IMPORT_LIST_PATH).toBe('billing/process/pointSales/importable');
    expect(IMPORT_PATH('10')).toBe('billing/process/pointSales/import/10');
  });

  test('solo una fila marcada importable se abre; la de Crédito trae su motivo', () => {
    expect(canImportRow({ importable: true })).toBe(true);
    expect(canImportRow({ importable: false, reason: 'pos.import.credit' })).toBe(false);
    expect(canImportRow(null)).toBe(false);
    expect(canImportRow({})).toBe(false);
    expect(importBlockedReason({ reason: 'pos.import.credit' })).toBe('pos.import.credit');
    expect(importBlockedReason({})).toBe('pos.import.credit');
  });

  test('el cuerpo lleva solo sesión, pagos con valor y recibido (nada de caja, cajero ni fecha)', () => {
    const body = buildImportPayload({
      sessionId: '3', receivedValue: 120,
      payments: [{ id: 1, value: '115', reference: 'R1', extra: 'x' }, { id: 2, value: '' }, { id: 3, value: 0 }]
    });
    expect(body).toEqual({ sessionId: 3, receivedValue: '120', payments: [{ paymentTypeDetailId: 1, amount: 115, reference: 'R1' }] });
    expect(buildImportPayload({ sessionId: 1, payments: undefined }).payments).toEqual([]);
    expect(buildImportPayload({ sessionId: 1, receivedValue: '' }).receivedValue).toBe('');
  });

  test('sin sesión no se importa', () => {
    expect(hasImportSession(3)).toBe(true);
    expect(hasImportSession(0)).toBe(false);
    expect(hasImportSession(undefined)).toBe(false);
  });
});
