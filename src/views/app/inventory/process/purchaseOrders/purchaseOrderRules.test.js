import { describe, expect, test } from 'vitest';
import {
  roundTo, calculateLine, calculateTotals, recalculateLine, applyManualDiscount, validateLine, validateOrder, buildOrderPayload,
  displayExpectedDate, lineFromServer, MAX_APPLICANT, MAX_DESCRIPTION_OTHERS, MAX_PRODUCT_CODE, MAX_LINES
} from './purchaseOrderRules';

// Mismos números y casos que los tests del back (purchaseOrderRules, PurchaseOrderDTO y PurchaseOrderDetailDTO).
const LINE = { productCode: 'HPL-00001', undId: 3, qty: 10, price: 100, percentDiscount: 10, percentTax: 15, isExonerated: 0, conversionFactor: 12 };
const FORM = { date: '2026-10-20', providerId: 7, paymentTypeId: 2, creditDays: 30, applicantName: 'Elena Cruz', valueOthers: 0, descriptionOthers: '' };

describe('roundTo', () => {
  test.each([
    [1.005, 2, 1.01], [10.475, 2, 10.48], [2.675, 2, 2.68], [0.1 + 0.2, 5, 0.3], [1.123456, 5, 1.12346], [1.123454, 5, 1.12345],
    [-1.005, 2, -1.01], [0, 5, 0], [5, 5, 5]
  ])('roundTo(%p, %p) = %p', (value, decimals, expected) => {
    expect(roundTo(value, decimals)).toBe(expected);
  });

  test('un valor no numérico da 0 y la notación científica no revienta', () => {
    expect(roundTo('abc', 2)).toBe(0);
    expect(roundTo(1e-7, 5)).toBe(0);
  });
});

describe('calculateLine', () => {
  // 10 x 100 = 1000; descuento 10 % = 100; impuesto 15 % de 900 = 135; total 1035.
  test('subtotal, descuento, impuesto y total con la fórmula del legacy', () => {
    expect(calculateLine(LINE)).toEqual({ subTotal: 1000, discount: 100, tax: 135, total: 1035, percentTax: 15 });
  });

  test('conserva 5 decimales', () => {
    expect(calculateLine({ qty: 3, price: 10.123, percentDiscount: 0, percentTax: 15 }))
      .toEqual({ subTotal: 30.369, discount: 0, tax: 4.55535, total: 34.92435, percentTax: 15 });
  });

  test('un producto exonerado no paga impuesto', () => {
    expect(calculateLine({ qty: 2, price: 50, percentDiscount: 0, percentTax: 15, isExonerated: true }))
      .toEqual({ subTotal: 100, discount: 0, tax: 0, total: 100, percentTax: 0 });
  });

  test('valores vacíos o no numéricos cuentan como 0', () => {
    expect(calculateLine({})).toEqual({ subTotal: 0, discount: 0, tax: 0, total: 0, percentTax: 0 });
    expect(calculateLine({ qty: '', price: 'x' }).subTotal).toBe(0);
  });

  test('acepta strings numéricos (así llegan los decimales del back)', () => {
    expect(calculateLine({ qty: '10.00000', price: '100.00000', percentDiscount: '10', percentTax: '15.00' }).total).toBe(1035);
  });
});

