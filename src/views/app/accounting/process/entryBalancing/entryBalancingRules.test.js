import { describe, it, expect } from 'vitest';
import {
  commonActions, isHomogeneous, buildParams, validateParams, chunkKeys, needsClosedConfirmation, categoryMeta,
  statusMeta, resultMeta, CATEGORIES, CATEGORY_META, isIgnoreReasonValid, mergeResults, readyKeys, canRepair,
  canConfirmClosed, summaryTotals, buildQuery, actionLabelKey, MAX_KEYS_PER_CALL, countByResult
} from './entryBalancingRules';
import es from '../../../../../lang/locales/es_ES.js';
import en from '../../../../../lang/locales/en_US.js';

const item = (over = {}) => ({
  key: 'e:1', category: 'UNBALANCED', subcategory: 'ROUNDING', actions: ['IGNORE', 'BALANCE_WITH_ACCOUNT'], periodClosed: false, ...over
});

describe('commonActions', () => {
  it('devuelve las acciones de una selección homogénea', () => {
    expect(commonActions([item(), item({ key: 'e:2' })])).toEqual(['IGNORE', 'BALANCE_WITH_ACCOUNT']);
  });
  it('selección vacía no ofrece nada', () => {
    expect(commonActions([])).toEqual([]);
  });
  it('selección mixta (otra categoría o subcategoría) no está permitida', () => {
    expect(isHomogeneous([item(), item({ category: 'NO_LINES', subcategory: undefined })])).toBe(false);
    expect(commonActions([item(), item({ subcategory: 'OTHER' })])).toEqual([]);
  });
  it('intersecta si los ítems traen acciones distintas', () => {
    const a = item({ actions: ['ADD_CREDIT_NOTE_LINE', 'IGNORE'] });
    const b = item({ actions: ['IGNORE'] });
    expect(commonActions([a, b])).toEqual(['IGNORE']);
  });
  it('un solo ítem conserva el orden del back', () => {
    expect(commonActions([item({ actions: ['FIX_HEADER'] })])).toEqual(['FIX_HEADER']);
  });
});

describe('buildParams y validateParams', () => {
  it('FIX_HEADER no lleva parámetros', () => {
    expect(buildParams('FIX_HEADER', { accountNumber: '1' })).toEqual({});
  });
  it('ADD_CREDIT_NOTE_LINE: cuenta opcional', () => {
    expect(buildParams('ADD_CREDIT_NOTE_LINE', {})).toEqual({});
    expect(buildParams('ADD_CREDIT_NOTE_LINE', { accountNumber: ' 1101 ' })).toEqual({ accountNumber: '1101' });
    expect(validateParams('ADD_CREDIT_NOTE_LINE', {})).toBeNull();
  });
  it('BALANCE_WITH_ACCOUNT exige cuenta', () => {
    expect(validateParams('BALANCE_WITH_ACCOUNT', {})).toBe('page.entryBalancing.msg.accountRequired');
    expect(validateParams('BALANCE_WITH_ACCOUNT', { accountNumber: '4101' })).toBeNull();
    expect(buildParams('BALANCE_WITH_ACCOUNT', { accountNumber: '4101' })).toEqual({ accountNumber: '4101' });
  });
  it('RECLASSIFY_DEPOSIT exige fecha YYYY-MM-DD y cuenta opcional', () => {
    expect(validateParams('RECLASSIFY_DEPOSIT', { accountNumber: '1' })).toBe('page.entryBalancing.msg.dateRequired');
    expect(validateParams('RECLASSIFY_DEPOSIT', { date: '2026-10-01' })).toBeNull();
    expect(buildParams('RECLASSIFY_DEPOSIT', { date: '2026-10-01', accountNumber: '' })).toEqual({ date: '2026-10-01' });
  });
  it('ASSIGN_ACCOUNTS arma assignments numéricos y descarta vacíos', () => {
    const form = { assignments: { 10: '1101', 11: '', 12: ' 2101 ' } };
    expect(buildParams('ASSIGN_ACCOUNTS', form)).toEqual({
      assignments: [{ lineId: 10, accountNumber: '1101' }, { lineId: 12, accountNumber: '2101' }]
    });
    expect(validateParams('ASSIGN_ACCOUNTS', { assignments: { 1: '' } })).toBe('page.entryBalancing.msg.assignmentsRequired');
    expect(validateParams('ASSIGN_ACCOUNTS', form)).toBeNull();
  });
  it('confirmClosedPeriod solo se envía en true', () => {
    expect(buildParams('FIX_HEADER', {}, { confirmClosedPeriod: true })).toEqual({ confirmClosedPeriod: true });
    expect(buildParams('FIX_HEADER', {}, { confirmClosedPeriod: false })).toEqual({});
  });
});

