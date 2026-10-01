import { describe, test, expect } from 'vitest';
import { calculateTotals, categorize } from './bankConciliationTotals';

// Mismos números que modules/banks/bankConciliation/__tests__/calculateTotals.test.js del back.
const base = { dateIn: '2026-08-01', dateOut: '2026-08-31', valueBank: 10000, valueBook: 9000 };
const docCategoryMap = { CHE: 'checks', DEP: 'deposits', NCR: 'creditNotes', NDB: 'debitNotes', TRB: 'transfers' };
let nextId = 1;
const line = (o = {}) => ({ id: nextId++, documentCode: 'CHE', date: '2026-08-10', valueDebit: 0, valueCredit: 0, annulled: 0, isConBank: false, isConBook: false, ...o });
const run = (lines, o = {}) => calculateTotals({ ...base, lines, docCategoryMap, ...o });

describe('categorize', () => {
  test.each([
    ['Cheques', 'checks'], ['Depósitos', 'deposits'], ['Notas de Credito', 'creditNotes'], ['Notas de Débito', 'debitNotes'],
    ['Tranferencias', 'transfers'], ['Transferencias', 'transfers'], ['Otro', null], [null, null]
  ])('%s -> %s', (label, expected) => expect(categorize(label)).toBe(expected));
});

describe('calculateTotals', () => {
  test('cheques: banco sin filtro de fecha, libro dentro del periodo', () => {
    nextId = 1;
    const t = run([
      line({ valueDebit: 100, isConBank: true, isConBook: true }),
      line({ valueDebit: 40, date: '2026-07-20', isConBank: true, isConBook: true }),
      line({ valueDebit: 7, isConBank: true, annulled: 1 })
    ]);
    expect(t.checks).toEqual({ bank: 140, book: 100, diff: -40 });
  });

  test('annulledChecksBook suma haber con isConBook sin filtro de fecha', () => {
    nextId = 1;
    const t = run([line({ valueCredit: 60, isConBook: true }), line({ valueCredit: 15, date: '2026-07-01', isConBook: true }), line({ valueCredit: 99 })]);
    expect(t.annulledChecksBook).toBe(75);
  });

  test('fórmula de pantalla con todas las categorías', () => {
    nextId = 1;
    const t = run([
      line({ valueDebit: 100, isConBank: true, isConBook: true }),
      line({ valueDebit: 300 }),
      line({ valueCredit: 60, isConBook: true }),
      line({ documentCode: 'DEP', valueCredit: 500, isConBank: true, isConBook: true }),
      line({ documentCode: 'DEP', valueCredit: 80, isConBank: true }),
      line({ documentCode: 'NCR', valueCredit: 30, isConBank: true, isConBook: true }),
      line({ documentCode: 'NDB', valueDebit: 20, isConBank: true, isConBook: true }),
      line({ documentCode: 'TRB', valueDebit: 100, isConBank: true, isConBook: true })
    ]);
    expect(t.adjBook).toBe(9310);
    expect(t.adjBank).toBe(10390);
    expect(t.finalDifference).toBe(-1080);
    expect(t.deposits).toEqual({ bank: 580, book: 500, diff: 80 });
  });

  test('sin periodo devuelve todo en cero', () => {
    expect(calculateTotals({ lines: [line()], docCategoryMap }).adjBook).toBe(0);
  });

  test('un código fuera del mapa no suma', () => {
    nextId = 1;
    const t = run([line({ documentCode: 'ZZZ', valueDebit: 10, isConBank: true, isConBook: true })]);
    expect(t.checks.bank).toBe(0);
  });
});
