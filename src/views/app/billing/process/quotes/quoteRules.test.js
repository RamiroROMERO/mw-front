import { describe, expect, test } from 'vitest';
import {
  buildInitialForm, buildLinePayload, buildQuotePayload, calculateLine, calculateTotals, discountPercentFromValue, formFromQuote, isQuoteLocked, isWithinLimit, limitDate,
  lineFromApi, lineFromProduct, priceChoices, priceWithoutTax, validateLine, validateQuote
} from './quoteRules';

// Mismos casos que modules/billing/quotes/__tests__ del back (quoteRules, QuoteDTO). Valores derivados a mano.
const NOW = new Date(2026, 10, 18, 12, 0, 0); // 2026-11-18
const LINE = { productCode: 'HPL-00001', unitId: 6, qty: 2, price: 100 };
const valid = () => ({
  ...buildInitialForm(), date: '2026-11-10', customerName: 'Ana', customerCode: '0801', customerPhone: '999', sellerId: 13
});
const check = (form = valid(), details = [LINE], options = { now: NOW }) => validateQuote(form, details, options);

describe('cálculo de la línea (fórmula del legacy)', () => {
  test('sin descuento ni impuesto: total = cantidad x precio', () => {
    expect(calculateLine({ qty: 3, price: 10, discountPercent: 0, taxPercent: 0 })).toEqual({ subtotal: 30, discountValue: 0, taxValue: 0, total: 30 });
  });
  test('descuento 10 % e ISV 15 %: 3 x 10.123 = 30.369; desc 3.0369; ISV 4.09981; total 31.43191', () => {
    expect(calculateLine({ qty: 3, price: 10.123, discountPercent: 10, taxPercent: 15 })).toEqual({ subtotal: 30.369, discountValue: 3.0369, taxValue: 4.09981, total: 31.43191 });
  });
  test('el impuesto se calcula sobre el subtotal ya descontado', () => {
    expect(calculateLine({ qty: 1, price: 100, discountPercent: 50, taxPercent: 15 })).toEqual({ subtotal: 100, discountValue: 50, taxValue: 7.5, total: 57.5 });
  });
  test('valores no numéricos cuentan como 0', () => {
    expect(calculateLine({ qty: 'x', price: null, discountPercent: undefined, taxPercent: 'a' })).toEqual({ subtotal: 0, discountValue: 0, taxValue: 0, total: 0 });
  });
});

describe('precio con ISV incluido (la pantalla hacía precio / 1 + %)', () => {
  test('115 / 1.15 = 100', () => { expect(priceWithoutTax(115, { includesTax: true, taxPercent: 15 })).toBe(100); });
  test('sin impuesto incluido o con impuesto 0 el precio no cambia', () => {
    expect(priceWithoutTax(115, { includesTax: false, taxPercent: 15 })).toBe(115);
    expect(priceWithoutTax(115, { includesTax: true, taxPercent: 0 })).toBe(115);
  });
});

describe('totales de la cabecera', () => {
  const lines = [calculateLine({ qty: 1, price: 100, discountPercent: 0, taxPercent: 15 }), calculateLine({ qty: 2, price: 50, discountPercent: 0, taxPercent: 0 })];
  test('suma las líneas; gravado = base con impuesto; exento = el resto', () => {
    expect(calculateTotals(lines)).toEqual({ subtotal: 200, discountValue: 0, taxValue: 15, total: 215, taxedValue: 100, exemptValue: 100, exoneratedValue: 0 });
  });
  test('0.1 + 0.2 suma 0.30 y el redondeo a centavos ocurre una sola vez (3 x 0.004 = 0.01)', () => {
    expect(calculateTotals([{ subtotal: 0.1, total: 0.1 }, { subtotal: 0.2, total: 0.2 }]).total).toBe(0.3);
    const line = { subtotal: 0.004, discountValue: 0, taxValue: 0, total: 0.004 };
    expect(calculateTotals([line, line, line]).total).toBe(0.01);
  });
  test('sin líneas todo es 0', () => { expect(calculateTotals([]).total).toBe(0); });
});

describe('descuento por valor (F2 del legacy)', () => {
  test('el valor se convierte a porcentaje del subtotal a 2 decimales', () => {
    expect(discountPercentFromValue(25, 200)).toBe(12.5);
    expect(discountPercentFromValue(1, 3)).toBe(33.33);
  });
  test('nunca pasa de 100; con subtotal o valor en 0 es 0', () => {
    expect(discountPercentFromValue(500, 200)).toBe(100);
    expect(discountPercentFromValue(10, 0)).toBe(0);
    expect(discountPercentFromValue(0, 200)).toBe(0);
    expect(discountPercentFromValue('x', 200)).toBe(0);
  });
});

