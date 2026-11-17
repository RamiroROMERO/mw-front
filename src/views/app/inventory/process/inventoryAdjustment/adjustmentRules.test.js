import { describe, expect, test } from 'vitest';
import {
  ADJUSTMENT_DOCUMENT, APPLY_TO, DEFAULT_APPLY_TO, adjustmentState, buildAdjustmentPayload, isNotToday, isValidCount, lineFromProduct, lineKey,
  needsLot, restLines, summarizeAdjustments, upsertLine, validateAdjustment
} from './adjustmentRules';

const TODAY = '2026-11-17';
const form = (over = {}) => ({ documentCode: 'AJU', date: '2026-11-10', sourceStoreId: 11, applyTo: 'Inventario', notes: '', ...over });
const line = (productCode, qty, extra = {}) => ({ productCode, qty, lotCode: '', expirationDate: '', ...extra });
const errors = (f, details = [line('A', 7)]) => validateAdjustment(f, details, { today: TODAY });

test('constantes: documento AJU y "Aplicar a" inicial Inventario (440 de 443 reales)', () => {
  expect(ADJUSTMENT_DOCUMENT).toBe('AJU');
  expect(DEFAULT_APPLY_TO).toBe('Inventario');
  expect(APPLY_TO).toEqual(['Inventario', 'Costo', 'Gasto']);
});

describe('validateAdjustment (mismos casos que AdjustmentDTO del back)', () => {
  test('un formulario válido no tiene errores', () => {
    expect(errors(form())).toEqual({});
  });

  test.each([['documentCode', ''], ['sourceStoreId', 0], ['date', '']])('%s vacío se marca', (field, value) => {
    expect(Object.keys(errors(form({ [field]: value })))).toContain(field);
  });

  test.each([[''], [undefined], [null], ['Otro'], ['costo']])('"Aplicar a" obligatorio y de la lista (%p)', (value) => {
    expect(errors(form({ applyTo: value })).applyTo).toBe('page.transfersToStores.error.applyTo');
  });

  test.each(APPLY_TO.map((v) => [v]))('"Aplicar a" %s es válido', (value) => {
    expect(errors(form({ applyTo: value })).applyTo).toBeUndefined();
  });

  test('un solo almacén: el destino no existe en las reglas', () => {
    expect(errors(form({ assignStoreId: 0 }))).toEqual({});
  });

  test('fecha futura se rechaza; hoy pasa', () => {
    expect(errors(form({ date: '2026-11-18' })).date).toBe('page.transfersToStores.error.dateFuture');
    expect(errors(form({ date: TODAY })).date).toBeUndefined();
  });

  test('detalle obligatorio y máximo 200', () => {
    expect(validateAdjustment(form(), [], { today: TODAY }).details).toBe('msg.required.documentDetail');
    expect(validateAdjustment(form(), Array.from({ length: 201 }, (_, i) => line(`P${i}`, 1)), { today: TODAY }).details).toBe('page.transfersToStores.error.tooManyLines');
  });

  test.each([[0], ['0'], [1], [0.5]])('la cantidad contada %p es válida (0 significa "conté cero")', (qty) => {
    expect(errors(form(), [line('A', qty)]).details).toBeUndefined();
  });

  test.each([[-1], ['x'], [''], [null], [undefined]])('la cantidad contada %p se rechaza', (qty) => {
    expect(errors(form(), [line('A', qty)]).details).toBe('page.inventoryAdjustment.error.qtyInvalid');
  });

  test('un producto repetido se rechaza; con requireExpLot el lote lo distingue', () => {
    expect(errors(form(), [line('A', 1, { lotCode: 'L1' }), line('A', 2, { lotCode: 'L2' })]).details).toBe('page.inventoryAdjustment.error.duplicateLine');
    expect(errors(form(), [line('A', 1, { lotCode: 'L1', requireExpLot: true }), line('A', 2, { lotCode: 'L2', requireExpLot: true })]).details).toBeUndefined();
    expect(errors(form(), [line('A', 1, { lotCode: 'L1', requireExpLot: true }), line('A', 2, { lotCode: 'L1', requireExpLot: true })]).details)
      .toBe('page.inventoryAdjustment.error.duplicateLine');
  });

  test('un producto que exige lote sin lote ni vencimiento se rechaza; con cualquiera pasa', () => {
    expect(errors(form(), [line('A', 1, { requireExpLot: true })]).details).toBe('page.inventoryAdjustment.error.lotRequired');
    expect(errors(form(), [line('A', 1, { requireExpLot: true, expirationDate: '2027-01-31' })]).details).toBeUndefined();
    expect(errors(form(), [line('A', 1, { requireExpLot: false })]).details).toBeUndefined();
  });
});

describe('llave de línea y lote', () => {
  test('sin requireExpLot es el producto; con él, producto + lote + vencimiento', () => {
    expect(lineKey(line('A', 1, { lotCode: 'L' }))).toBe('A');
    expect(lineKey(line('A', 1, { lotCode: 'L', expirationDate: '2027-01-31', requireExpLot: true }))).toBe('A|L|2027-01-31');
    expect(lineKey(line('A', 1, { lotCode: 'L', expirationDate: '1900-01-01', requireExpLot: true }))).toBe('A|L|');
  });

  test('needsLot solo aplica a los productos que lo exigen', () => {
    expect(needsLot(line('A', 1))).toBe(false);
    expect(needsLot(line('A', 1, { requireExpLot: true }))).toBe(true);
    expect(needsLot(line('A', 1, { requireExpLot: true, lotCode: 'L' }))).toBe(false);
  });
});

