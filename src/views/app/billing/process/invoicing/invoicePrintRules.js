// Reglas puras de la impresión de la factura de Facturación general (SPEC v2-74-sr). El back imprime siempre lo GUARDADO, así que el documento tiene que
// existir (id > 0); el formato y la moneda viajan por query y el correo por POST de solo lectura.
export const PRINT_PATH = 'billing/process/invoicing';

export const PRINT_FORMATS = ['detailed', 'byType'];
export const CURRENCIES = ['1', '2'];

export const INVOICE_FILE_NAME = 'Factura.pdf';
export const PROFORMA_FILE_NAME = 'Proforma.pdf';
export const DELIVERY_FILE_NAME = 'Documento de Entrega.pdf';

const isValidFormat = (format) => PRINT_FORMATS.includes(format);
const isValidCurrency = (currency) => CURRENCIES.includes(String(currency));

// Opciones de la factura: `format` (detailed | byType) y `currency` (1 Lempiras, 2 Dólares); lo inválido cae a Detallada y a la moneda de la factura (sin enviarla).
export const invoicePrintOptions = ({ id, format = 'detailed', currency } = {}) => ({
  path: PRINT_PATH,
  id,
  suffix: 'print',
  fileName: INVOICE_FILE_NAME,
  query: { format: isValidFormat(format) ? format : 'detailed', currency: isValidCurrency(currency) ? String(currency) : undefined }
});

export const proformaPrintOptions = ({ id } = {}) => ({ path: PRINT_PATH, id, suffix: 'proforma', fileName: PROFORMA_FILE_NAME });

export const deliveryPrintOptions = ({ id } = {}) => ({ path: PRINT_PATH, id, suffix: 'delivery', fileName: DELIVERY_FILE_NAME });

// El documento de entrega solo existe para una factura con documento fiscal (el back lo exige y rechaza con su mensaje).
export const canDeliver = ({ id, documentId } = {}) => Number(id) > 0 && Number(documentId) > 0;

export const emailUrl = (id) => `${PRINT_PATH}/${id}/email`;
