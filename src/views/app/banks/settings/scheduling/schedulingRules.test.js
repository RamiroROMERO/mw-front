import { describe, test, expect } from 'vitest';
import { isClosed, canModify, nextStatus, buildYearMonths } from './schedulingRules';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const monthLetter = (dateIn) => MONTHS[Number(dateIn.slice(5, 7)) - 1];

describe('isClosed', () => {
  test.each([[1, true], [true, true], ['1', true], [0, false], [false, false], [undefined, false], [null, false]])(
    'status %p -> %p', (status, expected) => expect(isClosed({ status })).toBe(expected)
  );
  test('sin período no está cerrado', () => expect(isClosed(undefined)).toBe(false));
});

describe('canModify y nextStatus', () => {
  test('un período abierto se puede editar o eliminar y la acción lo cierra', () => {
    expect(canModify({ status: 0 })).toBe(true);
    expect(nextStatus({ status: 0 })).toBe(1);
  });

  test('un período cerrado no se puede editar ni eliminar y la acción lo reabre', () => {
    expect(canModify({ status: 1 })).toBe(false);
    expect(nextStatus({ status: 1 })).toBe(0);
  });
});

describe('buildYearMonths', () => {
  test('genera los 12 meses abiertos con sus fechas, incluido febrero bisiesto', () => {
    const months = buildYearMonths(2028, [], monthLetter);

    expect(months).toHaveLength(12);
    expect(months.every((m) => m.status === 0)).toBe(true);
    expect(months[0]).toEqual({ month: 'Enero', dateIn: '2028-01-01', dateOut: '2028-01-31', status: 0 });
    expect(months[1].dateOut).toBe('2028-02-29');
    expect(months[11]).toEqual({ month: 'Diciembre', dateIn: '2028-12-01', dateOut: '2028-12-31', status: 0 });
  });

  test('omite los meses que ya existen', () => {
    const months = buildYearMonths(2027, ['Enero', 'Diciembre'], monthLetter);

    expect(months).toHaveLength(10);
    expect(months.map((m) => m.month)).not.toContain('Enero');
  });

  test('con el año completo no genera nada', () => {
    expect(buildYearMonths(2027, MONTHS, monthLetter)).toEqual([]);
  });
});
