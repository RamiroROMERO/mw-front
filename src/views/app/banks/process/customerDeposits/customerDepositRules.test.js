import { describe, it, expect } from 'vitest';
import {
  MAX_SHORTAGE_PERCENT, toCents, localToday, isFutureDate, calculateDepositTotals, findDepositProblem, resolveMaxShortagePercent, warningTexts
} from './customerDepositRules';

// Los casos y los números son los mismos de modules/banks/customerDeposits/__tests__/validateDepositTotals.test.js del back.
const line = (documentCode, originalValue, appliedValue, deductionValue = 0) => ({ documentCode, originalValue, appliedValue, deductionValue });
const ACCOUNT = '7110102002';

describe('toCents', () => {
  it.each([[1.005, 101], [10.475, 1048], [2.675, 268], [0.1, 10], [0.29, 29], ['1500.50', 150050], [null, 0], ['abc', 0], [-1.005, -101]])('%p → %p', (input, cents) => {
    expect(toCents(input)).toBe(cents);
  });
});

describe('fechas', () => {
  it('localToday usa el calendario local', () => {
    expect(localToday(new Date(2026, 9, 3, 23, 30))).toBe('2026-10-03');
    expect(localToday(new Date(2026, 0, 1, 0, 5))).toBe('2026-01-01');
  });

  it('hoy y ayer pasan; mañana es futura', () => {
    expect(isFutureDate('2026-10-03', '2026-10-03')).toBe(false);
    expect(isFutureDate('2026-10-02', '2026-10-03')).toBe(false);
    expect(isFutureDate('2026-10-04', '2026-10-03')).toBe(true);
  });

  it('una fecha con hora se compara por sus primeros 10 caracteres; vacía o inválida no es futura', () => {
    expect(isFutureDate('2026-10-04T00:00:00.000Z', '2026-10-03')).toBe(true);
    expect(isFutureDate('', '2026-10-03')).toBe(false);
    expect(isFutureDate(null, '2026-10-03')).toBe(false);
    expect(isFutureDate('mañana', '2026-10-03')).toBe(false);
  });
});

describe('calculateDepositTotals', () => {
  it('cuadrado', () => {
    expect(calculateDepositTotals({ value: 1000, lines: [line('F', 1000, 1000)] })).toEqual({ applied: 1000, deduction: 0, difference: 0, shortage: 0, overage: 0 });
  });

  it('con deducciones: valor = aplicado − deducciones', () => {
    expect(calculateDepositTotals({ value: 974.5, lines: [line('F', 1000, 1000, 25.5)] }).difference).toBe(0);
  });

  it('faltante (negativo) y sobrante (positivo)', () => {
    expect(calculateDepositTotals({ value: 1000, lines: [line('F', 1030, 1030)] })).toMatchObject({ difference: -30, shortage: 30, overage: 0 });
    expect(calculateDepositTotals({ value: 1500, lines: [line('F', 1000, 1000)] })).toMatchObject({ difference: 500, shortage: 0, overage: 500 });
  });

  it('suma en centavos sin ruido de coma flotante y acepta strings', () => {
    expect(calculateDepositTotals({ value: 0.3, lines: [line('A', 0.1, 0.1), line('B', 0.2, 0.2)] }).difference).toBe(0);
    expect(calculateDepositTotals({ value: '1500.50', lines: [line('F', '2000', '1500.50')] }).difference).toBe(0);
  });

  it('los valores vacíos o no numéricos de una línea cuentan como 0', () => {
    expect(calculateDepositTotals({ value: 100, lines: [line('F', 100, '', 'x')] })).toMatchObject({ applied: 0, deduction: 0, difference: 100 });
  });

  it('sin líneas', () => {
    expect(calculateDepositTotals({ value: 100 })).toMatchObject({ applied: 0, difference: 100 });
  });
});