describe('calculateTotals', () => {
  const line = (values) => ({ subTotal: 0, discount: 0, tax: 0, isExonerated: 0, ...values });

  test('gravado, exento y exonerado se separan por línea y el total los suma (Total = 500 + 1000 + 200 - 100 + 135 + 25 = 1760)', () => {
    expect(calculateTotals([
      line({ subTotal: 1000, discount: 100, tax: 135 }), line({ subTotal: 500 }), line({ subTotal: 200, isExonerated: 1 })
    ], 25)).toEqual({
      valueExempt: 500, valueTaxed: 1000, valueExonerated: 200, valueDiscount: 100, valueTax: 135, valueOthers: 25, valueTotal: 1760
    });
  });

  test('sin líneas todo es 0', () => {
    expect(calculateTotals([], 0).valueTotal).toBe(0);
  });

  test('suma con 5 decimales y redondea el encabezado a centavos al final', () => {
    const totals = calculateTotals([line({ subTotal: 30.369, tax: 4.55535 }), line({ subTotal: 30.369, tax: 4.55535 })]);
    expect(totals).toMatchObject({ valueTaxed: 60.74, valueTax: 9.11, valueTotal: 69.85 });
  });

  test('otros recargos no numéricos no suman', () => {
    expect(calculateTotals([line({ subTotal: 10 })], 'abc').valueOthers).toBe(0);
  });
});

describe('recalculateLine / applyManualDiscount', () => {
  test('recalculateLine conserva los campos y reemplaza los calculados', () => {
    expect(recalculateLine({ ...LINE, total: 1, tax: 1 })).toMatchObject({ productCode: 'HPL-00001', subTotal: 1000, discount: 100, tax: 135, total: 1035 });
  });

  // Por porcentaje: 20 % a una línea de 1000 con 15 % de impuesto: descuento 200, impuesto 15 % de 800 = 120, total 920.
  test('descuento por porcentaje a todo el detalle (recalcula también el impuesto)', () => {
    const result = applyManualDiscount([recalculateLine({ ...LINE, percentDiscount: 0 })], { mode: 'percent', amount: '20' });
    expect(result.details[0]).toMatchObject({ percentDiscount: 20, discount: 200, tax: 120, total: 920 });
  });

  // Por valor: 150 sobre subtotales de 1000 + 500 = 1500 son 10 %.
  test('descuento por valor: el porcentaje es valor / suma de subtotales x 100', () => {
    const lines = [recalculateLine({ ...LINE, percentDiscount: 0 }), recalculateLine({ ...LINE, qty: 5, percentDiscount: 0 })];
    const result = applyManualDiscount(lines, { mode: 'value', amount: 150 });
    expect(result.details.map((line) => line.percentDiscount)).toEqual([10, 10]);
    expect(result.details[0].discount).toBe(100);
  });

  test.each([[{ mode: 'percent', amount: -1 }], [{ mode: 'percent', amount: 101 }], [{ mode: 'percent', amount: '' }], [{ mode: 'value', amount: 2000 }]])('%p se rechaza', (input) => {
    expect(applyManualDiscount([recalculateLine(LINE)], input).error).toBe('msg.purchaseOrder.discount.invalid');
  });

  test('un descuento por valor sin subtotal se rechaza (no divide entre cero)', () => {
    expect(applyManualDiscount([], { mode: 'value', amount: 10 }).error).toBe('msg.purchaseOrder.discount.invalid');
  });

  test('no muta las líneas recibidas', () => {
    const lines = [recalculateLine(LINE)];
    applyManualDiscount(lines, { mode: 'percent', amount: 50 });
    expect(lines[0].percentDiscount).toBe(10);
  });
});