describe('aviso de fecha', () => {
  test('una fecha distinta de hoy avisa; hoy y vacía no', () => {
    expect(isNotToday('2026-11-10', TODAY)).toBe(true);
    expect(isNotToday(TODAY, TODAY)).toBe(false);
    expect(isNotToday('', TODAY)).toBe(false);
  });
});

describe('buildAdjustmentPayload', () => {
  test('manda solo lo que el back acepta: sin destino, enviado, recibido, número físico, costos ni cuentas', () => {
    const payload = buildAdjustmentPayload(
      { ...form(), id: 9, documentId: 4, pdaNumber: 3, isApplied: true, status: 0, assignStoreId: 7, senderName: 'A', physicalNumber: 9, originCtaCode: 'x' },
      [{ productCode: ' A ', qty: '0', lotCode: ' L ', expirationDate: '1900-01-01', cost: 99, total: 1, requireExpLot: true }]
    );
    expect(payload).toEqual({
      documentCode: 'AJU', date: '2026-11-10', sourceStoreId: 11, applyTo: 'Inventario', notes: '',
      details: [{ productCode: 'A', qty: 0, lotCode: 'L', expirationDate: '' }]
    });
  });
});

describe('agregar varios', () => {
  test('isValidCount: 0 vale; vacío y negativo no', () => {
    expect(isValidCount('0')).toBe(true);
    expect(isValidCount(5)).toBe(true);
    expect(isValidCount('')).toBe(false);
    expect(isValidCount(-1)).toBe(false);
    expect(isValidCount('x')).toBe(false);
  });

  test('lineFromProduct: total a 5 decimales y la marca de lote', () => {
    expect(lineFromProduct({ productCode: 'A', name: 'JABON', cost: 3.33333, requireExpLot: true }, 3))
      .toMatchObject({ productCode: 'A', nameProduct: 'JABON', qty: 3, cost: 3.33333, total: 9.99999, requireExpLot: true });
  });

  test('upsertLine reemplaza el conteo del mismo producto (no suma) y agrega los nuevos', () => {
    const base = [{ productCode: 'A', qty: 5, cost: 10, total: 50 }];
    expect(upsertLine(base, { productCode: 'A', qty: 8, cost: 10 })).toEqual([{ productCode: 'A', qty: 8, cost: 10, total: 80 }]);
    expect(upsertLine(base, { productCode: 'B', qty: 1, cost: 2, total: 2 })).toHaveLength(2);
    expect(base[0].qty).toBe(5);
  });
});

describe('"Agregar Rest."', () => {
  const products = [
    { productCode: 'A', name: 'A', cost: 10, requireExpLot: false },
    { productCode: 'B', name: 'B', cost: 0, requireExpLot: false },
    { productCode: 'C', name: 'C', cost: 5, requireExpLot: true },
    { productCode: 'D', name: 'D', cost: 4, requireExpLot: false },
    { productCode: 'E', name: 'E', cost: -1, requireExpLot: false }
  ];

  test('agrega con cantidad 0 los que faltan, omite los de costo 0 y los que exigen lote, y cuenta cada tipo', () => {
    const result = restLines({ products, details: [{ productCode: 'D', qty: 3 }] });
    expect(result.lines.map((l) => [l.productCode, l.qty, l.total])).toEqual([['A', 0, 0]]);
    expect(result.omittedCost).toBe(2);
    expect(result.omittedLot).toBe(1);
  });

  test('no duplica un producto que ya está en el detalle (ni repetido en la lista)', () => {
    const result = restLines({ products: [...products, products[0]], details: [{ productCode: 'A', qty: 1 }] });
    expect(result.lines).toEqual([expect.objectContaining({ productCode: 'D' })]);
    expect(restLines({ products: [products[0], products[0]], details: [] }).lines).toHaveLength(1);
  });

  test('sin productos o con todos presentes no agrega nada', () => {
    expect(restLines({})).toEqual({ lines: [], omittedCost: 0, omittedLot: 0 });
    expect(restLines({ products: [products[0]], details: [{ productCode: 'A' }] }).lines).toEqual([]);
  });
});

describe('resumen de Contabilizar y estado', () => {
  test('summarizeAdjustments cuenta entradas y salidas y suma los valores absolutos', () => {
    expect(summarizeAdjustments([{ difference: -3, value: -30 }, { difference: 2, value: 6.01 }, { difference: -1, value: -0.29 }]))
      .toEqual({ entries: 1, exits: 2, total: 36.3 });
    expect(summarizeAdjustments(undefined)).toEqual({ entries: 0, exits: 0, total: 0 });
  });

  test('estado: guardado sin aplicar se puede contabilizar; aplicado se puede anular y queda bloqueado', () => {
    expect(adjustmentState({ id: 5, isApplied: false, pdaNumber: 0, status: true })).toMatchObject({ canProcess: true, canVoid: false, locked: false });
    expect(adjustmentState({ id: 5, isApplied: true, pdaNumber: 9, status: true })).toMatchObject({ canProcess: false, canVoid: true, locked: true });
    expect(adjustmentState({ id: 5, status: false })).toMatchObject({ voided: true, locked: true });
  });
});
