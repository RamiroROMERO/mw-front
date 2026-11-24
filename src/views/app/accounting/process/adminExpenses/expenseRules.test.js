import { describe, it, expect } from 'vitest';
import { isValidAmount, isRealDate, lineValueCents, validateHeader, validateLine, validateDocument } from './expenseRules';

const TODAY = '2026-06-15';
const line = (extra = {}) => ({ documentCode: 'F-1', date: '2026-01-10', name: 'Compra', provider: 'Prov', idCtaCont: '5010101', valExent: 0, valGrav: 100, valTax: 15, ...extra });
const header = (extra = {}) => ({ date: '2026-01-10', description: 'Caja chica', responsible: 'Ana', ...extra });

describe('expenseRules (mismos casos que AdminExpenseDTO del back)', () => {
  it('valor de línea en centavos sin ruido', () => {
    expect(lineValueCents({ valExent: 0.1, valGrav: 0.2, valTax: 0 })).toBe(30);
  });

  it.each([['2026-02-30', false], ['2026-01-10', true], ['ayer', false], ['', false]])('isRealDate(%s) = %s', (v, ok) => {
    expect(isRealDate(v)).toBe(ok);
  });

  it.each([['0', true], ['10.5', true], ['-1', false], ['1.005', false]])('isValidAmount(%s) = %s', (v, ok) => {
    expect(isValidAmount(v)).toBe(ok);
  });

  it('encabezado válido; la fecha de hoy es válida y la futura no', () => {
    expect(validateHeader(header(), TODAY)).toEqual({});
    expect(validateHeader(header({ date: TODAY }), TODAY)).toEqual({});
    expect(validateHeader(header({ date: '2026-06-16' }), TODAY).date).toContain('futureDate');
  });

  it.each([
    [{ date: '' }, 'date'], [{ date: '2026-02-30' }, 'date'], [{ description: '' }, 'description'],
    [{ description: 'x'.repeat(201) }, 'description'], [{ responsible: 'x'.repeat(51) }, 'responsible']
  ])('encabezado %j marca %s', (extra, field) => {
    expect(Object.keys(validateHeader(header(extra), TODAY))).toContain(field);
  });

  it.each([
    [{ documentCode: '' }, 'missingDocumentCode'], [{ documentCode: 'd'.repeat(21) }, 'maxLength'], [{ date: '' }, 'missingDate'], [{ date: 'x' }, 'date'],
    [{ name: '' }, 'missingDescription'], [{ provider: '' }, 'missingProvider'], [{ idCtaCont: '' }, 'missingAccount'],
    [{ valTax: -1 }, 'amount'], [{ valGrav: 1.005 }, 'amount'], [{ valExent: 0, valGrav: 0, valTax: 0 }, 'zeroItem']
  ])('línea %j da %s', (extra, key) => {
    expect(validateLine(line(extra))).toContain(key);
  });

  it('una línea válida no da error y su fecha puede ser anterior al documento', () => {
    expect(validateLine(line())).toBe('');
    expect(validateLine(line({ date: '2025-12-01' }))).toBe('');
  });

  it('el documento exige detalle y reporta la primera línea inválida', () => {
    expect(validateDocument({ header: header(), lines: [line()] }, TODAY).documentError).toBe('');
    expect(validateDocument({ header: header(), lines: [] }, TODAY).documentError).toContain('noDetail');
    expect(validateDocument({ header: header(), lines: [line(), line({ provider: '' })] }, TODAY).documentError).toContain('missingProvider');
  });
});
