import { describe, it, expect, vi } from 'vitest';
import {
  buildComboParams, toProductOptions, isUserSearch, withSelectedOption, isLatestRequest, buildSearchPageParams, describePage, loadAllPending,
  COMBO_PAGE_SIZE, SEARCH_PAGE_SIZE, PENDING_PAGE_SIZE
} from './pagingRules';

describe('buildComboParams', () => {
  it('sin texto solo manda el límite', () => {
    expect(buildComboParams('')).toEqual({ limit: COMBO_PAGE_SIZE });
    expect(buildComboParams(undefined)).toEqual({ limit: 50 });
    expect(buildComboParams('   ')).toEqual({ limit: 50 });
  });

  it('con texto manda search recortado', () => {
    expect(buildComboParams(' arroz ')).toEqual({ limit: 50, search: 'arroz' });
  });

  it('acepta otro límite', () => {
    expect(buildComboParams('a', 20)).toEqual({ limit: 20, search: 'a' });
  });

  it('los tamaños de página son los de la spec', () => {
    expect([COMBO_PAGE_SIZE, SEARCH_PAGE_SIZE, PENDING_PAGE_SIZE]).toEqual([50, 50, 500]);
  });
});

describe('toProductOptions e isUserSearch', () => {
  it('arma "código - nombre" con el código como valor', () => {
    expect(toProductOptions([{ code: 'A-1', name: 'Arroz' }])).toEqual([{ value: 'A-1', label: 'A-1 - Arroz' }]);
    expect(toProductOptions(undefined)).toEqual([]);
  });

  it('solo input-change es una búsqueda del usuario', () => {
    expect(isUserSearch({ action: 'input-change' })).toBe(true);
    ['input-blur', 'menu-close', 'set-value'].forEach((action) => expect(isUserSearch({ action })).toBe(false));
    expect(isUserSearch(undefined)).toBe(false);
  });
});

describe('withSelectedOption', () => {
  const options = [{ value: 'A-1', label: 'A-1 - Arroz' }];

  it('si el elegido ya está en la lista no cambia nada', () => {
    expect(withSelectedOption(options, 'A-1')).toBe(options);
  });

  it('si no está lo agrega al inicio con su etiqueta conocida', () => {
    const result = withSelectedOption(options, 'B-2', [{ value: 'B-2', label: 'B-2 - Bolsa' }]);
    expect(result).toEqual([{ value: 'B-2', label: 'B-2 - Bolsa' }, ...options]);
  });

  it('sin etiqueta conocida usa el código', () => {
    expect(withSelectedOption(options, 'Z-9')[0]).toEqual({ value: 'Z-9', label: 'Z-9' });
  });

  it.each([[undefined], [null], [''], ['0'], [0]])('sin selección (%p) no agrega nada', (selected) => {
    expect(withSelectedOption(options, selected)).toBe(options);
  });

  it('no muta la lista original', () => {
    const copy = [...options];
    withSelectedOption(options, 'B-2');
    expect(options).toEqual(copy);
  });
});

describe('isLatestRequest', () => {
  it('solo la última solicitud se aplica', () => {
    expect(isLatestRequest(3, 3)).toBe(true);
    expect(isLatestRequest(2, 3)).toBe(false);
  });
});

describe('buildSearchPageParams y describePage', () => {
  it('la primera página empieza en 0 y las siguientes avanzan de a 50', () => {
    expect(buildSearchPageParams('', 0)).toEqual({ limit: 50, offset: 0 });
    expect(buildSearchPageParams('arr', 2)).toEqual({ limit: 50, offset: 100, search: 'arr' });
    expect(buildSearchPageParams('', -3)).toEqual({ limit: 50, offset: 0 });
  });

  it('describe el rango y si hay anterior o siguiente', () => {
    expect(describePage({ totalRecords: 321, limit: 50, offset: 0 }, 50)).toEqual({ from: 1, to: 50, total: 321, hasPrev: false, hasNext: true });
    expect(describePage({ totalRecords: 321, limit: 50, offset: 300 }, 21)).toEqual({ from: 301, to: 321, total: 321, hasPrev: true, hasNext: false });
    expect(describePage({ totalRecords: 100, limit: 50, offset: 50 }, 50)).toMatchObject({ hasNext: false, hasPrev: true });
  });

  it('sin resultados el rango es 0-0', () => {
    expect(describePage({ totalRecords: 0, limit: 50, offset: 0 }, 0)).toEqual({ from: 0, to: 0, total: 0, hasPrev: false, hasNext: false });
    expect(describePage(undefined, undefined)).toMatchObject({ from: 0, total: 0, hasPrev: false, hasNext: false });
  });
});

describe('loadAllPending', () => {
  const pages = (list) => vi.fn(async (afterId) => list.find((p) => p.afterId === afterId));

  it('recorre las páginas por llave hasta que nextAfterId es null y junta las filas en orden', async () => {
    const fetchPage = pages([
      { afterId: 0, rows: [{ id: 1 }, { id: 2 }], total: 5, nextAfterId: 2 },
      { afterId: 2, rows: [{ id: 3 }, { id: 4 }], total: 5, nextAfterId: 4 },
      { afterId: 4, rows: [{ id: 5 }], total: 5, nextAfterId: null }
    ]);
    const result = await loadAllPending(fetchPage);
    expect(result.rows.map((r) => r.id)).toEqual([1, 2, 3, 4, 5]);
    expect(result.total).toBe(5);
    expect(fetchPage.mock.calls.map(([afterId]) => afterId)).toEqual([0, 2, 4]);
  });

  it('con una sola página hace una sola llamada', async () => {
    const fetchPage = pages([{ afterId: 0, rows: [{ id: 1 }], total: 1, nextAfterId: null }]);
    expect((await loadAllPending(fetchPage)).rows).toHaveLength(1);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it('sin pendientes devuelve vacío', async () => {
    const result = await loadAllPending(pages([{ afterId: 0, rows: [], total: 0, nextAfterId: null }]));
    expect(result).toEqual({ rows: [], total: 0 });
  });

  it('un fallo en una página se propaga (no se distribuye con una lista a medias)', async () => {
    const fetchPage = vi.fn(async (afterId) => {
      if (afterId === 0) return { rows: [{ id: 1 }], total: 2, nextAfterId: 1 };
      throw new Error('red');
    });
    await expect(loadAllPending(fetchPage)).rejects.toThrow('red');
  });

  it('corta si el servidor nunca termina (tope de páginas)', async () => {
    const fetchPage = vi.fn(async (afterId) => ({ rows: [{ id: afterId + 1 }], total: 1, nextAfterId: afterId + 1 }));
    await expect(loadAllPending(fetchPage, { maxPages: 5 })).rejects.toThrow('pending.too.many.pages');
    expect(fetchPage).toHaveBeenCalledTimes(5);
  });
});
