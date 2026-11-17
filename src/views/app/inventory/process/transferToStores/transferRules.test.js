import { describe, expect, test } from 'vitest';
import {
  buildTransferPayload, canOpenAddMany, detailsFromApi, lineKey, linesFromSelection, mergeLine, validateTransfer, warningTexts
} from './transferRules';

const TODAY = '2026-11-17';
const FORM = {
  documentCode: 'TRL', date: '2026-11-16', sourceStoreId: 11, assignStoreId: 1, applyTo: 'Inventario', physicalNumber: 0,
  senderName: 'Ana', receiverName: 'Luis', notes: ''
};
const LINES = [{ productCode: 'A', qty: 2, lotCode: '', expirationDate: '' }];
const run = (changes = {}, details = LINES) => validateTransfer({ ...FORM, ...changes }, details, { today: TODAY });

describe('validateTransfer', () => {
  test('un traslado válido no tiene errores', () => expect(run()).toEqual({}));

  test.each([['documentCode', ''], ['date', ''], ['sourceStoreId', 0], ['assignStoreId', 0], ['assignStoreId', '-1']])('%s vacío (%s) es error', (field, value) => {
    expect(run({ [field]: value })[field]).toBeTruthy();
  });

  test('destino igual al origen (también como texto)', () => {
    expect(run({ assignStoreId: 11 }).assignStoreId).toBe('page.transfersToStores.error.sameStores');
    expect(run({ assignStoreId: '11' }).assignStoreId).toBe('page.transfersToStores.error.sameStores');
  });

  test('fecha futura, hoy y la fecha vacía de 1900', () => {
    expect(run({ date: '2026-11-18' }).date).toBe('page.transfersToStores.error.dateFuture');
    expect(run({ date: TODAY })).toEqual({});
    expect(run({ date: '1900-01-01' }).date).toBeTruthy();
  });

  test('máximos en el borde: documento 5, enviado y recibido 50', () => {
    expect(run({ documentCode: 'ABCDE' })).toEqual({});
    expect(run({ documentCode: 'ABCDEF' }).documentCode).toBeTruthy();
    expect(run({ senderName: 'x'.repeat(50) })).toEqual({});
    expect(run({ senderName: 'x'.repeat(51) }).senderName).toBeTruthy();
    expect(run({ receiverName: 'x'.repeat(51) }).receiverName).toBeTruthy();
  });

  test('applyTo y número físico', () => {
    expect(run({ applyTo: 'Gasto' })).toEqual({});
    expect(run({ applyTo: 'Otro' }).applyTo).toBeTruthy();
    expect(run({ physicalNumber: '' })).toEqual({});
    expect(run({ physicalNumber: -1 }).physicalNumber).toBeTruthy();
    expect(run({ physicalNumber: 1.5 }).physicalNumber).toBeTruthy();
  });

  test('detalle: vacío, hasta 200 líneas, cantidad mayor que 0 y líneas repetidas', () => {
    expect(run({}, []).details).toBe('msg.required.documentDetail');
    const many = (n) => Array.from({ length: n }, (_, i) => ({ productCode: `P${i}`, qty: 1 }));
    expect(run({}, many(200))).toEqual({});
    expect(run({}, many(201)).details).toBe('page.transfersToStores.error.tooManyLines');
    expect(run({}, [{ productCode: 'A', qty: 0 }]).details).toBeTruthy();
    expect(run({}, [{ productCode: 'A', qty: 'x' }]).details).toBeTruthy();
    expect(run({}, [{ productCode: '', qty: 1 }]).details).toBeTruthy();
    expect(run({}, [{ productCode: 'A', qty: 1 }, { productCode: 'A', qty: 2 }]).details).toBe('page.transfersToStores.error.duplicateLine');
  });

  test('mismo producto con otro lote o vencimiento no es repetido', () => {
    expect(run({}, [{ productCode: 'A', qty: 1, lotCode: '1' }, { productCode: 'A', qty: 1, lotCode: '2' }])).toEqual({});
    expect(run({}, [{ productCode: 'A', qty: 1, expirationDate: '2027-01-01' }, { productCode: 'A', qty: 1, expirationDate: '2027-02-01' }])).toEqual({});
  });
});

