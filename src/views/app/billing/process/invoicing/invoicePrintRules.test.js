import { describe, expect, test } from 'vitest';
import { buildPrintRequest } from '@Helpers/printDocument';
import { invoicePrintOptions, proformaPrintOptions, deliveryPrintOptions, canDeliver, emailUrl, PRINT_PATH } from './invoicePrintRules';

describe('invoicePrintRules', () => {
  test('factura: formato por defecto Detallada y sin moneda salvo que se pida una válida', () => {
    expect(invoicePrintOptions({ id: 5 }).query).toEqual({ format: 'detailed', currency: undefined });
    expect(invoicePrintOptions({ id: 5, format: 'byType', currency: '2' }).query).toEqual({ format: 'byType', currency: '2' });
    expect(invoicePrintOptions({ id: 5, format: 'xml', currency: '9' }).query).toEqual({ format: 'detailed', currency: undefined });
  });

  test('arma la URL del back con GET y los parámetros por query (sin moneda cuando no se pide)', () => {
    const request = buildPrintRequest(invoicePrintOptions({ id: 5, format: 'byType' }));
    expect(request.url).toBe('billing/process/invoicing/5/print');
    expect(request.params).toEqual({ format: 'byType' });
    expect(buildPrintRequest(invoicePrintOptions({ id: 5, currency: 2 })).params).toEqual({ format: 'detailed', currency: '2' });
  });

  test('proforma y entrega usan su sufijo y su nombre de archivo, sin query', () => {
    expect(buildPrintRequest(proformaPrintOptions({ id: 7 }))).toEqual({ url: `${PRINT_PATH}/7/proforma`, params: undefined });
    expect(buildPrintRequest(deliveryPrintOptions({ id: 7 }))).toEqual({ url: `${PRINT_PATH}/7/delivery`, params: undefined });
    expect(proformaPrintOptions({ id: 7 }).fileName).toBe('Proforma.pdf');
    expect(deliveryPrintOptions({ id: 7 }).fileName).toBe('Documento de Entrega.pdf');
  });

  test('la entrega exige factura guardada con documento fiscal', () => {
    expect(canDeliver({ id: 0, documentId: 3 })).toBe(false);
    expect(canDeliver({ id: 5, documentId: 0 })).toBe(false);
    expect(canDeliver({ id: 5, documentId: 3 })).toBe(true);
  });

  test('el correo va a la ruta de la factura', () => {
    expect(emailUrl(5)).toBe('billing/process/invoicing/5/email');
  });
});
