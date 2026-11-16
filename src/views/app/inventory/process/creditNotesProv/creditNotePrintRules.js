// Impresión de la nota de crédito de proveedor (SPEC v2-48-sr): GET sin cuerpo desde lo guardado en DB. Sin nota guardada no se llama al
// back (`printDocument` avisa "guarde primero"); una nota anulada se imprime con la marca ANULADO.
export const PRINT_PATH = 'inventory/process/creditNotes';
export const PRINT_FILE_NAME = 'Nota de Credito.pdf';

export const printOptions = (id) => ({ path: PRINT_PATH, id, fileName: PRINT_FILE_NAME });
