// Impresión de la Boleta de Compra (SPEC v2-40-sr): tres GET sobre lo guardado en DB (boleta, proforma y boleta vacía). Un POST exigiría
// el permiso de crear, por eso son GET sin cuerpo. Sin boleta guardada no se llama al back (`printDocument` avisa "guarde primero").
export const PRINT_PATH = 'inventory/process/ticketPurchase';

export const PRINT_KINDS = {
  ticket: { suffix: 'print', fileName: 'Boleta de Compra.pdf' },
  proforma: { suffix: 'proforma', fileName: 'Boleta Proforma.pdf' },
  empty: { suffix: 'empty', fileName: 'Boleta de Compra Vacia.pdf' }
};

export const printOptions = (id, kind = 'ticket') => {
  const { suffix, fileName } = PRINT_KINDS[kind] || PRINT_KINDS.ticket;
  return { path: PRINT_PATH, id, suffix, fileName };
};
