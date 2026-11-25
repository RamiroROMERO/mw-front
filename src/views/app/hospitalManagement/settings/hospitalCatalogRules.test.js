import { describe, expect, test } from 'vitest';
import { isValidName, isValidRoomCode, isValidPrice, isValidSpecialistDni, isValidPercent, isValidPercentSum, MAX_NAME } from './hospitalCatalogRules';

describe('isValidName', () => {
  test('3 caracteres es válido (Ana, Eli, Mia) y 2 no', () => {
    expect(isValidName('Ana', 50)).toBe(true);
    expect(isValidName(' Eli ', 50)).toBe(true);
    expect(isValidName('Mi', 50)).toBe(false);
    expect(isValidName('   ', 50)).toBe(false);
    expect(isValidName(undefined, 50)).toBe(false);
  });
  test('respeta el máximo de cada catálogo (la DB: áreas y razones 45, habitaciones 50, especialidades 100)', () => {
    expect(isValidName('x'.repeat(MAX_NAME.areas), MAX_NAME.areas)).toBe(true);
    expect(isValidName('x'.repeat(MAX_NAME.areas + 1), MAX_NAME.areas)).toBe(false);
    expect(isValidName('x'.repeat(MAX_NAME.reasons + 1), MAX_NAME.reasons)).toBe(false);
    expect(isValidName('x'.repeat(100), MAX_NAME.specialties)).toBe(true);
  });
});

describe('habitaciones', () => {
  test('código de 1 a 10', () => {
    expect(isValidRoomCode('A')).toBe(true);
    expect(isValidRoomCode('x'.repeat(10))).toBe(true);
    expect(isValidRoomCode('x'.repeat(11))).toBe(false);
    expect(isValidRoomCode('')).toBe(false);
  });
  test('precio: vacío, 0 y hasta 2 decimales válidos; negativos y 3 decimales no', () => {
    expect(isValidPrice('')).toBe(true);
    expect(isValidPrice(0)).toBe(true);
    expect(isValidPrice('12.5')).toBe(true);
    expect(isValidPrice('12.345')).toBe(false);
    expect(isValidPrice('-1')).toBe(false);
    expect(isValidPrice('abc')).toBe(false);
  });
});

describe('especialistas', () => {
  test('el DNI es opcional y llega a 20', () => {
    expect(isValidSpecialistDni('')).toBe(true);
    expect(isValidSpecialistDni('02')).toBe(true);
    expect(isValidSpecialistDni('x'.repeat(20))).toBe(true);
    expect(isValidSpecialistDni('x'.repeat(21))).toBe(false);
  });
  test('porcentajes de 0 a 100 con 2 decimales y suma máxima de 100', () => {
    expect(isValidPercent('')).toBe(true);
    expect(isValidPercent('80.5')).toBe(true);
    expect(isValidPercent('101')).toBe(false);
    expect(isValidPercent('-1')).toBe(false);
    expect(isValidPercent('1.234')).toBe(false);
    expect(isValidPercentSum(80, 20)).toBe(true);
    expect(isValidPercentSum('70', '40')).toBe(false);
    expect(isValidPercentSum('', '')).toBe(true);
  });
});
