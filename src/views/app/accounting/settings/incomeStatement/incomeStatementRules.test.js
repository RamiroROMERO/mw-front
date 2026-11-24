import { describe, expect, test } from 'vitest';
import { TYPE_GROUPS, emptyGroups, findProblems, overlaps, splitAddable, validateStructure } from './incomeStatementRules';

const row = (accountNumber, type) => ({ accountNumber, type });

describe('grupos', () => {
  test('siete grupos y uno vacío por cada uno', () => {
    expect(TYPE_GROUPS.map((g) => g.type)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(Object.keys(emptyGroups())).toHaveLength(7);
  });
});

describe('overlaps / findProblems (mismos casos que el back)', () => {
  test('hermanas no se traslapan', () => {
    expect(overlaps('402', '401')).toBe(false);
    expect(findProblems([row('4010101', 1), row('4010201', 1), row('50201', 2)])).toEqual({ duplicated: [], overlapping: [] });
  });
  test('repetida en el mismo grupo', () => {
    expect(findProblems([row('4010101', 1), row('4010101', 1)]).duplicated).toEqual(['4010101 (grupo 1)']);
  });
  test('la misma cuenta en dos grupos', () => {
    expect(findProblems([row('4010101', 1), row('4010101', 4)]).overlapping).toEqual(['4010101 (grupos 1 y 4)']);
  });
  test('una cuenta dentro de otra, en cualquier orden', () => {
    const expected = ['6010124282 (grupo 6) está dentro de 6010124 (grupo 3)'];
    expect(findProblems([row('6010124', 3), row('6010124282', 6)]).overlapping).toEqual(expected);
    expect(findProblems([row('6010124282', 6), row('6010124', 3)]).overlapping).toEqual(expected);
  });
});

describe('validateStructure', () => {
  test('vacía se rechaza', () => expect(validateStructure([]).id).toBe('page.incomeStatementStructure.error.empty'));
  test('repetida', () => expect(validateStructure([row('1', 1), row('1', 1)]).id).toBe('page.incomeStatementStructure.error.duplicated'));
  test('traslape', () => {
    const r = validateStructure([row('401', 1), row('40101', 2)]);
    expect(r.id).toBe('page.incomeStatementStructure.error.overlap');
    expect(r.detail).toContain('40101');
  });
  test('correcta devuelve null', () => expect(validateStructure([row('4010101', 1), row('5010101', 2)])).toBeNull());
});

describe('splitAddable', () => {
  test('separa lo que chocaría con lo existente (cualquier grupo) y entre lo elegido', () => {
    const existing = [row('4010101', 1), row('6010124', 3)];
    const { accepted, rejected } = splitAddable(['4010201', '4010101', '6010124282', '501', '50101'], existing);
    expect(accepted).toEqual(['4010201', '501']);
    expect(rejected).toEqual(['4010101', '6010124282', '50101']);
  });
  test('sin nada elegido', () => expect(splitAddable([], [row('1', 1)])).toEqual({ accepted: [], rejected: [] }));
});
