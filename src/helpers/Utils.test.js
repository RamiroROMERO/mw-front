import { describe, it, expect } from 'vitest';
import { cleanedObjectKeys, mapOrder, getExcelData } from './Utils';

describe('cleanedObjectKeys', () => {
  it('colapsa espacios múltiples y recorta los extremos de cada clave', () => {
    const input = { '  Número   de empleado  ': 1, Nombre: 'Ana' };
    expect(cleanedObjectKeys(input)).toEqual({
      'Número de empleado': 1,
      Nombre: 'Ana',
    });
  });

  it('colapsa saltos de línea dentro de las claves a un espacio', () => {
    // El primer replace (\s+) ya matchea \r\n, así que se normaliza a un
    // espacio en vez de eliminarse por completo.
    const input = { 'Fecha\r\nEntrada': '08:00' };
    expect(cleanedObjectKeys(input)).toEqual({ 'Fecha Entrada': '08:00' });
  });

  it('preserva los valores sin modificarlos', () => {
    const input = { Total: 1500.5 };
    expect(cleanedObjectKeys(input).Total).toBe(1500.5);
  });
});

describe('mapOrder', () => {
  it('ordena un array de objetos según el orden dado de una clave', () => {
    const items = [{ id: 'b' }, { id: 'a' }, { id: 'c' }];
    const ordered = mapOrder(items, ['a', 'b', 'c'], 'id');
    expect(ordered.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('getExcelData', () => {
  it('devuelve data vacía sin intentar parsear si el input no es un string', () => {
    // Cubre la rama que no dispara el import() dinámico de xlsx.
    return getExcelData(null, [], [], 'A', 1, 'Z', 100, false).then((result) => {
      expect(result).toEqual({ data: [] });
    });
  });
});
