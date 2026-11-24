import { describe, expect, test } from 'vitest';
import {
  AGING_BUCKETS, CURRENCY_DOLLARS, CURRENCY_LEMPIRAS, buildEditPayload, buildQuery, canDeleteRow, canEditRow, currencyLabel, effectiveCurrency, isValidDate,
  mapRowToEditForm, normalizeDetail, normalizeSettings, statusMessage, validateEditForm, validateQuery
} from './accountsReceivableRules';

describe('isValidDate / validateQuery (mismos casos que el back)', () => {
  test.each(['2026-02-28', '2028-02-29', '2026-12-31'])('"%s" es válida', (d) => expect(isValidDate(d)).toBe(true));
  test.each(['2026-02-30', '2026-13-01', 'abc', '26-01-01', '2026-1-1', '', null, undefined, '2026-01-01T00:00:00'])('"%s" no es válida', (d) => expect(isValidDate(d)).toBe(false));
  test('la fecha es obligatoria y debe ser real', () => {
    expect(validateQuery({ date: '' }).date).toBe('page.accountsReceivable.error.date.required');
    expect(validateQuery({ date: '2026-02-30' }).date).toBe('page.accountsReceivable.error.date.invalid');
    expect(validateQuery({ date: '2026-03-01' })).toEqual({});
  });
});

describe('moneda dual (dual_curr)', () => {
  test('normalizeSettings: solo `true` exacto cuenta', () => {
    expect(normalizeSettings({ hasDualCurrency: true })).toEqual({ hasDualCurrency: true });
    [{ hasDualCurrency: 1 }, { hasDualCurrency: 'true' }, {}, null, undefined, { hasDualCurrency: false }].forEach((data) => expect(normalizeSettings(data)).toEqual({ hasDualCurrency: false }));
  });
  test('Dólares solo si la empresa factura en ambas; por defecto Lempiras', () => {
    expect(effectiveCurrency(CURRENCY_DOLLARS, { hasDualCurrency: true })).toBe(CURRENCY_DOLLARS);
    expect(effectiveCurrency(CURRENCY_DOLLARS, { hasDualCurrency: false })).toBe(CURRENCY_LEMPIRAS);
    expect(effectiveCurrency(CURRENCY_DOLLARS, undefined)).toBe(CURRENCY_LEMPIRAS);
    expect(effectiveCurrency(undefined, { hasDualCurrency: true })).toBe(CURRENCY_LEMPIRAS);
    expect(effectiveCurrency('2', { hasDualCurrency: true })).toBe(CURRENCY_DOLLARS);
    expect(effectiveCurrency(7, { hasDualCurrency: true })).toBe(CURRENCY_LEMPIRAS);
  });
  test('etiqueta de la moneda', () => {
    expect(currencyLabel(2)).toBe('page.accountsReceivable.currency.dollars');
    expect(currencyLabel(1)).toBe('page.accountsReceivable.currency.lempiras');
  });
});

describe('buildQuery', () => {
  test('tipo de cliente en 0 o vacío no se manda; la moneda sale de la configuración', () => {
    expect(buildQuery({ date: '2026-03-01', customerTypeId: 0, currency: 2 }, { hasDualCurrency: false })).toEqual({ date: '2026-03-01', currency: 1 });
    expect(buildQuery({ date: '2026-03-01', customerTypeId: '3', currency: 2 }, { hasDualCurrency: true })).toEqual({ date: '2026-03-01', currency: 2, customerTypeId: 3 });
    expect(buildQuery({ date: '2026-03-01', customerTypeId: '', currency: 1 }, { hasDualCurrency: true }, { customerId: 9 })).toEqual({ date: '2026-03-01', currency: 1, customerId: 9 });
  });
});

