import { describe, expect, test } from 'vitest';
import { detailPath, isClosed, previewLine, buildCreatePayload, validateCreate, buildUpdatePayload, validateUpdate, splitProvider, sumTotals, validateProviders, buildProvidersPayload, warningTexts } from './eventDetailRules';

describe('consumos del evento', () => {
  test('un evento y una hospitalización usan su propia ruta; cerrado = status 2', () => {
    expect(detailPath({ typeId: 1 })).toBe('hospital/process/eventDetails');
    expect(detailPath({ typeId: 2 })).toBe('hospital/process/hospitalizationDetails');
    expect(isClosed({ status: 2 })).toBe(true);
    expect(isClosed({ status: 1 })).toBe(false);
  });
  test('vista previa: impuesto sobre el subtotal ya descontado, a centavos', () => {
    expect(previewLine({ quantity: 3, price: 10.5, discPercent: 10, taxPercent: 15 })).toEqual({ subtotal: 31.5, discount: 3.15, taxValue: 4.25, total: 32.6 });
  });
  test('el alta por lote manda solo producto y cantidad; los servicios no llevan almacén', () => {
    const rows = [{ productCode: 'A', qty: '2', price: 99, total: 1 }, { productCode: 'B', qty: 0 }, { productCode: 'C', qty: 1.5 }];
    expect(buildCreatePayload({ event: { id: 9 }, kind: 1, areaId: '3', storeId: '4', rows })).toEqual({ eventId: 9, kind: 1, areaId: 3, storeId: 4, lines: [{ productCode: 'A', quantity: 2 }, { productCode: 'C', quantity: 1.5 }] });
    expect(buildCreatePayload({ event: { id: 9 }, kind: 2, areaId: 3, storeId: 4, rows: [rows[0]] }).storeId).toBe(0);
  });
  test('validación del alta: área, almacén (solo productos) y al menos una cantidad válida', () => {
    expect(Object.keys(validateCreate({ kind: 1, areaId: 0, storeId: 0, rows: [] })).sort()).toEqual(['areaId', 'lines', 'storeId']);
    expect(validateCreate({ kind: 2, areaId: 1, storeId: 0, rows: [{ qty: 1 }] })).toEqual({});
    expect(validateCreate({ kind: 1, areaId: 1, storeId: 1, rows: [{ qty: 1.234 }] }).lines).toBe('page.events.msg.quantityInvalid');
    expect(validateCreate({ kind: 1, areaId: 1, storeId: 1, rows: Array.from({ length: 101 }, () => ({ qty: 1 })) }).lines).toBe('page.events.msg.linesTooMany');
  });
  test('editar: precio y descuento solo viajan con permiso', () => {
    const form = { quantity: '3', price: '10', discPercent: '5' };
    expect(buildUpdatePayload(form, false)).toEqual({ quantity: 3 });
    expect(buildUpdatePayload(form, true)).toEqual({ quantity: 3, price: 10, discPercent: 5 });
    expect(validateUpdate({ ...form, quantity: 0 }, false).quantity).toBeTruthy();
    expect(validateUpdate({ ...form, discPercent: 101 }, true).discPercent).toBeTruthy();
    expect(validateUpdate({ ...form, discPercent: 101 }, false)).toEqual({});
  });
});

describe('honorarios', () => {
  test('hospital + proveedor = total al centavo', () => {
    expect(splitProvider({ quantity: 2, price: 650, hospValue: 100 })).toEqual({ total: 1300, hospValue: 100, provValue: 1200, hospPercent: 7.69 });
    expect(sumTotals([{ quantity: 1, price: 0.1 }, { quantity: 1, price: 0.2 }])).toBe(0.3);
  });
  test('la suma de los proveedores es el valor del servicio; proveedor obligatorio y sin repetir; lista vacía los quita', () => {
    const line = { quantity: 2, price: 650 };
    const ok = [{ providerId: 1, quantity: 1, price: 650, hospValue: 10 }, { providerId: 2, quantity: 1, price: 650, hospValue: 0 }];
    expect(validateProviders(ok, line)).toBeNull();
    expect(validateProviders([], line)).toBeNull();
    expect(validateProviders([{ ...ok[0], quantity: 1, price: 1, hospValue: 0 }], line)).toBe('page.events.msg.providerTotalMismatch');
    expect(validateProviders([{ ...ok[0], providerId: 0 }], line)).toBe('msg.required.select.provider');
    expect(validateProviders([ok[0], { ...ok[1], providerId: 1 }], line)).toBe('page.events.msg.providerRepeated');
    expect(validateProviders([{ providerId: 1, quantity: 2, price: 650, hospValue: 2000 }], line)).toBe('page.events.msg.providerSplitInvalid');
  });
  test('el cuerpo trae solo proveedor, cantidad, precio y valor del hospital', () => {
    expect(buildProvidersPayload([{ providerId: '3', quantity: '2', price: '650', hospValue: '100', provValue: 9, total: 9 }])).toEqual({ providers: [{ providerId: 3, quantity: 2, price: 650, hospValue: 100 }] });
  });
  test('avisos de existencia', () => {
    expect(warningTexts([{ code: 'line.stock.insufficient', productCode: 'A', available: 3 }, { code: 'x' }])).toEqual([{ id: 'page.events.msg.stockInsufficient', productCode: 'A', available: 3 }]);
  });
});
