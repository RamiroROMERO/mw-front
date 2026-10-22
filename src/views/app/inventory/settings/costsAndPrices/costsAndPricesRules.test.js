import { describe, it, expect } from 'vitest';
import {
  LIMITS, MAX_ROWS, PRODUCT_FIELDS, COSTS_PRIVILEGE_CODE, hasCostsPrivilege, hasCostChanged, validateRow, validateRows, firstProblem,
  applyRowChange, buildSavePayload, mapOriginalCosts
} from './costsAndPricesRules';

// Mismos casos que CostsAndPricesRowsDTO.test.js y CostsAndPricesService.test.js del back.
const ROW = {
  rowKey: '5_70', productId: 5, distId: 70, code: 'A-1', productType: 1, name: 'Arroz', description: 'Grano', typeId: 1, tradeId: 2, packId: 3,
  submConversion: 12, undinId: 4, paymentTax: true, percentTax: '15.00', costValue: 10, undoutId: 3, valChange: 1,
  localMinPrice: 12, localMedPrice: 13, localMaxPrice: 14, foranMinPrice: 15, foranMedPrice: 16, foranMaxPrice: 17, edited: true
};
const ctx = { originalCost: 10, canEditCosts: true };
const fieldsOf = (patch, context = ctx) => Object.keys(validateRow({ ...ROW, ...patch }, context)).sort();

describe('validateRow: textos e identificadores', () => {
  it('una fila válida no tiene errores', () => expect(validateRow(ROW, ctx)).toEqual({}));
  it('name obligatorio; 120 pasa y 121 no', () => {
    [undefined, null, '', '   '].forEach((v) => expect(fieldsOf({ name: v })).toEqual(['name']));
    expect(fieldsOf({ name: 'a'.repeat(120) })).toEqual([]);
    expect(validateRow({ ...ROW, name: 'a'.repeat(121) }, ctx)).toEqual({ name: 'page.costsAndPrices.error.length' });
  });
  it('description opcional; 120 pasa y 121 no', () => {
    expect(fieldsOf({ description: '' })).toEqual([]);
    expect(fieldsOf({ description: undefined })).toEqual([]);
    expect(fieldsOf({ description: 'a'.repeat(120) })).toEqual([]);
    expect(fieldsOf({ description: 'a'.repeat(121) })).toEqual(['description']);
  });
  it.each(['typeId', 'tradeId', 'packId', 'undinId'])('%s obligatorio, entero mayor a 0', (field) => {
    [undefined, null, '', 0, -2, 1.5, 'x'].forEach((v) => expect(fieldsOf({ [field]: v })).toEqual([field]));
    expect(fieldsOf({ [field]: '9' })).toEqual([]);
  });
});

describe('validateRow: impuesto y factores', () => {
  it('percentTax solo 0, 15 o 18 (llega como "15.00")', () => {
    [0, '0.00', 15, '15.00', '18.00'].forEach((v) => expect(fieldsOf({ percentTax: v, paymentTax: false })).toEqual([]));
    [10, '', undefined, 'x', -1].forEach((v) => expect(validateRow({ ...ROW, percentTax: v }, ctx)).toEqual({ percentTax: 'page.costsAndPrices.error.taxPercent' }));
  });
  it('con impuesto activo el porcentaje debe ser mayor a 0; sin impuesto puede ser 0', () => {
    expect(validateRow({ ...ROW, paymentTax: true, percentTax: '0.00' }, ctx)).toEqual({ percentTax: 'page.costsAndPrices.error.taxRequired' });
    expect(fieldsOf({ paymentTax: false, percentTax: '0.00' })).toEqual([]);
  });
  it.each([['submConversion', Number('999999999.99999')], ['valChange', Number('9999999.99999')]])('%s: mayor a 0, con tope de la columna', (field, max) => {
    [undefined, '', 0, -1, 'x'].forEach((v) => expect(fieldsOf({ [field]: v })).toEqual([field]));
    expect(fieldsOf({ [field]: 0.00001 })).toEqual([]);
    expect(fieldsOf({ [field]: max })).toEqual([]);
    expect(fieldsOf({ [field]: max + 1 })).toEqual([field]);
  });
});

