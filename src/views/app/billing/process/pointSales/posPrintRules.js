// Impresión de la factura del POS (SPEC v2-84-sr): por GET, desde lo guardado. El formato sale del de la sesión (1 ticket, 2 media carta, 3 carta); las copias, de la empresa.
export const POS_PRINT_PATH = 'billing/process/pointSales';

const FORMAT_BY_SESSION = { 1: 'ticket', 2: 'halfLetter', 3: 'letter' };
export const MAX_COPIES = 3;

export const formatFromSession = (printFormat) => FORMAT_BY_SESSION[Number(printFormat)] || 'ticket';

// Copias pedidas válidas (1 a 3) o nada: sin ellas el servidor usa las de la empresa.
export const validCopies = (copies) => {
  const value = Number(copies);
  return Number.isInteger(value) && value >= 1 && value <= MAX_COPIES ? value : undefined;
};

// El servidor imprime lo GUARDADO: la factura debe existir (id > 0).
export const canPrint = (id) => Number(id) > 0;

// Petición de impresión de la factura o del documento de entrega: solo sesión, formato y copias; nunca `userName` ni cifras.
export const buildPosPrintRequest = ({ id, sessionId, printFormat, copies, kind = 'print' }) => {
  const params = { sessionId };
  if (kind === 'print') {
    params.format = formatFromSession(printFormat);
    const valid = validCopies(copies);
    if (valid) params.copies = valid;
  }
  return { url: `${POS_PRINT_PATH}/${id}/${kind}`, params };
};
