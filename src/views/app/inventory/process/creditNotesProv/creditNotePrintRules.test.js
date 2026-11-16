import { describe, it, expect } from 'vitest';
import { PRINT_PATH, PRINT_FILE_NAME, printOptions } from './creditNotePrintRules';
import { buildPrintRequest, canPrint } from '@Helpers/printDocument';

describe('impresión de la nota de crédito de proveedor', () => {
  it('apunta a GET inventory/process/creditNotes/:id/print sin parámetros', () => {
    expect(buildPrintRequest(printOptions(12))).toEqual({ url: 'inventory/process/creditNotes/12/print', params: undefined });
    expect(PRINT_PATH).toBe('inventory/process/creditNotes');
  });
  it('el archivo se llama como lo manda el back', () => expect(PRINT_FILE_NAME).toBe('Nota de Credito.pdf'));
  it('una nota sin guardar (id 0) no se imprime', () => {
    expect(canPrint(0)).toBe(false);
    expect(canPrint(printOptions(0).id)).toBe(false);
    expect(canPrint(printOptions(12).id)).toBe(true);
  });
});
