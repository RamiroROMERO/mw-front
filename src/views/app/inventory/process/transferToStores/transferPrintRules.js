// Impresión del traslado (SPEC v2-51-sr). El back imprime lo GUARDADO por GET (un POST exigiría el permiso de crear),
// así que sin traslado guardado no se llama al back (`printDocument` avisa "guarde primero").
export const PRINT_PATH = 'inventory/process/transfers';
export const PRINT_FILE_NAME = 'Traslado entre Almacenes.pdf';

export const printOptions = (id) => ({ path: PRINT_PATH, id, suffix: 'print', fileName: PRINT_FILE_NAME });
