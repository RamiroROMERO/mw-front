import { describe, it, expect } from 'vitest';
import getErrorMessage from './errorMessage';

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
