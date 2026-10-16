import { describe, it, expect, vi } from 'vitest';
import { PERCENT_FIELDS, emptyBulkPercents, suggestedPercents, validateBulkPercents, runBulkDistribution, summarizeSkipped } from './distributeAllRules';

const rowsOf = (n) => Array.from({ length: n }, (_, i) => ({ productCode: `P-${i}` }));

describe('porcentajes del diálogo', () => {
  it('son los seis de inv_porp', () => {
    expect(PERCENT_FIELDS).toEqual(['localMin', 'localMid', 'localMax', 'foranMin', 'foranMid', 'foranMax']);
    expect(Object.values(emptyBulkPercents())).toEqual(['', '', '', '', '', '']);
  });

  it('suggestedPercents: los de inv_porp como texto y los 0 quedan vacíos', () => {
    expect(suggestedPercents({ localMin: 10, localMid: 15.5, localMax: 0, foranMin: '20', foranMid: null })).toEqual({
      localMin: '10', localMid: '15.5', localMax: '', foranMin: '20', foranMid: '', foranMax: ''
    });
  });

  it('suggestedPercents sin respuesta -> todo vacío', () => {
    expect(suggestedPercents(undefined)).toEqual(emptyBulkPercents());
  });

  it.each([[''], [null], [undefined], ['  '], [0], ['0'], [20], ['99.99'], ['15.5']])('%p es válido', (value) => {
    expect(validateBulkPercents({ localMin: value })).toEqual({});
  });

  it.each([[-1], ['-5'], ['abc'], [100], ['100'], [150], [true]])('%p se rechaza', (value) => {
    expect(Object.keys(validateBulkPercents({ foranMax: value }))).toEqual(['foranMax']);
  });

  it('todo vacío o sin objeto es válido (usa los precios actuales de cada producto)', () => {
    expect(validateBulkPercents(emptyBulkPercents())).toEqual({});
    expect(validateBulkPercents(undefined)).toEqual({});
  });

  it('el error es un id de traducción', () => {
    expect(validateBulkPercents({ localMin: 'x' }).localMin).toBe('page.productsCatalog.error.distAll.percent');
  });
});

describe('runBulkDistribution', () => {
  it('envía en lotes de 200 y suma lo creado: 450 filas -> 200 + 200 + 50', async () => {
    const post = vi.fn(async (batch) => ({ data: { created: batch.length } }));
    const result = await runBulkDistribution({ rows: rowsOf(450), post });
    expect(post.mock.calls.map(([batch]) => batch.length)).toEqual([200, 200, 50]);
    expect(result).toEqual({ created: 450, completedBatches: 3, totalBatches: 3, failed: false, error: null });
  });

  it('usa lo que reporta el back como creado', async () => {
    const result = await runBulkDistribution({ rows: rowsOf(3), post: async () => ({ data: { created: 2 } }) });
    expect(result.created).toBe(2);
  });

  it('si la respuesta no trae created cuenta las filas del lote', async () => {
    const result = await runBulkDistribution({ rows: rowsOf(3), post: async () => ({}) });
    expect(result.created).toBe(3);
  });

  it('un lote que falla detiene el proceso: no envía los siguientes y conserva lo ya creado', async () => {
    const boom = { statusCode: 400, messages: [{ message: 'distribution.bulk.notPending' }] };
    const post = vi.fn()
      .mockResolvedValueOnce({ data: { created: 200 } })
      .mockRejectedValueOnce(boom)
      .mockResolvedValue({ data: { created: 50 } });
    const result = await runBulkDistribution({ rows: rowsOf(450), post });
    expect(post).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ created: 200, completedBatches: 1, totalBatches: 3, failed: true, error: boom });
  });

  it('si falla el primer lote no se creó nada', async () => {
    const result = await runBulkDistribution({ rows: rowsOf(10), post: async () => { throw new Error('x'); } });
    expect(result).toMatchObject({ created: 0, completedBatches: 0, failed: true });
  });

  it('sin filas no llama al back', async () => {
    const post = vi.fn();
    expect(await runBulkDistribution({ rows: [], post })).toMatchObject({ created: 0, totalBatches: 0, failed: false });
    expect(await runBulkDistribution({ rows: undefined, post })).toMatchObject({ created: 0, failed: false });
    expect(post).not.toHaveBeenCalled();
  });

  it('los lotes van en orden y sin perder filas', async () => {
    const seen = [];
    await runBulkDistribution({ rows: rowsOf(5), batchSize: 2, post: async (batch) => { seen.push(batch.map((r) => r.productCode)); return { data: { created: batch.length } }; } });
    expect(seen).toEqual([['P-0', 'P-1'], ['P-2', 'P-3'], ['P-4']]);
  });

  it('avisa el avance después de cada lote', async () => {
    const onProgress = vi.fn();
    await runBulkDistribution({ rows: rowsOf(5), batchSize: 2, onProgress, post: async (batch) => ({ data: { created: batch.length } }) });
    expect(onProgress.mock.calls.map(([p]) => p)).toEqual([{ done: 1, total: 3 }, { done: 2, total: 3 }, { done: 3, total: 3 }]);
  });
});

describe('summarizeSkipped', () => {
  const skipped = Array.from({ length: 60 }, (_, i) => ({ code: `S-${i}`, reason: 'price' }));

  it('lista los primeros 50 y cuenta los demás', () => {
    const { listed, hidden } = summarizeSkipped(skipped);
    expect(listed).toHaveLength(50);
    expect(hidden).toBe(10);
  });

  it('con pocos no oculta ninguno; sin lista, vacío', () => {
    expect(summarizeSkipped(skipped.slice(0, 3))).toEqual({ listed: skipped.slice(0, 3), hidden: 0 });
    expect(summarizeSkipped(undefined)).toEqual({ listed: [], hidden: 0 });
  });
});
