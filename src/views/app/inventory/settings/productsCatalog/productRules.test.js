import { describe, it, expect } from 'vitest';
import { validateProduct, buildProductPayload, MAX_CODE, MAX_NAME, MAX_DESCRIPTION } from './productRules';

// Los casos y los números son los mismos de modules/inventory/products/__tests__/ProductDTO.test.js y productRules.test.js del back.
const VALID = {
  code: 'ABC-00001', name: 'Arroz', description: '', typeId: 1, type: 1, packId: 2, undinId: 3, undoutId: 3, tradeId: 4, packQty: '1.0000',
  costValue: 10, typeCalculateCost: 3, typeCalculatePrice: 3, chargesTax: false, percentTax: 0
};

describe('un producto completo', () => {
  it('no tiene errores', () => {
    expect(validateProduct(VALID)).toEqual({});
  });
});

describe('code y name', () => {
  it.each([['ausente', undefined], ['vacío', ''], ['solo espacios', '   ']])('code %s se rechaza', (_, code) => {
    expect(validateProduct({ ...VALID, code }).code).toBe('msg.required.input.code');
  });

  it.each([['ausente', undefined], ['vacío', ''], ['solo espacios', '   ']])('name %s se rechaza', (_, name) => {
    expect(validateProduct({ ...VALID, name }).name).toBe('msg.required.input.name');
  });

  it('código de 20 pasa y de 21 se rechaza; los espacios de los extremos no cuentan', () => {
    expect(validateProduct({ ...VALID, code: 'A'.repeat(MAX_CODE) }).code).toBeUndefined();
    expect(validateProduct({ ...VALID, code: ` ${'A'.repeat(MAX_CODE)} ` }).code).toBeUndefined();
    expect(validateProduct({ ...VALID, code: 'A'.repeat(MAX_CODE + 1) }).code).toBe('page.productsCatalog.error.codeMax');
  });

  it('nombre y descripción de 120 pasan y de 121 se rechazan', () => {
    expect(validateProduct({ ...VALID, name: 'N'.repeat(MAX_NAME), description: 'D'.repeat(MAX_DESCRIPTION) })).toEqual({});
    expect(validateProduct({ ...VALID, name: 'N'.repeat(MAX_NAME + 1) }).name).toBe('page.productsCatalog.error.nameMax');
    expect(validateProduct({ ...VALID, description: 'D'.repeat(MAX_DESCRIPTION + 1) }).description).toBe('page.productsCatalog.error.descriptionMax');
  });
});

describe('ids obligatorios', () => {
  it.each([
    ['typeId', 'msg.required.select.classification2'], ['packId', 'msg.required.select.packaging'], ['undinId', 'msg.required.select.units'],
    ['undoutId', 'msg.required.select.units'], ['tradeId', 'msg.required.select.trademark']
  ])('%s en 0, vacío, negativo, decimal o texto se rechaza', (field, message) => {
    [0, '', '0', -1, 1.5, 'abc', undefined, null].forEach((v) => expect(validateProduct({ ...VALID, [field]: v })[field]).toBe(message));
    expect(validateProduct({ ...VALID, [field]: '7' })[field]).toBeUndefined();
  });

  it('type solo admite 1 y 2', () => {
    [0, 3, '', 'x', undefined].forEach((v) => expect(validateProduct({ ...VALID, type: v }).type).toBe('msg.required.radio.type'));
    expect(validateProduct({ ...VALID, type: 2 }).type).toBeUndefined();
  });

  it('packQty debe ser mayor a 0', () => {
    [0, '0', '0.0000', -1, '', 'x', undefined].forEach((v) => expect(validateProduct({ ...VALID, packQty: v }).packQty).toBe('page.productsCatalog.error.packQty'));
    expect(validateProduct({ ...VALID, packQty: '0.00001' }).packQty).toBeUndefined();
  });

  it.each(['typeCalculateCost', 'typeCalculatePrice'])('%s solo admite 1 a 3', (field) => {
    [0, 4, '', 'x', undefined].forEach((v) => expect(validateProduct({ ...VALID, [field]: v })[field]).toBe('msg.required.select.typeCalculatePrice'));
    [1, 2, 3, '2'].forEach((v) => expect(validateProduct({ ...VALID, [field]: v })[field]).toBeUndefined());
  });
});

