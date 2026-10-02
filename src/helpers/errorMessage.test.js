import { describe, it, expect } from 'vitest';
import getErrorMessage, { getErrorCode } from './errorMessage';

const catalog = { 'error.period.closed.module': 'El período está cerrado', 'msg.save.record.error': 'Error al Guardar el Registro' };
const FALLBACK = 'msg.save.record.error';
const body = (message, description, extra = {}) => ({
  status: 'error', data: [], messages: [{ type: 'error', message, description }], ...extra,
});

describe('getErrorMessage', () => {
  it('usa la traducción error.<name> cuando existe', () => {
    const err = body('period.closed.module', 'texto del back', { statusCode: 400 });
    expect(getErrorMessage(err, FALLBACK, catalog)).toEqual({ id: 'error.period.closed.module' });
  });

  it('la traducción gana aunque la respuesta sea un 500', () => {
    const err = body('period.closed.module', 'x', { statusCode: 500 });
    expect(getErrorMessage(err, FALLBACK, catalog)).toEqual({ id: 'error.period.closed.module' });
  });

  it.each([400, 401, 403])('sin traducción muestra la description en un %s', (statusCode) => {
    const err = body('notFound', 'El cheque no existe', { statusCode });
    expect(getErrorMessage(err, FALLBACK, catalog)).toEqual({ text: 'El cheque no existe' });
  });

  it('nunca muestra la description de un 500', () => {
    const err = body('created.error', 'SequelizeDatabaseError: Unknown column', { statusCode: 500 });
    expect(getErrorMessage(err, FALLBACK, catalog)).toEqual({ id: FALLBACK });
  });

  it('sin statusCode no muestra la description', () => {
    const err = body('notFound', 'El cheque no existe');
    expect(getErrorMessage(err, FALLBACK, catalog)).toEqual({ id: FALLBACK });
  });

  it('un 400 de validación de campos (errors) usa el mensaje genérico', () => {
    const err = body('validation.error', 'Invalid request parameters', { statusCode: 400, errors: [{ field: 'name' }] });
    expect(getErrorMessage(err, FALLBACK, catalog)).toEqual({ id: FALLBACK });
  });

  it('un 400 genérico del back (Invalid request parameters) usa el mensaje genérico', () => {
    const err = body('id.required', 'Invalid request parameters', { statusCode: 400 });
    expect(getErrorMessage(err, FALLBACK, catalog)).toEqual({ id: FALLBACK });
  });

  it('la description vacía o con solo espacios usa el mensaje genérico', () => {
    expect(getErrorMessage(body('x', '   ', { statusCode: 400 }), FALLBACK, catalog)).toEqual({ id: FALLBACK });
    expect(getErrorMessage(body('x', '', { statusCode: 400 }), FALLBACK, catalog)).toEqual({ id: FALLBACK });
  });

  it('una description que no es texto usa el mensaje genérico', () => {
    expect(getErrorMessage(body('x', { a: 1 }, { statusCode: 400 }), FALLBACK, catalog)).toEqual({ id: FALLBACK });
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['string', 'boom'],
    ['sin messages', { status: 'error' }],
    ['messages vacío', { messages: [] }],
    ['messages no es arreglo', { messages: 'x' }],
    ['primer mensaje no es objeto', { messages: ['x'] }],
  ])('%s usa el mensaje genérico', (_, err) => {
    expect(getErrorMessage(err, FALLBACK, catalog)).toEqual({ id: FALLBACK });
  });

  it('el nombre no se interpreta como propiedad heredada (toString)', () => {
    const err = body('toString', 'x', { statusCode: 500 });
    expect(getErrorMessage(err, FALLBACK, catalog)).toEqual({ id: FALLBACK });
  });

  it('usa el catálogo real por defecto', () => {
    const err = body('no.existe.en.ningun.idioma', 'Texto del back', { statusCode: 400 });
    expect(getErrorMessage(err, FALLBACK)).toEqual({ text: 'Texto del back' });
  });
});

describe('getErrorCode', () => {
  // Cuerpo real que responde el back desde la SPEC v2-20 para un ValidError('invoice.hasPayments', ...)
  const business = (message, extra = {}) => ({
    status: 'error', data: [], statusCode: 400,
    messages: [{ type: 'error', message, description: message }], ...extra,
  });

  it('devuelve el código de un error de negocio (400)', () => {
    expect(getErrorCode(business('invoice.hasPayments'))).toBe('invoice.hasPayments');
    expect(getErrorCode(business('stock.insufficient'))).toBe('stock.insufficient');
  });

  it('también entiende la forma anterior: description era el objeto { name, description }', () => {
    const legacy = { statusCode: 500, messages: [{ message: 'voidInvoice.error', description: { name: 'invoice.cashClosed', description: 'x' } }] };
    expect(getErrorCode(legacy)).toBe('invoice.cashClosed');
  });

  it.each([500, 403, 401, 404, undefined])('no hay código en un %s', (statusCode) => {
    expect(getErrorCode(business('invoice.hasPayments', { statusCode }))).toBeUndefined();
  });

  it('no hay código en un 400 de validación de campos ni en el 400 genérico', () => {
    expect(getErrorCode(business('validation.error', { errors: [{ field: 'name' }] }))).toBeUndefined();
    expect(getErrorCode({ statusCode: 400, messages: [{ message: 'id.required', description: 'Invalid request parameters' }] })).toBeUndefined();
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['string', 'boom'],
    ['sin messages', { statusCode: 400 }],
    ['messages vacío', { statusCode: 400, messages: [] }],
    ['message no es texto', { statusCode: 400, messages: [{ message: 5, description: 'x' }] }],
    ['message vacío', { statusCode: 400, messages: [{ message: '', description: 'x' }] }],
  ])('%s no tiene código', (_, err) => {
    expect(getErrorCode(err)).toBeUndefined();
  });
});
