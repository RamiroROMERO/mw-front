import { describe, expect, test } from 'vitest';
import { accountAction, caiFormPatch, genCaiAction, hasCai } from './ticketCaiRules';
import { emptyForm, formFromTicket } from './ticketPurchaseRules';

const SAVED = { id: 5, pdaNumber: 0, numberCAI: '' };

describe('hasCai', () => {
  test.each([
    ['con número fiscal', '000-001-11-00000125', true],
    ['vacío', '', false],
    ['solo espacios', '   ', false],
    ['nulo', null, false],
    ['ausente', undefined, false],
    ['un documentId como texto (documento sin fiscal)', '125', true]
  ])('%s', (_, numberCAI, expected) => {
    expect(hasCai({ numberCAI })).toBe(expected);
  });

  test('sin formulario', () => {
    expect(hasCai()).toBe(false);
    expect(hasCai(null)).toBe(false);
  });
});

describe('genCaiAction', () => {
  test('sin boleta guardada: guarde primero (no llama al back)', () => {
    expect(genCaiAction(emptyForm())).toBe('saveFirst');
    expect(genCaiAction({ id: 0 })).toBe('saveFirst');
    expect(genCaiAction({})).toBe('saveFirst');
    expect(genCaiAction()).toBe('saveFirst');
  });

  test('guardada y sin número fiscal: pide confirmación', () => {
    expect(genCaiAction(SAVED)).toBe('confirm');
    expect(genCaiAction({ ...SAVED, id: '5' })).toBe('confirm');
  });

  test('guardada y con número fiscal: no llama al back', () => {
    expect(genCaiAction({ ...SAVED, numberCAI: '000-001-11-00000125' })).toBe('alreadyGenerated');
  });

  test('una boleta cargada del back con número fiscal también', () => {
    expect(genCaiAction(formFromTicket({ id: 5, numberCAI: '000-001-11-00000125', pdaNumber: 0 }))).toBe('alreadyGenerated');
    expect(genCaiAction(formFromTicket({ id: 5, numberCAI: '', pdaNumber: 0 }))).toBe('confirm');
  });
});

describe('accountAction', () => {
  const WITH_CAI = { ...SAVED, numberCAI: '000-001-11-00000125' };

  test('sin boleta guardada: guarde primero', () => {
    expect(accountAction(emptyForm())).toBe('saveFirst');
    expect(accountAction()).toBe('saveFirst');
  });

  test('ya contabilizada: avisa (antes que pedir el número fiscal, como el back)', () => {
    expect(accountAction({ ...WITH_CAI, pdaNumber: 8801 })).toBe('processed');
    expect(accountAction({ ...SAVED, pdaNumber: 8801 })).toBe('processed');
  });

  test('sin número fiscal: pide Gen CAI primero y no llama al back', () => {
    expect(accountAction(SAVED)).toBe('genCaiFirst');
    expect(accountAction({ ...SAVED, numberCAI: '  ' })).toBe('genCaiFirst');
  });

  test('con número fiscal y sin contabilizar: pide confirmación', () => {
    expect(accountAction(WITH_CAI)).toBe('confirm');
  });
});

describe('caiFormPatch', () => {
  test('toma el número de documento y el número fiscal de la respuesta del back', () => {
    expect(caiFormPatch({ documentId: 125, numberCAI: '000-001-11-00000125', cai: 'X', limitDate: '2027-03-31', rangeCai: '1-500' }))
      .toEqual({ documentId: 125, numberCAI: '000-001-11-00000125' });
  });

  test('un documento sin fiscal trae el documentId como número fiscal', () => {
    expect(caiFormPatch({ documentId: 125, numberCAI: '125' })).toEqual({ documentId: 125, numberCAI: '125' });
  });

  test('datos ausentes dan valores seguros', () => {
    expect(caiFormPatch()).toEqual({ documentId: 0, numberCAI: '' });
    expect(caiFormPatch({ documentId: '12' })).toEqual({ documentId: 12, numberCAI: '' });
  });

  test('tras Gen CAI el formulario pasa de "confirm" a "alreadyGenerated" y contabilizar de "genCaiFirst" a "confirm"', () => {
    const before = { ...SAVED };
    const after = { ...before, ...caiFormPatch({ documentId: 125, numberCAI: '000-001-11-00000125' }) };
    expect(genCaiAction(before)).toBe('confirm');
    expect(genCaiAction(after)).toBe('alreadyGenerated');
    expect(accountAction(before)).toBe('genCaiFirst');
    expect(accountAction(after)).toBe('confirm');
  });
});
