import { describe, expect, test } from 'vitest';
import { isValidTime, toCalendarTime, validateAppointment, buildCreatePayload, buildUpdatePayload, validateReschedule, toCalendarEvent, visibleRange, printParams } from './appointmentRules';

const TODAY = '2026-11-25';
const free = { typeId: 1, name: 'Maria Lopez', specialistId: 3, date: '2026-12-01', time: '09:30' };

describe('citas programadas', () => {
  test('hora HH:mm de 24 horas; el texto libre del legacy se interpreta para el calendario', () => {
    expect(isValidTime('09:30')).toBe(true);
    expect(isValidTime('9:30')).toBe(false);
    expect(toCalendarTime('3.00 PM')).toBe('15:00');
    expect(toCalendarTime('12:00 AM')).toBe('00:00');
    expect(toCalendarTime('mañana')).toBe('00:00');
  });
  test('una cita válida de cada tipo', () => {
    expect(validateAppointment(free, TODAY)).toEqual({});
    expect(validateAppointment({ ...free, typeId: 2, patientId: 5, name: '' }, TODAY)).toEqual({});
  });
  test('tipo 1: nombre de 5 o más; tipo 2: paciente; médico, fecha no pasada y hora', () => {
    expect(validateAppointment({ ...free, name: 'Ana' }, TODAY).name).toBe('page.appointments.msg.nameShort');
    expect(validateAppointment({ ...free, typeId: 2, patientId: 0 }, TODAY).patientId).toBeTruthy();
    expect(validateAppointment({ ...free, specialistId: 0 }, TODAY).specialistId).toBeTruthy();
    expect(validateAppointment({ ...free, date: '2026-11-24' }, TODAY).date).toBeTruthy();
    expect(validateAppointment({ ...free, date: TODAY }, TODAY)).toEqual({});
    expect(validateAppointment({ ...free, time: '9:30 AM' }, TODAY).time).toBeTruthy();
  });
  test('el cuerpo del alta: nombre solo en tipo 1, paciente solo en tipo 2; nunca turno ni estado', () => {
    expect(buildCreatePayload({ ...free, phone: ' 99 ', notes: ' n ', turnNumber: 9, status: 2 })).toEqual({ typeId: 1, date: '2026-12-01', time: '09:30', specialistId: 3, phone: '99', notes: 'n', name: 'Maria Lopez' });
    const patient = buildCreatePayload({ ...free, typeId: 2, patientId: '5', name: 'x' });
    expect(patient.patientId).toBe(5);
    expect(patient).not.toHaveProperty('name');
  });
  test('la edición solo manda teléfono, notas y, en tipo 1, el nombre', () => {
    expect(buildUpdatePayload({ ...free, phone: '1', notes: 'n', date: '2030-01-01' })).toEqual({ phone: '1', notes: 'n', name: 'Maria Lopez' });
    expect(buildUpdatePayload({ ...free, typeId: 2, phone: '1', notes: 'n' })).toEqual({ phone: '1', notes: 'n' });
  });
  test('reprogramar valida fecha no pasada y hora', () => {
    expect(validateReschedule({ date: '2026-12-02', time: '10:00' }, TODAY)).toEqual({});
    expect(Object.keys(validateReschedule({ date: '2026-01-01', time: 'x' }, TODAY)).sort()).toEqual(['date', 'time']);
  });
  test('evento del calendario con la hora y el médico; el rango visible resta el día exclusivo', () => {
    const e = toCalendarEvent({ id: 4, date: '2026-12-01', time: '3.00 PM', name: 'Maria', specialistName: 'Dr A' });
    expect(e).toMatchObject({ id: '4', start: '2026-12-01T15:00', title: 'Maria - Dr A' });
    expect(visibleRange({ start: new Date(2026, 10, 29), end: new Date(2027, 0, 10) })).toEqual({ dateStart: '2026-11-29', dateEnd: '2027-01-09' });
  });
  test('parámetros del listado impreso', () => {
    expect(printParams({ date: '2026-12-01', specialistId: 0 })).toEqual({ date: '2026-12-01' });
    expect(printParams({ date: '2026-12-01', specialistId: 3 })).toEqual({ date: '2026-12-01', specialistId: '3' });
  });
});