describe('validateRow: precios', () => {
  it.each(['localMinPrice', 'localMedPrice', 'localMaxPrice'])('%s obligatorio y mayor a 0, tope decimal(12,2)', (field) => {
    [undefined, '', 0, -1, 'x'].forEach((v) => expect(fieldsOf({ [field]: v })).toEqual([field]));
    expect(fieldsOf({ [field]: 0.01 })).toEqual([]);
    expect(fieldsOf({ [field]: LIMITS.localPrice })).toEqual([]);
    expect(fieldsOf({ [field]: 10000000000 })).toEqual([field]);
  });
  it.each(['foranMinPrice', 'foranMedPrice', 'foranMaxPrice'])('%s opcional, no negativo, tope 999999.99', (field) => {
    [undefined, null, '', 0].forEach((v) => expect(fieldsOf({ [field]: v })).toEqual([]));
    [-1, 'x'].forEach((v) => expect(fieldsOf({ [field]: v })).toEqual([field]));
    expect(fieldsOf({ [field]: 999999.99 })).toEqual([]);
    expect(fieldsOf({ [field]: 1000000 })).toEqual([field]);
  });
  it('los valores llegan como texto desde las celdas', () => {
    expect(fieldsOf({ costValue: '10.5', valChange: '1', localMinPrice: '12.50', foranMinPrice: '' }, { originalCost: 10.5, canEditCosts: true })).toEqual([]);
  });
});

describe('validateRow: costo', () => {
  it('obligatorio, negativo no, tope decimal(17,5)', () => {
    [undefined, '', 'x', -0.01].forEach((v) => expect(fieldsOf({ costValue: v })).toEqual(['costValue']));
    expect(fieldsOf({ costValue: LIMITS.costValue }, { originalCost: LIMITS.costValue, canEditCosts: false })).toEqual([]);
    expect(fieldsOf({ costValue: 100000000000 })).toEqual(['costValue']);
  });
  it('sin cambio de costo no pide el privilegio (se edita un precio sin tocar el costo)', () => {
    expect(fieldsOf({ costValue: '10.00' }, { originalCost: '10.00000', canEditCosts: false })).toEqual([]);
  });
  it('cambiar el costo sin 11.01.003 se marca (el back rechazaría todo el lote con 403)', () => {
    expect(validateRow({ ...ROW, costValue: 11 }, { originalCost: 10, canEditCosts: false })).toEqual({ costValue: 'page.costsAndPrices.error.costForbidden' });
    expect(fieldsOf({ costValue: 11 }, { originalCost: 10, canEditCosts: true })).toEqual([]);
  });
  it('un producto no puede quedar con costo 0 al cambiarlo; un servicio sí', () => {
    expect(validateRow({ ...ROW, costValue: 0 }, ctx)).toEqual({ costValue: 'page.costsAndPrices.error.costZero' });
    expect(fieldsOf({ costValue: 0, productType: 2 })).toEqual([]);
  });
  it('el costo 0 que el producto ya tenía no bloquea editar otros campos (hay 99 productos así)', () => {
    expect(fieldsOf({ costValue: 0 }, { originalCost: '0.00000', canEditCosts: false })).toEqual([]);
  });
  it('el costo en cero se avisa antes que la falta de privilegio', () => {
    expect(validateRow({ ...ROW, costValue: 0 }, { originalCost: 10, canEditCosts: false })).toEqual({ costValue: 'page.costsAndPrices.error.costZero' });
  });
});

describe('hasCostChanged', () => {
  it('compara a 5 decimales y con textos', () => {
    expect(hasCostChanged({ costValue: '10.00' }, '10.00000')).toBe(false);
    expect(hasCostChanged({ costValue: 10.000001 }, 10)).toBe(false);
    expect(hasCostChanged({ costValue: 10.00001 }, 10)).toBe(true);
    expect(hasCostChanged({ costValue: '' }, 10)).toBe(true);
    expect(hasCostChanged({ costValue: 'x' }, 10)).toBe(true);
  });
});

