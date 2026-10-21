import { describe, it, expect } from 'vitest';
import { validateStoreProduct, buildStoreProductPayload, rowToForm, findExistingAssignment, MAX_QTY, MAX_PRODUCT_CODE, DEFAULT_LOCATION_ID } from './storesProductsRules';

// Los casos y los números son los mismos de modules/inventory/productsStore/__tests__/ProductStoreDTO.test.js y
// ProductStoreService.records.test.js del back.
const VALID = { storeId: 3, productCode: 'HPL-00001', locationId: 1, qtyMin: 0, qtyMax: 0, status: true };

describe('almacén y producto (obligatorios al crear)', () => {
  it('el formulario válido no tiene errores', () => {
    expect(validateStoreProduct(VALID)).toEqual({});
  });

  it.each([['ausente', undefined], ['cero', 0], ['vacío', ''], ['negativo', -1], ['decimal', 1.5], ['texto', 'abc']])(
    'storeId %s se rechaza', (_, storeId) => {
      expect(validateStoreProduct({ ...VALID, storeId }).storeId).toBe('msg.required.select.warehouse');
    }
  );

  it('storeId como string numérico es válido', () => {
    expect(validateStoreProduct({ ...VALID, storeId: '7' }).storeId).toBeUndefined();
  });

  it.each([['ausente', undefined], ['vacío', ''], ['solo espacios', '   '], ['"0" del combo sin selección', '0']])(
    'productCode %s se rechaza', (_, productCode) => {
      expect(validateStoreProduct({ ...VALID, productCode }).productCode).toBe('msg.required.select.product');
    }
  );

  it('productCode de 20 caracteres es válido y de 21 se rechaza', () => {
    expect(validateStoreProduct({ ...VALID, productCode: 'x'.repeat(MAX_PRODUCT_CODE) }).productCode).toBeUndefined();
    expect(validateStoreProduct({ ...VALID, productCode: 'x'.repeat(MAX_PRODUCT_CODE + 1) }).productCode).toBe('msg.required.select.product');
  });

  it('al editar no se validan (son inmutables)', () => {
    expect(validateStoreProduct({ ...VALID, storeId: 0, productCode: '' }, { isEditing: true })).toEqual({});
  });
});

describe('ubicación', () => {
  it.each([[undefined], [''], [null], [0], ['0']])('%p equivale a la de por defecto y no es error', (locationId) => {
    expect(validateStoreProduct({ ...VALID, locationId }).locationId).toBeUndefined();
  });

  it.each([[-2], [1.5], ['x']])('%p no es una ubicación válida', (locationId) => {
    expect(validateStoreProduct({ ...VALID, locationId }).locationId).toBe('msg.required.select.location');
  });
});

describe('cantidades mínima y máxima', () => {
  it.each(['qtyMin', 'qtyMax'])('%s: vacío, 0, 10, 2 decimales y el tope son válidos', (field) => {
    ['', undefined, null, 0, '0', 10, '10.5', 12.25, String(MAX_QTY)].forEach((value) => {
      expect(validateStoreProduct({ ...VALID, [field]: value })[field]).toBeUndefined();
    });
  });

  it.each(['qtyMin', 'qtyMax'])('%s: negativo, 3 decimales, texto y coma se rechazan', (field) => {
    [-1, '-0.5', '1.234', 'abc', '1,5'].forEach((value) => {
      expect(validateStoreProduct({ ...VALID, [field]: value })[field]).toBe('page.storesProducts.error.qtyFormat');
    });
  });

  it.each(['qtyMin', 'qtyMax'])('%s: sobre el tope se rechaza', (field) => {
    expect(validateStoreProduct({ ...VALID, [field]: '1000000000000.00' })[field]).toBe('page.storesProducts.error.qtyTooBig');
  });
});

describe('máximo contra mínimo (regla nueva)', () => {
  it('máximo menor que el mínimo, ambos mayores que 0, se rechaza en el máximo', () => {
    expect(validateStoreProduct({ ...VALID, qtyMin: 10, qtyMax: 5 }).qtyMax).toBe('page.storesProducts.error.qtyRange');
  });

  it.each([[0, 5], [5, 0], [5, 5], [5, 10], [0, 0], ['', 3]])('mínimo %p y máximo %p son válidos', (qtyMin, qtyMax) => {
    expect(validateStoreProduct({ ...VALID, qtyMin, qtyMax })).toEqual({});
  });

  it('si el máximo ya tiene un error de formato no se suma el del rango', () => {
    expect(validateStoreProduct({ ...VALID, qtyMin: 10, qtyMax: '1.234' }).qtyMax).toBe('page.storesProducts.error.qtyFormat');
  });
});

