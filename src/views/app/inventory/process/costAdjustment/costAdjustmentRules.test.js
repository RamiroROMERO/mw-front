import { describe, expect, test } from 'vitest';
import {
  MAX_ROWS, MAX_REASON, MAX_RANGE_DAYS, buildPayload, changeRow, collectEdits, computeValue, computeValues, decimalsOf, hasAdjustPrivilege, isEdited,
  rowNotice, summarizeResult, toRow, validateFilter, validateReason, validateRow
} from './costAdjustmentRules';

test('límites iguales a los del back', () => {
  expect([MAX_ROWS, MAX_REASON, MAX_RANGE_DAYS]).toEqual([500, 250, 366]);
});

test('privilegio 99.02.014: solo con `active`', () => {
  expect(hasAdjustPrivilege({ active: true })).toBe(true);
  expect(hasAdjustPrivilege({ active: false })).toBe(false);
  expect(hasAdjustPrivilege(undefined)).toBe(false);
});

describe('valores calculados (mismos casos que el back)', () => {
  test.each([[10, 3, 30], [10.123, 3, 30.37], [0.1, 3, 0.3], [1.005, 1, 1.01], [3.33333, 3, 10], [0, 5, 0], [12.5, 0.5, 6.25], [4, 5, 20]])('%s x %s = %s', (cost, qty, expected) => {
    expect(computeValue(cost, qty)).toBe(expected);
  });
  test('computeValues usa cada cantidad con su lado', () => {
    expect(computeValues({ costValue: 4, debitQty: 5, creditQty: 0 })).toEqual({ debitValue: 20, creditValue: 0 });
  });
  test('decimalsOf cuenta los decimales del texto (también en notación científica)', () => {
    expect([decimalsOf('1.12345'), decimalsOf(1.1), decimalsOf('2.000'), decimalsOf(1e-7), decimalsOf(5)]).toEqual([5, 1, 0, 7, 0]);
  });
});

describe('validateFilter', () => {
  const ok = { storeId: 1, productCode: 'P1', dateFrom: '2026-08-01', dateTo: '2026-08-31' };
  test('un filtro válido no tiene errores', () => { expect(validateFilter(ok)).toEqual({}); });
  test.each([[{ storeId: 0 }, 'storeId'], [{ storeId: '' }, 'storeId'], [{ productCode: '  ' }, 'productCode'], [{ dateFrom: '' }, 'dateFrom'], [{ dateTo: '' }, 'dateTo']])('%j marca %s', (over, field) => {
    expect(Object.keys(validateFilter({ ...ok, ...over }))).toContain(field);
  });
  test('fechas inválidas, invertidas y de más de 366 días (igual que el back)', () => {
    expect(validateFilter({ ...ok, dateFrom: '2026-02-30' }).dateFrom).toBe('page.costAdjustment.error.dateInvalid');
    expect(validateFilter({ ...ok, dateFrom: '2026-08-31', dateTo: '2026-08-01' }).dateTo).toBe('page.costAdjustment.error.rangeInvalid');
    expect(validateFilter({ ...ok, dateFrom: '2026-01-01', dateTo: '2027-01-02' })).toEqual({});
    expect(validateFilter({ ...ok, dateFrom: '2026-01-01', dateTo: '2027-01-03' }).dateTo).toBe('page.costAdjustment.error.rangeTooLarge');
    expect(validateFilter({ ...ok, dateFrom: '2028-01-01', dateTo: '2029-01-01' })).toEqual({}); // 2028 es bisiesto
    expect(validateFilter({ ...ok, dateFrom: '2026-08-10', dateTo: '2026-08-10' })).toEqual({});
  });
});

