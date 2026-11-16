import { describe, expect, test } from 'vitest';
import { buildPrintRequest } from '@Helpers/printDocument';
import { PRINT_PATH, printOptions } from './ticketPrintRules';

describe('printOptions', () => {
  test.each([
    ['ticket', 'inventory/process/ticketPurchase/7/print', 'Boleta de Compra.pdf'],
    ['proforma', 'inventory/process/ticketPurchase/7/proforma', 'Boleta Proforma.pdf'],
    ['empty', 'inventory/process/ticketPurchase/7/empty', 'Boleta de Compra Vacia.pdf']
  ])('%s arma un GET sin cuerpo con su ruta y nombre de archivo', (kind, url, fileName) => {
    const options = printOptions(7, kind);
    expect(options.fileName).toBe(fileName);
    expect(options.path).toBe(PRINT_PATH);
    expect(buildPrintRequest(options)).toEqual({ url, params: undefined });
  });

  test('un tipo desconocido imprime la boleta', () => {
    expect(printOptions(7, 'otro').suffix).toBe('print');
  });
});
