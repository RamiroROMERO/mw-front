import { describe, it, expect } from 'vitest';
import esLang from '../../lang/locales/es_ES.js';
import enLang from '../../lang/locales/en_US.js';

// Cada pantalla de Bancos y Activos Fijos despacha su ruta de breadcrumb en su index.jsx.
// El componente Breadcrumb traduce cada segmento con `menu.<segmento>`, así que un segmento sin
// clave se vería como el texto crudo "menu.xxx". Por eso las pantallas de Activos Fijos usan el
// segmento con prefijo (`fixedAssets.register` -> `menu.fixedAssets.register`): no es un error de
// tipeo, es la forma de obtener la etiqueta traducida (la última migaja no es enlace).
const files = import.meta.glob('../../views/app/{fixedAssets,banks}/**/index.jsx', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const DISPATCH = /onBreadcrumbEdit\(`\$\{adminRoot\}([^`]*)`\)/;

const screens = Object.entries(files).map(([file, source]) => {
  const folder = file.replace('../../views/app/', '').replace(/\/index\.jsx$/, '');
  const match = DISPATCH.exec(source);
  return { folder, dispatched: match ? match[1] : null };
});

const has = (lang, key) => Object.prototype.hasOwnProperty.call(lang, key);

describe('breadcrumbs de Bancos y Activos Fijos', () => {
  it('encuentra las pantallas', () => {
    expect(screens.length).toBeGreaterThan(20);
    expect(screens.some((s) => s.folder === 'fixedAssets/process/register')).toBe(true);
    expect(screens.some((s) => s.folder === 'fixedAssets/process/assign')).toBe(true);
  });

  it.each(screens.filter((s) => s.dispatched))('$folder: la ruta despachada sigue la carpeta de la pantalla', ({ folder, dispatched }) => {
    const segments = dispatched.split('/').filter(Boolean);
    const expected = folder.split('/');
    expect(segments).toHaveLength(expected.length);
    // el último segmento puede llevar el prefijo del módulo (`fixedAssets.register`)
    segments.forEach((segment, i) => {
      const last = i === segments.length - 1;
      const bare = last ? segment.split('.').pop() : segment;
      expect(bare).toBe(expected[i]);
    });
  });

  it.each(screens.filter((s) => s.dispatched))('$folder: todos los segmentos tienen traducción en es y en', ({ dispatched }) => {
    const segments = dispatched.split('/').filter(Boolean);
    const missing = [];
    segments.forEach((segment) => {
      const key = `menu.${segment}`;
      if (!has(esLang, key)) missing.push(`es:${key}`);
      if (!has(enLang, key)) missing.push(`en:${key}`);
    });
    expect(missing).toEqual([]);
  });

  it('Registro y Asignación de Activos muestran Activos Fijos > Proceso > su pantalla', () => {
    const register = screens.find((s) => s.folder === 'fixedAssets/process/register');
    const assign = screens.find((s) => s.folder === 'fixedAssets/process/assign');
    expect(register.dispatched).toBe('/fixedAssets/process/fixedAssets.register');
    expect(assign.dispatched).toBe('/fixedAssets/process/fixedAssets.assign');
    expect(esLang['menu.fixedAssets']).toBe('Activos Fijos');
    expect(esLang['menu.process']).toBe('Proceso');
    expect(esLang['menu.fixedAssets.register']).toBe('Registro de Activos');
    expect(esLang['menu.fixedAssets.assign']).toBe('Asignación de Activos');
  });
});