describe('validateRows y firstProblem', () => {
  it('reúne los errores por fila y reporta el primero con su código', () => {
    const rows = [ROW, { ...ROW, rowKey: '6_80', code: 'B-2', name: '', localMinPrice: 0 }];
    const { rowErrors, tooMany } = validateRows(rows, { originalCosts: { '5_70': 10, '6_80': 10 }, canEditCosts: true });
    expect(Object.keys(rowErrors)).toEqual(['6_80']);
    expect(firstProblem(rows, rowErrors)).toEqual({ rowKey: '6_80', code: 'B-2', field: 'name', id: 'page.costsAndPrices.error.required' });
    expect(tooMany).toBe(false);
  });
  it('sin errores firstProblem es null', () => {
    const { rowErrors } = validateRows([ROW], { originalCosts: { '5_70': 10 }, canEditCosts: true });
    expect(firstProblem([ROW], rowErrors)).toBeNull();
  });
  it('1000 filas pasan y 1001 no', () => {
    const many = (n) => Array.from({ length: n }, (_, i) => ({ ...ROW, rowKey: `k${i}` }));
    expect(validateRows(many(MAX_ROWS), { canEditCosts: true, originalCosts: {} }).tooMany).toBe(false);
    expect(validateRows(many(MAX_ROWS + 1), { canEditCosts: true, originalCosts: {} }).tooMany).toBe(true);
  });
});

describe('applyRowChange', () => {
  const rows = [
    { ...ROW, edited: false },
    { ...ROW, rowKey: '5_71', distId: 71, undoutId: 4, edited: false },
    { ...ROW, rowKey: '6_80', productId: 6, distId: 80, code: 'B-2', edited: false }
  ];
  it('un campo del producto se copia a las demás filas del mismo producto y las marca editadas', () => {
    const next = applyRowChange(rows, '5_70', 'name', 'Nuevo');
    expect(next.map((r) => [r.name, r.edited])).toEqual([['Nuevo', true], ['Nuevo', true], ['Arroz', false]]);
  });
  it.each(PRODUCT_FIELDS)('%s es un campo del producto', (field) => {
    const next = applyRowChange(rows, '5_70', field, 'v');
    expect(next[1][field]).toBe('v');
  });
  it('un campo de la distribución solo cambia su fila', () => {
    const next = applyRowChange(rows, '5_70', 'localMinPrice', '99');
    expect(next.map((r) => [r.localMinPrice, r.edited])).toEqual([['99', true], [12, false], [12, false]]);
  });
  it('una fila inexistente no cambia nada', () => expect(applyRowChange(rows, 'zz', 'name', 'x')).toBe(rows));
  it('no muta el arreglo de entrada', () => {
    applyRowChange(rows, '5_70', 'name', 'Nuevo');
    expect(rows[0].name).toBe('Arroz');
  });
});

describe('buildSavePayload', () => {
  it('solo las filas editadas, con números y foráneos vacíos en 0', () => {
    const rows = [
      { ...ROW, name: ' Arroz ', submConversion: '12', costValue: '10.5', foranMinPrice: '', foranMedPrice: null, foranMaxPrice: '3', paymentTax: 1, percentTax: '15.00' },
      { ...ROW, rowKey: 'x', edited: false }
    ];
    const payload = buildSavePayload(rows);
    expect(payload).toHaveLength(1);
    expect(payload[0]).toEqual({
      productId: 5, distId: 70, code: 'A-1', name: 'Arroz', description: 'Grano', typeId: 1, tradeId: 2, packId: 3, submConversion: 12, undinId: 4,
      paymentTax: true, percentTax: 15, costValue: 10.5, undoutId: 3, valChange: 1,
      localMinPrice: 12, localMedPrice: 13, localMaxPrice: 14, foranMinPrice: 0, foranMedPrice: 0, foranMaxPrice: 3
    });
  });
});

describe('privilegio y costos de partida', () => {
  it('11.01.003 activo', () => {
    expect(COSTS_PRIVILEGE_CODE).toBe('11.01.003');
    expect(hasCostsPrivilege({ active: 1 })).toBe(true);
    expect(hasCostsPrivilege({ active: 0 })).toBe(false);
    expect(hasCostsPrivilege(undefined)).toBe(false);
  });
  it('mapOriginalCosts indexa por rowKey', () => {
    expect(mapOriginalCosts([ROW, { ...ROW, rowKey: 'b', costValue: 3 }])).toEqual({ '5_70': 10, b: 3 });
  });
});
