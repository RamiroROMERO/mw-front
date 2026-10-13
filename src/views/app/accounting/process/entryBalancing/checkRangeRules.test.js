import { describe, it, expect } from 'vitest';
import {
  MAX_CHECKS_PER_CALL, SKIP_REASONS, skipReasonLabelKey, validateRange, buildPreviewBody, isSelectable, selectableIds,
  chunkIds, mergeRepairResults, countRepairResults, canRegenerate
} from './checkRangeRules';

describe('validateRange', () => {
  it('rango válido: null', () => expect(validateRange({ dateStart: '2026-08-01', dateEnd: '2026-08-31' })).toBeNull());
  it('mismo día: válido', () => expect(validateRange({ dateStart: '2026-08-01', dateEnd: '2026-08-01' })).toBeNull());
  it.each([[{}], [{ dateStart: '2026-08-01' }], [{ dateEnd: '2026-08-01' }], [undefined], [{ dateStart: ' ', dateEnd: '2026-08-01' }]])(
    'faltan fechas %j: rangeRequired', (range) => expect(validateRange(range)).toBe('page.entryBalancing.checkRange.msg.rangeRequired')
  );
  it.each([
    [{ dateStart: '2026-09-01', dateEnd: '2026-08-31' }],
    [{ dateStart: '01/08/2026', dateEnd: '31/08/2026' }]
  ])('rango inválido %j: rangeInvalid', (range) => expect(validateRange(range)).toBe('page.entryBalancing.checkRange.msg.rangeInvalid'));
});

describe('buildPreviewBody', () => {
  it('sin banco no lo manda', () => {
    expect(buildPreviewBody({ dateStart: ' 2026-08-01', dateEnd: '2026-08-31 ', bankCode: '  ' })).toEqual({ dateStart: '2026-08-01', dateEnd: '2026-08-31' });
  });
  it('con banco lo manda sin espacios', () => {
    expect(buildPreviewBody({ dateStart: '2026-08-01', dateEnd: '2026-08-31', bankCode: ' BAC ' }).bankCode).toBe('BAC');
  });
});

describe('selección', () => {
  const items = [
    { checkId: 1, status: 'READY' }, { checkId: 2, status: 'SKIPPED', skipReason: 'VOIDED' }, { checkId: 3, status: 'READY' }
  ];
  it('solo los READY se pueden elegir', () => {
    expect(items.map(isSelectable)).toEqual([true, false, true]);
    expect(selectableIds(items)).toEqual([1, 3]);
    expect(isSelectable(null)).toBe(false);
  });
});

describe('chunkIds', () => {
  it('lotes de máximo 200', () => {
    const ids = Array.from({ length: 450 }, (_, i) => i + 1);
    expect(chunkIds(ids).map((c) => c.length)).toEqual([200, 200, 50]);
    expect(MAX_CHECKS_PER_CALL).toBe(200);
  });
  it('vacío: sin lotes; exactamente 200: uno', () => {
    expect(chunkIds([])).toEqual([]);
    expect(chunkIds(Array.from({ length: 200 }, (_, i) => i))).toHaveLength(1);
  });
});

describe('resultados', () => {
  it('une los results de varias respuestas y cuenta por estado', () => {
    const merged = mergeRepairResults([
      { data: { results: [{ status: 'repaired' }, { status: 'skipped' }] } }, null, { data: { results: [{ status: 'error' }] } }
    ]);
    expect(merged).toHaveLength(3);
    expect(countRepairResults(merged)).toEqual({ repaired: 1, skipped: 1, error: 1 });
  });
});

describe('canRegenerate y etiquetas', () => {
  it('exige 11.01.015 y algo seleccionado', () => {
    expect(canRegenerate({ repair: true }, 2)).toBe(true);
    expect(canRegenerate({ repair: true }, 0)).toBe(false);
    expect(canRegenerate({ repair: false }, 2)).toBe(false);
    expect(canRegenerate(undefined, 2)).toBe(false);
  });
  it('cada motivo tiene su clave', () => {
    expect(SKIP_REASONS).toHaveLength(7);
    expect(skipReasonLabelKey('ALREADY_OK')).toBe('page.entryBalancing.checkRange.reason.ALREADY_OK');
  });
});
