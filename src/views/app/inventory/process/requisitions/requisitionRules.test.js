import { describe, expect, test } from 'vitest';
import {
  APPLY_TO, DEFAULT_APPLY_TO, REQUISITION_DOCUMENT, buildRequisitionPayload, detailsFromApi, employeeOptions, lineFromSelection, lineKey,
  mergeLine, requisitionState, validateRequisition
} from './requisitionRules';

const TODAY = '2026-11-17';
const form = (over = {}) => ({
  documentCode: 'REQ', date: '2026-11-10', sourceStoreId: 11, assignStoreId: 7, applyTo: 'Costo', physicalNumber: 0, senderName: 'A', receiverName: 'B', ...over
});
const lines = [{ productCode: 'A', qty: 2, lotCode: '', expirationDate: '', employeeId: 4 }];
const errors = (over, details = lines) => validateRequisition(form(over), details, { today: TODAY });

describe('constantes', () => {
  test('documento REQ y "Aplicar a" inicial Costo (85 % de las líneas reales)', () => {
    expect(REQUISITION_DOCUMENT).toBe('REQ');
    expect(DEFAULT_APPLY_TO).toBe('Costo');
    expect(APPLY_TO).toEqual(['Inventario', 'Costo', 'Gasto']);
  });
});

describe('validateRequisition (mismos casos que RequisitionDTO del back)', () => {
  test('un formulario válido no tiene errores', () => {
    expect(errors()).toEqual({});
  });

  test.each([['documentCode', ''], ['sourceStoreId', 0], ['assignStoreId', 0], ['date', '']])('%s vacío se marca', (field, value) => {
    expect(Object.keys(errors({ [field]: value }))).toContain(field);
  });

  test.each([[''], [undefined], [null], ['Otro'], ['costo']])('"Aplicar a" obligatorio y de la lista (%p)', (value) => {
    expect(errors({ applyTo: value }).applyTo).toBe('page.transfersToStores.error.applyTo');
  });

  test.each(APPLY_TO.map((v) => [v]))('"Aplicar a" %s es válido', (value) => {
    expect(errors({ applyTo: value }).applyTo).toBeUndefined();
  });

  test('un destino igual al origen NO se rechaza aquí (son tipos de almacén distintos; lo decide el back)', () => {
    expect(errors({ sourceStoreId: 5, assignStoreId: 5 }).assignStoreId).toBeUndefined();
  });

  test('fecha futura', () => {
    expect(errors({ date: '2026-11-18' }).date).toBe('page.transfersToStores.error.dateFuture');
    expect(errors({ date: TODAY }).date).toBeUndefined();
  });

  test('máximos de Enviado y Recibido por y número físico', () => {
    expect(errors({ senderName: 'x'.repeat(51) }).senderName).toBeDefined();
    expect(errors({ receiverName: 'x'.repeat(50) }).receiverName).toBeUndefined();
    expect(errors({ physicalNumber: -1 }).physicalNumber).toBeDefined();
  });

  test('detalle obligatorio, máximo 200, cantidad mayor que 0', () => {
    expect(validateRequisition(form(), [], { today: TODAY }).details).toBe('msg.required.documentDetail');
    expect(validateRequisition(form(), Array.from({ length: 201 }, (_, i) => ({ productCode: `P${i}`, qty: 1 })), { today: TODAY }).details)
      .toBe('page.transfersToStores.error.tooManyLines');
    expect(validateRequisition(form(), [{ productCode: 'A', qty: 0 }], { today: TODAY }).details).toBe('msg.required.input.qty');
  });

  test('mismo producto con distinto empleado NO es repetido; con el mismo empleado sí', () => {
    const two = (a, b) => validateRequisition(form(), [{ productCode: 'A', qty: 1, employeeId: a }, { productCode: 'A', qty: 1, employeeId: b }], { today: TODAY });
    expect(two(4, 5).details).toBeUndefined();
    expect(two(4, 4).details).toBe('page.requisitions.error.duplicateLine');
    expect(two(0, undefined).details).toBe('page.requisitions.error.duplicateLine');
  });
});

