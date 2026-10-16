import { describe, it, expect } from 'vitest';
import {
  round2, calculatePrice, costByType, calculateDistributionPrices, buildBulkRows, chunkRows, BULK_BATCH_SIZE,
  PRICE_SLOTS, recalculatePrice, recalculateAllPrices, calculateTaxValue, defaultPercentsPatch
} from './priceRules';

// Todos los valores esperados están derivados a mano en el comentario de cada bloque.

describe('round2 (mitades hacia arriba, sin toFixed)', () => {
  it.each([
    [1.005, 1.01],
    [10.475, 10.48],
    [2.675, 2.68],
    [1.004, 1],
    [0.125, 0.13],
    [14.375, 14.38],
    [100, 100],
    [0, 0]
  ])('%s -> %s', (input, expected) => {
    expect(round2(input)).toBe(expected);
  });

  it('acepta strings y valores no numéricos (0)', () => {
    expect(round2('1.005')).toBe(1.01);
    expect(round2('abc')).toBe(0);
    expect(round2(null)).toBe(0);
    expect(round2(undefined)).toBe(0);
  });

  it('números en notación exponencial no producen NaN', () => {
    expect(round2(1e-7)).toBe(0);
    expect(round2(1.5e21)).toBe(1.5e21);
  });
});

describe('calculatePrice = costo / (1 - margen/100), más impuesto si lo incluye', () => {
  // 10 / 0.8 = 12.5 ; 100 / 0.75 = 133.33.. ; 100 / 0.5 = 200
  it.each([
    [10, 20, 0, false, 12.5],
    [100, 25, 0, false, 133.33],
    [100, 50, 0, false, 200]
  ])('sin ISV: costo %s margen %s -> %s', (cost, margin, tax, include, expected) => {
    expect(calculatePrice(cost, margin, tax, include)).toBe(expected);
  });

  it('con ISV: 12.5 + 12.5 x 15 % = 14.375 -> 14.38 (mitad hacia arriba)', () => {
    expect(calculatePrice(10, 20, 15, true)).toBe(14.38);
  });

  it('el impuesto solo se suma si "incluye ISV" y el impuesto es mayor a 0', () => {
    expect(calculatePrice(10, 20, 15, false)).toBe(12.5);
    expect(calculatePrice(10, 20, 0, true)).toBe(12.5);
    expect(calculatePrice(10, 20, -5, true)).toBe(12.5);
  });

  it('redondea al final, no en el paso intermedio: 100 / 0.75 = 133.3333.. x 1.15 = 153.33333 -> 153.33', () => {
    expect(calculatePrice(100, 25, 15, true)).toBe(153.33);
  });

  it.each([
    ['sin costo', 0, 20],
    ['costo negativo', -5, 20],
    ['costo vacío', '', 20],
    ['costo no numérico', 'x', 20],
    ['sin margen', 10, 0],
    ['margen vacío', 10, ''],
    ['margen negativo', 10, -10],
    ['margen de 100 (no tiene precio)', 10, 100],
    ['margen mayor a 100', 10, 150]
  ])('%s -> 0', (_, cost, margin) => {
    expect(calculatePrice(cost, margin, 15, true)).toBe(0);
  });

  it('acepta strings numéricos', () => {
    expect(calculatePrice('10', '20', '15', true)).toBe(14.38);
  });
});

describe('costByType: 1 promedio, 2 último, 3 máximo', () => {
  const product = { costValue: '10.5', lastCostValue: 11, maxCostValue: '12', typeCalculateCost: 2 };

  it.each([[1, 10.5], [2, 11], [3, 12]])('tipo %s -> %s', (type, expected) => {
    expect(costByType(product, type)).toBe(expected);
  });

  it('sin tipo explícito usa el del producto', () => {
    expect(costByType(product)).toBe(11);
    expect(costByType({ ...product, typeCalculateCost: 3 })).toBe(12);
  });

  it.each([[0], [null], [undefined], [9], ['x']])('tipo %p -> el promedio', (type) => {
    expect(costByType({ ...product, typeCalculateCost: type })).toBe(10.5);
  });

  it('costo ausente -> 0', () => {
    expect(costByType({ typeCalculateCost: 1 })).toBe(0);
    expect(costByType(undefined)).toBe(0);
  });
});

