// Impresión del reintegro (SPEC v2-53-sr). El back imprime lo GUARDADO por GET (un POST exigiría el permiso de crear), así que sin
// reintegro guardado no se llama al back (`printDocument` avisa "guarde primero").
export const PRINT_PATH = 'inventory/process/refunds';
export const PRINT_FILE_NAME = 'Ingreso y Reintegro.pdf';

export const printOptions = (id) => ({ path: PRINT_PATH, id, suffix: 'print', fileName: PRINT_FILE_NAME });