describe('límite de edición (time_quote)', () => {
  test('limitDate: hoy menos N días; 0, vacío o negativo = sin límite', () => {
    expect(limitDate(30, NOW)).toBe('2026-10-19');
    expect(limitDate(1, NOW)).toBe('2026-11-17');
    expect(limitDate(0, NOW)).toBeNull();
    expect(limitDate('', NOW)).toBeNull();
    expect(limitDate(-5, NOW)).toBeNull();
  });
  test('cruza el cambio de mes y de año', () => {
    expect(limitDate(20, new Date(2026, 0, 10))).toBe('2025-12-21');
    expect(limitDate(1, new Date(2026, 2, 1))).toBe('2026-02-28');
  });
  test('isWithinLimit es inclusivo en el borde', () => {
    expect(isWithinLimit('2026-10-19', 30, NOW)).toBe(true);
    expect(isWithinLimit('2026-10-18', 30, NOW)).toBe(false);
    expect(isWithinLimit('2001-01-01', 0, NOW)).toBe(true);
    expect(isWithinLimit('abc', 30, NOW)).toBe(false);
  });
  test('una cotización guardada vencida es de solo lectura; una nueva o vigente no', () => {
    expect(isQuoteLocked({ id: 5, date: '2026-09-01' }, 30, NOW)).toBe(true);
    expect(isQuoteLocked({ id: 5, date: '2026-11-01' }, 30, NOW)).toBe(false);
    expect(isQuoteLocked({ id: 0, date: '2020-01-01' }, 30, NOW)).toBe(false);
    expect(isQuoteLocked({ id: 5, date: '2020-01-01' }, 0, NOW)).toBe(false);
    expect(isQuoteLocked(null, 30, NOW)).toBe(false);
  });
});

describe('validar la cotización (obligatorios del back)', () => {
  test('una cotización mínima es válida (cliente cualquiera, sin correo ni dirección ni almacén)', () => {
    expect(check()).toEqual({});
  });
  test.each([['customerName', ''], ['customerCode', ' '], ['customerPhone', ''], ['sellerId', 0], ['date', '']])('falta %s', (field, value) => {
    expect(Object.keys(check({ ...valid(), [field]: value }))).toEqual([field]);
  });
  test('sin líneas', () => { expect(check(valid(), []).details).toBe('page.quotes.error.details.required'); });
  test('máximos de nombre, RTN y teléfono', () => {
    expect(check({ ...valid(), customerName: 'x'.repeat(121) }).customerName).toBe('page.quotes.error.customerName.max');
    expect(check({ ...valid(), customerCode: 'x'.repeat(21) }).customerCode).toBe('page.quotes.error.customerCode.max');
    expect(check({ ...valid(), customerPhone: '9'.repeat(41) }).customerPhone).toBe('page.quotes.error.customerPhone.max');
    expect(check({ ...valid(), customerName: 'x'.repeat(120), customerCode: 'x'.repeat(20), customerPhone: '9'.repeat(40) })).toEqual({});
  });
  test('el correo debe tener formato válido si viene', () => {
    expect(check({ ...valid(), customerEmail: 'sin-arroba' }).customerEmail).toBe('page.quotes.error.customerEmail.invalid');
    expect(check({ ...valid(), customerEmail: 'a@b.com' })).toEqual({});
    expect(check({ ...valid(), customerEmail: '' })).toEqual({});
  });
  test('la fecha: real, no futura y dentro del límite de edición', () => {
    expect(check({ ...valid(), date: '2026-02-30' }).date).toBe('page.quotes.error.date.invalid');
    expect(check({ ...valid(), date: '2026-11-19' }).date).toBe('page.quotes.error.date.future');
    expect(check({ ...valid(), date: '2026-10-01' }, [LINE], { timeQuote: 30, now: NOW }).date).toBe('page.quotes.error.date.expired');
    expect(check({ ...valid(), date: '2026-10-19' }, [LINE], { timeQuote: 30, now: NOW })).toEqual({});
  });
  test('más de 500 líneas se rechaza; 500 pasa', () => {
    expect(check(valid(), Array.from({ length: 501 }, () => LINE)).details).toBe('page.quotes.error.details.max');
    expect(check(valid(), Array.from({ length: 500 }, () => LINE))).toEqual({});
  });
});

describe('validar una línea', () => {
  test.each([
    [{ productCode: '' }, 'page.quotes.error.line.product'], [{ unitId: 0 }, 'page.quotes.error.line.unit'], [{ qty: 0 }, 'page.quotes.error.line.qty'],
    [{ qty: 1.234 }, 'page.quotes.error.line.qty'], [{ qty: 1000000 }, 'page.quotes.error.line.qty'], [{ price: 0 }, 'page.quotes.error.line.price'],
    [{ discountPercent: 101 }, 'page.quotes.error.line.discount'], [{ taxPercent: -1 }, 'page.quotes.error.line.tax']
  ])('%j -> %s', (extra, id) => { expect(validateLine({ ...LINE, ...extra })).toBe(id); });
  test('cantidad con 2 decimales, descuento 100 e impuesto 15 son válidos', () => {
    expect(validateLine({ ...LINE, qty: 1.25, discountPercent: 100, taxPercent: 15 })).toBeNull();
  });
});

