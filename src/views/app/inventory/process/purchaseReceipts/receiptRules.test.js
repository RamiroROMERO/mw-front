import { describe, it, expect } from 'vitest';
import {
  MAX_LINES, CODES, roundTo, round5, parseQty, parseDate, rowsFromPreview, isChanged, rowStatus, validateRows, buildPayload
} from './receiptRules';

// Los casos y los números son los de purchaseReceiptRules.test.js del back (modules/inventory/purchases/__tests__).
const row = (kardexId, over = {}) => ({
  kardexId, productCode: 'A', productName: 'Producto A', isBonus: false, lotCode: '', purchasedQty: 10, receivedQty: 10, expirationDate: null,
  received: 10, expiration: '', ...over
});
const codes = (result) => result.problems.map((p) => p.code);

describe('roundTo / round5', () => {
  it('redondea las mitades hacia arriba sin ruido de coma flotante', () => {
    expect(round5(117.283865)).toBe(117.28387);
    expect(round5(9.5 * 12.34567)).toBe(117.28387);
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(round5(0.1 + 0.2)).toBe(0.3);
  });

  it('no es numérico: 0', () => {
    expect(round5('abc')).toBe(0);
    expect(round5(Infinity)).toBe(0);
  });
});

describe('parseQty', () => {
  it('acepta 0, hasta 5 decimales y strings numéricos; no tiene tope superior', () => {
    expect(parseQty(0)).toBe(0);
    expect(parseQty(12.34567)).toBe(12.34567);
    expect(parseQty('0.00001')).toBe(0.00001);
    expect(parseQty(999999.99999)).toBe(999999.99999);
  });

  it.each([[-1], [-0.00001], [12.345678], [0.000001], [1e-7], ['abc'], [''], [' '], [null], [undefined], [NaN], [Infinity], [true], [{}]])(
    'cantidad %j se rechaza', (value) => {
      expect(parseQty(value)).toBeNull();
    }
  );
});

describe('parseDate', () => {
  it.each([[undefined], [null], [''], ['  ']])('%j vale vacío (null)', (value) => {
    expect(parseDate(value)).toBeNull();
  });

  it('acepta fechas de calendario, incluido el 29 de febrero bisiesto', () => {
    expect(parseDate('2027-03-01')).toBe('2027-03-01');
    expect(parseDate('2028-02-29')).toBe('2028-02-29');
  });

  it.each([['2027-02-29'], ['2027-13-01'], ['2027-1-1'], ['01/03/2027'], ['2027-03-01T00:00'], ['abc'], [20270301], [new Date()]])(
    'vencimiento %j es inválido (undefined)', (value) => {
      expect(parseDate(value)).toBeUndefined();
    }
  );
});

describe('rowsFromPreview', () => {
  it('precarga lo recibido con el valor actual del kardex y el vencimiento vacío como cadena vacía', () => {
    const rows = rowsFromPreview({ rows: [{ kardexId: 1, receivedQty: 9.5, expirationDate: '2027-03-01' }, { kardexId: 2, receivedQty: 0, expirationDate: null }] });
    expect(rows).toEqual([
      { kardexId: 1, receivedQty: 9.5, expirationDate: '2027-03-01', received: 9.5, expiration: '2027-03-01' },
      { kardexId: 2, receivedQty: 0, expirationDate: null, received: 0, expiration: '' }
    ]);
  });

  it('sin vista previa devuelve una lista vacía', () => {
    expect(rowsFromPreview(null)).toEqual([]);
    expect(rowsFromPreview({})).toEqual([]);
  });
});

describe('isChanged', () => {
  it('sin cambios: false', () => {
    expect(isChanged(row(1))).toBe(false);
    expect(isChanged(row(1, { receivedQty: 9.5, received: '9.5' }))).toBe(false);
    expect(isChanged(row(1, { expirationDate: '2027-03-01', expiration: '2027-03-01' }))).toBe(false);
  });

  it('cantidad distinta o vencimiento distinto: true', () => {
    expect(isChanged(row(1, { received: 9.5 }))).toBe(true);
    expect(isChanged(row(1, { received: 0 }))).toBe(true);
    expect(isChanged(row(1, { expiration: '2027-03-01' }))).toBe(true);
    expect(isChanged(row(1, { expirationDate: '2027-03-01', expiration: '' }))).toBe(true);
  });

  it('una cantidad o una fecha que no se pueden leer cuentan como cambio (para que la validación las marque)', () => {
    expect(isChanged(row(1, { received: 'abc' }))).toBe(true);
    expect(isChanged(row(1, { received: '' }))).toBe(true);
    expect(isChanged(row(1, { expiration: '2027-02-30' }))).toBe(true);
  });
});

