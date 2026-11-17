import { describe, expect, test } from 'vitest';
import { PRINT_PATH, PRINT_FILE_NAME, printOptions } from './requisitionPrintRules';
import { buildPrintRequest, canPrint } from '@Helpers/printDocument';

describe('impresión de Requisiciones (SPEC v2-52-sr)', () => {
  test('ruta y nombre de archivo del back', () => {
    expect(PRINT_PATH).toBe('inventory/process/requisitions');
    expect(PRINT_FILE_NAME).toBe('Requisicion.pdf');
  });

  test('un solo GET a /:id/print, sin cuerpo ni parámetros', () => {
    expect(buildPrintRequest(printOptions(12))).toEqual({ url: 'inventory/process/requisitions/12/print', params: undefined });
  });

  test('sin requisición guardada (id 0) no se imprime', () => {
    expect(canPrint(printOptions(0).id)).toBe(false);
    expect(canPrint(printOptions(12).id)).toBe(true);
  });

  test('ya no usa el POST exportPDFRequisition', () => {
    expect(JSON.stringify(printOptions(1))).not.toContain('exportPDFRequisition');
  });
});
