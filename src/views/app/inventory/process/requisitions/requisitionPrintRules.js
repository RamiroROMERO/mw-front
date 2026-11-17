// Impresión de la requisición (SPEC v2-52-sr). El back imprime lo GUARDADO por GET (un POST exigiría el permiso de crear), así que sin
// requisición guardada no se llama al back (`printDocument` avisa "guarde primero").
export const PRINT_PATH = 'inventory/process/requisitions';
export const PRINT_FILE_NAME = 'Requisicion.pdf';

export const printOptions = (id) => ({ path: PRINT_PATH, id, suffix: 'print', fileName: PRINT_FILE_NAME });
