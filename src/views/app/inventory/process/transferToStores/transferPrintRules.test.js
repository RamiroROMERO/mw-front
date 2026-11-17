import { describe, expect, test } from 'vitest';
import { PRINT_PATH, PRINT_FILE_NAME, printOptions } from './transferPrintRules';
import { buildPrintRequest, canPrint } from '@Helpers/printDocument';

describe('impresión de Traslados (SPEC v2-51-sr)', () => {
  test('ruta y nombre de archivo del back', () => {
    expect(PRINT_PATH).toBe('inventory/process/transfers');
    expect(PRINT_FILE_NAME).toBe('Traslado entre Almacenes.pdf');
  });

  test('un solo GET a /:id/print, sin cuerpo ni parámetros', () => {
    const request = buildPrintRequest(printOptions(12));
    expect(request).toEqual({ url: 'inventory/process/transfers/12/print', params: undefined });
  });

  test('sin traslado guardado (id 0) no se imprime', () => {
    expect(canPrint(printOptions(0).id)).toBe(false);
    expect(canPrint(printOptions(12).id)).toBe(true);
  });

  test('ya no usa el POST exportPDFRequisition', () => {
    expect(JSON.stringify(printOptions(1))).not.toContain('exportPDFRequisition');
  });
});