describe('findDepositProblem', () => {
  it('el tope es el mismo del back', () => {
    expect(MAX_SHORTAGE_PERCENT).toBe(10);
  });

  it('sin líneas no hay nada que validar (se exige al contabilizar)', () => {
    expect(findDepositProblem({ value: 1000, lines: [] })).toBeNull();
  });

  it('depósito cuadrado, sin problema (ni cuenta)', () => {
    expect(findDepositProblem({ value: 1000, lines: [line('F', 1000, 1000)] })).toBeNull();
  });

  it('el caso real: 1.00 contra 2,004.45', () => {
    expect(findDepositProblem({ value: 1, lines: [line('F-2004', 2004.45, 2004.45)], differenceAccount: ACCOUNT })).toEqual({ code: 'deposit.shortage.exceeded' });
  });

  it('una línea que aplica más que su factura, con su número de factura', () => {
    expect(findDepositProblem({ value: 5000, lines: [line('F-9', 1000, 1000.01)] })).toEqual({ code: 'line.applied.exceeded', documentCode: 'F-9' });
  });

  it.each([[-1], ['abc'], [''], [null]])('un valor aplicado no válido (%p)', (applied) => {
    expect(findDepositProblem({ value: 100, lines: [line('F-1', 100, applied)] })).toEqual({ code: 'line.applied.invalid', documentCode: 'F-1' });
  });

  it('el orden: la línea antes que el total', () => {
    expect(findDepositProblem({ value: 1, lines: [line('F', 100, 200)] }).code).toBe('line.applied.exceeded');
  });

  it('un faltante del 10 % exacto con cuenta pasa; un centavo más no', () => {
    expect(findDepositProblem({ value: 1000, lines: [line('F', 1100, 1100)], differenceAccount: ACCOUNT })).toBeNull();
    expect(findDepositProblem({ value: 1000, lines: [line('F', 1100.01, 1100.01)], differenceAccount: ACCOUNT })).toEqual({ code: 'deposit.shortage.exceeded' });
  });

  it('el tope se calcula en centavos enteros (valor 0.30, tope 0.03)', () => {
    expect(findDepositProblem({ value: 0.3, lines: [line('F', 0.33, 0.33)], differenceAccount: ACCOUNT })).toBeNull();
    expect(findDepositProblem({ value: 0.3, lines: [line('F', 0.34, 0.34)], differenceAccount: ACCOUNT })).toEqual({ code: 'deposit.shortage.exceeded' });
  });

  it('un faltante enorme sin cuenta sale como faltante excedido (antes que pedir la cuenta)', () => {
    expect(findDepositProblem({ value: 1, lines: [line('F', 2004.45, 2004.45)] })).toEqual({ code: 'deposit.shortage.exceeded' });
  });

  it.each([[''], ['   '], [null], [undefined]])('una diferencia permitida sin cuenta (%p) pide la cuenta', (differenceAccount) => {
    expect(findDepositProblem({ value: 1000, lines: [line('F', 1050, 1050)], differenceAccount })).toEqual({ code: 'deposit.difference.account.required' });
    expect(findDepositProblem({ value: 1500, lines: [line('F', 1000, 1000)], differenceAccount })).toEqual({ code: 'deposit.difference.account.required' });
  });

  it('sobrante sin tope con cuenta; con diferencia 0 la cuenta no se pide', () => {
    expect(findDepositProblem({ value: 10000, lines: [line('F', 1000, 1000)], differenceAccount: ACCOUNT })).toBeNull();
    expect(findDepositProblem({ value: 1000, lines: [line('F', 1000, 1000)], differenceAccount: '' })).toBeNull();
  });

  it('los faltantes reales del 3 % al 4 % pasan (815.73 aplicando 842.12)', () => {
    expect(findDepositProblem({ value: 815.73, lines: [line('F', 842.12, 842.12)], differenceAccount: ACCOUNT })).toBeNull();
  });
});