describe('cuerpo del POST/PUT', () => {
  test('el encabezado solo lleva los campos del cliente y las líneas lo que decide el usuario (sin importes, estado ni usuarios)', () => {
    const payload = buildQuotePayload({ ...valid(), total: 99, subtotal: 9, status: false, id: 4, customerName: ' Ana ' }, [{ ...LINE, subtotal: 5, total: 5, taxValue: 1, id: 9, quoteId: 2 }]);
    expect(Object.keys(payload).sort()).toEqual(['customerAddress', 'customerCode', 'customerEmail', 'customerId', 'customerName', 'customerPhone', 'date', 'deliveryTime', 'details', 'notes', 'paymentTerms', 'sellerId', 'storeId']);
    expect(payload.customerName).toBe('Ana');
    expect(Object.keys(payload.details[0]).sort()).toEqual(['discountPercent', 'expirationDate', 'lotCode', 'price', 'priceType', 'productCode', 'qty', 'taxPercent', 'tempCode', 'unitId']);
  });
  test('tipo de precio 2 por defecto, fecha de salida vacía a null y números reales', () => {
    expect(buildLinePayload({ productCode: ' A ', unitId: '6', qty: '2', price: '10', discountPercent: '5', taxPercent: '15', expirationDate: '2027-01-31T00:00:00Z' }))
      .toMatchObject({ productCode: 'A', unitId: 6, qty: 2, price: 10, discountPercent: 5, taxPercent: 15, priceType: 2, expirationDate: '2027-01-31' });
    expect(buildLinePayload({ ...LINE }).expirationDate).toBeNull();
    expect(buildLinePayload({ ...LINE }).taxPercent).toBeUndefined();
  });
});

describe('cargar del back', () => {
  test('formFromQuote quita los null y deja la fecha como texto', () => {
    const form = formFromQuote({ id: 7, date: '2026-11-10T00:00:00.000Z', customerPhone: null, notes: undefined, customerName: 'Ana', total: '230.00000' });
    expect(form).toMatchObject({ id: 7, date: '2026-11-10', customerPhone: '', notes: '', customerName: 'Ana', sellerId: 0 });
    Object.values(form).forEach((value) => expect(value).not.toBeNull());
  });
  test('lineFromApi pone el nombre del producto y de la unidad, números reales y una clave estable', () => {
    const row = lineFromApi({ id: 3, productCode: 'A', qty: '2.00', price: '100.00000', taxPercent: '15.00000', productData: { name: 'UNO' }, unitData: { name: 'CAJA' } });
    expect(row).toMatchObject({ productName: 'UNO', unitProd: 'CAJA', qty: 2, price: 100, taxPercent: 15, productTax: 15, tempCode: 'L3' });
    expect(lineFromApi({ taxPercent: '0.00000' }).productTax).toBe(0);
    expect(lineFromApi({ tempCode: 'abc' }).tempCode).toBe('abc');
  });
});

describe('línea nueva desde un producto del selector', () => {
  const product = { productCode: 'P1', productName: 'Uno', undoutId: 6, undoutName: 'CAJA', valChange: 12, min: 90, med: 115, max: 130, percentTax: 15, includeTaxPrice: true, stock: 5 };
  test('el precio inicial es el medio sin el ISV incluido (115 / 1.15 = 100) y se calcula con el impuesto del producto', () => {
    expect(lineFromProduct(product, 'T1')).toMatchObject({ tempCode: 'T1', productCode: 'P1', unitId: 6, productTax: 15, price: 100, qty: 1, taxPercent: 15, subtotal: 100, taxValue: 15, total: 115, priceType: 2, minPrice: 90, midPrice: 115, maxPrice: 130 });
  });
  test('sin ISV incluido el precio es el medio tal cual', () => {
    expect(lineFromProduct({ ...product, includeTaxPrice: false, percentTax: 0 }, 'T2')).toMatchObject({ price: 115, taxValue: 0, total: 115 });
  });
  test('priceChoices: los tres precios del producto sin el ISV incluido; sin precios en 0', () => {
    expect(priceChoices({ min: 103.5, med: 115, max: 0, includeTaxPrice: true, taxPercent: 15 })).toEqual([90, 100]);
    expect(priceChoices({ minPrice: 10, midPrice: 20, maxPrice: 30, taxPercent: 0 })).toEqual([10, 20, 30]);
  });
});
