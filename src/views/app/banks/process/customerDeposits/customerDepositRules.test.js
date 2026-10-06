import { describe, it, expect } from 'vitest';
import { MAX_SHORTAGE_PERCENT, toCents, localToday, isFutureDate, calculateDepositTotals, findDepositProblem } from './customerDepositRules';

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
