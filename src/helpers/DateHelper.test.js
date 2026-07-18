import { describe, it, expect } from 'vitest';
import DateHelper from './DateHelper';

describe('DateHelper', () => {
  describe('format', () => {
    it('formatea una fecha con el formato por defecto (YYYY-MM-DD)', () => {
      expect(DateHelper.format('2026-07-17T10:00:00Z')).toBe('2026-07-17');
    });

    it('formatea una fecha con un formato custom', () => {
      expect(DateHelper.toShortDate('2026-07-17T10:00:00Z')).toBe('17/07/2026');
    });
  });

  describe('parse', () => {
    it('parsea una fecha en formato no-ISO (DD/MM/YYYY)', () => {
      const result = DateHelper.parse('18/07/2026', 'DD/MM/YYYY');
      expect(DateHelper.isValid(result)).toBe(true);
      expect(DateHelper.format(result)).toBe('2026-07-18');
    });
  });

  describe('add / subtract', () => {
    it('suma días a una fecha', () => {
      const result = DateHelper.add('2026-01-31', 1, 'day');
      expect(DateHelper.format(result)).toBe('2026-02-01');
    });

    it('resta meses a una fecha', () => {
      const result = DateHelper.subtract('2026-03-15', 1, 'month');
      expect(DateHelper.format(result)).toBe('2026-02-15');
    });
  });

  describe('diff', () => {
    it('calcula la diferencia en días entre dos fechas', () => {
      expect(DateHelper.diff('2026-07-20', '2026-07-17', 'day')).toBe(3);
    });

    it('calcula la diferencia en días como negativa si la primera fecha es anterior', () => {
      expect(DateHelper.diff('2026-07-17', '2026-07-20', 'day')).toBe(-3);
    });
  });

  describe('comparaciones', () => {
    it('isBefore devuelve true cuando la primera fecha es anterior', () => {
      expect(DateHelper.isBefore('2026-01-01', '2026-01-02')).toBe(true);
    });

    it('isAfter devuelve false cuando la primera fecha es anterior', () => {
      expect(DateHelper.isAfter('2026-01-01', '2026-01-02')).toBe(false);
    });

    it('isSame compara por unidad (día) ignorando la hora', () => {
      expect(DateHelper.isSame('2026-01-01T08:00:00', '2026-01-01T20:00:00', 'day')).toBe(true);
    });

    it('isBetween respeta el rango dado', () => {
      expect(DateHelper.isBetween('2026-06-15', '2026-06-01', '2026-06-30')).toBe(true);
      expect(DateHelper.isBetween('2026-07-15', '2026-06-01', '2026-06-30')).toBe(false);
    });
  });

  describe('isValid', () => {
    it('reconoce una fecha válida', () => {
      expect(DateHelper.isValid('2026-07-17')).toBe(true);
    });

    it('reconoce una fecha inválida', () => {
      expect(DateHelper.isValid('no-es-una-fecha')).toBe(false);
    });
  });

  describe('isWeekend', () => {
    it('identifica un sábado como fin de semana', () => {
      // 2026-07-18 es sábado
      expect(DateHelper.isWeekend('2026-07-18')).toBe(true);
    });

    it('identifica un lunes como día hábil', () => {
      // 2026-07-20 es lunes
      expect(DateHelper.isWeekend('2026-07-20')).toBe(false);
    });
  });

  describe('getters', () => {
    it('extrae año, mes (0-index) y día', () => {
      expect(DateHelper.getYear('2026-07-17')).toBe(2026);
      expect(DateHelper.getMonth('2026-07-17')).toBe(6);
      expect(DateHelper.getDay('2026-07-17')).toBe(17);
    });
  });

  describe('getDateRange', () => {
    it('genera un rango inclusivo de fechas día por día', () => {
      const range = DateHelper.getDateRange('2026-07-01', '2026-07-03');
      expect(range).toHaveLength(3);
      expect(range.map((d) => DateHelper.format(d))).toEqual([
        '2026-07-01',
        '2026-07-02',
        '2026-07-03',
      ]);
    });
  });
});