describe('validateLine', () => {
  test('una línea completa es válida', () => {
    expect(validateLine(LINE)).toEqual({});
  });

  test.each([[undefined], [''], ['   ']])('productCode %p es obligatorio', (value) => {
    expect(validateLine({ ...LINE, productCode: value }).productCode).toBe('msg.required.input.codeProduct');
  });

  test('productCode: 30 caracteres pasa y 31 falla', () => {
    expect(validateLine({ ...LINE, productCode: 'A'.repeat(MAX_PRODUCT_CODE) })).toEqual({});
    expect(validateLine({ ...LINE, productCode: 'A'.repeat(MAX_PRODUCT_CODE + 1) }).productCode).toBeDefined();
  });

  test.each([[undefined], [0], [-1], [1.5], ['x'], ['']])('undId %p se rechaza', (value) => {
    expect(validateLine({ ...LINE, undId: value }).undId).toBe('msg.required.select.units');
  });

  test.each([[undefined], [0], [-5], ['abc'], ['']])('qty %p se rechaza', (value) => {
    expect(validateLine({ ...LINE, qty: value }).qty).toBe('msg.required.input.qty');
  });

  test.each([[undefined], [0], [-1], ['abc']])('price %p se rechaza', (value) => {
    expect(validateLine({ ...LINE, price: value }).price).toBe('msg.required.input.price');
  });

  test.each([['percentDiscount'], ['percentTax']])('%s: 0 y 100 pasan; -0.01, 100.01 y texto fallan; vacío pasa', (field) => {
    expect(validateLine({ ...LINE, [field]: 0 })).toEqual({});
    expect(validateLine({ ...LINE, [field]: 100 })).toEqual({});
    expect(validateLine({ ...LINE, [field]: '' })).toEqual({});
    expect(validateLine({ ...LINE, [field]: -0.01 })[field]).toBe('msg.purchaseOrder.percent.range');
    expect(validateLine({ ...LINE, [field]: 100.01 })[field]).toBe('msg.purchaseOrder.percent.range');
    expect(validateLine({ ...LINE, [field]: 'abc' })[field]).toBe('msg.purchaseOrder.percent.range');
  });
});

describe('validateOrder', () => {
  test('un documento completo es válido', () => {
    expect(validateOrder(FORM, [LINE])).toEqual({});
  });

  test.each([[undefined], [''], ['  ']])('date %p es obligatoria', (value) => {
    expect(validateOrder({ ...FORM, date: value }, [LINE]).date).toBe('msg.required.input.date');
  });

  test.each([[undefined], [0], [-1], ['x'], [1.5], ['']])('providerId %p se rechaza', (value) => {
    expect(validateOrder({ ...FORM, providerId: value }, [LINE]).providerId).toBe('msg.required.select.provider');
  });

  test.each([[undefined], [0], [-1], ['x'], ['']])('paymentTypeId %p se rechaza', (value) => {
    expect(validateOrder({ ...FORM, paymentTypeId: value }, [LINE]).paymentTypeId).toBe('msg.required.select.paymentType');
  });

  test('providerId y paymentTypeId como string numérico son válidos', () => {
    expect(validateOrder({ ...FORM, providerId: '7', paymentTypeId: '2' }, [LINE])).toEqual({});
  });

  test('sin detalle falla; con una línea de precio cero falla distinto', () => {
    expect(validateOrder(FORM, []).details).toBe('msg.required.select.product');
    expect(validateOrder(FORM, undefined).details).toBe('msg.required.select.product');
    expect(validateOrder(FORM, [LINE, { ...LINE, price: 0 }]).details).toBe('msg.purchaseOrder.priceZero');
  });

  test('máximo de líneas: 500 pasa y 501 falla', () => {
    expect(validateOrder(FORM, Array.from({ length: MAX_LINES }, () => LINE))).toEqual({});
    expect(validateOrder(FORM, Array.from({ length: MAX_LINES + 1 }, () => LINE)).details).toBe('msg.purchaseOrder.maxLines');
  });

  test('applicantName: 50 pasa y 51 falla', () => {
    expect(validateOrder({ ...FORM, applicantName: 'A'.repeat(MAX_APPLICANT) }, [LINE])).toEqual({});
    expect(validateOrder({ ...FORM, applicantName: 'A'.repeat(MAX_APPLICANT + 1) }, [LINE]).applicantName).toBe('msg.purchaseOrder.maxLength');
  });

  test('descriptionOthers: 100 pasa y 101 falla', () => {
    expect(validateOrder({ ...FORM, descriptionOthers: 'A'.repeat(MAX_DESCRIPTION_OTHERS) }, [LINE])).toEqual({});
    expect(validateOrder({ ...FORM, descriptionOthers: 'A'.repeat(MAX_DESCRIPTION_OTHERS + 1) }, [LINE]).descriptionOthers).toBeDefined();
  });

  test('creditDays y valueOthers negativos o no numéricos se rechazan; cero y vacío pasan', () => {
    expect(validateOrder({ ...FORM, creditDays: -1 }, [LINE]).creditDays).toBe('msg.purchaseOrder.integer.invalid');
    expect(validateOrder({ ...FORM, creditDays: 1.5 }, [LINE]).creditDays).toBeDefined();
    expect(validateOrder({ ...FORM, valueOthers: -0.01 }, [LINE]).valueOthers).toBe('msg.purchaseOrder.amount.invalid');
    expect(validateOrder({ ...FORM, valueOthers: 'x' }, [LINE]).valueOthers).toBeDefined();
    expect(validateOrder({ ...FORM, creditDays: 0, valueOthers: 0 }, [LINE])).toEqual({});
    expect(validateOrder({ ...FORM, creditDays: '', valueOthers: '' }, [LINE])).toEqual({});
  });
});

