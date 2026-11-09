import { describe, expect, test } from 'vitest';
import {
  LOCKED_FORM_FIELDS, NOT_PROCESSED, PROCESSING_REASONS, isFieldLocked, normalizeProcessing, reasonMessageIds, shouldFetchProcessing
} from './purchaseProcessingRules';

describe('shouldFetchProcessing', () => {
  test.each([[1], [5], ['7'], [3279]])('una compra guardada (%p) se consulta', (id) => {
    expect(shouldFetchProcessing(id)).toBe(true);
  });

  test.each([[0], ['0'], [-1], [null], [undefined], [''], ['abc'], [1.5], [NaN]])('sin compra guardada (%p) no se consulta', (id) => {
    expect(shouldFetchProcessing(id)).toBe(false);
  });
});

describe('normalizeProcessing', () => {
  test('una respuesta válida se conserva', () => {
    expect(normalizeProcessing({ isProcessed: true, reasons: ['posted', 'applied'] })).toEqual({ isProcessed: true, reasons: ['posted', 'applied'] });
  });

  test('los motivos salen en el orden fijo posted, applied, cxp', () => {
    expect(normalizeProcessing({ isProcessed: true, reasons: ['cxp', 'posted', 'applied'] }).reasons).toEqual(['posted', 'applied', 'cxp']);
  });

  test('un motivo desconocido se descarta', () => {
    expect(normalizeProcessing({ isProcessed: true, reasons: ['posted', 'otra'] }).reasons).toEqual(['posted']);
  });

  test('sin procesar: false y sin motivos', () => {
    expect(normalizeProcessing({ isProcessed: false, reasons: [] })).toEqual({ isProcessed: false, reasons: [] });
  });

  test('isProcessed solo es verdadero si viene exactamente true (no basta un texto ni un número)', () => {
    expect(normalizeProcessing({ isProcessed: 'true', reasons: ['posted'] }).isProcessed).toBe(false);
    expect(normalizeProcessing({ isProcessed: 1, reasons: ['posted'] }).isProcessed).toBe(false);
  });

  test('procesada sin motivos conocidos sigue procesada (el aviso no lista motivos)', () => {
    expect(normalizeProcessing({ isProcessed: true })).toEqual({ isProcessed: true, reasons: [] });
  });

  test.each([[null], [undefined], [[]], ['x'], [0], [true]])('una respuesta rara (%p) no bloquea nada', (data) => {
    expect(normalizeProcessing(data)).toBe(NOT_PROCESSED);
  });

  test('NOT_PROCESSED no se puede modificar', () => {
    expect(Object.isFrozen(NOT_PROCESSED)).toBe(true);
    expect(Object.isFrozen(NOT_PROCESSED.reasons)).toBe(true);
    expect(NOT_PROCESSED).toEqual({ isProcessed: false, reasons: [] });
  });
});

describe('isFieldLocked', () => {
  const processed = { isProcessed: true, reasons: ['posted'] };

  test.each(LOCKED_FORM_FIELDS)('%s se bloquea en una compra procesada', (field) => {
    expect(isFieldLocked(processed, field)).toBe(true);
  });

  test.each(['cai', 'requestedBy', 'documentCode', 'exemptedCertificate', 'importDai', 'otroCampo'])('%s sigue editable', (field) => {
    expect(isFieldLocked(processed, field)).toBe(false);
  });

  test.each(LOCKED_FORM_FIELDS)('%s no se bloquea en una compra sin procesar', (field) => {
    expect(isFieldLocked(NOT_PROCESSED, field)).toBe(false);
  });

  test('sin estado (undefined o null) no se bloquea nada', () => {
    expect(isFieldLocked(undefined, 'providerId')).toBe(false);
    expect(isFieldLocked(null, 'providerId')).toBe(false);
  });

  test('los campos bloqueados son los de la spec', () => {
    expect(LOCKED_FORM_FIELDS).toEqual(['providerId', 'invoiceNumber', 'storeId', 'paymentTypeId', 'date', 'dateOut', 'typeFp', 'purchaseOrderId']);
  });
});

describe('reasonMessageIds', () => {
  test('un id de traducción por motivo, en orden fijo', () => {
    expect(reasonMessageIds(['cxp', 'posted'])).toEqual(['page.purchases.processed.reason.posted', 'page.purchases.processed.reason.cxp']);
  });

  test('las tres', () => {
    expect(reasonMessageIds(PROCESSING_REASONS)).toEqual([
      'page.purchases.processed.reason.posted', 'page.purchases.processed.reason.applied', 'page.purchases.processed.reason.cxp'
    ]);
  });

  test('sin motivos o con motivos desconocidos devuelve vacío', () => {
    expect(reasonMessageIds([])).toEqual([]);
    expect(reasonMessageIds(undefined)).toEqual([]);
    expect(reasonMessageIds(['otra'])).toEqual([]);
  });
});
