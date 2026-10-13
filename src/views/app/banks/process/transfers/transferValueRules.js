// Regla del valor de una Transferencia (SPEC v2-31): debe igualar, con tolerancia de 0.01, el crédito a la cuenta
// contable del banco. Mismos números y casos que modules/banks/transfers/validateBankCredit.js del back (el back decide;
// esto solo adelanta el aviso). Todo en centavos enteros.
const TOLERANCE_CENTS = 1;
const LEMPIRAS_NAMES = ['', 'lempiras', 'lempira', 'lps', 'l'];

export const toCents = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  const match = /^(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/i.exec(String(Math.abs(number)));
  if (!match) return 0;
  const digits = match[1] + (match[2] || '');
  const pointPos = match[1].length + Number(match[3] || 0) + 2;
  let intPart;
  let fracPart;
  if (pointPos <= 0) {
    intPart = '0';
    fracPart = '0'.repeat(-pointPos) + digits;
  } else if (pointPos >= digits.length) {
    intPart = digits + '0'.repeat(pointPos - digits.length);
    fracPart = '';
  } else {
    intPart = digits.slice(0, pointPos);
    fracPart = digits.slice(pointPos);
  }
  let cents = Number(intPart);
  if (fracPart.length > 0 && fracPart[0] >= '5') cents += 1;
  return number < 0 && cents !== 0 ? -cents : cents;
};

export const isLempiras = (currencyName) => LEMPIRAS_NAMES.includes(String(currencyName ?? '').trim().toLowerCase());

const sameAccount = (a, b) => String(a ?? '').trim() === String(b ?? '').trim();

// Suma de créditos de las líneas a la cuenta contable del banco (los débitos no cuentan).
export const getBankCredit = (lines, bankAccount) => {
  const bankNumber = bankAccount ? String(bankAccount.ctaBank ?? '').trim() : '';
  if (!bankNumber) return { cents: 0, hasLine: false };
  let cents = 0;
  let hasLine = false;
  (lines || []).forEach((line) => {
    if (!sameAccount(line.idCtaCont, bankNumber)) return;
    const credit = toCents(line.valueCredit);
    if (credit > 0) {
      hasLine = true;
      cents += credit;
    }
  });
  return { cents, hasLine };
};

export const isValueMatching = (value, bankCreditCents) => Math.abs(toCents(value) - bankCreditCents) <= TOLERANCE_CENTS;

// 'unknown' (sin cuenta bancaria conocida), 'exempt' (moneda extranjera), 'noBankLine', 'mismatch' u 'ok'.
export const valueStatus = ({ value, lines, bankAccount }) => {
  if (!bankAccount || !String(bankAccount.ctaBank ?? '').trim()) return 'unknown';
  if (!isLempiras(bankAccount.currencyName)) return 'exempt';
  const { cents, hasLine } = getBankCredit(lines, bankAccount);
  if (!hasLine) return 'noBankLine';
  return isValueMatching(value, cents) ? 'ok' : 'mismatch';
};

// Valor por defecto: el crédito al banco; en moneda extranjera o sin cuenta conocida, el total de débitos (como antes).
export const defaultValue = ({ lines, bankAccount }) => {
  const status = valueStatus({ value: 0, lines, bankAccount });
  if (status === 'exempt' || status === 'unknown') {
    return (lines || []).reduce((sum, l) => sum + toCents(l.valueDebit), 0) / 100;
  }
  return getBankCredit(lines, bankAccount).cents / 100;
};

// El guardado se bloquea salvo en 'ok', 'exempt' y 'unknown' (el back decide si la cuenta no existe).
export const blocksSave = (status) => status === 'mismatch' || status === 'noBankLine';
