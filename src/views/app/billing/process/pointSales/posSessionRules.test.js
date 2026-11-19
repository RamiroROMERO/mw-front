import { describe, expect, test } from 'vitest';
import { parseCents, validateOpening, buildOpenRequest, needsDateConfirm, buildStoredSession } from './posSessionRules';

const good = { cashBox: 1, email: 'a@b.com', cashierPass: 'x', dateCashOpen: '2026-11-19', initialValue: '100.50', typePrint: 1 };

describe('posSessionRules', () => {
  test('parseCents exacto y rechaza lo inválido', () => {
    expect(parseCents('')).toBe(0);
    expect(parseCents('10.5')).toBe(1050);
    expect(parseCents(0.3)).toBe(30);
    ['-1', '1.234', 'abc', '1e3'].forEach((bad) => expect(parseCents(bad)).toBeNull());
  });

  test('un formulario válido no tiene errores', () => {
    expect(validateOpening(good, '2026-11-19')).toEqual({});
  });

  test('cada campo obligatorio marca su error', () => {
    const errors = validateOpening({ cashBox: 0, email: ' ', cashierPass: '', dateCashOpen: '', initialValue: 'x', typePrint: 9 }, '2026-11-19');
    expect(Object.keys(errors).sort()).toEqual(['cashBox', 'cashierPass', 'dateCashOpen', 'email', 'initialValue', 'typePrint']);
  });

  test('fecha futura se rechaza y hoy o pasada no', () => {
    expect(validateOpening({ ...good, dateCashOpen: '2026-11-20' }, '2026-11-19').dateCashOpen).toBe('msg.error.pos.dateFuture');
    expect(validateOpening({ ...good, dateCashOpen: '2026-11-18' }, '2026-11-19')).toEqual({});
  });

  test('la petición lleva solo lo del cajero, caja, día, monto y formato', () => {
    expect(buildOpenRequest({ ...good, email: ' a@b.com ' })).toEqual({ registerId: 1, email: 'a@b.com', password: 'x', date: '2026-11-19', initialValue: '100.50', printFormat: 1, confirmDate: false });
    expect(buildOpenRequest(good, true).confirmDate).toBe(true);
  });

  test('pide confirmar solo si el día no es hoy', () => {
    expect(needsDateConfirm(good, '2026-11-19')).toBe(false);
    expect(needsDateConfirm(good, '2026-11-20')).toBe(true);
  });

  test('la sesión guardada sale de la respuesta del servidor', () => {
    const stored = buildStoredSession({
      session: { id: 7, cashierId: 11, date: '2026-11-19', printFormat: 2, initialValue: 50 }, register: { id: 1 }, area: { id: 4 }, store: { id: 2 },
      priceTypes: { local: 3 }, document: { code: 'FAC' }, cashier: { canVoid: true }, settings: { roundInPos: true }
    });
    expect(stored).toMatchObject({ sessionId: 7, cashId: 1, cashierId: 11, areaId: 4, storeId: 2, typePrice: 3, documentCode: 'FAC', dateInProcess: '2026-11-19', printType: 2, initialValue: 50 });
  });
});