describe('buildStoreProductPayload', () => {
  it('al crear lleva almacén y producto como número y texto, y nunca stock ni id', () => {
    const payload = buildStoreProductPayload({ ...VALID, id: 0, stock: 99, storeId: '3', productCode: ' HPL-1 ', qtyMin: '1.5', qtyMax: '10' });
    expect(payload).toEqual({ storeId: 3, productCode: 'HPL-1', locationId: 1, qtyMin: 1.5, qtyMax: 10, status: 1 });
    expect(payload).not.toHaveProperty('stock');
    expect(payload).not.toHaveProperty('id');
  });

  it('al editar no lleva almacén ni producto', () => {
    const payload = buildStoreProductPayload({ ...VALID, id: 5 }, { isEditing: true });
    expect(payload).not.toHaveProperty('storeId');
    expect(payload).not.toHaveProperty('productCode');
    expect(payload).toEqual({ locationId: 1, qtyMin: 0, qtyMax: 0, status: 1 });
  });

  it('ubicación vacía o 0 se envía como la de por defecto', () => {
    expect(buildStoreProductPayload({ ...VALID, locationId: '' }).locationId).toBe(DEFAULT_LOCATION_ID);
    expect(buildStoreProductPayload({ ...VALID, locationId: 0 }).locationId).toBe(DEFAULT_LOCATION_ID);
    expect(buildStoreProductPayload({ ...VALID, locationId: '2' }).locationId).toBe(2);
  });

  it('cantidades vacías se envían como 0 y el status se normaliza a 0 o 1', () => {
    const payload = buildStoreProductPayload({ ...VALID, qtyMin: '', qtyMax: null, status: false });
    expect(payload).toMatchObject({ qtyMin: 0, qtyMax: 0, status: 0 });
    expect(buildStoreProductPayload({ ...VALID, status: 1 }).status).toBe(1);
    expect(buildStoreProductPayload({ ...VALID, status: '0' }).status).toBe(0);
  });
});

describe('rowToForm', () => {
  it('toma la fila del back con productCode y el status como booleano', () => {
    const row = { id: 9, storeId: 2, productCode: 'HPL-2', locationId: 1, stock: '5.00000', qtyMin: '1.00', qtyMax: '4.00', status: 1, storeData: { name: 'X' } };
    expect(rowToForm(row)).toEqual({ id: 9, storeId: 2, productCode: 'HPL-2', locationId: 1, stock: '5.00000', qtyMin: '1.00', qtyMax: '4.00', status: true });
  });

  it('una fila sin datos da el formulario vacío con la ubicación por defecto', () => {
    expect(rowToForm(undefined)).toEqual({ id: 0, storeId: 0, productCode: '', locationId: 1, stock: 0, qtyMin: 0, qtyMax: 0, status: false });
  });
});

describe('findExistingAssignment (búsqueda con F1)', () => {
  const rows = [
    { id: 1, storeId: 3, productCode: 'HPL-00001' },
    { id: 2, storeId: 3, productCode: 'HPL-000010' },
    { id: 3, storeId: 4, productCode: 'HPL-00001' }
  ];

  it('encuentra la fila exacta de ese almacén y ese código (no la de otro almacén ni un código parecido)', () => {
    expect(findExistingAssignment(rows, 3, 'HPL-00001').id).toBe(1);
    expect(findExistingAssignment(rows, '4', ' HPL-00001 ').id).toBe(3);
  });

  it('sin coincidencia exacta devuelve null', () => {
    expect(findExistingAssignment(rows, 5, 'HPL-00001')).toBeNull();
    expect(findExistingAssignment(rows, 3, 'HPL-0000')).toBeNull();
  });

  it('sin almacén, sin código o sin filas devuelve null', () => {
    expect(findExistingAssignment(rows, 0, 'HPL-00001')).toBeNull();
    expect(findExistingAssignment(rows, undefined, 'HPL-00001')).toBeNull();
    expect(findExistingAssignment(rows, 3, '')).toBeNull();
    expect(findExistingAssignment(undefined, 3, 'HPL-00001')).toBeNull();
  });
});
