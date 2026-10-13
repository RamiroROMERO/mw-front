// Puente entre la pantalla de Conciliación y el cálculo de totales del back (SPEC v2-33). La fórmula vive solo en
// el back (modules/banks/bankConciliation/calculateTotals.js): acá únicamente se arma lo que se envía
// (las marcas y los dos saldos) y se adapta la respuesta al panel. Helpers puros, sin dependencias.

export const DEBOUNCE_MS = 300;

const zeroCategory = () => ({ book: 0, bank: 0, diff: 0 });

// Valor que muestra el panel cuando no hay nada que calcular (sin conciliación o sin documentos cargados).
export const emptyTotals = () => ({
  checks: zeroCategory(),
  deposits: zeroCategory(),
  creditNotes: zeroCategory(),
  debitNotes: zeroCategory(),
  transfers: zeroCategory(),
  annulledChecksBook: 0,
  adjBook: 0,
  adjBank: 0,
  finalDifference: 0
});

const toNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

// Sin documentos cargados no hay nada marcado: las categorías quedan en 0 y los saldos ajustados son los
// saldos del encabezado (sin conciliación seleccionada, todo en 0).
export const totalsWithoutLines = ({ id, valueBank = 0, valueBook = 0 }) => {
  const totals = emptyTotals();
  if (!(Number(id) > 0)) return totals;
  const bank = toNumber(valueBank);
  const book = toNumber(valueBook);
  return { ...totals, adjBook: book, adjBank: bank, finalDifference: Math.round((book - bank) * 100) / 100 };
};

// Cuerpo de POST /conciliations/:id/totals. Solo viajan el id y las dos marcas de cada línea y los saldos:
// los montos y fechas el back los toma de la DB.
export const buildTotalsBody = ({ lines = [], valueBank = 0, valueBook = 0 }) => ({
  valueBank: toNumber(valueBank),
  valueBook: toNumber(valueBook),
  marks: lines.map((l) => ({ id: l.id, isConBank: !!l.isConBank, isConBook: !!l.isConBook }))
});

// Sin conciliación seleccionada o sin documentos cargados no se consulta (el back leería de DB las marcas que
// otras conciliaciones dejaron en bco_book, y la pantalla no las está mostrando).
export const shouldFetchTotals = ({ id, lines }) => Number(id) > 0 && Array.isArray(lines) && lines.length > 0;

const pickCategory = (category = {}) => ({ book: toNumber(category.book), bank: toNumber(category.bank), diff: toNumber(category.diff) });

// Respuesta del back (`screen` es la fórmula de pantalla) -> forma que ya consume el panel.
export const toPanelTotals = (data) => {
  if (!data) return emptyTotals();
  const screen = data.screen || {};
  return {
    checks: pickCategory(data.checks),
    deposits: pickCategory(data.deposits),
    creditNotes: pickCategory(data.creditNotes),
    debitNotes: pickCategory(data.debitNotes),
    transfers: pickCategory(data.transfers),
    annulledChecksBook: toNumber(data.annulledChecksBook),
    adjBook: toNumber(screen.adjBook),
    adjBank: toNumber(screen.adjBank),
    finalDifference: toNumber(screen.finalDifference)
  };
};

export const PRINT_FORMATS = ['pdf', 'xlsx'];
const PRINT_FILE_NAME = 'Conciliacion Bancaria';

// Descarga del reporte con lo que hay en pantalla, guardado o no (SPEC v2-33). Va por POST con las marcas y
// los saldos en el body (el back los superpone a lo guardado; los montos salen de la DB). Sin documentos cargados
// no se mandan marcas y el back imprime lo guardado. El Excel trae las dos hojas, así que no lleva `type`.
export const buildPrintRequest = ({ id, type, format = 'pdf', lines = [], valueBank = 0, valueBook = 0 }) => {
  const isExcel = format === 'xlsx';
  const body = { format, ...(isExcel ? {} : { type }) };
  if (Array.isArray(lines) && lines.length > 0) Object.assign(body, buildTotalsBody({ lines, valueBank, valueBook }));
  return {
    url: `banks/process/conciliations/${id}/report`,
    data: body,
    fileName: `${PRINT_FILE_NAME}.${isExcel ? 'xlsx' : 'pdf'}`
  };
};
