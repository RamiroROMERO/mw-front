import { describe, it, expect } from 'vitest';
import {
  MAX_ITEMS, CODES, toCents, parseAmount, distributionStatus, toItems, validateDistribution, buildPayload, distributedTotal, rowsFromPreview, shouldOffer
} from './purchaseAdvanceRules';

// Los casos y los números son los de purchaseAdvanceRules.test.js del back (modules/inventory/purchases/__tests__).
const row = (advanceId, assigned, balance = 500) => ({ advanceId, assigned, balance });
const codes = (result) => result.problems.map((p) => p.code);

describe('parseAmount', () => {
  it('acepta números y strings numéricos con hasta 2 decimales', () => {
    expect(parseAmount(396706.49)).toBe(39670649);
    expect(parseAmount('10.50')).toBe(1050);
    expect(parseAmount(0.01)).toBe(1);
    expect(parseAmount(0.3)).toBe(30);
  });

  it.each([[0], [-1], [-0.01], ['0'], [''], ['  '], ['abc'], [null], [undefined], [NaN], [Infinity], [true], [[]], [{}]])('monto %j se rechaza', (amount) => {
    expect(parseAmount(amount)).toBeNull();
  });

  it('más de 2 decimales se rechaza y no se redondea en silencio', () => {
    expect(parseAmount(10.005)).toBeNull();
    expect(parseAmount(0.001)).toBeNull();
    expect(parseAmount('1.234')).toBeNull();
  });

  it('ruido de coma flotante: 0.1 + 0.2 no es válido y 0.3 sí', () => {
    expect(parseAmount(0.1 + 0.2)).toBeNull();
    expect(parseAmount(0.3)).toBe(30);
  });
});

describe('toCents', () => {
  it('desplaza el punto decimal sobre el texto (mitades hacia arriba)', () => {
    expect(toCents(1.005)).toBe(101);
    expect(toCents(10.475)).toBe(1048);
    expect(toCents(100.004)).toBe(10000);
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(toCents('abc')).toBe(0);
  });
});

describe('distributionStatus', () => {
  it('compra sin guardar, sin contabilizar y contabilizada', () => {
    expect(distributionStatus(null)).toBe('notSaved');
    expect(distributionStatus({ id: 0, pdaNumber: 5 })).toBe('notSaved');
    expect(distributionStatus({ id: 7, pdaNumber: 0 })).toBe('notPosted');
    expect(distributionStatus({ id: 7 })).toBe('notPosted');
    expect(distributionStatus({ id: 7, pdaNumber: '0' })).toBe('notPosted');
    expect(distributionStatus({ id: 7, pdaNumber: 100026629 })).toBe('ok');
  });
});

describe('toItems', () => {
  it('solo las filas con monto digitado, y los demás se omiten', () => {
    expect(toItems([row(1, ''), row(2, '10'), row(3, undefined), row(4, '  '), row(5, 0)])).toEqual([
      { advanceId: 2, amount: '10' }, { advanceId: 5, amount: 0 }
    ]);
  });
  it('lista ausente', () => {
    expect(toItems(undefined)).toEqual([]);
  });
});

describe('validateDistribution: forma', () => {
  it('sin ningún monto digitado: items.required', () => {
    expect(codes(validateDistribution({ rows: [row(1, ''), row(2, '')], cxpBalance: 1000 }))).toEqual([CODES.ITEMS]);
    expect(codes(validateDistribution({ rows: [], cxpBalance: 1000 }))).toEqual([CODES.ITEMS]);
    expect(codes(validateDistribution({ rows: undefined, cxpBalance: 1000 }))).toEqual([CODES.ITEMS]);
  });

  it('hasta 50 ítems pasan y 51 se rechazan', () => {
    const make = (n) => Array.from({ length: n }, (_, i) => row(i + 1, '1', 10));
    expect(validateDistribution({ rows: make(MAX_ITEMS), cxpBalance: 1000 }).problems).toEqual([]);
    expect(codes(validateDistribution({ rows: make(MAX_ITEMS + 1), cxpBalance: 1000 }))).toEqual([CODES.ITEMS]);
  });

  it('un advanceId repetido (también como string) se rechaza', () => {
    expect(codes(validateDistribution({ rows: [row(5, '1'), row(5, '2')], cxpBalance: 1000 }))).toEqual([CODES.ITEMS]);
    expect(codes(validateDistribution({ rows: [row(5, '1'), row('5', '2')], cxpBalance: 1000 }))).toEqual([CODES.ITEMS]);
  });

  it.each([[0], [-3], [1.5], ['abc'], [undefined]])('advanceId %j inválido', (advanceId) => {
    expect(codes(validateDistribution({ rows: [{ advanceId, assigned: '1', balance: 10 }], cxpBalance: 1000 }))).toEqual([CODES.ITEMS]);
  });

  it('un error de forma sale antes que un monto inválido', () => {
    expect(codes(validateDistribution({ rows: [row(1, '0'), row(1, '5')], cxpBalance: 1000 }))).toEqual([CODES.ITEMS]);
  });
});

