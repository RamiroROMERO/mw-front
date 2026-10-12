import { describe, it, expect } from 'vitest';
import { buildDocumentSignature, getAuxiliariesStatus, AUXILIARIES_MESSAGES } from './checkAuxiliariesRules';

const header = { date: '2026-10-12', bankCode: 'BAC', providerId: 7, providerName: 'X', checkNumber: 99, value: '1000.0000', referenceCode: '', exchangeRate: '1.0000', currencyName: 'Lempiras' };
const lines = [
  { idCtaCont: '6010', description: 'A', valueDebit: '300.5000', valueCredit: '0.0000', customerId: 5, providerId: 0, referenceCode: '' },
  { idCtaCont: '1010', description: 'B', valueDebit: 0, valueCredit: 300.5, customerId: 0, providerId: 7, referenceCode: 'R' }
];

describe('buildDocumentSignature', () => {
  it('es igual con números como texto o como número', () => {
    const typed = [{ ...lines[0], valueDebit: 300.5, valueCredit: 0 }, lines[1]];
    expect(buildDocumentSignature({ ...header, value: 1000, exchangeRate: 1 }, typed)).toBe(buildDocumentSignature(header, lines));
  });

  it('cambia si cambia la fecha del cheque', () => {
    expect(buildDocumentSignature({ ...header, date: '2026-10-13' }, lines)).not.toBe(buildDocumentSignature(header, lines));
  });

  it.each([
    ['el beneficiario', { providerName: 'OTRO' }],
    ['el valor', { value: 999 }],
    ['el número de cheque', { checkNumber: 100 }],
    ['el proveedor del encabezado', { providerId: 99 }]
  ])('no cambia si cambia %s (el back no los lee; la pantalla reescribe el beneficiario al cargar)', (_label, change) => {
    expect(buildDocumentSignature({ ...header, ...change }, lines)).toBe(buildDocumentSignature(header, lines));
  });

  it.each([
    ['el cliente', 0, { customerId: 9 }],
    ['el proveedor', 1, { providerId: 8 }],
    ['el débito', 0, { valueDebit: 1 }],
    ['la cuenta', 1, { idCtaCont: '9999' }]
  ])('cambia si cambia %s de una línea', (_label, index, change) => {
    const changed = lines.map((l, i) => (i === index ? { ...l, ...change } : l));
    expect(buildDocumentSignature(header, changed)).not.toBe(buildDocumentSignature(header, lines));
  });

  it('cambia si se quita una línea', () => {
    expect(buildDocumentSignature(header, lines.slice(0, 1))).not.toBe(buildDocumentSignature(header, lines));
  });

  it('tolera cabecera y líneas vacías', () => {
    expect(() => buildDocumentSignature(undefined, undefined)).not.toThrow();
  });
});

describe('getAuxiliariesStatus', () => {
  const same = buildDocumentSignature(header, lines);
  const base = { id: 12, isVoided: false, savedSignature: same, currentSignature: same };

  it('guardado, sin anular y sin cambios: ok', () => expect(getAuxiliariesStatus(base)).toBe('ok'));
  it.each([[0], [null], [undefined], ['']])('id %p: saveFirst', (id) => expect(getAuxiliariesStatus({ ...base, id })).toBe('saveFirst'));
  it('anulado: voided (antes que los cambios)', () => {
    expect(getAuxiliariesStatus({ ...base, isVoided: true, currentSignature: 'otra' })).toBe('voided');
  });
  it('con cambios sin guardar: unsaved', () => expect(getAuxiliariesStatus({ ...base, currentSignature: 'otra' })).toBe('unsaved'));
  it('cada estado distinto de ok tiene mensaje', () => {
    ['saveFirst', 'voided', 'unsaved'].forEach((s) => expect(typeof AUXILIARIES_MESSAGES[s]).toBe('string'));
  });
});
