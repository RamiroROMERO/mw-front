import { describe, it, expect } from 'vitest';
import { buildExportRequest, EXPORT_FILE_NAME, EXPORT_URL } from './exportRules';

// Lo que GETPdf termina enviando en un GET: `${url}?${new URLSearchParams(params)}`.
const queryOf = ({ url, params }) => `${url}?${new URLSearchParams(params).toString()}`;

describe('buildExportRequest', () => {
  it('con la casilla marcada pide includeDisabled=true', () => {
    expect(queryOf(buildExportRequest(true))).toBe('inventory/settings/products/export?includeDisabled=true');
  });

  it('con la casilla desmarcada pide includeDisabled=false', () => {
    expect(queryOf(buildExportRequest(false))).toBe('inventory/settings/products/export?includeDisabled=false');
  });

  it.each([undefined, null, 0, 1, 'true', ''])('un valor que no es el booleano true (%p) cuenta como false', (value) => {
    expect(buildExportRequest(value).params).toEqual({ includeDisabled: false });
  });

  it('la URL no lleva query propia (GETPdf la agrega y quedaría con dos "?")', () => {
    expect(buildExportRequest(true).url).toBe(EXPORT_URL);
    expect(EXPORT_URL).not.toContain('?');
  });
});

describe('EXPORT_FILE_NAME', () => {
  it('es el nombre que fija el back', () => {
    expect(EXPORT_FILE_NAME).toBe('Catálogo de Productos.xlsx');
  });
});
