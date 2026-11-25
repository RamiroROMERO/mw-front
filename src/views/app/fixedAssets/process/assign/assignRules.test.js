import { describe, expect, test } from 'vitest';
import { assignState, buildAssignPayload, validateAssign, validateFinish } from './assignRules';

const TODAY = '2026-11-25';
const valid = { id: 0, date: '2026-08-10', assetId: 2, assetValue: 1980, responsibleId: 2, areaId: 2, others: '', notes: '' };

describe('validateAssign (mismos casos que AssignDTO del back)', () => {
  test('una asignación válida no tiene errores', () => { expect(validateAssign(valid, TODAY)).toEqual({}); });
  test.each(['date', 'assetId', 'assetValue', 'responsibleId', 'areaId'])('%s es obligatorio', (field) => {
    expect(validateAssign({ ...valid, [field]: '' }, TODAY)[field]).toBeDefined();
  });
  test.each(['2026-02-30', 'abc', '2999-01-01'])('fecha %p inválida o futura', (date) => { expect(validateAssign({ ...valid, date }, TODAY).date).toBeDefined(); });
  test.each([0, -1, 'x', 10.555, 1e10 + 1])('valor %p inválido', (assetValue) => { expect(validateAssign({ ...valid, assetValue }, TODAY).assetValue).toBeDefined(); });
  test('texto máximo de 2000', () => { expect(validateAssign({ ...valid, notes: 'a'.repeat(2001) }, TODAY).notes).toBeDefined(); });
});

describe('validateFinish', () => {
  test('fecha de cierre real, no futura y no anterior a la asignación', () => {
    expect(validateFinish({ dateEnd: '2026-09-01', notesEnd: '' }, '2026-08-10', TODAY)).toEqual({});
    expect(validateFinish({ dateEnd: '2026-08-10', notesEnd: '' }, '2026-08-10', TODAY)).toEqual({});
    expect(validateFinish({ dateEnd: '2026-08-09' }, '2026-08-10', TODAY).dateEnd).toBeDefined();
    expect(validateFinish({ dateEnd: '2999-01-01' }, '2026-08-10', TODAY).dateEnd).toBeDefined();
    expect(validateFinish({ dateEnd: '2026-02-30' }, '2026-08-10', TODAY).dateEnd).toBeDefined();
    expect(validateFinish({ dateEnd: '2026-09-01', notesEnd: 'a'.repeat(2001) }, '2026-08-10', TODAY).notesEnd).toBeDefined();
  });
});

describe('assignState', () => {
  test('borrador sin guardar, borrador guardado, aplicada y desasignada', () => {
    expect(assignState({ id: 0, isApplied: 0 })).toMatchObject({ canApply: false, canFinish: false, canDelete: false });
    expect(assignState({ id: 4, isApplied: 0 })).toMatchObject({ canApply: true, canFinish: false, canDelete: true, locked: false });
    expect(assignState({ id: 4, isApplied: 1, dateEnd: null })).toMatchObject({ canApply: false, canFinish: true, canDelete: false, locked: true });
    expect(assignState({ id: 4, isApplied: 1, dateEnd: '2026-09-01' })).toMatchObject({ canFinish: false, finished: true });
    expect(assignState({ id: 4, isApplied: 1, dateEnd: '1900-01-01' }).canFinish).toBe(true);
  });
});

describe('buildAssignPayload', () => {
  test('solo manda lo que el back acepta, con números normalizados', () => {
    const payload = buildAssignPayload({ ...valid, assetId: '2', isApplied: 1, dateEnd: '2026-01-01', assetName: 'x' });
    expect(payload).toEqual({ date: '2026-08-10', assetId: 2, assetValue: 1980, responsibleId: 2, areaId: 2, others: '', notes: '' });
  });
});
