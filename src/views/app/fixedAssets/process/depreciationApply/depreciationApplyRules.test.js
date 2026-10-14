import { describe, it, expect } from 'vitest';
import {
  currentMonth, isValidMonth, isFutureMonth, monthOptions, formatMonth, buildPreviewQuery, buildApplyBody, buildUnapplyBody,
  pendingCount, canApply, previewSummary, groupByAsset, warningTexts, resolveUnapplyAction, batchRow, MONTHS_BACK
} from './depreciationApplyRules';

// Mismos números y casos que el back (depreciationApplyRules.test.js): mes en curso octubre 2026.
const NOW = new Date(2026, 9, 13, 12, 0, 0);
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const line = (over = {}) => ({
  detailId: 1, assetId: 10, assetCode: 'AF-001', assetName: 'Laptop', value: 100, areaId: 4, areaName: 'ADMINISTRACION',
  debitAccount: '6010101001', creditAccount: '1020201001', ...over
});
const preview = (over = {}) => ({ month: '2026-08', dateApply: '2026-08-31', total: 100, lines: [line()], zeroValueLines: [], warnings: [], ...over });

describe('mes', () => {
  it('currentMonth usa la fecha local', () => {
    expect(currentMonth(NOW)).toBe('2026-10');
    expect(currentMonth(new Date(2026, 0, 1, 0, 30, 0))).toBe('2026-01');
  });
  it.each(['2026-08', '1999-12', ' 2026-01 '])('%s es válido', (m) => expect(isValidMonth(m)).toBe(true));
  it.each(['2026-8', '2026-13', '2026-00', 'agosto', '', null, undefined, '2026-08-31'])('%p es inválido', (m) => expect(isValidMonth(m)).toBe(false));
  it('un mes futuro se detecta; el mes en curso y los anteriores no', () => {
    expect(isFutureMonth('2026-11', NOW)).toBe(true);
    expect(isFutureMonth('2027-01', NOW)).toBe(true);
    expect(isFutureMonth('2026-10', NOW)).toBe(false);
    expect(isFutureMonth('2025-01', NOW)).toBe(false);
    expect(isFutureMonth('basura', NOW)).toBe(false);
  });
});

describe('monthOptions', () => {
  it('empieza en el mes en curso y baja de mes en mes, cruzando el año', () => {
    const options = monthOptions(NOW, 12);
    expect(options).toHaveLength(12);
    expect(options[0]).toEqual({ value: '2026-10', year: 2026, month: 10 });
    expect(options[9].value).toBe('2026-01');
    expect(options[10]).toEqual({ value: '2025-12', year: 2025, month: 12 });
    expect(options[11].value).toBe('2025-11');
  });
  it('por defecto ofrece 36 meses, todos válidos, distintos y ninguno futuro', () => {
    const options = monthOptions(NOW);
    expect(options).toHaveLength(MONTHS_BACK);
    expect(MONTHS_BACK).toBe(36);
    options.forEach((o) => { expect(isValidMonth(o.value)).toBe(true); expect(isFutureMonth(o.value, NOW)).toBe(false); });
    expect(new Set(options.map((o) => o.value)).size).toBe(36);
  });
  it('en enero retrocede a diciembre del año anterior', () => {
    expect(monthOptions(new Date(2026, 0, 5), 2).map((o) => o.value)).toEqual(['2026-01', '2025-12']);
  });
});

describe('formatMonth', () => {
  it('usa los nombres del idioma activo', () => {
    expect(formatMonth('2026-10', MONTH_NAMES)).toBe('Octubre 2026');
    expect(formatMonth('2026-01', MONTH_NAMES)).toBe('Enero 2026');
  });
  it('sin nombres o con un valor inválido no falla', () => {
    expect(formatMonth('2026-10')).toBe('10 2026');
    expect(formatMonth('xx', MONTH_NAMES)).toBe('xx');
    expect(formatMonth(null, MONTH_NAMES)).toBe('');
  });
});

describe('cuerpos de las peticiones', () => {
  it('consulta y cuerpo de aplicar llevan el mes recortado', () => {
    expect(buildPreviewQuery(' 2026-08 ')).toEqual({ month: '2026-08' });
    expect(buildApplyBody('2026-08')).toEqual({ month: '2026-08' });
    expect(buildPreviewQuery(null)).toEqual({ month: '' });
  });
  it('desaplicar manda el id del lote como número', () => {
    expect(buildUnapplyBody({ id: '7' })).toEqual({ applyId: 7 });
    expect(buildUnapplyBody(null)).toEqual({ applyId: 0 });
  });
});

