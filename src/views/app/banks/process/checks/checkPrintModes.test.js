import { describe, it, expect } from 'vitest';
import { resolveCheckPrintMode, buildCheckPrintQuery } from './checkPrintModes';

describe('resolveCheckPrintMode', () => {
  it.each([[1, 'regular'], [2, 'notNegotiable'], [3, 'markedNotNegotiable'], ['2', 'notNegotiable']])('%p → %s', (option, mode) => {
    expect(resolveCheckPrintMode(option)).toBe(mode);
  });

  it.each([[0], [4], [null], [undefined], ['x']])('%p no es un modo', (option) => {
    expect(resolveCheckPrintMode(option)).toBeNull();
  });
});

describe('buildCheckPrintQuery', () => {
  it('modo y ciudad sin espacios', () => {
    expect(buildCheckPrintQuery(2, ' Tegucigalpa ')).toEqual({ mode: 'notNegotiable', city: 'Tegucigalpa' });
  });

  it('sin ciudad la manda vacía (printDocument la omite)', () => {
    expect(buildCheckPrintQuery(1, undefined)).toEqual({ mode: 'regular', city: '' });
  });

  it('sin selección no hay query', () => {
    expect(buildCheckPrintQuery(0, 'Tegucigalpa')).toBeNull();
  });
});
