import { describe, test, expect } from 'vitest';
import { buildTotalsBody, shouldFetchTotals, toPanelTotals, emptyTotals, totalsWithoutLines, buildPrintRequest } from './bankConciliationTotalsClient';

describe('buildTotalsBody', () => {
  test('envía solo id y las dos marcas de cada línea, más los saldos como número', () => {
    const body = buildTotalsBody({
      lines: [
        { id: 1, documentCode: 'CHE', valueDebit: '500.00', date: '2026-08-10', isConBank: 1, isConBook: 0 },
        { id: 2, isConBank: false, isConBook: true }
      ],
      valueBank: '10000.50',
      valueBook: 9000
    });
    expect(body).toEqual({
      valueBank: 10000.5,
      valueBook: 9000,
      marks: [{ id: 1, isConBank: true, isConBook: false }, { id: 2, isConBank: false, isConBook: true }]
    });
  });

  test('saldos vacíos o inválidos van como 0 y sin líneas no hay marcas', () => {
    expect(buildTotalsBody({ lines: [], valueBank: '', valueBook: 'x' })).toEqual({ valueBank: 0, valueBook: 0, marks: [] });
    expect(buildTotalsBody({})).toEqual({ valueBank: 0, valueBook: 0, marks: [] });
  });
});

describe('shouldFetchTotals', () => {
  test.each([
    [{ id: 5, lines: [{ id: 1 }] }, true],
    [{ id: 0, lines: [{ id: 1 }] }, false],
    [{ id: 5, lines: [] }, false],
    [{ id: 5, lines: undefined }, false],
    [{ id: '7', lines: [{ id: 1 }] }, true]
  ])('%j -> %s', (args, expected) => expect(shouldFetchTotals(args)).toBe(expected));
});

describe('toPanelTotals', () => {
  test('adapta la respuesta del back: la fórmula de pantalla sale de `screen`', () => {
    // Mismos números que el test de calculateScreenTotals del back (agosto 2026).
    const back = {
      checks: { book: 500, bank: 500, diff: 0 },
      deposits: { book: 300, bank: 300, diff: 0 },
      creditNotes: { book: 0, bank: 0, diff: 0 },
      debitNotes: { book: 0, bank: 0, diff: 0 },
      transfers: { book: 0, bank: 0, diff: 0 },
      annulledChecksBook: 60,
      screen: { adjBook: 8800, adjBank: 9800, finalDifference: -1000 },
      print: { totalBank: 9800 }
    };
    expect(toPanelTotals(back)).toEqual({
      checks: { book: 500, bank: 500, diff: 0 },
      deposits: { book: 300, bank: 300, diff: 0 },
      creditNotes: { book: 0, bank: 0, diff: 0 },
      debitNotes: { book: 0, bank: 0, diff: 0 },
      transfers: { book: 0, bank: 0, diff: 0 },
      annulledChecksBook: 60,
      adjBook: 8800,
      adjBank: 9800,
      finalDifference: -1000
    });
  });

  test('una respuesta vacía o incompleta no rompe el panel', () => {
    expect(toPanelTotals(null)).toEqual(emptyTotals());
    expect(toPanelTotals({})).toEqual(emptyTotals());
  });

  test('emptyTotals tiene las cinco categorías en cero y no comparte referencias', () => {
    const a = emptyTotals();
    const b = emptyTotals();
    a.checks.book = 5;
    expect(b.checks.book).toBe(0);
    expect(Object.keys(a)).toEqual(['checks', 'deposits', 'creditNotes', 'debitNotes', 'transfers', 'annulledChecksBook', 'adjBook', 'adjBank', 'finalDifference']);
  });
});

describe('totalsWithoutLines', () => {
  test('sin conciliación todo en 0', () => {
    expect(totalsWithoutLines({ id: 0, valueBank: 100, valueBook: 50 })).toEqual(emptyTotals());
  });

  test('con conciliación y sin documentos los saldos ajustados son los del encabezado', () => {
    // libro 9000 - banco 10000 = -1000
    expect(totalsWithoutLines({ id: 5, valueBank: '10000', valueBook: 9000 })).toEqual({
      ...emptyTotals(), adjBook: 9000, adjBank: 10000, finalDifference: -1000
    });
  });

  test('redondea la diferencia a centavos', () => {
    expect(totalsWithoutLines({ id: 5, valueBank: 0.1, valueBook: 0.3 }).finalDifference).toBe(0.2);
  });
});

describe('buildPrintRequest', () => {
  const lines = [{ id: 1, valueDebit: '500.00', isConBank: 1, isConBook: 0 }];

  test('PDF: lleva type, las marcas y los saldos de la pantalla', () => {
    expect(buildPrintRequest({ id: 5, type: 'summary', lines, valueBank: '10000', valueBook: 9000 })).toEqual({
      url: 'banks/process/conciliations/5/report',
      data: { format: 'pdf', type: 'summary', valueBank: 10000, valueBook: 9000, marks: [{ id: 1, isConBank: true, isConBook: false }] },
      fileName: 'Conciliacion Bancaria.pdf'
    });
  });

  test('Excel: sin type (trae las dos hojas) y con extensión xlsx', () => {
    const req = buildPrintRequest({ id: 5, type: 'detailed', format: 'xlsx', lines, valueBank: 1, valueBook: 2 });
    expect(req.data).toEqual({ format: 'xlsx', valueBank: 1, valueBook: 2, marks: [{ id: 1, isConBank: true, isConBook: false }] });
    expect(req.data.type).toBeUndefined();
    expect(req.fileName).toBe('Conciliacion Bancaria.xlsx');
  });

  test('sin documentos cargados no manda marcas ni saldos: el back imprime lo guardado', () => {
    const req = buildPrintRequest({ id: 5, type: 'detailed', lines: [], valueBank: 99, valueBook: 99 });
    expect(req.data).toEqual({ format: 'pdf', type: 'detailed' });
  });

  test('no manda montos ni fechas de las líneas', () => {
    const body = buildPrintRequest({ id: 5, type: 'summary', lines }).data;
    expect(JSON.stringify(body)).not.toContain('500');
  });
});
