import { describe, expect, test } from 'vitest';
import {
  isValidDate, money, toCents, validateHeader, lineProblem, totalsOf, saveProblem, isManualEntry, isReadOnly, canDeleteEntry, MAX_LINES
} from './dailyItemRules';

const TODAY = '2026-08-10';
const L1 = { accountNumber: '6010101001', description: 'GASTO', valueDebit: 100, valueCredit: 0 };
const L2 = { accountNumber: '1010102002', description: 'BANCO', valueDebit: 0, valueCredit: 100 };
const HEADER = { documentCode: '101', date: TODAY };

describe('fecha y encabezado', () => {
  test('fechas reales y bisiestos', () => {
    expect(isValidDate('2028-02-29')).toBe(true);
    ['2026-02-30', '2026-13-01', 'abc', '', null].forEach((d) => expect(isValidDate(d)).toBe(false));
  });
  test('tipo de documento y fecha', () => {
    expect(validateHeader({ documentCode: '', date: TODAY }, TODAY).documentCode).toBeTruthy();
    expect(validateHeader({ documentCode: '101', date: '2026-08-11' }, TODAY).date).toBe('page.dailyItems.error.date.future');
    expect(validateHeader({ documentCode: '101', date: '2026-02-30' }, TODAY).date).toBe('page.dailyItems.error.date.invalid');
    expect(validateHeader(HEADER, TODAY)).toEqual({});
  });
  test('acepta fecha con hora (los primeros 10 caracteres)', () => {
    expect(validateHeader({ documentCode: '101', date: '2026-08-10T06:00:00.000Z' }, TODAY)).toEqual({});
  });
});

describe('montos y líneas', () => {
  test('money: vacío es 0 y se rechazan negativos, texto y 3 decimales', () => {
    expect(money('')).toBe(0);
    expect(money('1.25')).toBe(1.25);
    expect(money('25.0000')).toBe(25);
    expect(Number.isNaN(money('12.5050'))).toBe(true);
    ['-1', 'abc', '1.005'].forEach((v) => expect(Number.isNaN(money(v))).toBe(true));
  });
  test('toCents sin arrastre', () => {
    expect(toCents(0.1) + toCents(0.2)).toBe(toCents(0.3));
    expect(toCents(1.005)).toBe(101);
  });
  test.each([
    ['sin cuenta', { accountNumber: '' }, 'page.dailyItems.msg.missingData'],
    ['sin descripción', { description: ' ' }, 'page.dailyItems.msg.missingData'],
    ['en cero', { valueDebit: 0, valueCredit: 0 }, 'page.dailyItems.msg.zeroItem'],
    ['debe y haber', { valueDebit: 1, valueCredit: 1 }, 'page.dailyItems.error.bothSides'],
    ['negativa', { valueDebit: -5 }, 'page.dailyItems.error.value.invalid'],
    ['3 decimales', { valueDebit: '1.005' }, 'page.dailyItems.error.value.invalid']
  ])('línea %s', (_n, patch, id) => expect(lineProblem({ ...L1, ...patch })).toBe(id));
  test('línea válida', () => expect(lineProblem(L1)).toBe(''));
});

describe('totales y guardado', () => {
  test('0.1 + 0.2 contra 0.3 cuadra', () => {
    expect(totalsOf([{ valueDebit: 0.1 }, { valueDebit: 0.2 }, { valueCredit: 0.3 }]).diff).toBe(0);
  });
  test('un centavo de diferencia no cuadra', () => {
    expect(totalsOf([L1, { ...L2, valueCredit: 99.99 }]).diff).toBe(0.01);
  });
  test('saveProblem en orden: encabezado, detalle, tope, líneas y cuadre', () => {
    expect(saveProblem({ header: { ...HEADER, documentCode: '' }, lines: [L1, L2] }, TODAY)).toBe('page.dailyItems.error.documentCode.required');
    expect(saveProblem({ header: HEADER, lines: [] }, TODAY)).toBe('page.dailyItems.msg.noDetail');
    expect(saveProblem({ header: HEADER, lines: Array.from({ length: MAX_LINES + 1 }, () => L1) }, TODAY)).toBe('page.dailyItems.error.lines.tooMany');
    expect(saveProblem({ header: HEADER, lines: [{ ...L1, valueDebit: 0 }, L2] }, TODAY)).toBe('page.dailyItems.msg.zeroItem');
    expect(saveProblem({ header: HEADER, lines: [L1, { ...L2, valueCredit: 50 }] }, TODAY)).toBe('page.dailyItems.msg.unbalanced');
    expect(saveProblem({ header: HEADER, lines: [L1, L2] }, TODAY)).toBe('');
  });
});

describe('qué se puede hacer con la partida', () => {
  test('manual por defecto y solo falso explícito es de otro módulo', () => {
    expect(isManualEntry({})).toBe(true);
    expect(isManualEntry({ isManual: true })).toBe(true);
    expect(isManualEntry({ isManual: false })).toBe(false);
  });
  test('solo lectura: partida de otro módulo guardada y sin el privilegio', () => {
    expect(isReadOnly({ id: 5, header: { isManual: false } }, { canEditOther: false })).toBe(true);
    expect(isReadOnly({ id: 5, header: { isManual: false } }, { canEditOther: true })).toBe(false);
    expect(isReadOnly({ id: 5, header: { isManual: true } }, {})).toBe(false);
    expect(isReadOnly({ id: 0, header: {} }, {})).toBe(false);
  });
  test('eliminar: guardada, manual y con el privilegio de anular', () => {
    expect(canDeleteEntry({ id: 5, header: { isManual: true } }, { canDelete: true })).toBe(true);
    expect(canDeleteEntry({ id: 5, header: { isManual: false } }, { canDelete: true })).toBe(false);
    expect(canDeleteEntry({ id: 5, header: { isManual: true } }, { canDelete: false })).toBe(false);
    expect(canDeleteEntry({ id: 0, header: {} }, { canDelete: true })).toBe(false);
  });
});
