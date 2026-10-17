import { describe, it, expect } from 'vitest';
import { EMPTY_STOCK, normalizeStock, shouldFetchStock, formatQty, STORE_PRIVILEGE_CODE, hasRefreshStockPrivilege } from './stockRules';

describe('normalizeStock', () => {
  it('respuesta del back de un tipo 1: filas con cantidades numéricas y total', () => {
    const out = normalizeStock({ applies: true, rows: [{ storeId: 1, storeName: 'BODEGA SPS', qty: '120.5' }], total: 120.5 });
    expect(out).toEqual({ applies: true, rows: [{ storeId: 1, storeName: 'BODEGA SPS', qty: 120.5 }], total: 120.5 });
  });

  it('applies false: grid vacío y total 0 aunque vengan filas', () => {
    expect(normalizeStock({ applies: false, rows: [{ storeId: 1, storeName: 'X', qty: 5 }], total: 5 }))
      .toEqual({ applies: false, rows: [], total: 0 });
  });

  it.each([[undefined], [null], ['x'], [5]])('dato inválido (%s): vacío y aplicable', (data) => {
    expect(normalizeStock(data)).toEqual({ applies: true, rows: [], total: 0 });
  });

  it('sin filas: lista vacía y total 0', () => {
    expect(normalizeStock({ applies: true, rows: [], total: 0 })).toEqual({ applies: true, rows: [], total: 0 });
  });

  it('un saldo negativo se conserva', () => {
    expect(normalizeStock({ applies: true, rows: [{ storeId: 1, storeName: 'A', qty: -200 }], total: -200 }).rows[0].qty).toBe(-200);
  });

  it('el estado vacío no se comparte entre llamadas', () => {
    const a = normalizeStock(null);
    a.rows.push(1);
    expect(normalizeStock(null).rows).toEqual([]);
    expect(EMPTY_STOCK.rows).toEqual([]);
  });
});

describe('shouldFetchStock', () => {
  it.each([[5, 'HPL-1'], ['5', 'HPL-1']])('producto guardado (id %s): se piden', (id, code) => {
    expect(shouldFetchStock({ id, code })).toBe(true);
  });
  it.each([[0, 'HPL-1'], ['0', 'HPL-1'], [5, ''], [5, '  '], [5, undefined], [undefined, 'A']])('no se piden (%s, %s)', (id, code) => {
    expect(shouldFetchStock({ id, code })).toBe(false);
  });
});

describe('formatQty', () => {
  it.each([[0, '0.00'], [16, '16.00'], [120.5, '120.50'], [-200, '-200.00'], [0.00003, '0.00003'], [1.234, '1.234'], ['7', '7.00']])(
    '%s -> %s', (value, text) => { expect(formatQty(value)).toBe(text); }
  );
  it.each([[undefined], [null], ['abc'], [NaN]])('no numérico (%s): 0.00', (v) => { expect(formatQty(v)).toBe('0.00'); });
});

describe('privilegio de "Actualizar existencias" (SPEC v2-15-sr)', () => {
  it('usa el privilegio de Almacenes y Productos', () => {
    expect(STORE_PRIVILEGE_CODE).toBe('01.05.006');
  });

  it.each([[undefined, false], [null, false], [{ active: false }, false], [{ active: true }, true]])('%j -> %s', (privilege, expected) => {
    expect(hasRefreshStockPrivilege(privilege)).toBe(expected);
  });
});
