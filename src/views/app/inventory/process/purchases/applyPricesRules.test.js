import { describe, it, expect } from 'vitest';
import { hasNewPrice, finalPrice, buildApplyPayload, rowMirror, mirrorSummary } from './applyPricesRules';

// Mismos casos que purchaseApplyRules.test.js del back (modules/inventory/purchases/__tests__).
const rows = () => ([
  { distId: 10, productCode: 'A-1', productName: 'PROD A', cost: 12.5, oldPrice1: '20.00', oldPrice2: '25.00', oldPrice3: '30.00', newPrice1: 0, newPrice2: 0, newPrice3: 0, isDefault: true, copiesToProduct: true, productPrice1: '18.50', productPrice2: '22.00', productPrice3: '27.00' },
  { distId: 11, productCode: 'A-1', productName: 'PROD A', cost: 12.5, oldPrice1: 200, oldPrice2: 250, oldPrice3: 300, newPrice1: 0, newPrice2: 0, newPrice3: 0, isDefault: false, copiesToProduct: false, productPrice1: '18.50', productPrice2: '22.00', productPrice3: '27.00' },
  { distId: 20, productCode: 'B-2', productName: 'PROD B', cost: 7, oldPrice1: 9, oldPrice2: 10, oldPrice3: 11, newPrice1: 0, newPrice2: 0, newPrice3: 0, isDefault: false, copiesToProduct: false, productPrice1: '4.00', productPrice2: '5.00', productPrice3: '6.00' }
]);

describe('hasNewPrice y finalPrice', () => {
  it('0, vacío o no numérico significan conservar', () => {
    expect(hasNewPrice({ newPrice1: 0, newPrice2: '', newPrice3: 'abc' })).toBe(false);
    expect(hasNewPrice({})).toBe(false);
    expect(hasNewPrice(null)).toBe(false);
  });

  it('un precio nuevo distinto de 0 cuenta', () => {
    expect(hasNewPrice({ newPrice1: 0, newPrice2: 3 })).toBe(true);
    expect(hasNewPrice({ newPrice3: '31.10' })).toBe(true);
  });

  it('el precio final es el nuevo si se digitó y si no el actual', () => {
    const row = { oldPrice1: '20.00', newPrice1: 22.5, oldPrice2: '25.00', newPrice2: 0 };
    expect(finalPrice(row, 1)).toBe(22.5);
    expect(finalPrice(row, 2)).toBe(25);
    expect(finalPrice(row, 3)).toBe(0);
  });
});

describe('buildApplyPayload', () => {
  it('envía solo distId y los tres precios nuevos, nunca el costo ni el producto', () => {
    const data = rows();
    data[0].newPrice1 = 22.5;
    data[0].newPrice3 = '33';
    expect(buildApplyPayload(data)).toEqual({ priceRows: [{ distId: 10, newPrice1: 22.5, newPrice2: 0, newPrice3: 33 }] });
  });

  it('no incluye las filas sin precio nuevo', () => {
    expect(buildApplyPayload(rows())).toEqual({ priceRows: [] });
  });

  it('un cost editado por error en la fila no viaja', () => {
    const data = rows();
    data[0].cost = 9999;
    data[0].newPrice2 = 1;
    const sent = buildApplyPayload(data).priceRows[0];
    expect(Object.keys(sent).sort()).toEqual(['distId', 'newPrice1', 'newPrice2', 'newPrice3']);
  });

  it('entrada no arreglo da una lista vacía', () => {
    expect(buildApplyPayload(undefined)).toEqual({ priceRows: [] });
  });
});

describe('rowMirror', () => {
  it('solo la fila con copiesToProduct se copia', () => {
    expect(rowMirror(rows()[1])).toBeNull();
    expect(rowMirror(rows()[2])).toBeNull();
    expect(rowMirror(null)).toBeNull();
  });

  it('sin precios nuevos copia los de la distribución y marca que cambia respecto al producto', () => {
    expect(rowMirror(rows()[0])).toEqual({ current: [18.5, 22, 27], final: [20, 25, 30], changed: true });
  });

  it('con precios nuevos el final usa el nuevo', () => {
    const data = rows();
    data[0].newPrice1 = 22.5;
    expect(rowMirror(data[0]).final).toEqual([22.5, 25, 30]);
  });

  it('si el producto ya tiene los mismos precios, changed es false', () => {
    const row = { ...rows()[0], productPrice1: '20.00', productPrice2: '25.00', productPrice3: '30.00' };
    expect(rowMirror(row).changed).toBe(false);
  });
});

describe('mirrorSummary', () => {
  it('lista los productos que se copian y los que no tienen distribución por defecto', () => {
    const summary = mirrorSummary(rows());
    expect(summary.copies.map((c) => c.productCode)).toEqual(['A-1']);
    expect(summary.copies[0]).toMatchObject({ distId: 10, final: [20, 25, 30] });
    expect(summary.withoutDefault).toEqual(['B-2']);
  });

  it('un producto con varias distribuciones aparece una sola vez', () => {
    expect(mirrorSummary(rows()).withoutDefault).not.toContain('A-1');
  });

  it('sin filas devuelve listas vacías', () => {
    expect(mirrorSummary(undefined)).toEqual({ copies: [], withoutDefault: [] });
  });
});
