import { describe, expect, test } from 'vitest';
import { PRINT_PATH, PRINT_FILE_NAME, printOptions } from './refundPrintRules';
import { buildPrintRequest, canPrint } from '@Helpers/printDocument';

describe('impresión de Reintegros (SPEC v2-53-sr)', () => {
  test('ruta y nombre de archivo del back', () => {
    expect(PRINT_PATH).toBe('inventory/process/refunds');
    expect(PRINT_FILE_NAME).toBe('Ingreso y Reintegro.pdf');
  });

  test('un solo GET a /:id/print, sin cuerpo ni parámetros', () => {
    expect(buildPrintRequest(printOptions(12))).toEqual({ url: 'inventory/process/refunds/12/print', params: undefined });
  });

  test('sin reintegro guardado (id 0) no se imprime', () => {
    expect(canPrint(printOptions(0).id)).toBe(false);
    expect(canPrint(printOptions(12).id)).toBe(true);
  });

  test('ya no usa el POST exportPDFRequisition', () => {
    expect(JSON.stringify(printOptions(1))).not.toContain('exportPDFRequisition');
  });
});