// SPEC v2-32: mismos casos y números que modules/banks/customerDeposits/__tests__/validateDepositTotals.secondPass.test.js del back.
describe('findDepositProblem: deducción y facturas repetidas (SPEC v2-32)', () => {
  it('deducción igual a lo aplicado se acepta', () => {
    expect(findDepositProblem({ value: 0, lines: [line('F-1', 100, 100, 100)] })).toBeNull();
  });

  it('deducción mayor que lo aplicado a esa factura', () => {
    expect(findDepositProblem({ value: 500, lines: [line('F-1', 1000, 100, 100.01), line('F-2', 1000, 500)] }))
      .toEqual({ code: 'line.deduction.exceeded', documentCode: 'F-1' });
  });

  it('no se compensa con lo aplicado a otras facturas', () => {
    expect(findDepositProblem({ value: 300, lines: [line('F-1', 1000, 100, 300), line('F-2', 1000, 500)] }).code).toBe('line.deduction.exceeded');
  });

  it.each([[-5], ['abc']])('deducción %p no válida', (deduction) => {
    expect(findDepositProblem({ value: 100, lines: [line('F-1', 100, 100, deduction)] }).code).toBe('line.deduction.invalid');
  });

  it.each([[null], [undefined], ['']])('deducción vacía (%p) cuenta como 0', (deduction) => {
    expect(findDepositProblem({ value: 100, lines: [line('F-1', 100, 100, deduction)] })).toBeNull();
  });

  it('factura repetida, también con espacios', () => {
    expect(findDepositProblem({ value: 200, lines: [line('F-1', 100, 100), line(' F-1 ', 100, 100)] }))
      .toEqual({ code: 'line.duplicated', documentCode: ' F-1 ' });
  });

  it('facturas distintas y líneas sin código no son repetidas', () => {
    expect(findDepositProblem({ value: 200, lines: [line('F-1', 100, 100), line('F-2', 100, 100)] })).toBeNull();
    expect(findDepositProblem({ value: 200, lines: [line('', 100, 100), line('', 100, 100)] })).toBeNull();
  });
});

describe('tope del faltante configurable (SPEC v2-32)', () => {
  const input = { value: 1000, lines: [line('F-1', 1050, 1050)], differenceAccount: ACCOUNT };

  it('el parámetro manda sobre el valor por defecto', () => {
    expect(findDepositProblem({ ...input, maxShortagePercent: 5 })).toBeNull();
    expect(findDepositProblem({ ...input, maxShortagePercent: 4.99 })).toEqual({ code: 'deposit.shortage.exceeded' });
  });

  it('con 0 % no se admite faltante pero sí sobrante; con 100 % pasa cualquiera', () => {
    expect(findDepositProblem({ ...input, maxShortagePercent: 0 }).code).toBe('deposit.shortage.exceeded');
    expect(findDepositProblem({ value: 1000, lines: [line('F', 999, 999)], differenceAccount: ACCOUNT, maxShortagePercent: 0 })).toBeNull();
    expect(findDepositProblem({ value: 100, lines: [line('F', 200, 200)], differenceAccount: ACCOUNT, maxShortagePercent: 100 })).toBeNull();
  });

  it('admite decimales: 2.5 % de 1,000.00 son 25.00', () => {
    const base = { value: 1000, differenceAccount: ACCOUNT, maxShortagePercent: 2.5 };
    expect(findDepositProblem({ ...base, lines: [line('F', 1025, 1025)] })).toBeNull();
    expect(findDepositProblem({ ...base, lines: [line('F', 1025.01, 1025.01)] }).code).toBe('deposit.shortage.exceeded');
  });
});

describe('resolveMaxShortagePercent', () => {
  it.each([[15, 15], ['2.5', 2.5], [0, 0], ['100', 100]])('%p → %p', (input, expected) => {
    expect(resolveMaxShortagePercent(input)).toBe(expected);
  });

  it.each([[undefined], [null], [''], ['abc'], [-1], [100.5]])('%p cae al valor por defecto', (input) => {
    expect(resolveMaxShortagePercent(input)).toBe(MAX_SHORTAGE_PERCENT);
  });
});

describe('warningTexts', () => {
  it('devuelve el mensaje de cada advertencia del back', () => {
    expect(warningTexts([{ code: 'a', message: 'uno' }, { code: 'b', message: 'dos' }])).toEqual(['uno', 'dos']);
  });

  it('ignora advertencias sin mensaje y respuestas sin advertencias', () => {
    expect(warningTexts([{ code: 'a' }, null])).toEqual([]);
    expect(warningTexts(undefined)).toEqual([]);
    expect(warningTexts([])).toEqual([]);
  });
});