describe('estado, detalle y tramos', () => {
  test('mensajes del estado', () => {
    expect(statusMessage({ code: 'toDue', days: 4 })).toEqual({ id: 'page.accountsReceivable.status.toDue', values: { days: 4 } });
    expect(statusMessage({ code: 'overdue', days: 29 })).toEqual({ id: 'page.accountsReceivable.status.overdue', values: { days: 29 } });
    expect(statusMessage({ code: 'noDue', days: 0 }).id).toBe('page.accountsReceivable.status.noDue');
    expect(statusMessage(undefined).id).toBe('page.accountsReceivable.status.noDue');
  });
  test('normalizeDetail tolera formas raras', () => {
    expect(normalizeDetail(undefined)).toEqual({ customer: {}, rows: [], totals: {}, aging: {} });
    expect(normalizeDetail({ rows: 'x', totals: 5, aging: null, customer: [] }).rows).toEqual([]);
    expect(normalizeDetail({ rows: [{ id: 1 }], totals: { balance: 2 } }).totals.balance).toBe(2);
  });
  test('los seis tramos son los que devuelve el back', () => {
    expect(AGING_BUCKETS.map((b) => b.field)).toEqual(['current', 'd1to30', 'd31to60', 'd61to90', 'd91to120', 'over120']);
  });
});

describe('qué botones se ofrecen', () => {
  const manual = { id: 1, isManual: true };
  const document = { id: 2, isManual: false };
  test('editar: solo cartera manual y con fn_update', () => {
    expect(canEditRow(manual, { update: true })).toBe(true);
    expect(canEditRow(manual, { update: false })).toBe(false);
    expect(canEditRow(document, { update: true })).toBe(false);
    expect(canEditRow(manual, undefined)).toBe(false);
  });
  test('eliminar: solo cartera manual, con fn_delete Y el privilegio de administrador', () => {
    expect(canDeleteRow(manual, { delete: true, admin: true })).toBe(true);
    expect(canDeleteRow(manual, { delete: true, admin: false })).toBe(false);
    expect(canDeleteRow(manual, { delete: false, admin: true })).toBe(false);
    expect(canDeleteRow(document, { delete: true, admin: true })).toBe(false);
  });
});

describe('edición de la cartera manual (mismas reglas del back)', () => {
  const ok = { id: 1, date: '2026-01-10', dueDate: '2026-02-10', value: '100.50' };
  test('un formulario correcto no tiene errores', () => expect(validateEditForm(ok, '2026-06-01')).toEqual({}));
  test('fecha: válida y no futura', () => {
    expect(validateEditForm({ ...ok, date: '' }, '2026-06-01').date).toBe('page.accountsReceivable.error.manual.date');
    expect(validateEditForm({ ...ok, date: '2026-06-02' }, '2026-06-01').date).toBe('page.accountsReceivable.error.manual.dateFuture');
  });
  test('vencimiento: opcional, válido y no anterior a la fecha', () => {
    expect(validateEditForm({ ...ok, dueDate: '' }, '2026-06-01')).toEqual({});
    expect(validateEditForm({ ...ok, dueDate: '2026-02-30' }, '2026-06-01').dueDate).toBe('page.accountsReceivable.error.manual.dueDate');
    expect(validateEditForm({ ...ok, dueDate: '2026-01-01' }, '2026-06-01').dueDate).toBe('page.accountsReceivable.error.manual.dueBeforeDate');
  });
  test.each(['0', '-1', '1.234', 'abc', '1e3', '', '1000000000000'])('valor "%s" se rechaza', (value) => {
    expect(validateEditForm({ ...ok, value }, '2026-06-01').value).toBe('page.accountsReceivable.error.manual.value');
  });
  test('el payload lleva solo lo que cambió', () => {
    const original = { id: 1, date: '2026-01-10', dueDate: '2026-02-10', originalValue: 100.5 };
    expect(buildEditPayload(mapRowToEditForm(original), original)).toEqual({});
    expect(buildEditPayload({ id: 1, date: '2026-01-12', dueDate: '2026-02-10', value: '100.50' }, original)).toEqual({ date: '2026-01-12' });
    expect(buildEditPayload({ id: 1, date: '2026-01-10', dueDate: '2026-03-01', value: '250' }, original)).toEqual({ dateOut: '2026-03-01', value: 250 });
  });
  test('mapRowToEditForm carga lo guardado', () => {
    expect(mapRowToEditForm({ id: 4, date: '2026-01-10', dueDate: null, originalValue: 80 })).toEqual({ id: 4, date: '2026-01-10', dueDate: '', value: '80' });
  });
});
