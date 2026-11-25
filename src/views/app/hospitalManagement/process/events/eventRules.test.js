import { describe, expect, test } from 'vitest';
import { validateEvent, buildEventPayload, validateHospitalization, buildHospitalizePayload, daysStay, warningMessages } from './eventRules';

const TODAY = '2026-11-25';
const ok = { fatherId: 5, date: '2026-11-24', areaId: 1, attendingSpecialistId: 3, eventType: 1 };

describe('validateEvent', () => {
  test('un evento mínimo es válido', () => {
    expect(validateEvent(ok, TODAY)).toEqual({});
  });
  test('paciente, fecha (real y no futura), área y médico son obligatorios', () => {
    expect(Object.keys(validateEvent({}, TODAY)).sort()).toEqual(['areaId', 'attendingSpecialistId', 'date', 'fatherId']);
    expect(validateEvent({ ...ok, date: '2026-11-26' }, TODAY).date).toBeTruthy();
    expect(validateEvent({ ...ok, date: '2026-02-30' }, TODAY).date).toBeTruthy();
    expect(validateEvent({ ...ok, date: TODAY }, TODAY)).toEqual({});
  });
  test('aseguradora privada exige aseguradora, términos y tipo de asegurado; los otros tipos no', () => {
    expect(Object.keys(validateEvent({ ...ok, eventType: 2 }, TODAY)).sort()).toEqual(['insuranceId', 'secureTypeId', 'termsId']);
    expect(validateEvent({ ...ok, eventType: 2, insuranceId: 9, termsId: 1, secureTypeId: 1 }, TODAY)).toEqual({});
    expect(validateEvent({ ...ok, eventType: 3 }, TODAY)).toEqual({});
  });
  test('cobertura y deducible: monto >= 0 con 2 decimales', () => {
    expect(validateEvent({ ...ok, coverVal: '10.5', valDeduc: '' }, TODAY)).toEqual({});
    expect(validateEvent({ ...ok, coverVal: '-1' }, TODAY).coverVal).toBeTruthy();
    expect(validateEvent({ ...ok, valDeduc: '1.234' }, TODAY).valDeduc).toBeTruthy();
  });
});

describe('buildEventPayload', () => {
  test('manda solo los campos del evento (nunca estado, tipo ni factura) y recorta', () => {
    const payload = buildEventPayload({ ...ok, status: 2, typeId: 2, invoiceNumber: '9', notes: ' hola ', roomId: 3 });
    expect(payload).toEqual({ fatherId: 5, date: '2026-11-24', areaId: 1, attendingSpecialistId: 3, responsibleName: '', responsiblePhone: '', notes: 'hola', eventType: 1 });
  });
  test('con aseguradora privada agrega sus datos; con otro tipo no los manda', () => {
    const insured = buildEventPayload({ ...ok, eventType: 2, insuranceId: '982', termsId: '2', secureTypeId: '1', coverVal: '100', valDeduc: '50', poliza: ' P1 ' });
    expect(insured).toMatchObject({ eventType: 2, insuranceId: 982, termsId: 2, secureTypeId: 1, coverVal: 100, valDeduc: 50, poliza: 'P1', contractor: '', certificate: '' });
    expect(buildEventPayload({ ...ok, eventType: 3, insuranceId: 982, poliza: 'X' })).not.toHaveProperty('insuranceId');
  });
});

describe('hospitalización', () => {
  const form = { dateIn: '2026-11-25', admissionSpecialistId: 3, responsibleSpecialistId: 4, roomId: 7 };
  test('fecha de ingreso real, no futura y no anterior al evento; dos médicos y habitación', () => {
    expect(validateHospitalization(form, { today: TODAY, eventDate: '2026-11-24' })).toEqual({});
    expect(validateHospitalization({ ...form, dateIn: '2026-11-26' }, { today: TODAY }).dateIn).toBe('page.hospitalizations.msg.dateInInvalid');
    expect(validateHospitalization({ ...form, dateIn: '2026-11-20' }, { today: TODAY, eventDate: '2026-11-24T00:00:00.000Z' }).dateIn).toBe('page.hospitalizations.msg.dateInBeforeEvent');
    expect(Object.keys(validateHospitalization({ dateIn: TODAY }, { today: TODAY })).sort()).toEqual(['admissionSpecialistId', 'responsibleSpecialistId', 'roomId']);
  });
  test('el cuerpo de hospitalizar son números y la razón opcional vale 0', () => {
    expect(buildHospitalizePayload({ ...form, reasonId: '' })).toEqual({ dateIn: '2026-11-25', admissionSpecialistId: 3, responsibleSpecialistId: 4, reasonId: 0, roomId: 7 });
  });
  test('días de estancia desde el ingreso (o la fecha del evento si no tiene), nunca negativos', () => {
    expect(daysStay({ dateIn: '2026-11-20', date: '2026-01-01' }, TODAY)).toBe(5);
    expect(daysStay({ date: '2026-11-24' }, TODAY)).toBe(1);
    expect(daysStay({ dateIn: '2026-11-30' }, TODAY)).toBe(0);
    expect(daysStay({}, TODAY)).toBe(0);
  });
  test('los avisos del back se traducen a claves', () => {
    expect(warningMessages([{ code: 'room.occupied', roomId: 7, occupants: 1 }])).toEqual(['page.hospitalizations.msg.roomOccupied']);
    expect(warningMessages([])).toEqual([]);
  });
});
