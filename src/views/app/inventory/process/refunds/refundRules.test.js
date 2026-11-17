import { describe, expect, test } from 'vitest';
import {
  APPLY_TO, DEFAULT_REINT_TYPE, REFUND_DOCUMENT, REINT_PROVIDER, REINT_STORE, buildRefundPayload, canOpenAddMany, ensureSelectedProvider,
  providerOptions, refundState, resetForType, validateRefund
} from './refundRules';

const TODAY = '2026-11-17';
const lines = [{ productCode: 'A', qty: 2, lotCode: '', expirationDate: '' }];
const provider = (over = {}) => ({
  documentCode: 'REI', date: '2026-11-10', sourceStoreId: 11, reintType: 1, providerId: 152, expirationDate: '2026-12-10', physicalNumber: 0, senderName: 'A', receiverName: 'B', ...over
});
const store = (over = {}) => ({
  documentCode: 'REI', date: '2026-11-10', sourceStoreId: 11, reintType: 2, assignStoreId: 7, applyTo: 'Inventario', physicalNumber: 0, senderName: 'A', receiverName: 'B', ...over
});
const errors = (form, details = lines) => validateRefund(form, details, { today: TODAY });

describe('constantes', () => {
  test('documento REI y tipo inicial "a proveedor" (780 de 783 reales)', () => {
    expect(REFUND_DOCUMENT).toBe('REI');
    expect(DEFAULT_REINT_TYPE).toBe(REINT_PROVIDER);
    expect(REINT_PROVIDER).toBe(1);
    expect(REINT_STORE).toBe(2);
    expect(APPLY_TO).toEqual(['Inventario', 'Costo', 'Gasto']);
  });
});

describe('validateRefund (mismos casos que RefundDTO del back)', () => {
  test('un formulario válido en cada modo no tiene errores', () => {
    expect(errors(provider())).toEqual({});
    expect(errors(store())).toEqual({});
  });

  test.each([['documentCode', ''], ['sourceStoreId', 0], ['date', '']])('%s vacío se marca en los dos modos', (field, value) => {
    expect(Object.keys(errors(provider({ [field]: value })))).toContain(field);
    expect(Object.keys(errors(store({ [field]: value })))).toContain(field);
  });

  test.each([[0], [3], [''], [undefined]])('tipo inválido (%p)', (value) => {
    expect(errors(provider({ reintType: value })).reintType).toBe('page.refunds.error.reintType');
  });

  test('fecha futura', () => {
    expect(errors(provider({ date: '2026-11-18', expirationDate: '2026-12-18' })).date).toBe('page.transfersToStores.error.dateFuture');
  });

  describe('modo proveedor', () => {
    test('proveedor y vencimiento obligatorios', () => {
      expect(errors(provider({ providerId: 0 })).providerId).toBe('msg.required.select.provider');
      expect(errors(provider({ expirationDate: '' })).expirationDate).toBe('page.refunds.error.expirationRequired');
    });

    test('vencimiento menor que la fecha se rechaza; igual pasa', () => {
      expect(errors(provider({ expirationDate: '2026-11-09' })).expirationDate).toBe('page.refunds.error.expirationBeforeDate');
      expect(errors(provider({ expirationDate: '2026-11-10' })).expirationDate).toBeUndefined();
    });

    test('un destino y un "Aplicar a" vacíos o inválidos no se validan (el back los ignora)', () => {
      expect(errors(provider({ assignStoreId: 0, applyTo: 'Otro' }))).toEqual({});
    });
  });

  describe('modo almacén', () => {
    test('destino y "Aplicar a" obligatorios', () => {
      expect(errors(store({ assignStoreId: 0 })).assignStoreId).toBe('msg.required.select.destinationId');
      expect(errors(store({ applyTo: '' })).applyTo).toBe('page.transfersToStores.error.applyTo');
      expect(errors(store({ applyTo: 'Otro' })).applyTo).toBe('page.transfersToStores.error.applyTo');
    });

    test.each(APPLY_TO.map((v) => [v]))('"Aplicar a" %s es válido', (value) => {
      expect(errors(store({ applyTo: value })).applyTo).toBeUndefined();
    });

    test('destino igual al almacén del documento', () => {
      expect(errors(store({ assignStoreId: 11 })).assignStoreId).toBe('page.refunds.error.sameStores');
    });

    test('un proveedor y un vencimiento vacíos no se validan', () => {
      expect(errors(store({ providerId: 0, expirationDate: '' }))).toEqual({});
    });
  });

  test('máximos y número físico', () => {
    expect(errors(provider({ senderName: 'x'.repeat(51) })).senderName).toBeDefined();
    expect(errors(provider({ receiverName: 'x'.repeat(50) })).receiverName).toBeUndefined();
    expect(errors(provider({ physicalNumber: -1 })).physicalNumber).toBeDefined();
  });

  test('detalle obligatorio, máximo 200, cantidad > 0 y sin líneas repetidas', () => {
    expect(validateRefund(provider(), [], { today: TODAY }).details).toBe('msg.required.documentDetail');
    expect(validateRefund(provider(), Array.from({ length: 201 }, (_, i) => ({ productCode: `P${i}`, qty: 1 })), { today: TODAY }).details)
      .toBe('page.transfersToStores.error.tooManyLines');
    expect(validateRefund(provider(), [{ productCode: 'A', qty: 0 }], { today: TODAY }).details).toBe('msg.required.input.qty');
    expect(validateRefund(provider(), [{ productCode: 'A', qty: 1 }, { productCode: 'A', qty: 2 }], { today: TODAY }).details)
      .toBe('page.transfersToStores.error.duplicateLine');
  });
});