describe('lineKey y mergeLine', () => {
  test('el vencimiento vacío o 1900-01-01 es la misma llave', () => {
    expect(lineKey({ productCode: ' A ', lotCode: '', expirationDate: '' })).toBe(lineKey({ productCode: 'A', expirationDate: '1900-01-01' }));
  });

  test('suma la cantidad si la llave ya está y recalcula el total sin mutar', () => {
    const original = [{ productCode: 'A', qty: 2, cost: 12.5, total: 25, lotCode: '', expirationDate: '' }];
    const result = mergeLine(original, { productCode: 'A', qty: 3, cost: 12.5, total: 37.5, lotCode: '', expirationDate: '' });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ qty: 5, total: 62.5 });
    expect(original[0].qty).toBe(2);
  });

  test('agrega una línea nueva si la llave es otra', () => {
    const result = mergeLine([{ productCode: 'A', qty: 1, lotCode: 'x' }], { productCode: 'A', qty: 1, lotCode: 'y' });
    expect(result).toHaveLength(2);
  });

  test('0.1 + 0.2 no deja ruido de coma flotante', () => {
    const result = mergeLine([{ productCode: 'A', qty: 0.1, cost: 10 }], { productCode: 'A', qty: 0.2, cost: 10 });
    expect(result[0].qty).toBe(0.3);
    expect(result[0].total).toBe(3);
  });
});

describe('buildTransferPayload', () => {
  test('solo manda lo que el back acepta, sin costo, total, cuentas ni estado', () => {
    const payload = buildTransferPayload(
      { ...FORM, id: 5, documentId: 9, pdaNumber: 3, status: false, originCtaCode: 'x', notes: ' n ', physicalNumber: '' },
      [{ productCode: ' A ', qty: '2', cost: 99, total: 1, originCtaCode: 'x', nameProduct: 'N', lotCode: ' L ', expirationDate: '1900-01-01' }]
    );
    expect(payload).toEqual({
      documentCode: 'TRL', date: '2026-11-16', sourceStoreId: 11, assignStoreId: 1, applyTo: 'Inventario', physicalNumber: 0,
      notes: 'n', senderName: 'Ana', receiverName: 'Luis',
      details: [{ productCode: 'A', qty: 2, lotCode: 'L', expirationDate: '' }]
    });
  });
});

describe('detailsFromApi', () => {
  test('toma el nombre del producto, números y el vencimiento vacío', () => {
    expect(detailsFromApi([{ id: 1, productCode: 'A', qty: '2.00000', cost: '12.50000', total: '25.00000', expirationDate: '1900-01-01', invProduct: { name: 'JABON' } }]))
      .toEqual([expect.objectContaining({ nameProduct: 'JABON', qty: 2, cost: 12.5, total: 25, expirationDate: '' })]);
    expect(detailsFromApi(undefined)).toEqual([]);
  });
});

describe('warningTexts', () => {
  test('toma el mensaje de cada aviso y descarta lo inválido', () => {
    expect(warningTexts([{ code: 'a', message: 'uno' }, { code: 'b' }, null])).toEqual(['uno']);
    expect(warningTexts(undefined)).toEqual([]);
  });
});

describe('Agregar varios', () => {
  test('solo se abre con origen y destino y el documento sin aplicar', () => {
    expect(canOpenAddMany({ sourceStoreId: 11, assignStoreId: 1, disabled: false })).toBe(true);
    expect(canOpenAddMany({ sourceStoreId: 0, assignStoreId: 1 })).toBe(false);
    expect(canOpenAddMany({ sourceStoreId: 11, assignStoreId: 0 })).toBe(false);
    expect(canOpenAddMany({ sourceStoreId: 11, assignStoreId: 1, disabled: true })).toBe(false);
  });

  test('linesFromSelection ignora cantidades 0 y calcula el total a 5 decimales', () => {
    const lines = linesFromSelection({
      A: { product: { productCode: 'A', name: 'ALFA', cost: 2.5 }, qty: 3 },
      B: { product: { productCode: 'B', name: 'BETA', cost: 1 }, qty: 0 },
      C: { product: { productCode: 'C', name: 'GAMMA', cost: 3.33333 }, qty: 1.5 }
    });
    expect(lines.map((l) => l.productCode)).toEqual(['A', 'C']);
    expect(lines[0]).toMatchObject({ nameProduct: 'ALFA', qty: 3, cost: 2.5, total: 7.5, lotCode: '', expirationDate: '' });
    expect(lines[1].total).toBe(5);
  });
});
