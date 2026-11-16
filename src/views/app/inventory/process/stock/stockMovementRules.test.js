import { describe, it, expect } from 'vitest';
import { MOVEMENT_MODES, defaultMovementForm, buildTypeOptions, validateMovement, buildMovementRequest, modeOf } from './stockMovementRules';

const TODAY = '2026-11-16';
const VALID = { productTypeId: 9, dateStart: '2026-11-01', dateEnd: '2026-11-16', modeId: 1, excludeAdjustments: false };

describe('modos y valores iniciales', () => {
  it('detalle y resumen, con los ids que usa el RadioGroup', () => {
    expect(MOVEMENT_MODES.map((m) => m.mode)).toEqual(['detail', 'summary']);
    expect(modeOf('2').mode).toBe('summary');
    expect(modeOf(0)).toBeNull();
  });
  it('el valor inicial es del primer día del mes a hoy, detalle, todos los tipos y con ajustes', () => {
    expect(defaultMovementForm(TODAY)).toEqual({ productTypeId: 0, dateStart: '2026-11-01', dateEnd: '2026-11-16', modeId: 1, excludeAdjustments: false });
  });
});

describe('buildTypeOptions', () => {
  it('trae "Todos" primero con valor 0 y los tipos con su id numérico', () => {
    expect(buildTypeOptions([{ id: 5, name: ' BIO ' }, { id: '9', name: 'HIGIENICOS' }], 'Todos')).toEqual([{ value: 0, label: 'Todos' }, { value: 5, label: 'BIO' }, { value: 9, label: 'HIGIENICOS' }]);
  });
  it('ignora filas sin id válido y sin datos devuelve solo "Todos"', () => {
    expect(buildTypeOptions([null, { id: 0, name: 'x' }, {}])).toEqual([{ value: 0, label: 'Todos' }]);
    expect(buildTypeOptions()).toHaveLength(1);
  });
});

describe('validateMovement', () => {
  it('un filtro completo es válido', () => expect(validateMovement(VALID, { today: TODAY })).toEqual({}));
  it.each([[''], ['  '], [undefined]])('fecha %p obligatoria (las dos)', (value) => {
    expect(validateMovement({ ...VALID, dateStart: value }, { today: TODAY })).toEqual({ dateStart: 'msg.required.input.date' });
    expect(validateMovement({ ...VALID, dateEnd: value }, { today: TODAY })).toEqual({ dateEnd: 'msg.required.input.date' });
  });
  it.each([['2026-02-30'], ['abc'], ['2026-13-01']])('fecha %s inválida', (value) => {
    expect(validateMovement({ ...VALID, dateStart: value }, { today: TODAY })).toEqual({ dateStart: 'page.stock.report.error.dateInvalid' });
  });
  it('una fecha futura se marca', () => {
    expect(validateMovement({ ...VALID, dateEnd: '2026-11-17' }, { today: TODAY })).toEqual({ dateEnd: 'page.stock.movement.error.dateFuture' });
  });
  it('el rango invertido marca la fecha final; un solo día es válido', () => {
    expect(validateMovement({ ...VALID, dateStart: '2026-11-10', dateEnd: '2026-11-01' }, { today: TODAY })).toEqual({ dateEnd: 'page.stock.movement.error.range' });
    expect(validateMovement({ ...VALID, dateStart: '2026-11-10', dateEnd: '2026-11-10' }, { today: TODAY })).toEqual({});
  });
  it('un modo desconocido se marca', () => {
    expect(validateMovement({ ...VALID, modeId: 0 }, { today: TODAY })).toEqual({ modeId: 'msg.required.select' });
  });
  it('con todo vacío marca las dos fechas y el modo', () => {
    expect(Object.keys(validateMovement({}, { today: TODAY })).sort()).toEqual(['dateEnd', 'dateStart', 'modeId']);
  });
});

describe('buildMovementRequest', () => {
  it('arma el GET con los parámetros en `params` y no en la URL', () => {
    const r = buildMovementRequest({ ...VALID, modeId: 2, excludeAdjustments: true }, 'xlsx');
    expect(r).toEqual({ url: 'inventory/process/stocks/movements', params: { productTypeId: 9, dateStart: '2026-11-01', dateEnd: '2026-11-16', mode: 'summary', excludeAdjustments: true, format: 'xlsx' }, fileName: 'Movimiento de Productos.xlsx' });
    expect(r.url).not.toContain('?');
  });
  it('"Todos" se envía como tipo 0 y un tipo inválido también', () => {
    expect(buildMovementRequest({ ...VALID, productTypeId: 0 }).params.productTypeId).toBe(0);
    expect(buildMovementRequest({ ...VALID, productTypeId: 'abc' }).params.productTypeId).toBe(0);
    expect(buildMovementRequest({ ...VALID, productTypeId: '7' }).params.productTypeId).toBe(7);
  });
  it('un formato distinto de xlsx es pdf y el modo por defecto es detalle', () => {
    expect(buildMovementRequest(VALID, 'otro').params.format).toBe('pdf');
    expect(buildMovementRequest(VALID).fileName).toBe('Movimiento de Productos.pdf');
    expect(buildMovementRequest({ ...VALID, modeId: undefined }).params.mode).toBe('detail');
  });
  it('excluir ajustes siempre viaja como booleano', () => {
    expect(buildMovementRequest({ ...VALID, excludeAdjustments: undefined }).params.excludeAdjustments).toBe(false);
  });
});
