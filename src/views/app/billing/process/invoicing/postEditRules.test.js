import { describe, expect, test } from 'vitest';
import {
  buildChangeProductBody, buildCostBody, buildInfoBody, buildInfoPatch, changedCostRows, regeneratesAccounting, validateChangeProduct, validateCostRows, validateInfoForm
} from './postEditRules';

// SPEC v2-72-sr: mismos casos que modules/billing/invoices/postEdit/__tests__/postEditRules.test.js del back.
const ORIGINAL = { customerDNI: '0801', customerName: 'Ana', notes: 'x', purchaseOrderNumber: '', exemptedCertificate: '', exemptedNumber: '', exemptedRecord: '', expirationDate: '2026-08-10', documentType: 1, isExonerated: false, sellerId: 2 };

describe('buildInfoPatch', () => {
  test('sin cambios el parche queda vacío', () => expect(buildInfoPatch(ORIGINAL, { ...ORIGINAL })).toEqual({}));

  test('solo manda lo que cambió y recorta espacios', () => {
    expect(buildInfoPatch(ORIGINAL, { ...ORIGINAL, customerName: ' Pedro ', notes: '' })).toEqual({ customerName: 'Pedro', notes: '' });
  });

  test('tipo de venta y exoneración', () => {
    expect(buildInfoPatch(ORIGINAL, { ...ORIGINAL, documentType: '2', isExonerated: true })).toEqual({ documentType: 2, isExonerated: true });
  });

  test('el vendedor solo si se eligió otro', () => {
    expect(buildInfoPatch(ORIGINAL, { ...ORIGINAL, sellerId: 2 })).toEqual({});
    expect(buildInfoPatch(ORIGINAL, { ...ORIGINAL, sellerId: 5 })).toEqual({ sellerId: 5 });
    expect(buildInfoPatch(ORIGINAL, { ...ORIGINAL, sellerId: 0 })).toEqual({});
  });

  test('el vencimiento se compara por día y vacío se manda como null', () => {
    expect(buildInfoPatch(ORIGINAL, { ...ORIGINAL, expirationDate: '2026-08-10T00:00:00' })).toEqual({});
    expect(buildInfoPatch(ORIGINAL, { ...ORIGINAL, expirationDate: '2026-09-09' })).toEqual({ expirationDate: '2026-09-09' });
    expect(buildInfoPatch(ORIGINAL, { ...ORIGINAL, expirationDate: '' })).toEqual({ expirationDate: null });
  });
});

describe('regeneratesAccounting y validateInfoForm', () => {
  test('solo el tipo de venta y la exoneración regeneran', () => {
    expect(regeneratesAccounting({ notes: 'a' })).toBe(false);
    expect(regeneratesAccounting({ documentType: 2 })).toBe(true);
    expect(regeneratesAccounting({ isExonerated: false })).toBe(true);
  });

  test('sin cambios, sin nombre o sin motivo cuando regenera', () => {
    expect(validateInfoForm(ORIGINAL, {}, '').patch).toBeDefined();
    expect(validateInfoForm(ORIGINAL, { customerName: '' }, '').customerName).toBeDefined();
    expect(validateInfoForm(ORIGINAL, { documentType: 2 }, '').reason).toBeDefined();
    expect(validateInfoForm(ORIGINAL, { documentType: 2 }, 'Pagó')).toEqual({});
    expect(validateInfoForm(ORIGINAL, { notes: 'a' }, '')).toEqual({});
  });

  test('exonerada exige la constancia y el motivo no pasa de 200', () => {
    expect(validateInfoForm({ ...ORIGINAL, isExonerated: true, exemptedCertificate: '' }, { isExonerated: true }, 'x').exemptedCertificate).toBeDefined();
    expect(validateInfoForm({ ...ORIGINAL, isExonerated: true, exemptedCertificate: 'EX' }, { isExonerated: true }, 'x'.repeat(201)).reason).toBeDefined();
  });

  test('el cuerpo lleva el motivo solo si se digitó', () => {
    expect(buildInfoBody({ notes: 'a' }, '')).toEqual({ notes: 'a' });
    expect(buildInfoBody({ notes: 'a' }, ' por qué ')).toEqual({ notes: 'a', reason: 'por qué' });
  });
});

describe('costo y distribución', () => {
  const rows = [{ id: 1, newCost: '2.5', newQtyDist: '10' }, { id: 2, newCost: '', newQtyDist: '5' }, { id: 3, newCost: '0', newQtyDist: '0' }];

  test('solo cuentan las filas con ambos valores', () => expect(changedCostRows(rows).map((row) => row.id)).toEqual([1]));

  test('valida filas y motivo', () => {
    expect(validateCostRows([], 'x')).toBe('page.invoicing.modal.editCostDist.msg.noChanges');
    expect(validateCostRows(rows, '')).toBe('page.invoicing.modal.postEdit.error.reason');
    expect(validateCostRows([{ id: 1, newCost: '-1', newQtyDist: '2' }], 'x')).toBe('page.invoicing.modal.postEdit.error.values');
    expect(validateCostRows(rows, 'Costo mal digitado')).toBeNull();
  });

  test('el cuerpo trae números y el motivo', () => {
    expect(buildCostBody(rows, ' Costo mal ')).toEqual({ rows: [{ id: 1, newCost: 2.5, newQtyDist: 10 }], reason: 'Costo mal' });
  });
});

describe('cambio de producto', () => {
  test('valida producto, que sea otro y el motivo', () => {
    expect(validateChangeProduct({ selectedCode: '', currentCode: 'A', reason: 'x' })).toBe('page.invoicing.modal.changeProduct.msg.selectProduct');
    expect(validateChangeProduct({ selectedCode: 'A', currentCode: 'A', reason: 'x' })).toBe('page.invoicing.modal.postEdit.error.sameProduct');
    expect(validateChangeProduct({ selectedCode: 'B', currentCode: 'A', reason: '' })).toBe('page.invoicing.modal.postEdit.error.reason');
    expect(validateChangeProduct({ selectedCode: 'B', currentCode: 'A', reason: 'Se equivocó' })).toBeNull();
  });

  test('el cuerpo', () => {
    expect(buildChangeProductBody({ detailId: 11, selectedCode: ' B ', reason: ' x ' })).toEqual({ detailId: 11, newProductCode: 'B', reason: 'x' });
  });
});

describe('edición posterior del POS (SPEC v2-83-sr)', () => {
  test('la ruta del POS y la sesión de caja en la consulta', async () => {
    const { POS_API_PATH, API_PATH, withSession } = await import('./postEditRules');
    expect(POS_API_PATH).toBe('billing/process/pointSales/postEdit');
    expect(API_PATH).toBe('billing/process/invoicePostEdit');
    expect(withSession('a/5/info', 9)).toBe('a/5/info?sessionId=9');
    expect(withSession('a/5/info?x=1', '9')).toBe('a/5/info?x=1&sessionId=9');
    expect(withSession('a/5/info', 0)).toBe('a/5/info');
    expect(withSession('a/5/info', undefined)).toBe('a/5/info');
  });
});