describe('buildRefundPayload', () => {
  test('modo proveedor: proveedor y vencimiento, sin destino ni "Aplicar a"', () => {
    const payload = buildRefundPayload(
      { ...provider(), id: 9, documentId: 4, pdaNumber: 3, isApplied: true, status: 0, assignStoreId: 7, applyTo: 'Gasto', assignCtaCode: 'x' },
      [{ productCode: ' A ', qty: '2', lotCode: ' L ', expirationDate: '1900-01-01', cost: 99, total: 1 }]
    );
    expect(payload).toEqual({
      documentCode: 'REI', date: '2026-11-10', sourceStoreId: 11, reintType: 1, physicalNumber: 0, notes: '', senderName: 'A', receiverName: 'B',
      providerId: 152, expirationDate: '2026-12-10', details: [{ productCode: 'A', qty: 2, lotCode: 'L', expirationDate: '' }]
    });
  });

  test('modo almacén: destino y "Aplicar a", sin proveedor ni vencimiento', () => {
    const payload = buildRefundPayload({ ...store(), providerId: 152, expirationDate: '2026-12-10' }, lines);
    expect(payload).toMatchObject({ reintType: 2, assignStoreId: 7, applyTo: 'Inventario' });
    expect(payload).not.toHaveProperty('providerId');
    expect(payload).not.toHaveProperty('expirationDate');
  });
});

describe('cambio de tipo', () => {
  test('a almacén descarta proveedor y vencimiento y arranca en Inventario', () => {
    expect(resetForType(2)).toEqual({ reintType: 2, providerId: 0, expirationDate: '', assignCtaCode: '', applyTo: 'Inventario' });
  });

  test('a proveedor descarta destino y "Aplicar a"', () => {
    expect(resetForType('1')).toEqual({ reintType: 1, assignStoreId: 0, applyTo: '', assignCtaCode: '' });
  });
});

describe('selector de proveedor', () => {
  test('providerOptions con RTN y nombre', () => {
    expect(providerOptions([{ id: '152', dni: '0801', name: 'IRON' }, { id: 5, dni: '', name: 'SIN RTN' }])).toEqual([
      { value: 152, label: '0801 - IRON' }, { value: 5, label: 'SIN RTN' }
    ]);
    expect(providerOptions(undefined)).toEqual([]);
  });

  test('el proveedor elegido sigue en las opciones aunque la búsqueda no lo traiga', () => {
    const options = [{ value: 1, label: 'A' }];
    expect(ensureSelectedProvider(options, 152, 'IRON')).toEqual([{ value: 152, label: 'IRON' }, { value: 1, label: 'A' }]);
    expect(ensureSelectedProvider(options, 1, 'A')).toBe(options);
    expect(ensureSelectedProvider(options, 0, '')).toBe(options);
  });
});

describe('agregar varios y estado', () => {
  test('solo pide el almacén del documento y que no esté bloqueado', () => {
    expect(canOpenAddMany({ sourceStoreId: 11, disabled: false })).toBe(true);
    expect(canOpenAddMany({ sourceStoreId: 0, disabled: false })).toBe(false);
    expect(canOpenAddMany({ sourceStoreId: 11, disabled: true })).toBe(false);
  });

  test('estado: guardado sin aplicar se puede contabilizar; aplicado se puede anular y queda bloqueado', () => {
    expect(refundState({ id: 5, isApplied: false, pdaNumber: 0, status: true })).toMatchObject({ canProcess: true, canVoid: false, locked: false });
    expect(refundState({ id: 5, isApplied: true, pdaNumber: 9, status: true })).toMatchObject({ canProcess: false, canVoid: true, locked: true });
    expect(refundState({ id: 5, status: false })).toMatchObject({ voided: true, locked: true });
  });
});
