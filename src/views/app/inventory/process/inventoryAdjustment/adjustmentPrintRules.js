// Impresión del ajuste (SPEC v2-54-sr). El back imprime lo GUARDADO por GET (un POST exigiría el permiso de crear), así que sin ajuste
// guardado no se llama al back (`printDocument` avisa "guarde primero").
export const PRINT_PATH = 'inventory/process/adjustments';
export const PRINT_FILE_NAME = 'Inventario Fisico.pdf';

export const printOptions = (id) => ({ path: PRINT_PATH, id, suffix: 'print', fileName: PRINT_FILE_NAME });
