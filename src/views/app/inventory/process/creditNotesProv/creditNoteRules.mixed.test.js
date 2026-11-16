import { describe, it, expect } from 'vitest';
import {
  isMixedNote, canBeMixed, calculateMixedLine, emptyMixedDraft, validateMixedDraft, mixedLineFromDraft, setMixedField, sumMixed, validateMixedLines,
  validateNote, buildPayload, normalizeNote
} from './creditNoteRules';

// Los casos son los de modules/inventory/creditNotes/__tests__/creditNoteRules.mixed.test.js del back (SPEC v2-47-sr).
const DRAFT = { ...emptyMixedDraft(1), productCode: 'A', description: 'ATOMIZADOR', taxPercent: 15, quantity: 2, cost: 10.5 };
const NOTE = { documentCode: 'NCP', providerId: 5, cai: 'C', numberCAI: 'N', typeId: 3, isMixed: true, originInvoiceNumber: '' };

describe('nota mixta: tipo y casilla', () => {
  it('solo es mixta con el tipo 3', () => {
    expect(isMixedNote({ typeId: 3, isMixed: true })).toBe(true);
    expect(isMixedNote({ typeId: 3, isMixed: false })).toBe(false);
    expect(isMixedNote({ typeId: 1, isMixed: true })).toBe(false);
    expect(isMixedNote(undefined)).toBe(false);
  });
  it('la casilla solo aplica a la devolución', () => {
    expect([1, 2, 3, 4].map(canBeMixed)).toEqual([false, false, true, false]);
  });
});

describe('calculateMixedLine', () => {
  it('2 x 10.50 al 15 %: subtotal 21, impuesto 3.15, total 24.15', () => {
    expect(calculateMixedLine({ quantity: 2, cost: 10.5, taxPercent: 15 })).toEqual({ subtotal: 21, taxValue: 3.15, total: 24.15 });
  });
  it('sin impuesto y con costo 0', () => {
    expect(calculateMixedLine({ quantity: 3, cost: 2, taxPercent: 0 })).toEqual({ subtotal: 6, taxValue: 0, total: 6 });
    expect(calculateMixedLine({ quantity: 3, cost: 0, taxPercent: 15 }).total).toBe(0);
  });
  it('mitades hacia arriba: 1 x 0.05 al 15 % = 0.0075 -> 0.01', () => {
    expect(calculateMixedLine({ quantity: 1, cost: 0.05, taxPercent: 15 }).taxValue).toBe(0.01);
  });
  it('valores vacíos o no numéricos cuentan como 0', () => {
    expect(calculateMixedLine({ quantity: '', cost: 'x', taxPercent: undefined })).toEqual({ subtotal: 0, taxValue: 0, total: 0 });
  });
});

describe('validateMixedDraft', () => {
  it('una línea completa es válida', () => expect(validateMixedDraft(DRAFT)).toBe(''));
  it.each([
    [{ storeId: 0 }, 'page.creditNotesProv.error.mixed.store'], [{ productCode: '' }, 'page.creditNotesProv.error.mixed.product'],
    [{ quantity: 0 }, 'page.creditNotesProv.error.mixed.qty'], [{ quantity: 1.234 }, 'page.creditNotesProv.error.mixed.qty'], [{ quantity: 'abc' }, 'page.creditNotesProv.error.mixed.qty'],
    [{ cost: '' }, 'page.creditNotesProv.error.mixed.cost'], [{ cost: -1 }, 'page.creditNotesProv.error.mixed.cost'], [{ cost: 1.234 }, 'page.creditNotesProv.error.mixed.cost'], [{ cost: 1000000 }, 'page.creditNotesProv.error.mixed.cost']
  ])('%j -> %s', (over, id) => expect(validateMixedDraft({ ...DRAFT, ...over })).toBe(id));
  it('costo 0 es válido', () => expect(validateMixedDraft({ ...DRAFT, cost: 0 })).toBe(''));
  it('un producto que exige lote o vencimiento sin ninguno se marca; con uno de los dos pasa', () => {
    const lot = { ...DRAFT, requireExpLot: true };
    expect(validateMixedDraft(lot)).toBe('page.creditNotesProv.error.mixed.lot');
    expect(validateMixedDraft({ ...lot, lotCode: 'L1' })).toBe('');
    expect(validateMixedDraft({ ...lot, dateExp: '2027-01-01' })).toBe('');
  });
  it('una línea repetida (almacén + producto + lote) se marca; con otro almacén o lote es válida', () => {
    const existing = [mixedLineFromDraft(DRAFT)];
    expect(validateMixedDraft(DRAFT, existing)).toBe('page.creditNotesProv.error.mixed.duplicated');
    expect(validateMixedDraft({ ...DRAFT, storeId: 2 }, existing)).toBe('');
    expect(validateMixedDraft({ ...DRAFT, lotCode: 'L2' }, existing)).toBe('');
  });
});

