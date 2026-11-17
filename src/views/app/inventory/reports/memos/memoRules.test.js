import { describe, expect, test } from 'vitest';
import {
  MEMO_KINDS, MAX_ITEMS, validateMemoForm, rowKey, toggleRow, setPageSelected, selectedRows, isRowSelected, isPageSelected, selectedTotal, buildItems,
  buildCreateBody, selectionProblem, buildPendingParams, memoFileName, validateFilter, isValidCalendarDate
} from './memoRules';

const today = '2026-08-20';
const ok = { date: '2026-08-10', for1: 'Contabilidad', department1: 'Finanzas', from1: 'Compras', department2: 'Inventario', subject: 'Entrega' };
const row = (kind, id, total = 10) => ({ kind, id, total, date: '2026-08-02' });

describe('validateMemoForm (mismos casos del back)', () => {
  test('una cabecera válida no tiene errores; los opcionales pueden faltar', () => { expect(validateMemoForm(ok, { today })).toEqual({}); });
  test('fecha obligatoria, válida y no futura; hoy vale', () => {
    expect(validateMemoForm({ ...ok, date: '' }, { today }).date).toBe('msg.required.input.date');
    expect(validateMemoForm({ ...ok, date: '2026-02-30' }, { today }).date).toBe('page.fuelPurchases.report.error.dateInvalid');
    expect(validateMemoForm({ ...ok, date: '2026-08-21' }, { today }).date).toBe('page.fuelPurchases.report.error.dateFuture');
    expect(validateMemoForm({ ...ok, date: today }, { today })).toEqual({});
  });
  test.each(['for1', 'department1', 'from1', 'department2', 'subject'])('%s es obligatorio (también solo espacios)', (key) => {
    expect(validateMemoForm({ ...ok, [key]: '' }, { today })[key]).toBe('page.memos.error.required');
    expect(validateMemoForm({ ...ok, [key]: '   ' }, { today })[key]).toBe('page.memos.error.required');
  });
  test('máximos: 50 y 200 (asunto), 50 en creado y revisado por', () => {
    ['for1', 'department1', 'from1', 'department2', 'createdBy', 'reviewedBy'].forEach((k) => {
      expect(validateMemoForm({ ...ok, [k]: 'x'.repeat(50) }, { today })[k]).toBeUndefined();
      expect(validateMemoForm({ ...ok, [k]: 'x'.repeat(51) }, { today })[k]).toBe('page.memos.error.tooLong');
    });
    expect(validateMemoForm({ ...ok, subject: 'x'.repeat(200) }, { today }).subject).toBeUndefined();
    expect(validateMemoForm({ ...ok, subject: 'x'.repeat(201) }, { today }).subject).toBe('page.memos.error.tooLong');
    expect(validateMemoForm({ ...ok, notes: 'x'.repeat(5001) }, { today }).notes).toBe('page.memos.error.tooLong');
  });
  test('un formulario vacío marca los 6 obligatorios', () => { expect(Object.keys(validateMemoForm({}, { today })).sort()).toEqual(['date', 'department1', 'department2', 'for1', 'from1', 'subject']); });
  test('bisiesto', () => { expect(isValidCalendarDate('2028-02-29')).toBe(true); expect(isValidCalendarDate('2027-02-29')).toBe(false); });
});

