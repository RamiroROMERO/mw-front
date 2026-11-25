import { describe, expect, test } from 'vitest';
import { isValidDni, isValidBirthDate, validatePhones, fullName, printFileOptions, printEventOptions } from './patientRules';

describe('isValidDni', () => {
  test('de 13 a 20 caracteres, sin guiones, puntos, comas ni espacios', () => {
    expect(isValidDni('0801199012345')).toBe(true);
    expect(isValidDni('x'.repeat(20))).toBe(true);
    expect(isValidDni('x'.repeat(21))).toBe(false);
    expect(isValidDni('123456789012')).toBe(false);
    expect(isValidDni('0801-1990-12345')).toBe(false);
    expect(isValidDni('0801 1990 12345')).toBe(false);
    expect(isValidDni('')).toBe(false);
  });
});

describe('isValidBirthDate', () => {
  test('real, desde 1910 y no futura', () => {
    expect(isValidBirthDate('1990-05-10', '2026-11-25')).toBe(true);
    expect(isValidBirthDate('1910-01-01', '2026-11-25')).toBe(true);
    expect(isValidBirthDate('1909-12-31', '2026-11-25')).toBe(false);
    expect(isValidBirthDate('2026-11-26', '2026-11-25')).toBe(false);
    expect(isValidBirthDate('1990-02-30', '2026-11-25')).toBe(false);
    expect(isValidBirthDate('', '2026-11-25')).toBe(false);
  });
});

describe('validatePhones', () => {
  test('al menos un teléfono y todos de 7 a 15 dígitos', () => {
    expect(validatePhones({ phone: '', phone2: '' })).toBe('msg.required.input.phone');
    expect(validatePhones({ phone: '9999-8888', phone2: '' })).toBe('');
    expect(validatePhones({ phone: '', phone2: '88887777' })).toBe('');
    expect(validatePhones({ phone: '12', phone2: '' })).toBe('msg.invalid.input.phone');
    expect(validatePhones({ phone: '99998888', phone2: 'abc' })).toBe('msg.invalid.input.phone');
  });
});

test('fullName arma el nombre sin espacios dobles', () => {
  expect(fullName({ firstName: 'Ana', secondName: '', lastName: 'Pérez', secondLastName: 'Mejía' })).toBe('Ana Pérez Mejía');
  expect(fullName({ firstName: ' Ana ', lastName: 'Pérez' })).toBe('Ana Pérez');
});

test('las impresiones apuntan a los GET del back', () => {
  expect(printFileOptions(3)).toEqual({ path: 'hospital/process/expedients', id: 3, fileName: 'Expediente de Paciente.pdf' });
  expect(printEventOptions(3, 9)).toEqual({ path: 'hospital/process/expedients/3/events', id: 9, fileName: 'Registro de Atencion.pdf' });
});
