import { describe, it, expect } from 'vitest';
import enLang from './en_US.js';
import esLang from './es_ES.js';

// Nombres de los ValidError de Bancos y Activos Fijos (SPEC v2-20) y de permisos que tienen
// traducción `error.<name>`. Quedan fuera a propósito los genéricos (`notFound`, `validation.error`,
// `locked`, `lines.required`, `unbalanced`, `value.required`, `calendar.closed`, `littleCash*`) y los
// que cambian de significado según el documento (`bank.notFound`, `customer.noCxcAccount`,
// `void.cannotEdit`): ahí se muestra la `description` del back.
const TRANSLATED = [
  'affiliate.noCustomer', 'alreadyFinished', 'bankAccount.code.duplicate', 'bankAccount.code.inUse',
  'bankAccount.inUse', 'calendar.inUse', 'calendar.reopen.forbidden', 'checkNumber.duplicate',
  'cxc.amount.invalid', 'cxp.amount.invalid', 'deduction.incomplete', 'disabled.accounting',
  'documentCode.invalid', 'exchangeRate.required', 'littleCashFund.notFound',
  'littleCashSettlement.alreadyClosed', 'littleCashSettlement.empty', 'missing.data', 'notEditable',
  'period.closed.global', 'period.closed.module', 'range.invalid', 'range.required', 'settings.notFound',
  'user.forbidden.editPosted', 'void.advanceExists', 'void.alreadyApplied', 'void.alreadyVoided',
  'void.paymentsApplied',
  'user.unauthorized', 'user.forbidden', 'user.create.forbidden', 'user.update.forbidden', 'user.delete.forbidden',
];

const NOT_TRANSLATED = [
  'notFound', 'validation.error', 'locked', 'lines.required', 'unbalanced', 'value.required',
  'calendar.closed', 'bank.notFound', 'customer.noCxcAccount', 'void.cannotEdit',
  // SPEC v2-22: su descripción lleva los montos reales (valor del depósito, lo aplicado, el faltante y el tope).
  'line.applied.exceeded', 'line.applied.invalid', 'deposit.shortage.exceeded', 'deposit.difference.account.required',
  'deposit.difference.account.invalid',
  // SPEC v2-25 (Cuadre de Asientos): su descripcion lleva los montos y cuentas reales de la partida.
  'repair.account.invalid',
  'repair.account.isBank',
  'repair.account.required',
  'repair.action.invalid',
  'repair.batch.tooLarge',
  'repair.check.notFound',
  'repair.creditNote.notFound',
  'repair.creditNote.notOneSided',
  'repair.creditNote.type',
  'repair.date.closed',
  'repair.deposit.noExtraLines',
  'repair.deposit.notFound',
  'repair.entry.notFound',
  'repair.header.noLines',
  'repair.key.invalid',
  'repair.keys.required',
  'repair.line.notBlank',
  'repair.line.notFound',
  'repair.line.reconciled',
  'repair.period.confirmRequired',
  'repair.reason.required',
  'repair.reversal.notZero',
  'repair.reversal.originalInvalid',
];

describe('traducciones de errores del back (error.<name>)', () => {
  it.each(TRANSLATED)('error.%s existe en es y en con texto', (name) => {
    expect(typeof esLang[`error.${name}`]).toBe('string');
    expect(esLang[`error.${name}`].trim()).not.toBe('');
    expect(typeof enLang[`error.${name}`]).toBe('string');
    expect(enLang[`error.${name}`].trim()).not.toBe('');
  });

  it('el texto en inglés no es una copia del español', () => {
    const same = TRANSLATED.filter((n) => esLang[`error.${n}`] === enLang[`error.${n}`]);
    expect(same).toEqual([]);
  });

  it.each(NOT_TRANSLATED)('%s no tiene traducción, para que se muestre la description del back', (name) => {
    expect(Object.keys(esLang)).not.toContain(`error.${name}`);
    expect(Object.keys(enLang)).not.toContain(`error.${name}`);
  });

  it('no hay claves error.* que no estén en la lista', () => {
    const extra = Object.keys(esLang).filter((k) => k.startsWith('error.') && !TRANSLATED.includes(k.slice(6)));
    expect(extra).toEqual([]);
  });
});
