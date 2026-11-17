import { describe, expect, test } from 'vitest';
import { PRINT_PATH, PRINT_FILE_NAME, printOptions } from './adjustmentPrintRules';
import { buildPrintRequest, canPrint } from '@Helpers/printDocument';

describe('impresión de Ajustes (SPEC v2-54-sr)', () => {
  test('ruta y nombre de archivo del back', () => {
    expect(PRINT_PATH).toBe('inventory/process/adjustments');
    expect(PRINT_FILE_NAME).toBe('Inventario Fisico.pdf');
  });

  test('un solo GET a /:id/print, sin cuerpo ni parámetros', () => {
    expect(buildPrintRequest(printOptions(12))).toEqual({ url: 'inventory/process/adjustments/12/print', params: undefined });
  });

  test('sin ajuste guardado (id 0) no se imprime', () => {
    expect(canPrint(printOptions(0).id)).toBe(false);
    expect(canPrint(printOptions(12).id)).toBe(true);
  });

  test('ya no usa el POST exportPDFRequisition retirado', () => {
    expect(JSON.stringify(printOptions(1))).not.toContain('exportPDFRequisition');
  });
});
