import { describe, it, expect } from 'vitest';
import { toCents, isLempiras, getBankCredit, isValueMatching, valueStatus, defaultValue, blocksSave } from './transferValueRules';

// Los casos y los números son los mismos de modules/banks/transfers/__tests__/validateBankCredit.test.js del back.
const BANK = { ctaBank: '1010102002', currencyName: 'Lempiras' };
const LINES = [
  { idCtaCont: '6010110006', valueDebit: 10000, valueCredit: 0 },
  { idCtaCont: '1010102002', valueDebit: 0, valueCredit: 9702.42 },
  { idCtaCont: '2010102002', valueDebit: 0, valueCredit: 297.58 }
];
const status = (value, extra = {}) => valueStatus({ value, lines: LINES, bankAccount: BANK, ...extra });

describe('toCents', () => {
  it.each([[1.005, 101], [10.475, 1048], [0.1 + 0.2, 30], ['9702.42', 970242], [null, 0], ['abc', 0]])('%p → %p', (input, cents) => {
    expect(toCents(input)).toBe(cents);
  });
});

describe('valueStatus', () => {
  it.each([[9702.42], [9702.43], [9702.41], ['9702.42']])('valor %p es ok', (value) => {
    expect(status(value)).toBe('ok');
  });

  it.each([[9702.44], [9702.4], [10000]])('valor %p es mismatch', (value) => {
    expect(status(value)).toBe('mismatch');
  });

  it('suma varias líneas al banco y ignora espacios al borde', () => {
    const lines = [LINES[0], { ...LINES[1], idCtaCont: ' 1010102002 ', valueCredit: 9000 }, { ...LINES[1], valueCredit: 702.42 }, LINES[2]];
    expect(status(9702.42, { lines })).toBe('ok');
  });

  it('un débito a la cuenta del banco no cuenta', () => {
    const lines = [{ idCtaCont: '1010102002', valueDebit: 500, valueCredit: 0 }, { idCtaCont: '6010110006', valueDebit: 0, valueCredit: 500 }];
    expect(status(500, { lines })).toBe('noBankLine');
  });

  it('sin línea al banco', () => {
    expect(status(10000, { lines: [LINES[0], LINES[2]] })).toBe('noBankLine');
  });

  it('cuenta en dólares: exenta', () => {
    expect(status(1, { bankAccount: { ...BANK, currencyName: 'Dolares' } })).toBe('exempt');
  });

  it.each([[null], [{ ctaBank: '' }], [{ ctaBank: '  ' }]])('cuenta desconocida o sin numcta (%j)', (bankAccount) => {
    expect(status(1, { bankAccount })).toBe('unknown');
  });

  it('el ruido de coma flotante no cambia el resultado', () => {
    const lines = [{ idCtaCont: '1010102002', valueCredit: 0.1 + 0.2 }];
    expect(status(0.31, { lines })).toBe('ok');
    expect(status(0.32, { lines })).toBe('mismatch');
  });
});

describe('defaultValue y blocksSave', () => {
  it('por defecto es el crédito al banco', () => {
    expect(defaultValue({ lines: LINES, bankAccount: BANK })).toBe(9702.42);
    expect(getBankCredit(LINES, BANK)).toEqual({ cents: 970242, hasLine: true });
  });

  it('sin línea al banco el valor por defecto es 0', () => {
    expect(defaultValue({ lines: [LINES[0], LINES[2]], bankAccount: BANK })).toBe(0);
  });

  it('en dólares o sin cuenta conocida es el total de débitos', () => {
    expect(defaultValue({ lines: LINES, bankAccount: { ...BANK, currencyName: 'Dolares' } })).toBe(10000);
    expect(defaultValue({ lines: LINES, bankAccount: null })).toBe(10000);
  });

  it('solo bloquea el guardado en mismatch y noBankLine', () => {
    expect(['ok', 'exempt', 'unknown', 'mismatch', 'noBankLine'].map(blocksSave)).toEqual([false, false, false, true, true]);
  });

  it('isValueMatching y isLempiras', () => {
    expect(isValueMatching(5.01, 500)).toBe(true);
    expect(isValueMatching(5.02, 500)).toBe(false);
    expect(['Lempiras', ' LPS ', '', null, 'Dolares', 'USD'].map(isLempiras)).toEqual([true, true, true, true, false, false]);
  });
});