describe('qué se puede aplicar', () => {
  it('cuenta las líneas con asiento y las de valor 0', () => {
    expect(pendingCount(preview({ lines: [line(), line({ detailId: 2 })], zeroValueLines: [{ detailId: 3 }] }))).toBe(3);
    expect(pendingCount(null)).toBe(0);
    expect(pendingCount({})).toBe(0);
  });
  it('sin pendientes el botón Aplicar queda deshabilitado', () => {
    expect(canApply(preview({ lines: [], zeroValueLines: [] }))).toBe(false);
    expect(canApply(null)).toBe(false);
  });
  it('con pendientes se habilita, salvo mientras hay una operación en curso', () => {
    expect(canApply(preview())).toBe(true);
    expect(canApply(preview(), true)).toBe(false);
  });
  it('un lote de solo líneas en cero también se puede aplicar', () => {
    expect(canApply(preview({ lines: [], zeroValueLines: [{ detailId: 1 }] }))).toBe(true);
  });
});

describe('previewSummary', () => {
  it('cuenta líneas, activos distintos, ceros y avisos', () => {
    const p = preview({
      total: 250.5, lines: [line(), line({ detailId: 2, value: 50.5 }), line({ detailId: 3, assetId: 11, value: 100 })],
      zeroValueLines: [{ detailId: 9 }], warnings: [{ code: 'asset.noAssignment', assetId: 11, message: 'x' }]
    });
    expect(previewSummary(p)).toEqual({
      month: '2026-08', dateApply: '2026-08-31', total: 250.5, linesCount: 3, zeroCount: 1, assetsCount: 2, warningsCount: 1
    });
  });
  it('sin vista previa todo en cero', () => {
    expect(previewSummary(null)).toEqual({ month: '', dateApply: '', total: 0, linesCount: 0, zeroCount: 0, assetsCount: 0, warningsCount: 0 });
  });
});

describe('groupByAsset', () => {
  it('agrupa por activo y suma en centavos sin ruido de coma flotante', () => {
    const groups = groupByAsset([line({ value: 0.1 }), line({ detailId: 2, value: 0.2 }), line({ detailId: 3, assetId: 11, assetCode: 'AF-002', value: 33.33 })]);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ assetId: 10, count: 2, value: 0.3 });
    expect(groups[1]).toMatchObject({ assetId: 11, assetCode: 'AF-002', count: 1, value: 33.33 });
  });
  it('conserva el orden de aparición y las cuentas de cada activo', () => {
    const groups = groupByAsset([line({ assetId: 20 }), line({ assetId: 10, detailId: 2 })]);
    expect(groups.map((g) => g.assetId)).toEqual([20, 10]);
    expect(groups[0]).toMatchObject({ debitAccount: '6010101001', creditAccount: '1020201001', areaName: 'ADMINISTRACION' });
  });
  it('500 líneas de 33.33 suman 16665 exactos', () => {
    const lines = Array.from({ length: 500 }, (_, i) => line({ detailId: i + 1, value: 33.33 }));
    expect(groupByAsset(lines)[0].value).toBe(16665);
  });
  it('lista vacía o ausente', () => {
    expect(groupByAsset([])).toEqual([]);
    expect(groupByAsset()).toEqual([]);
  });
});

describe('warningTexts', () => {
  it('devuelve los mensajes del back sin repetir ni vacíos', () => {
    expect(warningTexts([{ message: 'a' }, { message: 'a' }, { message: '' }, null, { message: 'b' }])).toEqual(['a', 'b']);
    expect(warningTexts(undefined)).toEqual([]);
  });
});

describe('resolveUnapplyAction (privilegio 11.01.015)', () => {
  it('con permiso pide confirmación', () => expect(resolveUnapplyAction({ id: 5 }, true)).toBe('confirm'));
  it('sin permiso avisa sin llamar al back', () => expect(resolveUnapplyAction({ id: 5 }, false)).toBe('forbidden'));
  it('sin lote no hay nada que desaplicar', () => {
    expect(resolveUnapplyAction(null, true)).toBe('none');
    expect(resolveUnapplyAction({ id: 0 }, true)).toBe('none');
    expect(resolveUnapplyAction({}, true)).toBe('none');
  });
});

describe('batchRow', () => {
  it('normaliza los números del historial', () => {
    expect(batchRow({ id: '3', periodMonth: '2026-08', dateApply: '2026-08-31', pdaNumber: '500', total: '10.5', linesCount: '2' }))
      .toEqual({ id: 3, periodMonth: '2026-08', dateApply: '2026-08-31', pdaNumber: 500, hasEntry: true, total: 10.5, linesCount: 2 });
  });
  it('un lote sin partida (solo líneas en cero) se marca sin asiento', () => {
    expect(batchRow({ id: 4, pdaNumber: 0, total: 0, linesCount: 0 })).toMatchObject({ pdaNumber: 0, hasEntry: false });
    expect(batchRow({ id: 4 })).toMatchObject({ pdaNumber: 0, hasEntry: false, total: 0, linesCount: 0 });
  });
});
