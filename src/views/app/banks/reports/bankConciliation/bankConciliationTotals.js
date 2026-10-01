// Totales de pantalla de la Conciliación bancaria: réplica de calculartotales (bco_conciliacion.sc2,
// PROCEDURE calculartotales, línea 1476). Helper puro, sin dependencias, con tests. La misma fórmula vive
// en el back (modules/banks/bankConciliation/calculateTotals.js): los tests de ambos usan los mismos números.

const toNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? 0 : Number.parseFloat(parsed.toFixed(2));
};

const normalize = (value) => (value || '').toString().toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Por texto normalizado, no por el string exacto de bco_conciliacion_setreport.report. La tabla real trae
// "Tranferencias" (sin la S): `TRANS?FER` acepta las dos ortografías.
export const categorize = (label) => {
  const upper = normalize(label);
  if (upper.includes('CHEQUE')) return 'checks';
  if (upper.includes('DEPOSITO')) return 'deposits';
  if (upper.includes('CREDITO')) return 'creditNotes';
  if (upper.includes('DEBITO')) return 'debitNotes';
  if (/TRANS?FER/.test(upper)) return 'transfers';
  return null;
};

export const emptyTotals = () => ({
  checks: { book: 0, bank: 0, diff: 0 },
  deposits: { book: 0, bank: 0, diff: 0 },
  creditNotes: { book: 0, bank: 0, diff: 0 },
  debitNotes: { book: 0, bank: 0, diff: 0 },
  transfers: { book: 0, bank: 0, diff: 0 },
  annulledChecksBook: 0,
  adjBook: 0,
  adjBank: 0,
  finalDifference: 0
});

// Para Cheques, el lado Banco NO filtra por fecha (incluye cheques arrastrados de períodos anteriores
// que aún no compensan), el lado Libro SÍ se restringe al rango del período; las otras 4 categorías
// restringen ambos lados al rango. `annulledChecksBook` (Numbox_hw1 del legacy) suma el haber de los
// cheques conciliados en libro, sin filtro de fecha, y no entra en la fórmula de pantalla.
export const calculateTotals = ({ lines = [], docCategoryMap = {}, dateIn, dateOut, valueBank = 0, valueBook = 0 }) => {
  const result = emptyTotals();
  if (!dateIn || !dateOut) return result;

  lines.forEach((line) => {
    const category = docCategoryMap[line.documentCode];
    if (!category) return;

    const withinPeriod = line.date >= dateIn && line.date <= dateOut;
    const debit = toNumber(line.valueDebit);
    const credit = toNumber(line.valueCredit);

    if (category === 'checks') {
      if (line.isConBank && !line.annulled) result.checks.bank += debit;
      if (line.isConBook && !line.annulled && withinPeriod) result.checks.book += debit;
      if (line.isConBook) result.annulledChecksBook += credit;
      return;
    }
    if (!withinPeriod) return;

    const value = (category === 'debitNotes' || category === 'transfers') ? (debit - credit) : (credit - debit);
    if (line.isConBank) result[category].bank += value;
    if (line.isConBook) result[category].book += value;
  });

  result.checks.diff = result.checks.book - result.checks.bank;
  result.deposits.diff = result.deposits.bank - result.deposits.book;
  result.creditNotes.diff = result.creditNotes.bank - result.creditNotes.book;
  result.debitNotes.diff = result.debitNotes.bank - result.debitNotes.book;
  result.transfers.diff = result.transfers.bank - result.transfers.book;

  result.adjBook = toNumber(valueBook) - result.checks.book + result.deposits.book + result.creditNotes.book - result.debitNotes.book - result.transfers.book;
  result.adjBank = toNumber(valueBank) - result.checks.bank + result.deposits.bank + result.creditNotes.bank - result.debitNotes.bank - result.transfers.bank;
  result.finalDifference = result.adjBook - result.adjBank;

  return result;
};
