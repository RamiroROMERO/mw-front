import { describe, expect, test } from 'vitest';
import { formatFromSession, validCopies, canPrint, buildPosPrintRequest } from './posPrintRules';

describe('posPrintRules', () => {
  test('el formato sale del de la sesión', () => {
    expect(formatFromSession(1)).toBe('ticket');
    expect(formatFromSession(2)).toBe('halfLetter');
    expect(formatFromSession(3)).toBe('letter');
    expect(formatFromSession(9)).toBe('ticket');
  });

  test('copias válidas de 1 a 3; otra cosa no se manda', () => {
    expect(validCopies('2')).toBe(2);
    [0, 4, 1.5, 'x', undefined].forEach((v) => expect(validCopies(v)).toBeUndefined());
  });

  test('solo se imprime lo guardado', () => {
    expect(canPrint(10)).toBe(true);
    expect(canPrint(0)).toBe(false);
    expect(canPrint(undefined)).toBe(false);
  });

  test('la petición no lleva usuario ni cifras', () => {
    expect(buildPosPrintRequest({ id: 7, sessionId: 5, printFormat: 3, copies: 2, userName: 'x', total: 9 })).toEqual({ url: 'billing/process/pointSales/7/print', params: { sessionId: 5, format: 'letter', copies: 2 } });
    expect(buildPosPrintRequest({ id: 7, sessionId: 5, printFormat: 1 }).params).toEqual({ sessionId: 5, format: 'ticket' });
    expect(buildPosPrintRequest({ id: 7, sessionId: 5, kind: 'delivery', printFormat: 3, copies: 2 })).toEqual({ url: 'billing/process/pointSales/7/delivery', params: { sessionId: 5 } });
  });
});