describe('llave de línea y mezcla', () => {
  test('incluye al empleado; sin empleado vale 0', () => {
    expect(lineKey({ productCode: 'A', employeeId: 4 })).not.toBe(lineKey({ productCode: 'A', employeeId: 5 }));
    expect(lineKey({ productCode: 'A' })).toBe(lineKey({ productCode: 'A', employeeId: 0 }));
    expect(lineKey({ productCode: ' A ', expirationDate: '1900-01-01' })).toBe(lineKey({ productCode: 'A', expirationDate: '' }));
  });

  test('mergeLine suma la cantidad del mismo producto y empleado, y recalcula el total', () => {
    const base = [{ productCode: 'A', qty: 2, cost: 10, total: 20, employeeId: 4 }];
    const merged = mergeLine(base, { productCode: 'A', qty: 3, cost: 10, total: 30, employeeId: 4 });
    expect(merged).toEqual([{ productCode: 'A', qty: 5, cost: 10, total: 50, employeeId: 4 }]);
    expect(base[0].qty).toBe(2);
  });

  test('mergeLine agrega la línea si el empleado es distinto', () => {
    const merged = mergeLine([{ productCode: 'A', qty: 2, cost: 10, total: 20, employeeId: 4 }], { productCode: 'A', qty: 1, cost: 10, total: 10, employeeId: 5 });
    expect(merged).toHaveLength(2);
  });

  test('sin ruido de coma flotante: 0.1 + 0.2', () => {
    expect(mergeLine([{ productCode: 'A', qty: 0.1, cost: 1, total: 0.1 }], { productCode: 'A', qty: 0.2, cost: 1, total: 0.2 })[0].qty).toBe(0.3);
  });
});

describe('buildRequisitionPayload', () => {
  test('manda solo lo que el back acepta; sin RRHH no manda empleado', () => {
    const payload = buildRequisitionPayload(
      { ...form(), id: 9, documentId: 4, pdaNumber: 3, isApplied: true, status: 0, originCtaCode: 'x', assignCtaCode: 'y', isWorkOrder: 1 },
      [{ productCode: ' A ', qty: '2', lotCode: ' L ', expirationDate: '1900-01-01', employeeId: 4, cost: 99, total: 1 }]
    );
    expect(payload).toEqual({
      documentCode: 'REQ', date: '2026-11-10', sourceStoreId: 11, assignStoreId: 7, applyTo: 'Costo', physicalNumber: 0, notes: '',
      senderName: 'A', receiverName: 'B', details: [{ productCode: 'A', qty: 2, lotCode: 'L', expirationDate: '' }]
    });
  });

  test('con RRHH manda el empleado de cada línea (0 si no hay)', () => {
    const payload = buildRequisitionPayload(form(), [{ productCode: 'A', qty: 1, employeeId: '4' }, { productCode: 'B', qty: 1 }], { withEmployees: true });
    expect(payload.details.map((d) => d.employeeId)).toEqual([4, 0]);
  });

  test('"Aplicar a" no se inventa: va como está en el formulario', () => {
    expect(buildRequisitionPayload(form({ applyTo: 'Gasto' }), lines).applyTo).toBe('Gasto');
  });
});

describe('detalle desde el back y selección', () => {
  test('detailsFromApi trae nombre, números, vencimiento vacío y el empleado', () => {
    const [line] = detailsFromApi([{ productCode: 'A', invProduct: { name: 'JABON' }, qty: '2.00000', cost: '10', total: '20', expirationDate: '1900-01-01', employeeId: 4, employeeName: 'Ana' }]);
    expect(line).toMatchObject({ nameProduct: 'JABON', qty: 2, cost: 10, total: 20, expirationDate: '', employeeId: 4, employeeName: 'Ana' });
  });

  test('sin empleado: 0 y vacío', () => {
    const [line] = detailsFromApi([{ productCode: 'A', qty: 1, cost: 1, total: 1 }]);
    expect(line).toMatchObject({ employeeId: 0, employeeName: '' });
    expect(detailsFromApi(undefined)).toEqual([]);
  });

  test('lineFromSelection arma la línea con el costo, el total a 5 decimales y el empleado', () => {
    const line = lineFromSelection({ productCode: 'A', name: 'JABON', cost: 3.33333 }, 3, { id: 4, name: 'Ana' });
    expect(line).toMatchObject({ productCode: 'A', nameProduct: 'JABON', qty: 3, cost: 3.33333, total: 9.99999, employeeId: 4, employeeName: 'Ana' });
    expect(lineFromSelection({ productCode: 'A', name: 'x', cost: 1 }, 1)).toMatchObject({ employeeId: 0, employeeName: '' });
  });

  test('employeeOptions con código y nombre', () => {
    expect(employeeOptions([{ id: '4', code: '0801', name: 'Ana' }, { id: 5, code: '', name: 'Luis' }])).toEqual([
      { value: 4, label: '0801 - Ana' }, { value: 5, label: 'Luis' }
    ]);
    expect(employeeOptions(undefined)).toEqual([]);
  });
});

describe('estado del documento (el de Traslados)', () => {
  test('guardado sin aplicar se puede contabilizar; aplicado se puede anular y queda bloqueado', () => {
    expect(requisitionState({ id: 5, isApplied: false, pdaNumber: 0, status: true })).toMatchObject({ canProcess: true, canVoid: false, locked: false });
    expect(requisitionState({ id: 5, isApplied: true, pdaNumber: 9, status: true })).toMatchObject({ canProcess: false, canVoid: true, locked: true });
    expect(requisitionState({ id: 5, status: false })).toMatchObject({ voided: true, locked: true });
  });
});