describe('validateRow', () => {
  const ok = { costValue: 10, debitQty: 0, creditQty: 3 };
  test('una fila válida (también como texto y con 5 decimales)', () => {
    expect(validateRow(ok)).toEqual({});
    expect(validateRow({ costValue: '10.12345', debitQty: '0', creditQty: '1.00001' })).toEqual({});
  });
  test.each(['costValue', 'debitQty', 'creditQty'])('%s: vacío, no numérico, negativo y de más de 5 decimales se marcan', (field) => {
    expect(validateRow({ ...ok, [field]: '' })[field]).toBe('page.costAdjustment.error.number');
    expect(validateRow({ ...ok, [field]: 'x' })[field]).toBe('page.costAdjustment.error.number');
    expect(validateRow({ ...ok, [field]: -1 })[field]).toBe('page.costAdjustment.error.negative');
    expect(validateRow({ ...ok, [field]: '1.123456' })[field]).toBe('page.costAdjustment.error.decimals');
  });
  test('entrada y salida a la vez se marcan', () => {
    expect(validateRow({ costValue: 1, debitQty: 1, creditQty: 2 }).creditQty).toBe('page.costAdjustment.error.bothSides');
  });
});

describe('filas editables', () => {
  const item = { id: 5, costValue: 10, debitQty: 0, debitValue: 0, creditQty: 3, creditValue: 30, editable: true, isTransfer: false };
  test('una fila recién consultada no está editada; cambiar un campo la marca y recalcula el valor', () => {
    const row = toRow(item);
    expect(isEdited(row)).toBe(false);
    const changed = changeRow(row, 'costValue', '12');
    expect(isEdited(changed)).toBe(true);
    expect(changed.creditValue).toBe(36);
    expect(changed.debitValue).toBe(0);
  });
  test('volver al valor original deja la fila sin editar', () => {
    expect(isEdited(changeRow(changeRow(toRow(item), 'costValue', '12'), 'costValue', '10'))).toBe(false);
  });
  test('una fila no editable no cambia', () => {
    const locked = toRow({ ...item, editable: false });
    expect(changeRow(locked, 'costValue', '99')).toBe(locked);
  });
  test('collectEdits devuelve solo las editadas y los errores por id', () => {
    const rows = [toRow(item), changeRow(toRow({ ...item, id: 6 }), 'costValue', '-1'), changeRow(toRow({ ...item, id: 7 }), 'costValue', '11')];
    const { edited, errors } = collectEdits(rows);
    expect(edited.map((r) => r.id)).toEqual([6, 7]);
    expect(Object.keys(errors)).toEqual(['6']);
  });
  test('rowNotice: no editable, traslado o nada', () => {
    expect(rowNotice({ editable: false })).toBe('page.costAdjustment.notice.valueMismatch');
    expect(rowNotice({ editable: true, isTransfer: true })).toBe('page.costAdjustment.notice.transfer');
    expect(rowNotice({ editable: true, isTransfer: false })).toBeNull();
  });
});

describe('motivo, cuerpo y resultado', () => {
  test('motivo obligatorio y de máximo 250', () => {
    expect(validateReason('')).toBe('page.costAdjustment.error.reasonRequired');
    expect(validateReason('   ')).toBe('page.costAdjustment.error.reasonRequired');
    expect(validateReason('M'.repeat(250))).toBeNull();
    expect(validateReason('M'.repeat(251))).toBe('page.costAdjustment.error.reasonTooLong');
  });
  test('el cuerpo trae el filtro, el motivo y solo id, costo y cantidades (nunca el valor)', () => {
    const edited = [changeRow(toRow({ id: 5, costValue: 10, debitQty: 0, creditQty: 3, debitValue: 0, creditValue: 30, editable: true }), 'costValue', '12')];
    expect(buildPayload({ storeId: '1', productCode: ' P1 ', dateFrom: '2026-08-01', dateTo: '2026-08-31' }, ' motivo ', edited)).toEqual({
      storeId: 1, productCode: 'P1', dateFrom: '2026-08-01', dateTo: '2026-08-31', reason: 'motivo', rows: [{ id: 5, costValue: 12, debitQty: 0, creditQty: 3 }]
    });
  });
  test('summarizeResult cuenta líneas, existencia y avisos de traslado', () => {
    expect(summarizeResult({ updated: 2, unchanged: 1, stock: { existence: 18.5 }, warnings: [{ id: 1, code: 'transfer.half' }] })).toEqual({ updated: 2, unchanged: 1, existence: 18.5, transferWarnings: 1 });
    expect(summarizeResult(undefined)).toEqual({ updated: 0, unchanged: 0, existence: 0, transferWarnings: 0 });
  });
});