describe('selección entre páginas', () => {
  test('la llave distingue el tipo de documento (compra 1 y boleta 1 son distintas)', () => { expect(rowKey(row('compra', 1))).not.toBe(rowKey(row('boleta', 1))); });
  test('toggleRow marca y desmarca sin mutar', () => {
    const a = toggleRow({}, row('compra', 1));
    expect(Object.keys(a)).toEqual(['compra:1']);
    const b = toggleRow(a, row('compra', 2));
    expect(Object.keys(a)).toEqual(['compra:1']);
    expect(selectedRows(toggleRow(b, row('compra', 1))).map((r) => r.id)).toEqual([2]);
  });
  test('marcar la página no toca las filas de otras páginas; desmarcar tampoco', () => {
    const base = toggleRow({}, row('compra', 99));
    const page = [row('compra', 1), row('boleta', 2)];
    const all = setPageSelected(base, page, true);
    expect(selectedRows(all)).toHaveLength(3);
    expect(isPageSelected(all, page)).toBe(true);
    const none = setPageSelected(all, page, false);
    expect(selectedRows(none).map((r) => r.id)).toEqual([99]);
    expect(isRowSelected(none, row('compra', 99))).toBe(true);
    expect(isPageSelected(none, page)).toBe(false);
    expect(isPageSelected(none, [])).toBe(false);
  });
  test('el total de lo marcado suma en centavos (0.1 + 0.2 = 0.3)', () => {
    expect(selectedTotal(setPageSelected({}, [row('compra', 1, 0.1), row('compra', 2, 0.2)], true))).toBe(0.3);
    expect(selectedTotal({})).toBe(0);
    expect(selectedTotal(setPageSelected({}, [row('compra', 1, '1150.50'), row('compra', 2, null)], true))).toBe(1150.5);
  });
  test('buildItems manda solo el tipo y el id', () => {
    expect(buildItems(setPageSelected({}, [{ ...row('compra', 1), providerName: 'X' }], true))).toEqual([{ kind: 'compra', id: 1 }]);
  });
  test('selectionProblem: vacía y más de 500', () => {
    expect(selectionProblem({})).toBe('page.memos.msg.selectItems');
    const many = setPageSelected({}, Array.from({ length: MAX_ITEMS + 1 }, (_, i) => row('compra', i + 1)), true);
    expect(selectionProblem(many)).toBe('page.memos.msg.tooMany');
    expect(selectionProblem(setPageSelected({}, [row('compra', 1)], true))).toBeNull();
  });
});

describe('peticiones', () => {
  test('buildCreateBody recorta la cabecera y manda los documentos', () => {
    expect(buildCreateBody({ ...ok, subject: '  Entrega ', notes: ' n ' }, setPageSelected({}, [row('compra', 1)], true))).toEqual({
      date: '2026-08-10', for1: 'Contabilidad', department1: 'Finanzas', from1: 'Compras', department2: 'Inventario', subject: 'Entrega', createdBy: '', reviewedBy: '', notes: 'n',
      items: [{ kind: 'compra', id: 1 }]
    });
  });
  test('buildPendingParams: página (desde 1), búsqueda y fechas solo con valor', () => {
    expect(buildPendingParams({ dateStart: '', dateEnd: '', search: '' })).toEqual({ limit: 50, offset: 0 });
    expect(buildPendingParams({ dateStart: ' 2026-08-01 ', dateEnd: '2026-08-31', search: ' F-1 ' }, 3)).toEqual({ limit: 50, offset: 100, search: 'F-1', dateStart: '2026-08-01', dateEnd: '2026-08-31' });
  });
  test('validateFilter: fechas opcionales pero válidas y en orden', () => {
    expect(validateFilter({})).toEqual({});
    expect(validateFilter({ dateStart: '2026-08-01', dateEnd: '2026-08-31' })).toEqual({});
    expect(validateFilter({ dateStart: '2026-02-30' }).dateStart).toBe('page.fuelPurchases.report.error.dateInvalid');
    expect(validateFilter({ dateStart: '2026-09-01', dateEnd: '2026-08-01' }).dateEnd).toBe('page.fuelPurchases.report.error.range');
  });
  test('nombre del archivo por tipo y formato', () => {
    expect(memoFileName('purchase', { number: 3 }, 'pdf')).toBe('Memorandum de Compras 3.pdf');
    expect(memoFileName('inventory', { number: 7 }, 'xlsx')).toBe('Memorandum de Inventario 7.xlsx');
    expect(memoFileName('purchase', { number: 3 }, 'otro')).toBe('Memorandum de Compras 3.pdf');
  });
  test('los dos tipos tienen ruta, privilegio y columnas', () => {
    expect(MEMO_KINDS.purchase.privilege).toBe('01.05.028');
    expect(MEMO_KINDS.inventory.privilege).toBe('01.05.029');
    Object.values(MEMO_KINDS).forEach((k) => { expect(k.basePath).toMatch(/^inventory\/reports\//); k.columns.forEach((c) => expect(c.field && c.label).toBeTruthy()); });
  });
});