describe('validateDistribution: montos', () => {
  it.each([['0'], ['-1'], ['abc'], ['1.234'], [0]])('monto %j: amount.invalid con el anticipo', (assigned) => {
    const result = validateDistribution({ rows: [row(8, assigned)], cxpBalance: 1000 });
    expect(result.problems).toEqual([{ code: CODES.AMOUNT, advanceId: 8 }]);
  });

  it('informa todos los montos inválidos y no evalúa saldos', () => {
    const result = validateDistribution({ rows: [row(1, '0'), row(2, '700'), row(3, 'x')], cxpBalance: 1 });
    expect(result.problems).toEqual([{ code: CODES.AMOUNT, advanceId: 1 }, { code: CODES.AMOUNT, advanceId: 3 }]);
  });
});

describe('validateDistribution: saldos', () => {
  it('devuelve los ítems normalizados y el total en centavos cuando todo cabe', () => {
    const result = validateDistribution({ rows: [row(1, '100', 500), row(2, '50.25', 60)], cxpBalance: 1000 });
    expect(result.problems).toEqual([]);
    expect(result.items).toEqual([{ advanceId: 1, amount: 100, cents: 10000 }, { advanceId: 2, amount: 50.25, cents: 5025 }]);
    expect(result.totalCents).toBe(15025);
  });

  it('un monto igual al saldo del anticipo y al de la CxP se acepta', () => {
    expect(validateDistribution({ rows: [row(56, '396706.49', 396706.49)], cxpBalance: 396706.49 }).problems).toEqual([]);
  });

  it('un centavo sobre el saldo del anticipo: balance.exceeded con ambos montos', () => {
    const result = validateDistribution({ rows: [row(56, '100.01', 100)], cxpBalance: 1000 });
    expect(result.problems).toEqual([{ code: CODES.BALANCE, advanceId: 56, amount: 100.01, limit: 100 }]);
  });

  it('un centavo sobre el saldo de la CxP: cxp.exceeded con ambos montos', () => {
    const result = validateDistribution({ rows: [row(1, '60', 100), row(2, '40.01', 100)], cxpBalance: 100 });
    expect(result.problems).toEqual([{ code: CODES.CXP, amount: 100.01, limit: 100 }]);
  });

  it('cada monto cabe en su anticipo pero la suma pasa la CxP: cxp.exceeded', () => {
    expect(codes(validateDistribution({ rows: [row(1, '80', 100), row(2, '80', 100)], cxpBalance: 150 }))).toEqual([CODES.CXP]);
  });

  it('el saldo del anticipo se evalúa antes que el de la CxP', () => {
    expect(codes(validateDistribution({ rows: [row(1, '500', 100)], cxpBalance: 10 }))).toEqual([CODES.BALANCE]);
  });

  it('una CxP con saldo 0 rechaza cualquier monto', () => {
    expect(codes(validateDistribution({ rows: [row(1, '0.01', 100)], cxpBalance: 0 }))).toEqual([CODES.CXP]);
  });

  it('saldos con ruido de coma flotante o con 4 decimales de MySQL se comparan en centavos', () => {
    expect(validateDistribution({ rows: [row(1, '0.3', 0.1 + 0.2)], cxpBalance: 0.1 + 0.2 }).problems).toEqual([]);
    expect(validateDistribution({ rows: [row(1, '100', 100.004)], cxpBalance: 100.004 }).problems).toEqual([]);
  });

  it('las filas sin monto no cuentan: solo se valida lo digitado', () => {
    const result = validateDistribution({ rows: [row(1, '', 0), row(2, '10', 500)], cxpBalance: 10 });
    expect(result.problems).toEqual([]);
    expect(result.items).toHaveLength(1);
  });
});

describe('buildPayload, distributedTotal, rowsFromPreview y shouldOffer', () => {
  it('el cuerpo del POST lleva solo advanceId y amount', () => {
    expect(buildPayload([{ advanceId: 5, amount: 12.5, cents: 1250 }])).toEqual({ items: [{ advanceId: 5, amount: 12.5 }] });
  });

  it('el total distribuido suma en centavos', () => {
    expect(distributedTotal([{ amount: 0.1 }, { amount: 0.2 }])).toBe(0.3);
    expect(distributedTotal(undefined)).toBe(0);
  });

  it('las filas del modal salen de los anticipos disponibles, con el monto asignado vacío', () => {
    const preview = { available: [{ advanceId: 56, date: '2026-08-01', description: 'ANT', originalValue: 500, balance: 300 }] };
    expect(rowsFromPreview(preview)).toEqual([{ advanceId: 56, date: '2026-08-01', description: 'ANT', originalValue: 500, balance: 300, assigned: '' }]);
    expect(rowsFromPreview(undefined)).toEqual([]);
  });

  it('solo se ofrece el modal tras contabilizar si hay anticipos con saldo', () => {
    expect(shouldOffer({ available: [{ balance: 10 }] })).toBe(true);
    expect(shouldOffer({ available: [{ balance: 0 }] })).toBe(false);
    expect(shouldOffer({ available: [] })).toBe(false);
    expect(shouldOffer(undefined)).toBe(false);
  });
});