describe('calculateDistributionPrices: costo x factor, cada precio con su propio porcentaje', () => {
  // costo 10 x 12 = 120. Márgenes 20, 25, 30, 40, 50, 60:
  // 120/0.8 = 150 ; 120/0.75 = 160 ; 120/0.7 = 171.428.. -> 171.43 ; 120/0.6 = 200 ; 120/0.5 = 240 ; 120/0.4 = 300
  const product = {
    costValue: 10, lastCostValue: 99, maxCostValue: 99, typeCalculateCost: 1, percentTax: 15, priceIncludeTax: false,
    percentLocalPriceMin: 20, percentLocalPriceMid: 25, percentLocalPriceMax: 30,
    percentOutsidePriceMin: 40, percentOutsidePriceMid: 50, percentOutsidePriceMax: 60
  };

  it('los seis precios usan cada uno su porcentaje (los foráneos 2 y 3 no repiten el cuarto)', () => {
    expect(calculateDistributionPrices(product, 12)).toEqual({
      localMinPrice: 150, localMedPrice: 160, localMaxPrice: 171.43,
      foranMinPrice: 200, foranMedPrice: 240, foranMaxPrice: 300
    });
  });

  it('con "incluye ISV" (15 %): 172.5, 184, 197.14 (171.428.. x 1.15 = 197.142..), 230, 276, 345', () => {
    expect(calculateDistributionPrices({ ...product, priceIncludeTax: 1 }, 12)).toEqual({
      localMinPrice: 172.5, localMedPrice: 184, localMaxPrice: 197.14,
      foranMinPrice: 230, foranMedPrice: 276, foranMaxPrice: 345
    });
  });

  it('el costo sale del tipo de cálculo: tipo 3 (máximo 20) x 1 = 20 -> 25 con margen 20', () => {
    const maxCost = { ...product, typeCalculateCost: 3, maxCostValue: 20 };
    expect(calculateDistributionPrices(maxCost, 1).localMinPrice).toBe(25);
  });

  it('un porcentaje en 0 deja ese precio en 0 sin afectar a los demás', () => {
    const result = calculateDistributionPrices({ ...product, percentOutsidePriceMid: 0 }, 12);
    expect(result.foranMedPrice).toBe(0);
    expect(result.foranMinPrice).toBe(200);
  });

  it.each([[0], [-1], [''], [undefined], ['x']])('factor %p -> todo en 0', (factor) => {
    expect(Object.values(calculateDistributionPrices(product, factor))).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it('factor como string', () => {
    expect(calculateDistributionPrices(product, '12').localMinPrice).toBe(150);
  });
});

describe('buildBulkRows', () => {
  const base = {
    code: 'A-1', name: 'Producto A', undoutId: 4, costValue: 10, lastCostValue: 0, maxCostValue: 0, typeCalculateCost: 1,
    percentTax: 0, priceIncludeTax: false,
    priceLocalMin: 0, priceLocalMid: 13, priceLocalMax: 0, priceLocalOther: 7,
    priceOutsideMin: 0, priceOutsideMid: 0, priceOutsideMax: 0, priceOutsideOther: 3
  };

  it('con porcentajes calcula con el costo (factor 1): 10/0.8 = 12.5 ; 10/0.5 = 20', () => {
    const { rows, skipped } = buildBulkRows([base], { localMin: 20, localMid: '', localMax: 50, foranMin: '', foranMid: '', foranMax: '' });
    expect(skipped).toEqual([]);
    expect(rows).toEqual([{
      productCode: 'A-1', undoutId: 4,
      localMinPrice: 12.5, localMedPrice: 13, localMaxPrice: 20,
      foranMinPrice: 0, foranMedPrice: 0, foranMaxPrice: 0,
      localOtherPrice: 7, foranOtherPrice: 3
    }]);
  });

  it('los seis porcentajes calculan los seis precios, con ISV: 10/0.8 x 1.1 = 13.75 ; 10/0.5 x 1.1 = 22', () => {
    const product = { ...base, percentTax: 10, priceIncludeTax: true };
    const { rows } = buildBulkRows([product], { localMin: 20, localMid: 20, localMax: 20, foranMin: 50, foranMid: 50, foranMax: 50 });
    expect(rows[0]).toMatchObject({ localMinPrice: 13.75, localMedPrice: 13.75, localMaxPrice: 13.75, foranMinPrice: 22, foranMedPrice: 22, foranMaxPrice: 22 });
  });

  it('con porcentajes vacíos usa los precios actuales del producto', () => {
    const product = { ...base, priceLocalMin: 11, priceLocalMid: 12, priceLocalMax: 14, priceOutsideMin: 15, priceOutsideMid: 16, priceOutsideMax: 17 };
    const { rows } = buildBulkRows([product], {});
    expect(rows[0]).toMatchObject({ localMinPrice: 11, localMedPrice: 12, localMaxPrice: 14, foranMinPrice: 15, foranMedPrice: 16, foranMaxPrice: 17 });
  });

  it('un porcentaje en 0 o vacío conserva el precio actual; uno mayor a 0 lo reemplaza', () => {
    const product = { ...base, priceLocalMin: 11, priceLocalMid: 12, priceLocalMax: 14 };
    const { rows } = buildBulkRows([product], { localMin: 0, localMid: '0', localMax: 20 });
    expect(rows[0]).toMatchObject({ localMinPrice: 11, localMedPrice: 12, localMaxPrice: 12.5 });
  });

  it('se omiten (reason price) los que quedan con algún precio local en 0, y se listan', () => {
    const noPrices = { ...base, code: 'B-2', name: 'Sin precios', priceLocalMid: 0 };
    const partial = { ...base, code: 'C-3', name: 'Medio' };
    const { rows, skipped } = buildBulkRows([noPrices, partial], { localMin: 20, localMid: '', localMax: 50 });
    expect(skipped).toEqual([{ code: 'B-2', name: 'Sin precios', reason: 'price' }]);
    expect(rows.map((r) => r.productCode)).toEqual(['C-3']);
  });

  it('con porcentaje pero sin costo el precio es 0 y el producto se omite', () => {
    const { rows, skipped } = buildBulkRows([{ ...base, costValue: 0 }], { localMin: 20, localMid: 20, localMax: 20 });
    expect(rows).toEqual([]);
    expect(skipped).toHaveLength(1);
  });

  it('un producto sin unidad de salida se omite con reason unit', () => {
    const { rows, skipped } = buildBulkRows([{ ...base, undoutId: 0 }, { ...base, code: 'D-4', undoutId: null }], { localMin: 20, localMid: 20, localMax: 20 });
    expect(rows).toEqual([]);
    expect(skipped.map((s) => s.reason)).toEqual(['unit', 'unit']);
  });

  it('usa el costo del tipo de cálculo del producto (último = 40 -> 40/0.8 = 50)', () => {
    const { rows } = buildBulkRows([{ ...base, typeCalculateCost: 2, lastCostValue: 40 }], { localMin: 20, localMid: 20, localMax: 20 });
    expect(rows[0].localMinPrice).toBe(50);
  });

  it('lista vacía o ausente -> sin filas', () => {
    expect(buildBulkRows([], {})).toEqual({ rows: [], skipped: [] });
    expect(buildBulkRows(undefined)).toEqual({ rows: [], skipped: [] });
  });

  it('la fila solo trae los campos que acepta el back (sin valChange, isDefault ni nombre)', () => {
    const { rows } = buildBulkRows([base], { localMin: 20, localMid: 20, localMax: 20 });
    expect(Object.keys(rows[0]).sort()).toEqual([
      'foranMaxPrice', 'foranMedPrice', 'foranMinPrice', 'foranOtherPrice',
      'localMaxPrice', 'localMedPrice', 'localMinPrice', 'localOtherPrice', 'productCode', 'undoutId'
    ]);
  });
});

describe('chunkRows', () => {
  const make = (n) => Array.from({ length: n }, (_, i) => i);

  it('el tamaño por defecto es el máximo del back (200)', () => {
    expect(BULK_BATCH_SIZE).toBe(200);
  });

  it.each([[0, []], [1, [1]], [200, [200]], [201, [200, 1]], [450, [200, 200, 50]]])('%s filas -> lotes %j', (total, sizes) => {
    expect(chunkRows(make(total)).map((batch) => batch.length)).toEqual(sizes);
  });

  it('conserva el orden y no pierde filas', () => {
    expect(chunkRows(make(5), 2)).toEqual([[0, 1], [2, 3], [4]]);
  });
});

describe('pestaña Precios: recalculatePrice / recalculateAllPrices', () => {
  // costo 10 (promedio), ISV 15 % incluido. Margen 20: valor 10/0.8 = 12.5 ; total 12.5 x 1.15 = 14.375 -> 14.38
  // Margen 50: valor 20 ; total 23. Margen 25: valor 13.33 ; total 13.3333.. x 1.15 = 15.3333.. -> 15.33
  const form = {
    costValue: 10, lastCostValue: 0, maxCostValue: 0, typeCalculateCost: 1, percentTax: 15, priceIncludeTax: true,
    percentLocalPriceMin: 20, valuePercentLocalPriceMin: 0, priceLocalMin: 0,
    percentLocalPriceMid: 50, valuePercentLocalPriceMid: 0, priceLocalMid: 0,
    percentLocalPriceMax: 0, valuePercentLocalPriceMax: 77, priceLocalMax: 88,
    percentOutsidePriceMin: 25, valuePercentOutsidePriceMin: 0, priceOutsideMin: 0,
    percentOutsidePriceMid: 0, valuePercentOutsidePriceMid: 0, priceOutsideMid: 0,
    percentOutsidePriceMax: 0, valuePercentOutsidePriceMax: 0, priceOutsideMax: 0
  };

  it('al salir de una casilla calcula su valor (sin impuesto) y su total (con impuesto)', () => {
    expect(recalculatePrice(form, 'percentLocalPriceMin')).toEqual({ valuePercentLocalPriceMin: 12.5, priceLocalMin: 14.38 });
    expect(recalculatePrice(form, 'percentLocalPriceMid')).toEqual({ valuePercentLocalPriceMid: 20, priceLocalMid: 23 });
    expect(recalculatePrice(form, 'percentOutsidePriceMin')).toEqual({ valuePercentOutsidePriceMin: 13.33, priceOutsideMin: 15.33 });
  });

  it('sin "incluye ISV" el valor y el total son iguales', () => {
    expect(recalculatePrice({ ...form, priceIncludeTax: false }, 'percentLocalPriceMin')).toEqual({ valuePercentLocalPriceMin: 12.5, priceLocalMin: 12.5 });
  });

  it('con porcentaje en 0 (o vacío) no cambia nada: conserva lo que haya en valor y total', () => {
    expect(recalculatePrice(form, 'percentLocalPriceMax')).toEqual({});
    expect(recalculatePrice({ ...form, percentLocalPriceMax: '' }, 'percentLocalPriceMax')).toEqual({});
  });

  it('un campo que no es un porcentaje no calcula nada', () => {
    expect(recalculatePrice(form, 'priceLocalMin')).toEqual({});
    expect(recalculatePrice(form, undefined)).toEqual({});
  });

  it('el costo sale del tipo de cálculo (último = 40: 40/0.8 = 50 ; x 1.15 = 57.5)', () => {
    expect(recalculatePrice({ ...form, typeCalculateCost: 2, lastCostValue: 40 }, 'percentLocalPriceMin')).toEqual({ valuePercentLocalPriceMin: 50, priceLocalMin: 57.5 });
  });

  it('sin costo el valor y el total quedan en 0', () => {
    expect(recalculatePrice({ ...form, costValue: 0 }, 'percentLocalPriceMin')).toEqual({ valuePercentLocalPriceMin: 0, priceLocalMin: 0 });
  });

  it('recalculateAllPrices calcula solo las casillas con porcentaje mayor a 0', () => {
    const patch = recalculateAllPrices(form);
    expect(patch).toEqual({
      valuePercentLocalPriceMin: 12.5, priceLocalMin: 14.38,
      valuePercentLocalPriceMid: 20, priceLocalMid: 23,
      valuePercentOutsidePriceMin: 13.33, priceOutsideMin: 15.33
    });
    expect(patch).not.toHaveProperty('priceLocalMax'); // porcentaje 0: se conserva el valor manual (88)
  });

  it('recalculateAllPrices con el costo en 0 pone en 0 los precios de las casillas con porcentaje', () => {
    expect(recalculateAllPrices({ ...form, costValue: 0 }).priceLocalMin).toBe(0);
  });

  it('formulario sin porcentajes -> sin cambios', () => {
    expect(recalculateAllPrices({ costValue: 10 })).toEqual({});
    expect(recalculateAllPrices(undefined)).toEqual({});
  });

  it('cubre las seis casillas', () => {
    expect(PRICE_SLOTS.map((slot) => slot.percent)).toEqual([
      'percentLocalPriceMin', 'percentLocalPriceMid', 'percentLocalPriceMax',
      'percentOutsidePriceMin', 'percentOutsidePriceMid', 'percentOutsidePriceMax'
    ]);
  });

  it('cada casilla usa su propio porcentaje (costo 10 sin ISV): 20 -> 12.5, 50 -> 20, 60 -> 25', () => {
    const six = { costValue: 10, typeCalculateCost: 1, percentTax: 0, priceIncludeTax: false, percentLocalPriceMin: 20, percentOutsidePriceMid: 50, percentOutsidePriceMax: 60 };
    const patch = recalculateAllPrices(six);
    expect(patch.priceLocalMin).toBe(12.5);
    expect(patch.priceOutsideMid).toBe(20);
    expect(patch.priceOutsideMax).toBe(25);
  });
});

describe('calculateTaxValue', () => {
  it.each([[{ percentTax: 15, costValue: 10 }, 1.5], [{ percentTax: '15.00', costValue: '10.5' }, 1.58], [{ percentTax: 0, costValue: 10 }, 0], [{}, 0]])('%j -> %s', (form, expected) => {
    expect(calculateTaxValue(form)).toBe(expected);
  });
});

describe('defaultPercentsPatch', () => {
  it('mapea los seis porcentajes de inv_porp a las casillas del formulario', () => {
    expect(defaultPercentsPatch({ localMin: 10, localMid: '15.5', localMax: 20, foranMin: 30, foranMid: 35, foranMax: 40 })).toEqual({
      percentLocalPriceMin: 10, percentLocalPriceMid: 15.5, percentLocalPriceMax: 20,
      percentOutsidePriceMin: 30, percentOutsidePriceMid: 35, percentOutsidePriceMax: 40
    });
  });

  it('respuesta ausente o incompleta -> ceros', () => {
    expect(Object.values(defaultPercentsPatch(undefined))).toEqual([0, 0, 0, 0, 0, 0]);
    expect(defaultPercentsPatch({ localMin: 5 }).percentLocalPriceMin).toBe(5);
    expect(defaultPercentsPatch({ localMin: 5 }).percentOutsidePriceMax).toBe(0);
  });
});
