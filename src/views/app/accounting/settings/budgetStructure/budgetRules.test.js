import { describe, expect, test } from 'vitest';
import { INITIAL_LINE_FORM, MONTHS, actionText, buildLinePayload, canMove, formatAmount, isDetail, isValidAmount, mapLineToForm, monthKey, moveId, spreadFirstMonth, validateLine } from './budgetRules';

const valid = { ...INITIAL_LINE_FORM, name: 'GASTOS ADMINISTRATIVOS', type: 'Detalle', action: 'Suma', month1: '5000' };

describe('isValidAmount (mismos casos que isValidAmount del back)', () => {
  test.each(['', '0', '0.5', '100', '100.25', '9999999999.99'])('"%s" es válido', (value) => expect(isValidAmount(value)).toBe(true));
  test.each(['-1', '1.234', '1e3', 'abc', '10000000000', '1,5', '.5'])('"%s" no es válido', (value) => expect(isValidAmount(value)).toBe(false));
  test('null y undefined cuentan como vacío', () => {
    expect(isValidAmount(null)).toBe(true);
    expect(isValidAmount(undefined)).toBe(true);
  });
});

describe('validateLine (mismos casos que BudgetLineDTO del back)', () => {
  test('un Detalle completo es válido', () => expect(validateLine(valid)).toEqual({}));
  test('un Titulo, un Total y un Acumulado solo necesitan nombre y tipo', () => {
    ['Titulo', 'Total', 'Acumulado'].forEach((type) => expect(validateLine({ ...INITIAL_LINE_FORM, name: 'Ingresos', type, action: '' })).toEqual({}));
  });
  test('el nombre es obligatorio (vacío o solo espacios) y de máximo 200', () => {
    ['', '   '].forEach((name) => expect(validateLine({ ...valid, name }).name).toBe('page.budgetStructure.error.name.required'));
    expect(validateLine({ ...valid, name: 'x'.repeat(201) }).name).toBe('page.budgetStructure.error.name.max');
    expect(validateLine({ ...valid, name: 'x'.repeat(200) })).toEqual({});
  });
  test('un Detalle sin acción se rechaza; en otros tipos no se pide', () => {
    expect(validateLine({ ...valid, action: '' }).action).toBe('page.budgetStructure.error.action.required');
    expect(validateLine({ ...valid, action: 'Multiplica' }).action).toBe('page.budgetStructure.error.action.required');
    expect(validateLine({ ...valid, type: 'Total', action: '' })).toEqual({});
  });
  test('tipo fuera de la lista', () => {
    expect(validateLine({ ...valid, type: 'Subtotal' }).type).toBe('page.budgetStructure.error.type.required');
    expect(validateLine({ ...valid, type: '' }).type).toBe('page.budgetStructure.error.type.required');
  });
  test('los meses de un Detalle son montos válidos; los de otros tipos no se validan', () => {
    expect(validateLine({ ...valid, month3: '-5' }).month3).toBe('page.budgetStructure.error.month.invalid');
    expect(validateLine({ ...valid, month12: '1.234' }).month12).toBe('page.budgetStructure.error.month.invalid');
    expect(validateLine({ ...valid, type: 'Titulo', month3: '-5' })).toEqual({});
  });
});

describe('buildLinePayload / mapLineToForm', () => {
  test('un Detalle manda sus 12 meses como número (vacío = 0)', () => {
    const payload = buildLinePayload({ ...valid, month2: '12.5' });
    expect(payload).toMatchObject({ name: 'GASTOS ADMINISTRATIVOS', type: 'Detalle', action: 'Suma', month1: 5000, month2: 12.5, month3: 0, month12: 0 });
    expect(MONTHS.every((month) => typeof payload[monthKey(month)] === 'number')).toBe(true);
  });
  test('los otros tipos mandan acción Ninguno y ningún mes (los calcula el back)', () => {
    const payload = buildLinePayload({ ...valid, type: 'Total', action: 'Suma' });
    expect(payload).toEqual({ name: 'GASTOS ADMINISTRATIVOS', type: 'Total', action: 'Ninguno' });
  });
  test('nunca manda orden, año, total ni estado', () => {
    ['orderId', 'yearNo', 'year', 'total', 'status', 'id'].forEach((key) => expect(buildLinePayload({ ...valid, orderId: 3, yearNo: 2026, total: 9, status: 0, id: 4 })).not.toHaveProperty(key));
  });
  test('mapLineToForm muestra los montos con 2 decimales y una acción Ninguno como Suma por defecto', () => {
    const form = mapLineToForm({ id: 7, name: ' Viáticos ', type: 'Detalle', action: 'Resta', month1: '500.00', month2: 12, month3: null });
    expect(form).toMatchObject({ id: 7, name: 'Viáticos', action: 'Resta', month1: '500.00', month2: '12.00', month3: '' });
    expect(mapLineToForm({ id: 1, name: 'T', type: 'Titulo', action: 'Ninguno' }).action).toBe('Suma');
  });
});

describe('spreadFirstMonth', () => {
  test('copia el mes 1 a los meses vacíos o en 0 y respeta los ya digitados', () => {
    const form = spreadFirstMonth({ ...INITIAL_LINE_FORM, month1: '100', month2: '0', month3: '250', month4: '' });
    expect(form.month2).toBe('100');
    expect(form.month3).toBe('250');
    expect(form.month4).toBe('100');
    expect(form.month12).toBe('100');
  });
  test('con el mes 1 vacío o inválido no cambia nada', () => {
    const base = { ...INITIAL_LINE_FORM, month1: '' };
    expect(spreadFirstMonth(base)).toBe(base);
    const bad = { ...INITIAL_LINE_FORM, month1: '-3' };
    expect(spreadFirstMonth(bad)).toBe(bad);
  });
});

describe('moveId / canMove', () => {
  const ids = [10, 20, 30];
  test('sube y baja una línea intercambiándola con su vecina', () => {
    expect(moveId(ids, 20, -1)).toEqual([20, 10, 30]);
    expect(moveId(ids, 20, 1)).toEqual([10, 30, 20]);
  });
  test('en los extremos o con un id inexistente no cambia (misma referencia)', () => {
    expect(moveId(ids, 10, -1)).toBe(ids);
    expect(moveId(ids, 30, 1)).toBe(ids);
    expect(moveId(ids, 99, 1)).toBe(ids);
    expect(canMove(ids, 10, -1)).toBe(false);
    expect(canMove(ids, 20, 1)).toBe(true);
  });
  test('no muta la lista original', () => {
    const copy = [...ids];
    moveId(ids, 20, -1);
    expect(ids).toEqual(copy);
  });
  test('acepta ids como texto', () => {
    expect(moveId(['10', '20'], 20, -1)).toEqual(['20', '10']);
  });
});

describe('auxiliares', () => {
  test('isDetail y actionText', () => {
    expect(isDetail('Detalle')).toBe(true);
    expect(isDetail(' Detalle ')).toBe(true);
    expect(isDetail('Total')).toBe(false);
    expect(actionText('Suma')).toBe('Suma');
    expect(actionText('Ninguno')).toBe('');
  });
  test('formatAmount', () => {
    expect(formatAmount(1234.5)).toBe('1,234.50');
    expect(formatAmount('60000')).toBe('60,000.00');
    expect(formatAmount(null)).toBe('0.00');
  });
});
