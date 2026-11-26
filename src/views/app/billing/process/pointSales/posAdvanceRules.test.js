import { describe, expect, test } from 'vitest';
import {
  ADVANCES_PATH, ADVANCE_PATIENTS_PATH, paymentsOf, rowsTotalCents, validateAdvance, buildAdvancePayload, emptyRows, validateVoidReason, applySummary, toggleSelection, advanceParams, voidParams, MAX_REASON
} from './posAdvanceRules';

const rows = [{ id: 1, name: 'Efectivo', value: '100', reference: '' }, { id: 2, name: 'POS', value: '50.5', reference: 'ref' }, { id: 3, name: 'Otra', value: '', reference: '' }];

describe('posAdvanceRules', () => {
  test('rutas', () => {
    expect(ADVANCES_PATH).toBe('billing/process/pointSales/advances');
    expect(ADVANCE_PATIENTS_PATH).toBe('billing/process/pointSales/advances/patients');
  });

  test('paymentsOf manda solo las formas con monto y rowsTotalCents suma en centavos', () => {
    expect(paymentsOf(rows)).toEqual([{ paymentTypeDetailId: 1, amount: 100, reference: '' }, { paymentTypeDetailId: 2, amount: 50.5, reference: 'ref' }]);
    expect(rowsTotalCents(rows)).toBe(15050);
    expect(rowsTotalCents([{ value: '0.1' }, { value: '0.2' }])).toBe(30);
  });

  test('validateAdvance: paciente, monto válido y al menos una forma', () => {
    expect(validateAdvance({ customerId: 7, rows })).toBeNull();
    expect(validateAdvance({ customerId: 0, rows })).toBe('page.pointSales.advance.msg.patientRequired');
    expect(validateAdvance({ customerId: 7, rows: [{ id: 1, value: '' }] })).toBe('page.pointSales.advance.msg.paymentsRequired');
    expect(validateAdvance({ customerId: 7, rows: [{ id: 1, value: '1.234' }] })).toBe('page.pointSales.advance.msg.amountInvalid');
    expect(validateAdvance({ customerId: 7, rows: [{ id: 1, value: '-5' }] })).toBe('page.pointSales.advance.msg.amountInvalid');
  });

  test('buildAdvancePayload solo lleva sesión, paciente y formas (nada de valor, caja o fecha)', () => {
    const payload = buildAdvancePayload({ sessionId: '9', customerId: '7', rows });
    expect(Object.keys(payload).sort()).toEqual(['customerId', 'payments', 'sessionId']);
    expect(payload).toMatchObject({ sessionId: 9, customerId: 7 });
  });

  test('emptyRows deja las formas sin montos y no muta', () => {
    expect(emptyRows(rows).every((row) => row.value === '')).toBe(true);
    expect(rows[0].value).toBe('100');
  });

  test('motivo de anulación obligatorio y de hasta 200 caracteres', () => {
    expect(validateVoidReason('  ')).toBe('msg.required.input.voidReason');
    expect(validateVoidReason('x'.repeat(MAX_REASON + 1))).toBe('page.pointSales.advance.msg.reasonTooLong');
    expect(validateVoidReason('devolución')).toBeNull();
    expect(voidParams(` ${'x'.repeat(300)} `).reason.length).toBe(MAX_REASON);
  });

  test('applySummary resta lo aplicado del copago y avisa si lo supera', () => {
    const advances = [{ id: 1, value: '100.00' }, { id: 2, value: 50 }, { id: 3, value: 10 }];
    expect(applySummary({ copayment: 230, advances, selectedIds: [1, 2] })).toMatchObject({ applied: '150.00', toPay: '80.00', exceeds: false });
    expect(applySummary({ copayment: 100, advances, selectedIds: [1, 2] })).toMatchObject({ applied: '150.00', toPay: '0.00', exceeds: true });
    expect(applySummary({ copayment: 100, advances, selectedIds: [] })).toMatchObject({ applied: '0.00', toPay: '100.00', exceeds: false });
    expect(applySummary({ copayment: 0.3, advances: [{ id: 1, value: 0.1 }, { id: 2, value: 0.2 }], selectedIds: [1, 2] })).toMatchObject({ toPay: '0.00', exceeds: false });
  });

  test('toggleSelection alterna sin mutar y advanceParams arma la lista', () => {
    const base = [1, 2];
    expect(toggleSelection(base, 3)).toEqual([1, 2, 3]);
    expect(toggleSelection(base, 1)).toEqual([2]);
    expect(base).toEqual([1, 2]);
    expect(advanceParams([4, 5])).toEqual({ advanceIds: '4,5' });
    expect(advanceParams([])).toEqual({});
  });
});
