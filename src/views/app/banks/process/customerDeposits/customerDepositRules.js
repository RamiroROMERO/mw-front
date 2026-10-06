// Reglas de Depósitos de Clientes (SPEC v2-22), las mismas del back (`validateDepositTotals` y `CustomerDepositDTO`):
// la pantalla las usa para mostrar la diferencia en vivo y avisar antes de llamar al back, pero el back sigue
// siendo quien decide (además valida que la cuenta exista y que no sea la del banco, datos que la pantalla no tiene).
// Todo en centavos enteros: mismo redondeo de mitades hacia arriba que RoundMoney del back.

export const MAX_SHORTAGE_PERCENT = 10;

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

  let cents = BigInt(intPart);
  if (fracPart.length > 0 && fracPart[0] >= '5') cents += 1n;

  const result = Number(cents);
  return number < 0 && result !== 0 ? -result : result;
};

const fromCents = (cents) => cents / 100;
const isNumber = (value) => value !== null && value !== undefined && String(value).trim() !== '' && Number.isFinite(Number(value));

// Fecha de hoy por calendario local (YYYY-MM-DD), como `localToday` del DTO del back.
export const localToday = (now = new Date()) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// Una fecha vacía o inválida no es "futura" (de eso se encarga el requerido).
export const isFutureDate = (value, today = localToday()) => {
  const date = String(value || '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && date > today;
};

// lines: las de la pantalla ({ documentCode, originalValue, appliedValue, deductionValue }).
export const calculateDepositTotals = ({ value, lines = [] }) => {
  let applied = 0;
  let deduction = 0;
  lines.forEach((line) => {
    applied += isNumber(line.appliedValue) ? toCents(line.appliedValue) : 0;
    deduction += isNumber(line.deductionValue) ? toCents(line.deductionValue) : 0;
  });
  const difference = toCents(value) - (applied - deduction);
  return {
    applied: fromCents(applied),
    deduction: fromCents(deduction),
    // positivo = sobrante, negativo = faltante, 0 = cuadrado
    difference: fromCents(difference),
    shortage: fromCents(difference < 0 ? -difference : 0),
    overage: fromCents(difference > 0 ? difference : 0)
  };
};

// Primer problema que el back también rechazaría, en su mismo orden, o null. Solo hay algo que validar con líneas.
// Códigos = nombres de error del back; `documentCode` identifica la factura de una línea.
export const findDepositProblem = ({ value, lines = [], differenceAccount = '' }) => {
  if (!lines.length) return null;

  for (const line of lines) {
    if (!isNumber(line.appliedValue) || Number(line.appliedValue) < 0) {
      return { code: 'line.applied.invalid', documentCode: line.documentCode };
    }
    if (toCents(line.appliedValue) > toCents(line.originalValue)) {
      return { code: 'line.applied.exceeded', documentCode: line.documentCode };
    }
  }

  const { difference, shortage } = calculateDepositTotals({ value, lines });
  const maxShortage = Math.floor((toCents(value) * MAX_SHORTAGE_PERCENT) / 100);
  if (toCents(shortage) > maxShortage) return { code: 'deposit.shortage.exceeded' };

  if (difference !== 0 && !String(differenceAccount || '').trim()) return { code: 'deposit.difference.account.required' };

  return null;
};