describe('rowStatus', () => {
  it('rojo (zero) si la recibida es 0, amarillo (differs) si difiere de lo comprado, ok si coincide', () => {
    expect(rowStatus(row(1, { received: 0 }))).toBe('zero');
    expect(rowStatus(row(1, { received: 9.5 }))).toBe('differs');
    expect(rowStatus(row(1, { received: 12 }))).toBe('differs');
    expect(rowStatus(row(1, { received: 10 }))).toBe('ok');
    expect(rowStatus(row(1, { received: '10.00000' }))).toBe('ok');
  });

  it('cantidad ilegible: invalid; sin cantidad comprada nunca es amarillo', () => {
    expect(rowStatus(row(1, { received: 'abc' }))).toBe('invalid');
    expect(rowStatus(row(1, { purchasedQty: null, received: 3 }))).toBe('ok');
  });
});

describe('validateRows', () => {
  it('envía solo las filas que cambiaron, normalizadas', () => {
    const result = validateRows([row(1), row(2, { received: '9.5', expiration: '2027-03-01' }), row(3)]);
    expect(result.problems).toEqual([]);
    expect(result.lines).toEqual([{ kardexId: 2, receivedQty: 9.5, expirationDate: '2027-03-01' }]);
  });

  it('el ejemplo: 9.5 sin vencimiento deja expirationDate null', () => {
    expect(validateRows([row(7, { received: 9.5 })]).lines).toEqual([{ kardexId: 7, receivedQty: 9.5, expirationDate: null }]);
  });

  it('cantidad 0 explícita es válida', () => {
    expect(validateRows([row(1, { received: 0 })]).lines).toEqual([{ kardexId: 1, receivedQty: 0, expirationDate: null }]);
  });

  it('sin ningún cambio: lines.required y nada que enviar', () => {
    const result = validateRows([row(1), row(2)]);
    expect(codes(result)).toEqual([CODES.LINES]);
    expect(result.lines).toEqual([]);
  });

  it('lista vacía o ausente: lines.required', () => {
    expect(codes(validateRows([]))).toEqual([CODES.LINES]);
    expect(codes(validateRows(undefined))).toEqual([CODES.LINES]);
  });

  it('hasta 200 filas con cambios pasan y 201 se rechazan', () => {
    const build = (n) => Array.from({ length: n }, (_, i) => row(i + 1, { received: 9 }));
    expect(validateRows(build(MAX_LINES)).lines).toHaveLength(200);
    expect(codes(validateRows(build(MAX_LINES + 1)))).toEqual([CODES.LINES]);
  });

  it.each([[-1], [12.345678], ['abc'], ['']])('cantidad %j: purchase.receipt.qty.invalid, con la fila y el campo', (received) => {
    const result = validateRows([row(5, { received })]);
    expect(result.problems).toEqual([{ code: CODES.QTY, kardexId: 5, field: 'received' }]);
    expect(result.lines).toEqual([]);
  });

  it('vencimiento inválido: purchase.receipt.date.invalid, con la fila y el campo', () => {
    const result = validateRows([row(5, { expiration: '2027-02-30' })]);
    expect(result.problems).toEqual([{ code: CODES.DATE, kardexId: 5, field: 'expiration' }]);
  });

  it('la cantidad se evalúa antes que el vencimiento en una misma fila', () => {
    expect(codes(validateRows([row(5, { received: -1, expiration: 'x' })]))).toEqual([CODES.QTY]);
  });

  it('informa los problemas de todas las filas y no deja ninguna línea si alguna falla', () => {
    const result = validateRows([row(1, { received: 'abc' }), row(2, { received: 9 }), row(3, { expiration: '2027-13-01' })]);
    expect(result.problems.map((p) => p.kardexId)).toEqual([1, 3]);
    expect(result.lines).toEqual([]);
  });
});

describe('buildPayload', () => {
  it('arma el cuerpo del PUT con el vencimiento vacío como cadena vacía', () => {
    expect(buildPayload([{ kardexId: 123, receivedQty: 9.5, expirationDate: '2027-03-01' }, { kardexId: 7, receivedQty: 2, expirationDate: null }])).toEqual({
      lines: [{ kardexId: 123, receivedQty: 9.5, expirationDate: '2027-03-01' }, { kardexId: 7, receivedQty: 2, expirationDate: '' }]
    });
  });
});
