import { describe, it, expect } from 'vitest';
import { isValidAmount, toCents, validateHeader, validateLine, validateDocument } from './recurringRules';

const line = (extra = {}) => ({ idCtaAccount: '1010101', name: 'Sinopsis', valDebe: 100, valHaber: 0, referenceCode: '', ...extra });
const header = (extra = {}) => ({ name: 'Alquiler', descrip: 'Mensual', dayRun: '5', ...extra });

describe('recurringRules (mismos casos que RecurringItemDTO del back)', () => {
  it('toCents sin ruido de coma flotante', () => {
    expect(toCents('0.1') + toCents('0.2')).toBe(30);
    expect(toCents('')).toBe(0);
    expect(toCents('10.5')).toBe(1050);
  });

  it.each([['0', true], ['10.5', true], ['10.50', true], ['-1', false], ['1.234', false], ['abc', false], ['', false], ['9999999999.99', true], ['10000000000', false]])('isValidAmount(%s) = %s', (v, ok) => {
    expect(isValidAmount(v)).toBe(ok);
  });

  it('encabezado válido no da errores; día 1 y 31 son válidos', () => {
    expect(validateHeader(header())).toEqual({});
    expect(validateHeader(header({ dayRun: '1' }))).toEqual({});
    expect(validateHeader(header({ dayRun: '31' }))).toEqual({});
  });

  it.each([
    [{ name: '' }, 'name'], [{ name: 'x'.repeat(81) }, 'name'], [{ descrip: ' ' }, 'descrip'],
    [{ dayRun: '0' }, 'dayRun'], [{ dayRun: '32' }, 'dayRun'], [{ dayRun: '5.5' }, 'dayRun'], [{ dayRun: '' }, 'dayRun'], [{ dayRun: 'x' }, 'dayRun']
  ])('encabezado %j marca %s', (extra, field) => {
    expect(Object.keys(validateHeader(header(extra)))).toContain(field);
  });

  it.each([
    [{ idCtaAccount: '' }, 'missingAccount'], [{ name: '' }, 'missingSynopsis'], [{ referenceCode: 'r'.repeat(51) }, 'maxReference'],
    [{ valDebe: -1 }, 'amount'], [{ valHaber: 1.234 }, 'amount'], [{ valDebe: 0, valHaber: 0 }, 'zeroItem'], [{ valDebe: '', valHaber: '' }, 'zeroItem']
  ])('línea %j da %s', (extra, key) => {
    expect(validateLine(line(extra))).toContain(key);
  });

  it('una línea válida no da error', () => {
    expect(validateLine(line())).toBe('');
    expect(validateLine(line({ valDebe: 0, valHaber: 5 }))).toBe('');
  });

  it('el documento exige detalle y cuadre en centavos', () => {
    const ok = [line({ valDebe: 0.1 }), line({ valDebe: 0.2 }), line({ valDebe: 0, valHaber: 0.3 })];
    expect(validateDocument({ header: header(), lines: ok }).documentError).toBe('');
    expect(validateDocument({ header: header(), lines: [] }).documentError).toContain('noDetail');
    expect(validateDocument({ header: header(), lines: [line(), line({ valDebe: 0, valHaber: 99.99 })] }).documentError).toContain('unbalanced');
  });

  it('una línea inválida dentro del documento se reporta antes del cuadre', () => {
    expect(validateDocument({ header: header(), lines: [line({ name: '' })] }).documentError).toContain('missingSynopsis');
  });
});
