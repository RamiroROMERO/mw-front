import { describe, it, expect } from 'vitest';
import esLang from '../../lang/locales/es_ES.js';
import enLang from '../../lang/locales/en_US.js';

// Cada pantalla despacha la ruta de su breadcrumb en su index.jsx (`onBreadcrumbEdit`) y su título con
// `onTitleEdit`. El componente Breadcrumb traduce cada segmento con `menu.<segmento>`, y solo la última
// migaja (la pantalla actual) no es enlace. Por eso:
//  - los niveles intermedios tienen que ser los de la carpeta de la pantalla (si no, el enlace lleva a otro módulo
//    o falta un nivel, como "Billing > Quotes" sin "Process");
//  - la última migaja es una CLAVE DE ETIQUETA, no una URL: puede llevar prefijo (`fixedAssets.register` ->
//    `menu.fixedAssets.register`, porque no existe `menu.register`) o diferir del nombre de la carpeta, pero su texto
//    tiene que ser el del título de la pantalla.
const files = import.meta.glob('../../views/app/**/index.{js,jsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const DISPATCH = /onBreadcrumbEdit\(`\$\{adminRoot\}([^`]*)`\)/;
const TITLE = /onTitleEdit\(\s*["'`]([^"'`]*)["'`]/;

const screens = Object.entries(files)
  .map(([file, source]) => {
    const folder = file.replace('../../views/app/', '').replace(/\/index\.jsx?$/, '');
    const dispatch = DISPATCH.exec(source);
    const title = TITLE.exec(source);
    return {
      folder,
      dispatched: dispatch ? dispatch[1] : null,
      titleKey: title ? title[1] : null,
    };
  })
  .filter((s) => s.dispatched);

// Pantallas con una desalineación conocida que no se corrige aquí:
//  - Format: pantalla huérfana (no está en el menú) y `menu.format` no existe en ningún idioma.
//  - dashboards/*: la ruta real es `/dashboards/billingSales` y `/dashboards/productCatalog`; la carpeta tiene un nivel
//    más (`billing/`) y el breadcrumb de dos niveles es el correcto.
const KNOWN_ISSUES = ['Format', 'dashboards/billing/sales', 'dashboards/productCatalog'];

const checked = screens.filter((s) => !KNOWN_ISSUES.includes(s.folder));
const has = (lang, key) => Object.prototype.hasOwnProperty.call(lang, key);
const segmentsOf = (dispatched) => dispatched.split('/').filter(Boolean);
const lastKey = (dispatched) => `menu.${segmentsOf(dispatched).pop()}`;

describe('breadcrumbs de todas las pantallas', () => {
  it('encuentra las pantallas', () => {
    expect(screens.length).toBeGreaterThan(200);
    expect(screens.some((s) => s.folder === 'fixedAssets/process/register')).toBe(true);
    expect(screens.some((s) => s.folder === 'billing/process/quotes')).toBe(true);
  });

  it.each(checked)('$folder: los niveles intermedios son los de la carpeta', ({ folder, dispatched }) => {
    const parents = segmentsOf(dispatched).slice(0, -1);
    const expected = folder.split('/').slice(0, -1);
    expect(parents).toEqual(expected);
  });

  it.each(checked)('$folder: todos los segmentos tienen traducción en es y en', ({ dispatched }) => {
    const missing = [];
    segmentsOf(dispatched).forEach((segment) => {
      const key = `menu.${segment}`;
      if (!has(esLang, key)) missing.push(`es:${key}`);
      if (!has(enLang, key)) missing.push(`en:${key}`);
    });
    expect(missing).toEqual([]);
  });

  it.each(checked.filter((s) => s.titleKey))('$folder: la última migaja muestra el texto del título', ({ dispatched, titleKey }) => {
    const crumb = lastKey(dispatched);
    expect(esLang[crumb]).toBe(esLang[titleKey]);
    expect(enLang[crumb]).toBe(enLang[titleKey]);
  });

  it('las desalineaciones conocidas siguen siéndolo (si se arreglan, quitarlas de la lista)', () => {
    const format = screens.find((s) => s.folder === 'Format');
    expect(has(esLang, 'menu.format')).toBe(false);
    expect(format.titleKey).toBe('menu.format');
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

  it.each([
    ['billing/process/quotes', '/billing/process/quotes'],
    ['billing/process/purchaseOrders', '/billing/process/billingPurchaseOrders'],
    ['humanResources/process/calculationBenefits', '/humanResources/process/calculationBenefits'],
    ['humanResources/reports/paymentsHistory', '/humanResources/reports/paymentsHistory'],
    ['humanResources/process/neighborhoodTax', '/humanResources/process/neighborhoodTaxPayroll'],
    ['hospitalManagement/reports/honorariosReport', '/hospitalManagement/reports/hospitalManagement.honorariosReport'],
  ])('%s despacha %s (corregido en la SPEC v2-21)', (folder, expected) => {
    expect(screens.find((s) => s.folder === folder).dispatched).toBe(expected);
  });
});