describe('costo obligatorio salvo en servicios', () => {
  it('un producto con costo 0 se rechaza (también como texto)', () => {
    expect(validateProduct({ ...VALID, costValue: 0 }).costValue).toBe('msg.required.input.averageCost');
    expect(validateProduct({ ...VALID, costValue: '0.00000' }).costValue).toBe('msg.required.input.averageCost');
  });

  it('un servicio (type 2) con costo 0 pasa', () => {
    expect(validateProduct({ ...VALID, type: 2, costValue: 0 }).costValue).toBeUndefined();
  });

  it('un costo negativo o no numérico se rechaza aun en servicios', () => {
    expect(validateProduct({ ...VALID, type: 2, costValue: -1 }).costValue).toBe('page.productsCatalog.error.costInvalid');
    expect(validateProduct({ ...VALID, costValue: 'x' }).costValue).toBe('page.productsCatalog.error.costInvalid');
  });
});

describe('porcentaje de impuesto', () => {
  it.each([true, 1, '1'])('chargesTax %p con porcentaje 0 se rechaza', (chargesTax) => {
    expect(validateProduct({ ...VALID, chargesTax, percentTax: 0 }).percentTax).toBe('page.productsCatalog.error.percentTax');
  });

  it('con chargesTax y 15 o 18 pasa', () => {
    expect(validateProduct({ ...VALID, chargesTax: true, percentTax: '15.00' }).percentTax).toBeUndefined();
    expect(validateProduct({ ...VALID, chargesTax: true, percentTax: 18 }).percentTax).toBeUndefined();
  });

  it('sin chargesTax el porcentaje 0 pasa', () => {
    expect(validateProduct({ ...VALID, chargesTax: false, percentTax: 0 }).percentTax).toBeUndefined();
  });

  it('solo se admiten 0, 15 y 18', () => {
    [10, '12', -15, 'x'].forEach((v) => expect(validateProduct({ ...VALID, percentTax: v }).percentTax).toBe('page.productsCatalog.error.percentTax'));
  });
});

describe('buildProductPayload', () => {
  const FORM = { ...VALID, id: 0, status: 0, classification: 'X', tradeMark: 'X', submission: 'X', inputUnit: 'X', outputUnit: 'X', isDisabled: false, dateLastPurchase: 'x', taxValue: '1.5' };

  it('no envía los textos denormalizados, status ni campos de pantalla', () => {
    const payload = buildProductPayload(FORM, { isNew: true });
    ['id', 'status', 'classification', 'tradeMark', 'submission', 'inputUnit', 'outputUnit', 'dateLastPurchase', 'taxValue'].forEach((f) => expect(payload).not.toHaveProperty(f));
    expect(payload).toMatchObject({ code: 'ABC-00001', name: 'Arroz', packQty: '1.0000', isDisabled: 0, chargesTax: 0 });
  });

  it('un producto nuevo tiene como padre su propio código', () => {
    expect(buildProductPayload({ ...FORM, parentProduct: 0 }, { isNew: true }).parentProduct).toBe('ABC-00001');
    expect(buildProductPayload({ ...FORM, parentProduct: 'OTRO' }, { isNew: true }).parentProduct).toBe('ABC-00001');
  });

  it('al editar conserva el padre guardado y si falta usa el código', () => {
    expect(buildProductPayload({ ...FORM, parentProduct: 'PADRE-1' }).parentProduct).toBe('PADRE-1');
    expect(buildProductPayload({ ...FORM, parentProduct: '' }).parentProduct).toBe('ABC-00001');
  });

  it('recorta código y nombre', () => {
    const payload = buildProductPayload({ ...FORM, code: ' A1 ', name: ' Arroz ' });
    expect(payload).toMatchObject({ code: 'A1', name: 'Arroz' });
  });
});