describe('líneas de la tabla', () => {
  it('mixedLineFromDraft arma la línea con sus importes y la llave almacén + producto + lote', () => {
    expect(mixedLineFromDraft({ ...DRAFT, lotCode: ' L1 ' })).toMatchObject({ id: '1|A|L1', storeId: 1, productCode: 'A', quantity: 2, cost: 10.5, lotCode: 'L1', subtotal: 21, taxValue: 3.15, total: 24.15 });
  });
  it('setMixedField recalcula con el nuevo valor', () => {
    const line = mixedLineFromDraft(DRAFT);
    expect(setMixedField(line, 'quantity', 4)).toMatchObject({ quantity: 4, subtotal: 42, taxValue: 6.3, total: 48.3 });
    expect(setMixedField(line, 'cost', 0)).toMatchObject({ subtotal: 0, total: 0 });
  });
  it('sumMixed suma sin ruido de coma flotante (0.1 + 0.2 = 0.3)', () => {
    expect(sumMixed([{ quantity: 1, total: 0.1 }, { quantity: 1, total: 0.2 }])).toBe(0.3);
    expect(sumMixed([{ quantity: 0, total: 99 }, { quantity: 1, total: 5 }])).toBe(5);
    expect(sumMixed(undefined)).toBe(0);
  });
  it('validateMixedLines: sin líneas se marca y con líneas repetidas también', () => {
    expect(validateMixedLines([])).toBe('page.creditNotesProv.error.mixed.empty');
    expect(validateMixedLines([mixedLineFromDraft(DRAFT)])).toBe('');
    expect(validateMixedLines([mixedLineFromDraft(DRAFT), mixedLineFromDraft(DRAFT)])).toBe('page.creditNotesProv.error.mixed.duplicated');
  });
});

describe('validateNote de una mixta', () => {
  it('no exige la compra origen (es opcional)', () => {
    expect(validateNote(NOTE, { products: [mixedLineFromDraft(DRAFT)] })).toEqual({});
  });
  it('sin líneas marca el detalle', () => {
    expect(validateNote(NOTE, { products: [] })).toEqual({ detail: 'page.creditNotesProv.error.mixed.empty' });
  });
  it('una devolución normal sigue exigiendo la compra origen', () => {
    expect(validateNote({ ...NOTE, isMixed: false }, { products: [] }).detail).toBe('msg.required.select.originInvoice');
  });
});

describe('buildPayload de una mixta', () => {
  it('manda solo lo digitado (almacén, producto, cantidad, costo, lote y vencimiento), sin importes', () => {
    const body = buildPayload(NOTE, { products: [mixedLineFromDraft({ ...DRAFT, lotCode: 'L1', dateExp: '2027-03-31' }), { ...mixedLineFromDraft({ ...DRAFT, productCode: 'B', storeId: 2 }), quantity: 0 }] });
    expect(body.isMixed).toBe(true);
    expect(body.typeId).toBe(3);
    expect(body.products).toEqual([{ storeId: 1, productCode: 'A', quantity: 2, cost: 10.5, lotCode: 'L1', dateExp: '2027-03-31' }]);
    expect(JSON.stringify(body)).not.toMatch(/subtotal|taxValue|total|qtyReturn/);
  });
  it('con compra origen la manda; sin ella va vacía', () => {
    expect(buildPayload({ ...NOTE, originInvoiceNumber: 'F-1' }, { products: [mixedLineFromDraft(DRAFT)] }).originInvoiceNumber).toBe('F-1');
    expect(buildPayload(NOTE, { products: [mixedLineFromDraft(DRAFT)] }).originInvoiceNumber).toBe('');
  });
});

describe('normalizeNote de una mixta', () => {
  it('trae almacén, cantidad, costo, lote, vencimiento y el porcentaje de impuesto derivado', () => {
    const { products } = normalizeNote({ products: [{ id: 1, productCode: 'A', quantity: '2.00', cost: '10.50', subtotal: '21.00', taxValue: '3.15', total: '24.15', storeId: 1, lotCode: 'L1', dateExp: '2027-03-31', productData: { name: 'ATOMIZADOR' } }] });
    expect(products[0]).toMatchObject({ storeId: 1, quantity: 2, cost: 10.5, lotCode: 'L1', dateExp: '2027-03-31', taxPercent: 15, total: 24.15, description: 'ATOMIZADOR' });
  });
  it('el vencimiento 1900-01-01 sale vacío', () => {
    expect(normalizeNote({ products: [{ productCode: 'A', quantity: 1, dateExp: '1900-01-01', subtotal: 0, taxValue: 0 }] }).products[0].dateExp).toBe('');
  });
});