describe('lotes y período cerrado', () => {
  it('parte en lotes de 200', () => {
    const keys = Array.from({ length: 450 }, (_, i) => `e:${i}`);
    const chunks = chunkKeys(keys);
    expect(MAX_KEYS_PER_CALL).toBe(200);
    expect(chunks.map((c) => c.length)).toEqual([200, 200, 50]);
    expect(chunks.flat()).toEqual(keys);
    expect(chunkKeys([])).toEqual([]);
    expect(chunkKeys(['a', 'b', 'c'], 2)).toEqual([['a', 'b'], ['c']]);
  });
  it('detecta período cerrado en ítems y en resultados de la vista previa', () => {
    expect(needsClosedConfirmation([item(), item()])).toBe(false);
    expect(needsClosedConfirmation([item(), item({ periodClosed: true })])).toBe(true);
    expect(needsClosedConfirmation([{ key: 'a', periodClosed: true }])).toBe(true);
    expect(needsClosedConfirmation([{ key: 'a', item: { periodClosed: true } }])).toBe(true);
    expect(needsClosedConfirmation([])).toBe(false);
  });
  it('une resultados de varias respuestas y cuenta por estado', () => {
    const res = mergeResults([
      { data: { results: [{ key: 'a', status: 'ready' }] } },
      { data: { results: [{ key: 'b', status: 'error' }, { key: 'c', status: 'ready' }] } },
      null
    ]);
    expect(res.map((r) => r.key)).toEqual(['a', 'b', 'c']);
    expect(readyKeys(res)).toEqual(['a', 'c']);
    expect(countByResult(res)).toEqual({ ready: 2, error: 1 });
  });
});

describe('privilegios, resumen, filtros y motivo', () => {
  it('reparar exige 11.01.015 y confirmar cerrado además 11.01.019', () => {
    expect(canRepair({ repair: false, closedPeriod: true })).toBe(false);
    expect(canConfirmClosed({ repair: true, closedPeriod: false })).toBe(false);
    expect(canConfirmClosed({ repair: true, closedPeriod: true })).toBe(true);
  });
  it('suma el resumen', () => {
    expect(summaryTotals([
      { pending: 2, repaired: 1, ignored: 0, total: 3 },
      { pending: 1, repaired: 0, ignored: 4, total: 5 }
    ])).toEqual({ pending: 3, repaired: 1, ignored: 4, total: 8 });
  });
  it('buildQuery omite vacíos', () => {
    expect(buildQuery({ dateFrom: '', category: 'NO_LINES', status: 'pending' }, { page: 1, pageSize: 25 }))
      .toEqual({ category: 'NO_LINES', status: 'pending', page: 1, pageSize: 25 });
  });
  it('el motivo de ignorar pide mínimo 3 caracteres', () => {
    expect(isIgnoreReasonValid('  ab ')).toBe(false);
    expect(isIgnoreReasonValid('abc')).toBe(true);
    expect(isIgnoreReasonValid(undefined)).toBe(false);
  });
});

describe('etiquetas y colores', () => {
  it('toda categoría tiene color y etiqueta traducida en es y en', () => {
    CATEGORIES.forEach((c) => {
      expect(CATEGORY_META[c].color).toBeTruthy();
      expect(es[CATEGORY_META[c].labelKey]).toBeTruthy();
      expect(en[CATEGORY_META[c].labelKey]).toBeTruthy();
    });
  });
  it('estados y resultados tienen color y traducción', () => {
    ['pending', 'repaired', 'ignored'].forEach((s) => {
      expect(statusMeta(s).color).toBeTruthy();
      expect(es[statusMeta(s).labelKey]).toBeTruthy();
      expect(en[statusMeta(s).labelKey]).toBeTruthy();
    });
    ['ready', 'repaired', 'unchanged', 'error'].forEach((s) => {
      expect(es[resultMeta(s).labelKey]).toBeTruthy();
      expect(en[resultMeta(s).labelKey]).toBeTruthy();
    });
  });
  it('categoría desconocida cae a un valor neutro', () => {
    expect(categoryMeta('X').color).toBe('secondary');
    expect(statusMeta('zzz').color).toBe('secondary');
  });
  it('cada acción y subcategoría tiene traducción', () => {
    ['FIX_HEADER', 'REVERSE_CHECK_LINES', 'REGENERATE_CHECK_ENTRY', 'ADD_CREDIT_NOTE_LINE', 'ADD_DIFFERENCE_LINE',
      'RECLASSIFY_DEPOSIT', 'ASSIGN_ACCOUNTS', 'BALANCE_WITH_ACCOUNT', 'IGNORE'].forEach((a) => {
      expect(es[actionLabelKey(a)]).toBeTruthy();
      expect(en[actionLabelKey(a)]).toBeTruthy();
    });
    ['ROUNDING', 'CREDIT_NOTE_ONE_SIDED', 'DEPOSIT_MISSING_LINE', 'OTHER', 'CHECK_REVERSAL_ZERO'].forEach((s) => {
      expect(es[`page.entryBalancing.subcategory.${s}`]).toBeTruthy();
      expect(en[`page.entryBalancing.subcategory.${s}`]).toBeTruthy();
    });
  });
});