describe('buildOrderPayload', () => {
  test('arma el cuerpo sin totales ni valores calculados ni ids locales', () => {
    const payload = buildOrderPayload(
      { ...FORM, id: 5, notes: 'Entregar', expectedDate: '', workOrderId: '4', valueOthers: '12.5', valueTotal: 999, valueTaxed: 999, address: 'X' },
      [{ ...LINE, id: 1699999999, subTotal: 1000, total: 1035, tax: 135, discount: 100, nameUM: 'CAJA', nameProduct: 'X', qtyRec: 3 }]
    );
    expect(payload).toEqual({
      date: '2026-10-20', providerId: 7, paymentTypeId: 2, applicantName: 'Elena Cruz', notes: 'Entregar', expectedDate: '1900-01-01',
      creditDays: 30, workOrderId: 4, valueOthers: 12.5, descriptionOthers: '',
      details: [{
        productCode: 'HPL-00001', undId: 3, qty: 10, price: 100, percentDiscount: 10, percentTax: 15, isExonerated: 0, conversionFactor: 12
      }]
    });
  });

  test('isExonerated se envía como 0 o 1 y el factor de conversión vacío como 1', () => {
    const payload = buildOrderPayload(FORM, [{ ...LINE, isExonerated: true, conversionFactor: 0 }, { ...LINE, isExonerated: false }]);
    expect(payload.details.map((line) => line.isExonerated)).toEqual([1, 0]);
    expect(payload.details[0].conversionFactor).toBe(1);
  });

  test('la fecha de recepción se conserva si viene y los enteros inválidos van en 0', () => {
    const payload = buildOrderPayload({ ...FORM, expectedDate: '2026-10-30', workOrderId: 'abc', creditDays: '' }, [LINE]);
    expect(payload.expectedDate).toBe('2026-10-30');
    expect(payload.workOrderId).toBe(0);
    expect(payload.creditDays).toBe(0);
  });
});

describe('displayExpectedDate / lineFromServer', () => {
  test('la fecha vacía del back (1900-01-01) se muestra vacía', () => {
    expect(displayExpectedDate('1900-01-01')).toBe('');
    expect(displayExpectedDate('1900-01-01T00:00:00.000Z')).toBe('');
    expect(displayExpectedDate(null)).toBe('');
    expect(displayExpectedDate('2026-10-30')).toBe('2026-10-30');
  });

  test('lineFromServer agrega nombre y marca del producto y deja lo recibido ahora en 0', () => {
    const line = lineFromServer({ id: 4, productCode: 'A', isExonerated: 1, productData: { name: 'Jabón', tradeMark: 'ACME' } });
    expect(line).toMatchObject({ id: 4, nameProduct: 'Jabón', marca: 'ACME', qtyRec: 0, isExonerated: true });
  });

  test('sin datos del producto no revienta', () => {
    expect(lineFromServer({ id: 1, isExonerated: 0 })).toMatchObject({ nameProduct: '', marca: '', isExonerated: false });
  });
});
